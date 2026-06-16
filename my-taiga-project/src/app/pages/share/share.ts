import { Component, inject, DestroyRef, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TuiTitle, TuiRadio } from '@taiga-ui/core';
import { LanguageService } from '../../services/language';
import { MoexService } from '../../services/moex';
import { Share as ShareInterface } from '../../shared/ui/shares-table/shares-table';
import { Observable, of, combineLatest, map, switchMap, catchError } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-share',
  standalone: true,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    TuiTitle,
    TuiRadio,
  ],
  templateUrl: './share.html',
  styleUrl: './share.less',
})
export class Share implements OnInit {
  private languageService = inject(LanguageService);
  private moexService = inject(MoexService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  form = new FormGroup({
    choice: new FormControl<'en' | 'ru'>('ru'),
  });

  instrument$!: Observable<ShareInterface | null>;
  title$!: Observable<string>;

  constructor() {
    this.form.controls.choice.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(lang => {
        if (lang) this.languageService.setLanguage(lang);
      });
  }

  ngOnInit(): void {
    const params$ = this.route.params.pipe(
      map(params => ({
        type: params['type'] as 'share' | 'index',
        secid: params['secid'] as string,
      }))
    );

    this.instrument$ = params$.pipe(
      switchMap(({ type, secid }) => {
        if (!secid) return of(null);
        let request$: Observable<ShareInterface | null>;
        if (type === 'share') {
          request$ = this.moexService.getShare(secid);
        } else if (type === 'index') {
          request$ = this.moexService.getIndex(secid);
        } else {
          return of(null);
        }
        return request$.pipe(catchError(() => of(null)));
      })
    );

    this.title$ = combineLatest([
      this.languageService.langCode$,
      this.instrument$
    ]).pipe(
      map(([lang, instrument]) => {
        const prefix = 'MOEX';
        const currentType = this.route.snapshot.params['type'];
        let typeText: string;
        if (currentType === 'share') {
          typeText = lang === 'ru' ? 'Акции' : 'Shares';
        } else {
          typeText = lang === 'ru' ? 'Индексы' : 'Indices';
        }
        const name = instrument?.name || instrument?.code || '';
        return `${prefix} / ${typeText} / ${name}`;
      })
    );
  }
}
