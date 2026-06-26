import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { combineLatest, interval, Observable, of } from 'rxjs';
import { startWith, switchMap, catchError } from 'rxjs/operators';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { SharesTableComponent } from '../../shared/ui/shares-table/shares-table';
import { Share } from '../../shared/models/share.model';
import { MoexService } from '../../services/moex';
import { Header } from '../../shared/ui/header/header';

@Component({
  selector: 'app-indices',
  standalone: true,
  imports: [
    AsyncPipe,
    TranslocoPipe,
    SharesTableComponent,
    Header,
  ],
  templateUrl: './indices.html',
  styleUrls: ['./indices.less'],
})
export class Indices implements OnInit {
  private readonly moexService = inject(MoexService);
  private readonly transloco = inject(TranslocoService);

  indices$!: Observable<Share[]>;

  readonly title$ =
      this.transloco.selectTranslate('indices.title');

  ngOnInit(): void {
    const refreshInterval$ = interval(30000).pipe(
        startWith(0)
    );

    this.indices$ = combineLatest([
      this.transloco.langChanges$,
      refreshInterval$
    ]).pipe(
        switchMap(([lang]) =>
            this.moexService.getIndices(lang as 'ru' | 'en')
        ),
        catchError(error => {
          console.error(
              'Ошибка загрузки данных MOEX индексов',
              error
          );

          return of([]);
        })
    );
  }
}