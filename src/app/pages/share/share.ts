import { Component, inject, OnInit, signal, computed, effect, DestroyRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { catchError, of, combineLatest, interval, startWith, map, switchMap } from 'rxjs';
import { toSignal, toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MoexService } from '../../services/moex';
import { LayoutService } from '../../services/layout.service';
import { Share as ShareInterface } from '../../shared/models/share.model';

import { NgxEchartsModule } from 'ngx-echarts';
import { EChartsOption } from 'echarts';

import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { InstrumentParamsComponent } from '../../shared/ui/instrument-params/instrument-params';
import { TradeDataComponent } from '../../shared/ui/trade-data/trade-data';
import { TuiSegmented, TuiBadge } from '@taiga-ui/kit';
import { TuiLoader } from '@taiga-ui/core';

@Component({
  selector: 'app-share',
  standalone: true,
  imports: [
    DecimalPipe,
    NgxEchartsModule,
    TranslocoPipe,
    InstrumentParamsComponent,
    TradeDataComponent,
    TuiSegmented,
    TuiLoader,
    TuiBadge,
    RouterModule,
  ],
  templateUrl: './share.html',
  styleUrl: './share.less',
})
export class Share implements OnInit {
  private moexService = inject(MoexService);
  private route = inject(ActivatedRoute);
  private transloco = inject(TranslocoService);
  private layout = inject(LayoutService);
  private destroyRef = inject(DestroyRef);

  private titleEffect = effect(() => {
    const instrument = this.instrument();
    const name = instrument?.name || instrument?.code || '';
    if (name) {
      this.layout.title.set(`MOEX / Акции / ${name}`);
    }
  });

  instrument = signal<ShareInterface | null>(null);

  candles = signal<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[]>([]);

  stats = computed(() => {
    const data = this.candles();
    if (!data?.length) {
      return null;
    }

    const closes = data.map((c) => c.close);
    const open = closes[0];
    const close = closes[closes.length - 1];
    const high = Math.max(...closes);
    const low = Math.min(...closes);
    const changePercent = open !== 0 ? ((close - open) / open) * 100 : 0;
    const totalVolume = data.reduce((sum, c) => sum + c.volume, 0);

    return { open, high, low, close, changePercent, volume: totalVolume };
  });

  chartOptions = computed<EChartsOption | null>(() => {
    const data = this.candles();
    const lang = this.currentLang() as 'ru' | 'en';

    if (!data?.length) {
      return null;
    }

    const dates = data.map((item) => item.date);
    const prices = data.map((item) => item.close);
    const volumes = data.map((item) => item.volume);

    const totalVolume = volumes.reduce((sum, value) => sum + value, 0);

    const barData = data.map((item, index) => {
      let color = '#6d89f9';

      if (index > 0) {
        const prevClose = data[index - 1].close;
        color = item.close >= prevClose ? '#00a651' : '#e53935';
      } else {
        color = item.close >= item.open ? '#00a651' : '#e53935';
      }

      return {
        value: item.volume,
        itemStyle: { color },
      };
    });

    const priceLabel = lang === 'ru' ? 'Цена' : 'Price';
    const volumeLabel = lang === 'ru' ? 'Объём' : 'Volume';
    const volumeText = lang === 'ru' ? 'Объем' : 'Volume';

    const monthNames: Record<'ru' | 'en', string[]> = {
      ru: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
      en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    };

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        formatter: (params: any) => {
          let result = params[0].axisValue + '<br/>';
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
        { left: '5%', right: '5%', top: '10%', height: '50%' },
        { left: '5%', right: '5%', top: '67%', height: '25%' },
      ],
      xAxis: [
        {
          type: 'category',
          data: dates,
          gridIndex: 0,
          axisLabel: { show: false },
          splitLine: { show: false },
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
              return `${date.getDate()} ${monthNames[lang][date.getMonth()]}`;
            },
          },
          splitLine: { show: false },
        },
      ],
      yAxis: [
        {
          type: 'value',
          gridIndex: 0,
          scale: true,
          splitLine: { show: true },
          position: 'right',
        },
        {
          type: 'value',
          gridIndex: 1,
          scale: true,
          splitLine: { show: true },
          position: 'right',
          max: (value: { max: number; min: number }) => value.max * 1.1,
        },
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
          yAxisIndex: 0,
          markLine:
            prices.length > 0
              ? {
                  silent: true,
                  symbol: 'none',
                  lineStyle: { color: 'rgb(52 193 126)', type: 'dashed', width: 2 },
                  label: { show: false },
                  data: [{ yAxis: prices[prices.length - 1] }],
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
  });

  readonly intervalLabels = [
    { value: 1, labelKey: 'share.intervalLabels.1m' },
    { value: 5, labelKey: 'share.intervalLabels.5m' },
    { value: 30, labelKey: 'share.intervalLabels.30m' },
    { value: 60, labelKey: 'share.intervalLabels.60m' },
    { value: 1440, labelKey: 'share.intervalLabels.1440m' },
  ];

  interval = signal(1);

  currentLang = toSignal(this.transloco.langChanges$, { initialValue: 'ru' as 'ru' | 'en' });

  private interval$ = toObservable(this.interval);

  private refresh$ = combineLatest([
    this.transloco.langChanges$,
    interval(5000).pipe(startWith(0)),
  ]).pipe(map(([lang]) => lang as 'ru' | 'en'));

  private secid$ = this.route.params.pipe(map((params) => params['secid'] as string));

  get activeIntervalIndex(): number {
    return this.intervalLabels.findIndex((item) => item.value === this.interval());
  }

  onIntervalChange(index: number): void {
    this.interval.set(this.intervalLabels[index].value);
  }

  ngOnInit(): void {
    combineLatest([this.secid$, this.refresh$])
      .pipe(
        switchMap(([secid, lang]) => {
          if (!secid) return of(null);
          return this.moexService.getShare(secid, lang).pipe(catchError(() => of(null)));
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((share) => this.instrument.set(share));

    combineLatest([this.secid$, this.refresh$, this.interval$])
      .pipe(
        switchMap(([secid, lang, candleInterval]) => {
          if (!secid) return of([]);

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
            .getCandles(secid, fromStr, toStr, candleInterval, lang)
            .pipe(catchError(() => of([])));
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((candles) => this.candles.set(candles));
  }
}
