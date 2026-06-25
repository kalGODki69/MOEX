import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { LanguageService } from '../../services/language';
import { MoexService } from '../../services/moex';
import { Share as ShareInterface } from '../../shared/models/share.model';
import { Observable, of, combineLatest, map, switchMap, catchError, interval, startWith, BehaviorSubject } from 'rxjs';
import { Header } from '../../shared/ui/header/header';
import { NgxEchartsModule } from 'ngx-echarts';
import { EChartsOption } from 'echarts';

@Component({
  selector: 'app-share',
  standalone: true,
  imports: [AsyncPipe, Header, DecimalPipe, NgxEchartsModule],
  templateUrl: './share.html',
  styleUrl: './share.less',
})
export class Share implements OnInit {
  public languageService = inject(LanguageService);
  private moexService = inject(MoexService);
  private route = inject(ActivatedRoute);

  instrument$!: Observable<ShareInterface | null>;
  candles$!: Observable<{ date: string; open: number; high: number; low: number; close: number; volume: number }[]>;
  chartOptions$!: Observable<EChartsOption | null>;

  stats$!: Observable<{
    open: number;
    high: number;
    low: number;
    close: number;
    changePercent: number;
    volume: number;
  } | null>;

  private refresh$ = combineLatest([
    this.languageService.langCode$,
    interval(5000).pipe(startWith(0)),
  ]).pipe(map(([lang]) => lang));

  private intervalSubject = new BehaviorSubject<number>(1);
  public interval$ = this.intervalSubject.asObservable();

  setInterval(interval: number): void {
    this.intervalSubject.next(interval);
  }

  translations$ = this.languageService.langCode$.pipe(
    map((lang) => {
      const ru = {
        params: {
          code: 'Код ценной бумаги',
          isin: 'ISIN код',
          boardId: 'ID режима торгов',
          listLevel: 'Уровень листинга',
          boardName: 'Режим торгов',
          lotSize: 'Лотность',
          prevDate: 'Дата начала торгов',
          status: 'Для квал. инвесторов',
        },
        tradeData: {
          title: 'Торговые данные',
          prevPrice: 'Цена закрытия',
          open: 'Цена первой сделки',
          low: 'Минимальная цена',
          high: 'Максимальная цена',
          valueToday: 'Объем сделок за день',
          valueTodayRur: 'Объем сделок для рыночной цены (2), руб.',
          volumeToday: 'Объем сделок за день, шт.',
          valueTodayUsd: 'Объем сделок для рыночной цены (3), руб.',
        },
        intervalLabels: [
          { value: 1, label: '1 минута' },
          { value: 5, label: '5 минут' },
          { value: 30, label: '30 минут' },
          { value: 60, label: '1 час' },
          { value: 1440, label: '1 день' },
        ],
        statsLabels: {
          open: 'Отк.',
          high: 'Макс.',
          low: 'Мин.',
          close: 'Закр.',
          change: 'Изм.',
          volume: 'Объем',
        },
      };
      const en = {
        params: {
          code: 'Security code',
          isin: 'ISIN code',
          boardId: 'Trading board ID',
          listLevel: 'Listing level',
          boardName: 'Trading mode',
          lotSize: 'Lot size',
          prevDate: 'Start trading date',
          status: 'For qualified investors',
        },
        tradeData: {
          title: 'Trading data',
          prevPrice: 'Close price',
          open: 'First deal price',
          low: 'Min price',
          high: 'Max price',
          valueToday: 'Daily turnover',
          valueTodayRur: 'Daily turnover for market price (2), RUB',
          volumeToday: 'Daily volume, pcs',
          valueTodayUsd: 'Daily turnover for market price (3), RUB',
        },
        intervalLabels: [
          { value: 1, label: '1 minute' },
          { value: 5, label: '5 minutes' },
          { value: 30, label: '30 minutes' },
          { value: 60, label: '1 hour' },
          { value: 1440, label: '1 day' },
        ],
        statsLabels: {
          open: 'Open',
          high: 'High',
          low: 'Low',
          close: 'Close',
          change: 'Change',
          volume: 'Volume',
        },
      };
      return lang === 'ru' ? ru : en;
    })
  );

  title$!: Observable<string>;

