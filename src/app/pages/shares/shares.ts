import { Component, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { combineLatest, interval, of } from 'rxjs';
import { startWith, switchMap, catchError } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { SharesTableComponent } from '../../shared/ui/shares-table/shares-table';
import { MoexService } from '../../services/moex';
import { Share } from '../../shared/models/share.model';
import { TuiLoader } from '@taiga-ui/core';
import { LayoutService } from '../../services/layout.service';
import { LIST_REFRESH_INTERVAL } from '../../shared/constants/share.constants';

@Component({
  selector: 'app-shares',
  standalone: true,
  imports: [
    SharesTableComponent,
    TranslocoPipe,
    TuiLoader,
  ],
  templateUrl: './shares.html',
  styleUrls: ['./shares.less'],
})
export class Shares implements OnInit {
  private readonly moexService = inject(MoexService);
  private readonly transloco = inject(TranslocoService);
  private readonly layout = inject(LayoutService);
  private readonly destroyRef = inject(DestroyRef);

  shares = signal<Share[]>([]);

  ngOnInit(): void {
    this.layout.title.set('MOEX / Акции');

    const refreshInterval$ = interval(LIST_REFRESH_INTERVAL).pipe(startWith(0));

    combineLatest([
      this.transloco.langChanges$,
      refreshInterval$,
    ]).pipe(
      switchMap(([lang]) =>
        this.moexService.getShares(lang as 'ru' | 'en')
      ),
      catchError((err) => {
        console.error('Ошибка загрузки данных MOEX', err);
        return of([]);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((shares) => this.shares.set(shares));
  }
}
