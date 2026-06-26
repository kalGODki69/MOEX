import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { Observable, of, combineLatest, map, switchMap, catchError, interval, startWith, BehaviorSubject } from 'rxjs';

import { MoexService } from '../../services/moex';
import { Share as ShareInterface } from '../../shared/models/share.model';

import { Header } from '../../shared/ui/header/header';
import { NgxEchartsModule } from 'ngx-echarts';
import { EChartsOption } from 'echarts';

import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-share',
  standalone: true,
  imports: [
    AsyncPipe,
    Header,
    DecimalPipe,
    NgxEchartsModule,
    TranslocoPipe,
  ],
  templateUrl: './share.html',
  styleUrl: './share.less',
})
export class Share implements OnInit {
  private moexService = inject(MoexService);
  private route = inject(ActivatedRoute);
  private transloco = inject(TranslocoService);

  instrument$!: Observable<ShareInterface | null>;

  candles$!: Observable<
    {
      date: string;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
    }[]
  >;

  chartOptions$!: Observable<EChartsOption | null>;

  stats$!: Observable<{
    open: number;
    high: number;
    low: number;
    close: number;
    changePercent: number;
    volume: number;
  } | null>;

  title$!: Observable<string>;

  readonly intervalLabels = [
    { value: 1, labelKey: 'share.intervalLabels.1m' },
    { value: 5, labelKey: 'share.intervalLabels.5m' },
    { value: 30, labelKey: 'share.intervalLabels.30m' },
    { value: 60, labelKey: 'share.intervalLabels.60m' },
    { value: 1440, labelKey: 'share.intervalLabels.1440m' },
  ];

  private refresh$ = combineLatest([
    this.transloco.langChanges$,
    interval(5000).pipe(startWith(0)),
  ]).pipe(map(([lang]) => lang as 'ru' | 'en'));

  private intervalSubject = new BehaviorSubject<number>(1);

  public interval$ = this.intervalSubject.asObservable();

  setInterval(interval: number): void {
    this.intervalSubject.next(interval);
  }

