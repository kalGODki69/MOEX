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

  // Поток с данными конкретной акции
  share$!: Observable<ShareInterface | null>;

  // Адаптивный заголовок в формате "MOEX / Акции / Название"
  title$!: Observable<string>;

  constructor() {
    this.form.controls.choice.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(lang => {
        if (lang) this.languageService.setLanguage(lang);
      });
  }

  ngOnInit(): void {
    // Получаем secid из параметров маршрута
    const secid$ = this.route.params.pipe(
      map(params => params['secid'])
    );

    // Загружаем данные акции
    this.share$ = secid$.pipe(
      switchMap(secid => {
        if (!secid) return of(null);
        return this.moexService.getShare(secid).pipe(
          catchError(() => of(null))
        );
      })
    );

    // Формируем заголовок: MOEX / [Тип] / [Название]
    this.title$ = combineLatest([
      this.languageService.langCode$,
      this.share$
    ]).pipe(
      map(([lang, share]) => {
        const prefix = 'MOEX';
        const type = lang === 'ru' ? 'Акции' : 'Shares';
        const name = share?.name || share?.code || '';
        return `${prefix} / ${type} / ${name}`;
      })
    );
  }
}