  ngOnInit(): void {
    const secid$ = this.route.params.pipe(
      map((params) => params['secid'] as string)
    );

    this.instrument$ = combineLatest([secid$, this.refresh$]).pipe(
      switchMap(([secid, lang]) => {
        if (!secid) return of(null);
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
        if (!secid) return of([]);
        const now = new Date();
        const from = new Date();
        let days = 30;
        if (candleInterval <= 1) days = 1;
        else if (candleInterval <= 5) days = 3;
        else if (candleInterval <= 30) days = 7;
        else if (candleInterval <= 60) days = 14;
        else days = 30;
        from.setDate(now.getDate() - days);
        const fromStr = from.toISOString().slice(0, 10);
        const toStr = now.toISOString().slice(0, 10);
        return this.moexService.getCandles(secid, fromStr, toStr, candleInterval, lang).pipe(
          catchError(() => of([]))
        );
      })
    );

    this.stats$ = this.candles$.pipe(
      map((data) => {
        if (!data || data.length === 0) return null;

        const closes = data.map(c => c.close);
        const open = closes[0];
        const close = closes[closes.length - 1];
        const high = Math.max(...closes);
        const low = Math.min(...closes);
        const changePercent = open !== 0 ? ((close - open) / open) * 100 : 0;
        const totalVolume = data.reduce((sum, c) => sum + c.volume, 0);

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
      this.languageService.langCode$,
    ]).pipe(
      map(([data, lang]) => {
        if (!data || data.length === 0) return null;

        const dates = data.map(item => item.date);
        const prices = data.map(item => item.close);
        const volumes = data.map(item => item.volume);
        const totalVolume = volumes.reduce((sum, v) => sum + v, 0);

        const barData = data.map((item, index) => {
          let color = '#6d89f9';
          if (index > 0) {
            const prevClose = data[index - 1].close;
            const currClose = item.close;
            color = currClose >= prevClose ? '#00a651' : '#e53935';
          } else {
            color = item.close >= item.open ? '#00a651' : '#e53935';
          }
          return {
            value: item.volume,
            itemStyle: { color }
          };
        });

        const priceLabel = lang === 'ru' ? 'Цена' : 'Price';
        const volumeLabel = lang === 'ru' ? 'Объём' : 'Volume';
        const volumeText = lang === 'ru' ? 'Объем' : 'Volume';

        return {
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'cross' },
            formatter: (params: any) => {
              let res = params[0].axisValue + '<br/>';
              params.forEach((p: any) => {
                if (p.seriesName) {
                  res += `${p.seriesName}: ${p.value}<br/>`;
                }
              });
              return res;
            }
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
                fontWeight: 'bold'
              }
            }
          ],
          grid: [
            { left: '5%', right: '5%', top: '10%', height: '50%' },
            { left: '5%', right: '5%', top: '67%', height: '25%' }
          ],
          xAxis: [
            {
              type: 'category',
              data: dates,
              gridIndex: 0,
              axisLabel: { show: false },
              splitLine: { show: false }
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
                  const day = date.getDate();
                  const monthNames: Record<'ru' | 'en', string[]> = {
                    ru: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
                    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                  };
                  const month = monthNames[lang as 'ru' | 'en']?.[date.getMonth()] || '';
                  return `${day} ${month}`;
                }
              },
              splitLine: { show: false }
            }
          ],
          yAxis: [
            {
              type: 'value',
              gridIndex: 0,
              scale: true,
              splitLine: { show: true },
              position: 'right'
            },
            {
              type: 'value',
              gridIndex: 1,
              scale: true,
              splitLine: { show: true },
              position: 'right',
              max: (value: { max: number, min: number }) => value.max * 1.1
            }
          ],
          series: [
            {
              name: priceLabel,
              type: 'line',
              data: prices,
              smooth: true,
              lineStyle: { color: '#6d89f9', width: 2 },
              areaStyle: { color: '#0743d6', opacity: 0.1 },
              symbol: 'circle',
              symbolSize: 4,
              xAxisIndex: 0,
              yAxisIndex: 0
            },
            {
              name: volumeLabel,
              type: 'bar',
              data: barData,
              xAxisIndex: 1,
              yAxisIndex: 1,
              barWidth: '80%'
            }
          ]
        };
      })
    );

    this.title$ = combineLatest([
      this.languageService.langCode$,
      this.instrument$,
    ]).pipe(
      map(([lang, instrument]) => {
        const prefix = 'MOEX';
        const typeText = lang === 'ru' ? 'Акции' : 'Shares';
        const name = instrument?.name || instrument?.code || '';
        return `${prefix} / ${typeText} / ${name}`;
      })
    );
  }
}
