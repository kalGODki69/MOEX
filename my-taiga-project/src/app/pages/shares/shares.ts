import { Component, inject, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TuiTitle, TuiRadio } from '@taiga-ui/core';
import { LanguageService } from '../../services/language';
import { map, startWith, switchMap, catchError } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { Observable, of } from 'rxjs';
import { SharesTableComponent, Share } from '../../shared/ui/shares-table/shares-table';
import { MoexService } from '../../services/moex';

@Component({
  selector: 'app-shares',
  standalone: true,
  imports: [
    TuiTitle,
    TuiRadio,
    ReactiveFormsModule,
    AsyncPipe,
    SharesTableComponent
  ],
  templateUrl: './shares.html',
  styleUrls: ['./shares.less'],
})
export class Shares implements OnInit {
  private languageService = inject(LanguageService);
  private moexService = inject(MoexService);
  private destroyRef = inject(DestroyRef);

  form = new FormGroup({
    choice: new FormControl<'en' | 'ru'>('ru'),
  });

  shares$!: Observable<Share[]>;
  title$ = this.languageService.langCode$.pipe(
    map(lang => lang === 'ru' ? 'MOEX / Акции' : 'MOEX / Shares')
  );

  constructor() {
    this.form.controls.choice.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(lang => {
        if (lang) this.languageService.setLanguage(lang);
      });
  }

  ngOnInit(): void {
    this.shares$ = this.languageService.langCode$.pipe(
      startWith(this.languageService.getCurrentLanguageCode()),
      switchMap(lang => this.moexService.getShares(lang)),
      catchError(err => {
        console.error('Ошибка загрузки данных MOEX', err);
        return of([]);
      })
    );
  }
}
