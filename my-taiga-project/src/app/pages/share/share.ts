import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { LanguageService } from '../../services/language';
import { MoexService } from '../../services/moex';
import { Share as ShareInterface } from '../../shared/models/share.model';
import { Observable, of, combineLatest, map, switchMap, catchError, interval, startWith } from 'rxjs';
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
  candles$!: Observable<{ date: string; value: number }[]>;
  chartOptions$!: Observable<EChartsOption>;

  private refresh$ = combineLatest([
    this.languageService.langCode$,
    interval(5000).pipe(startWith(0)),
  ]).pipe(map(([lang]) => lang));

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
          status: 'Для квал. инвесторов'
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
          valueTodayUsd: 'Объем сделок для рыночной цены (3), руб.'
        }
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
          status: 'For qualified investors'
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
          valueTodayUsd: 'Daily turnover for market price (3), RUB'
        }
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

    this.candles$ = combineLatest([secid$, this.refresh$]).pipe(
      switchMap(([secid, lang]) => {
        if (!secid) return of([]);
        const now = new Date();
        const from = new Date();
        from.setDate(now.getDate() - 30);
        const fromStr = from.toISOString().slice(0, 10);
        const toStr = now.toISOString().slice(0, 10);
        return this.moexService.getCandles(secid, fromStr, toStr, 24, lang).pipe(
          catchError(() => of([]))
        );
      })
    );

    this.chartOptions$ = combineLatest([
      this.candles$,
      this.languageService.langCode$
    ]).pipe(
      map(([data, lang]) => {
        const dates = data.map(item => item.date);
        const values = data.map(item => item.value);
        const priceLabel = lang === 'ru' ? 'Цена' : 'Price';

        return {
          tooltip: {
            trigger: 'axis',
            formatter: (params: any) => `${params[0].axisValue}<br/>${priceLabel}: ${params[0].value}`
          },
          grid: { left: '2%', right: '5%', bottom: '5%', },
          xAxis: {
            type: 'category',
            data: dates,
            boundaryGap: false,
            axisLabel: { show: false },
            splitLine: { show: true }
          },
          yAxis: {
            type: 'value',
            scale: true,
            splitLine: { show: true },
            position: 'right'
          },
          series: [{
            type: 'line',
            data: values,
            smooth: true,
            lineStyle: { color: '#6d89f9', width: 2 },
            areaStyle: { color: '#0743d6', opacity: 0.1 },
            symbol: 'circle',
            symbolSize: 4,
          }]
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
