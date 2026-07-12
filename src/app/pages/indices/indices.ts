import { Component, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { combineLatest, interval, of } from 'rxjs';
import { startWith, switchMap, catchError } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { SharesTableComponent } from '../../shared/ui/shares-table/shares-table';
import { Share } from '../../shared/models/share.model';
import { MoexService } from '../../services/moex';
import { TuiLoader } from '@taiga-ui/core';
import { LayoutService } from '../../services/layout.service';
import { LIST_REFRESH_INTERVAL } from '../../shared/constants/share.constants';

@Component({
  selector: 'app-indices',
  standalone: true,
  imports: [
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
  private readonly destroyRef = inject(DestroyRef);

  indices = signal<Share[]>([]);

  ngOnInit(): void {
    const refreshInterval$ = interval(LIST_REFRESH_INTERVAL).pipe(startWith(0));

    this.transloco.langChanges$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.layout.title.set(this.transloco.translate('indices.title'));
    });

    combineLatest([
      this.transloco.langChanges$,
      refreshInterval$
    ]).pipe(
      switchMap(([lang]) =>
        this.moexService.getIndices(lang as 'ru' | 'en')
      ),
      catchError(error => {
        console.error('Ошибка загрузки данных MOEX индексов', error);
        return of([]);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((indices) => this.indices.set(indices));
  }
}
