import { Component, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TuiTitle, TuiRadio } from '@taiga-ui/core';
import { LanguageService } from '../../services/language';
import { map } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import {TuiInputPhone} from '@taiga-ui/kit';

@Component({
  selector: 'app-shares',
  standalone: true,
  imports: [
    TuiTitle,
    TuiRadio,
    ReactiveFormsModule,
    AsyncPipe,
    TuiInputPhone
  ],
  templateUrl: './shares.html',
  styleUrls: ['./shares.less'],
})
export class Shares {
  private languageService = inject(LanguageService);
  private destroyRef = inject(DestroyRef);

  form = new FormGroup({
    choice: new FormControl<'en' | 'ru'>('ru'),
  });

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
}
