import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiTitle, TuiRadio } from '@taiga-ui/core';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { LanguageService } from '../../../services/language';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, TuiTitle, TuiRadio, ReactiveFormsModule],
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

  constructor() {
    this.form.controls.choice.setValue(this.languageService.getCurrentLanguageCode());

    this.form.controls.choice.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(lang => {
        if (lang) this.languageService.setLanguage(lang);
      });
  }
}
