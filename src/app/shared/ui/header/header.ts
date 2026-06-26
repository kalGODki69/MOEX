import { Component, Input, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { TuiTitle, TuiRadio } from '@taiga-ui/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import { LanguageService } from '../../../services/language';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    TuiTitle,
    TuiRadio,
    TranslocoPipe,
  ],
  templateUrl: './header.html',
  styleUrl: './header.less',
})
export class Header {
  @Input() title = '';

  private readonly languageService = inject(LanguageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = new FormGroup({
    choice: new FormControl<'ru' | 'en'>('ru'),
  });

  constructor() {
    this.form.controls.choice.setValue(
        this.languageService.getCurrentLanguageCode()
    );

    this.form.controls.choice.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((lang) => {
          if (lang) {
            this.languageService.setLanguage(lang);
          }
        });
  }
}