  ngOnInit(): void {
    const secid$ = this.route.params.pipe(
      map((params) => params['secid'] as string)
    );

    this.instrument$ = combineLatest([
      secid$,
      this.refresh$,
    ]).pipe(
      switchMap(([secid, lang]) => {
        if (!secid) {
          return of(null);
        }

        return this.moexService.getShare(secid, lang).pipe(
          catchError(() => of(null))
        );
      })
    );

    this.candles$ = combineLatest([
      secid$,
      this.refresh$,
      this.interval$,
    ]).pipe(
      switchMap(([secid, lang, candleInterval]) => {
        if (!secid) {
          return of([]);
        }

        const now = new Date();
        const from = new Date();

        let days = 30;

        if (candleInterval <= 1) {
          days = 1;
        } else if (candleInterval <= 5) {
          days = 3;
        } else if (candleInterval <= 30) {
          days = 7;
        } else if (candleInterval <= 60) {
          days = 14;
        }

        from.setDate(now.getDate() - days);

        const fromStr = from.toISOString().slice(0, 10);
        const toStr = now.toISOString().slice(0, 10);

        return this.moexService
          .getCandles(
            secid,
            fromStr,
            toStr,
            candleInterval,
            lang
          )
          .pipe(catchError(() => of([])));
      })
    );

    this.stats$ = this.candles$.pipe(
      map((data) => {
        if (!data?.length) {
          return null;
        }

        const closes = data.map((c) => c.close);

        const open = closes[0];
        const close = closes[closes.length - 1];
        const high = Math.max(...closes);
        const low = Math.min(...closes);

        const changePercent =
          open !== 0
            ? ((close - open) / open) * 100
            : 0;

        const totalVolume = data.reduce(
          (sum, c) => sum + c.volume,
          0
        );

        return {
          open,
          high,
          low,
          close,
          changePercent,
          volume: totalVolume,
        };
      })
    );

    this.chartOptions$ = combineLatest([
      this.candles$,
      this.transloco.langChanges$,
    ]).pipe(
      map(([data, lang]) => {
        const currentLang = lang as 'ru' | 'en';

        if (!data?.length) {
          return null;
        }

        const dates = data.map((item) => item.date);
        const prices = data.map((item) => item.close);
        const volumes = data.map((item) => item.volume);

        const totalVolume = volumes.reduce(
          (sum, value) => sum + value,
          0
        );

        const barData = data.map((item, index) => {
          let color = '#6d89f9';

          if (index > 0) {
            const prevClose = data[index - 1].close;
            color =
              item.close >= prevClose
                ? '#00a651'
                : '#e53935';
          } else {
            color =
              item.close >= item.open
                ? '#00a651'
                : '#e53935';
          }

          return {
            value: item.volume,
            itemStyle: { color },
          };
        });

        const priceLabel =
          currentLang === 'ru'
            ? 'Цена'
            : 'Price';

        const volumeLabel =
          currentLang === 'ru'
            ? 'Объём'
            : 'Volume';

        const volumeText =
          currentLang === 'ru'
            ? 'Объем'
            : 'Volume';

        const monthNames: Record<
          'ru' | 'en',
          string[]
        > = {
          ru: [
            'янв',
            'фев',
            'мар',
            'апр',
            'май',
            'июн',
            'июл',
            'авг',
            'сен',
            'окт',
            'ноя',
            'дек',
          ],
          en: [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
          ],
        };

        return {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
            },
            formatter: (params: any) => {
              let result =
                params[0].axisValue + '<br/>';

              params.forEach((p: any) => {
                if (p.seriesName) {
                  result += `${p.seriesName}: ${p.value}<br/>`;
                }
              });

              return result;
            },
          },

          graphic: [
            {
              type: 'text',
              left: '5%',
              top: '68%',
              style: {
                text: `${volumeText}: ${totalVolume.toLocaleString()}`,
                fill: '#888',
                fontSize: 14,
                fontWeight: 'bold',
              },
            },
          ],

          grid: [
            {
              left: '5%',
              right: '5%',
              top: '10%',
              height: '50%',
            },
            {
              left: '5%',
              right: '5%',
              top: '67%',
              height: '25%',
            },
          ],

          xAxis: [
            {
              type: 'category',
              data: dates,
              gridIndex: 0,
              axisLabel: {
                show: false,
              },
              splitLine: {
                show: false,
              },
            },
            {
              type: 'category',
              data: dates,
              gridIndex: 1,
              axisLabel: {
                rotate: 30,
                interval: 'auto',
                fontSize: 10,
                color: '#888',
                formatter: (value: string) => {
                  const date = new Date(value);

                  return `${date.getDate()} ${
  monthNames[currentLang][
      date.getMonth()
      ]
}`;
                },
              },
              splitLine: {
                show: false,
              },
            },
          ],

          yAxis: [
            {
              type: 'value',
              gridIndex: 0,
              scale: true,
              splitLine: {
                show: true,
              },
              position: 'right',
            },
            {
              type: 'value',
              gridIndex: 1,
              scale: true,
              splitLine: {
                show: true,
              },
              position: 'right',
              max: (value: {
                max: number;
                min: number;
              }) => value.max * 1.1,
            },
          ],

          series: [
            {
              name: priceLabel,
              type: 'line',
              data: prices,
              smooth: true,
              lineStyle: {
                color: '#6d89f9',
                width: 2,
              },
              areaStyle: {
                color: '#0743d6',
                opacity: 0.1,
              },
              symbol: 'circle',
              symbolSize: 4,
              xAxisIndex: 0,
              yAxisIndex: 0,
              markLine:
                prices.length > 0
                  ? {
                      silent: true,
                      symbol: 'none',
                      lineStyle: {
                        color: 'rgb(52 193 126)',
                        type: 'dashed',
                        width: 2,
                      },
                      label: {
                        show: false,
                      },
                      data: [
                        {
                          yAxis:
                            prices[
                              prices.length - 1
                            ],
                        },
                      ],
                    }
                  : undefined,
            },
            {
              name: volumeLabel,
              type: 'bar',
              data: barData,
              xAxisIndex: 1,
              yAxisIndex: 1,
              barWidth: '80%',
            },
          ],
        } as EChartsOption;
      })
    );

    this.title$ = combineLatest([
      this.transloco.selectTranslate('share.type.shares'),
      this.instrument$,
    ]).pipe(
      map(([type, instrument]) => {
        const name =
          instrument?.name ||
          instrument?.code ||
          '';

        return `MOEX / ${type} / ${name}`;
      })
    );
  }
}

