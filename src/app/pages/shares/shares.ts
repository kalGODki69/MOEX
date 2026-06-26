import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable, of, combineLatest, interval } from 'rxjs';
import { map, startWith, switchMap, catchError } from 'rxjs/operators';

import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { SharesTableComponent } from '../../shared/ui/shares-table/shares-table';
import { MoexService } from '../../services/moex';
import { LanguageService } from '../../services/language';
import { Header } from '../../shared/ui/header/header';
import { Share } from '../../shared/models/share.model';

@Component({
  selector: 'app-shares',
  standalone: true,
  imports: [
    AsyncPipe,
    SharesTableComponent,
    Header,
    TranslocoPipe,
  ],
  templateUrl: './shares.html',
  styleUrls: ['./shares.less'],
})
export class Shares implements OnInit {
  private readonly languageService = inject(LanguageService);
  private readonly moexService = inject(MoexService);
  private readonly transloco = inject(TranslocoService);

  shares$!: Observable<Share[]>;

  title$ = this.languageService.langCode$.pipe(
      map((lang) =>
          this.transloco.translate(
              'shares.title',
              {},
              lang
          )
      )
  );

  ngOnInit(): void {
    const refreshInterval$ = interval(30000).pipe(
        startWith(0)
    );

    this.shares$ = combineLatest([
      this.languageService.langCode$,
      refreshInterval$,
    ]).pipe(
        switchMap(([lang]) =>
            this.moexService.getShares(lang)
        ),
        catchError((err) => {
          console.error(
              'Ошибка загрузки данных MOEX',
              err
          );
          return of([]);
        })
    );
  }
}