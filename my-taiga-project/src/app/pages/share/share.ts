import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { LanguageService } from '../../services/language';
import { MoexService } from '../../services/moex';
import { Share as ShareInterface } from '../../shared/models/share.model';
import { Observable, of, combineLatest, map, switchMap, catchError } from 'rxjs';
import { Header } from '../../shared/ui/header/header';

@Component({
  selector: 'app-share',
  standalone: true,
  imports: [AsyncPipe, Header, DecimalPipe],
  templateUrl: './share.html',
  styleUrl: './share.less',
})
export class Share implements OnInit {
  public languageService = inject(LanguageService);
  private moexService = inject(MoexService);
  private route = inject(ActivatedRoute);

  instrument$!: Observable<ShareInterface | null>;
  title$!: Observable<string>;

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
      };
      return lang === 'ru' ? ru : en;
    })
  );

  ngOnInit(): void {
    const secid$ = this.route.params.pipe(
      map((params) => params['secid'] as string)
    );

    this.instrument$ = secid$.pipe(
      switchMap((secid) => {
        if (!secid) return of(null);
        return this.moexService.getShare(secid).pipe(
          catchError(() => of(null))
        );
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
