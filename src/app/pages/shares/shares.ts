import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable, of, combineLatest, interval } from 'rxjs';
import { startWith, switchMap, catchError } from 'rxjs/operators';

import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { SharesTableComponent } from '../../shared/ui/shares-table/shares-table';
import { MoexService } from '../../services/moex';
import { Header } from '../../shared/ui/header/header';
import { Share } from '../../shared/models/share.model';
import { TuiLoader } from '@taiga-ui/core';

@Component({
  selector: 'app-shares',
  standalone: true,
  imports: [
    AsyncPipe,
    SharesTableComponent,
    Header,
    TranslocoPipe,
    TuiLoader,
  ],
  templateUrl: './shares.html',
  styleUrls: ['./shares.less'],
})
export class Shares implements OnInit {
  private readonly moexService = inject(MoexService);
  private readonly transloco = inject(TranslocoService);

  shares$!: Observable<Share[]>;

  title$ = this.transloco.selectTranslate('shares.title');

  ngOnInit(): void {
    const refreshInterval$ = interval(30000).pipe(
        startWith(0)
    );

    this.shares$ = combineLatest([
      this.transloco.langChanges$,
      refreshInterval$,
    ]).pipe(
        switchMap(([lang]) =>
            this.moexService.getShares(lang as 'ru' | 'en')
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