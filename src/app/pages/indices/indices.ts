import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { combineLatest, interval, Observable, of } from 'rxjs';
import { startWith, switchMap, catchError } from 'rxjs/operators';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { SharesTableComponent } from '../../shared/ui/shares-table/shares-table';
import { Share } from '../../shared/models/share.model';
import { MoexService } from '../../services/moex';
import { TuiLoader } from '@taiga-ui/core';
import { LayoutService } from '../../services/layout.service';

@Component({
  selector: 'app-indices',
  standalone: true,
  imports: [
    AsyncPipe,
    TranslocoPipe,
    SharesTableComponent,
    TuiLoader,
  ],
  templateUrl: './indices.html',
  styleUrls: ['./indices.less'],
})
export class Indices implements OnInit {
  private readonly moexService = inject(MoexService);
  private readonly transloco = inject(TranslocoService);
  private readonly layout = inject(LayoutService);

  indices$!: Observable<Share[]>;

  ngOnInit(): void {
    this.layout.title.set('MOEX / Индексы');

    const refreshInterval$ = interval(30000).pipe(startWith(0));

    this.indices$ = combineLatest([
      this.transloco.langChanges$,
      refreshInterval$
    ]).pipe(
        switchMap(([lang]) =>
            this.moexService.getIndices(lang as 'ru' | 'en')
        ),
        catchError(error => {
          console.error('Ошибка загрузки данных MOEX индексов', error);
          return of([]);
        })
    );
  }
}