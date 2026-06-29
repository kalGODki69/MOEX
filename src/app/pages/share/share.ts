import { Component, inject, OnInit, signal, computed, effect, DestroyRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { catchError, of, combineLatest, interval, startWith, map, switchMap } from 'rxjs';
import { toSignal, toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MoexService } from '../../services/moex';
import { LayoutService } from '../../services/layout.service';
import { Share as ShareInterface } from '../../shared/models/share.model';
import { INTERVAL_LABELS, CHART_REFRESH_INTERVAL } from '../../shared/constants/share.constants';
import { calculateStats, buildChartOptions } from '../../shared/utils/chart.utils';
import { formatDateRange } from '../../shared/utils/date.utils';

import { NgxEchartsModule } from 'ngx-echarts';

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

  stats = computed(() => calculateStats(this.candles()));

  chartOptions = computed(() => buildChartOptions(this.candles(), this.currentLang() as 'ru' | 'en'));

  readonly intervalLabels = INTERVAL_LABELS;

  interval = signal(1);

  currentLang = toSignal(this.transloco.langChanges$, { initialValue: 'ru' as 'ru' | 'en' });

  private interval$ = toObservable(this.interval);

  private refresh$ = combineLatest([
    this.transloco.langChanges$,
    interval(CHART_REFRESH_INTERVAL).pipe(startWith(0)),
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

          const { from, to } = formatDateRange(candleInterval);

          return this.moexService
            .getCandles(secid, from, to, candleInterval, lang)
            .pipe(catchError(() => of([])));
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((candles) => this.candles.set(candles));
  }
}
