import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TuiTitle, TuiRadio } from '@taiga-ui/core';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { LanguageService } from '../../../services/language';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, TuiTitle, TuiRadio, ReactiveFormsModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.less',
})
export class Header {
  @Input() title: string = '';

  private languageService = inject(LanguageService);
  private destroyRef = inject(DestroyRef);

  form = new FormGroup({
    choice: new FormControl<'en' | 'ru'>('ru'),
  });

  navLinks$: Observable<{ link: string; label: string }[]> = this.languageService.langCode$.pipe(
    startWith(this.languageService.getCurrentLanguageCode()), // гарантируем начальное значение
    map((lang) => [
      { link: '/shares', label: lang === 'ru' ? 'Акции' : 'Shares' },
      { link: '/indices', label: lang === 'ru' ? 'Индексы' : 'Indices' },
    ])
  );

  constructor() {
    this.form.controls.choice.setValue(this.languageService.getCurrentLanguageCode());

    this.form.controls.choice.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((lang) => {
        if (lang) this.languageService.setLanguage(lang);
      });
  }
}
