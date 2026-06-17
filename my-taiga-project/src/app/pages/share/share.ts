import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { LanguageService } from '../../services/language';
import { MoexService } from '../../services/moex';
import { Share as ShareInterface } from '../../shared/ui/shares-table/shares-table';
import { Observable, of, combineLatest, map, switchMap, catchError } from 'rxjs';
import { Header } from '../../shared/ui/header/header';

@Component({
  selector: 'app-share',
  standalone: true,
  imports: [
    AsyncPipe,
    Header,
  ],
  templateUrl: './share.html',
  styleUrl: './share.less',
})
export class Share implements OnInit {
  private languageService = inject(LanguageService);
  private moexService = inject(MoexService);
  private route = inject(ActivatedRoute);

  instrument$!: Observable<ShareInterface | null>;
  title$!: Observable<string>;

  ngOnInit(): void {
    const secid$ = this.route.params.pipe(
      map(params => params['secid'] as string)
    );

    this.instrument$ = secid$.pipe(
      switchMap(secid => {
        if (!secid) return of(null);
        return this.moexService.getShare(secid).pipe(
          catchError(() => of(null))
        );
      })
    );

    this.title$ = combineLatest([
      this.languageService.langCode$,
      this.instrument$
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
