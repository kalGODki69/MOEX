import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  TuiLanguage,
  TUI_RUSSIAN_LANGUAGE,
  TUI_ENGLISH_LANGUAGE,
} from '@taiga-ui/i18n';
import { TranslocoService } from '@jsverse/transloco';

export type AppLanguage = 'ru' | 'en';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly transloco = inject(TranslocoService);

  private readonly languageSubject =
      new BehaviorSubject<TuiLanguage>(TUI_RUSSIAN_LANGUAGE);

  readonly language$ = this.languageSubject.asObservable();

  private readonly langCodeSubject =
      new BehaviorSubject<AppLanguage>('ru');

  readonly langCode$ = this.langCodeSubject.asObservable();

  setLanguage(lang: AppLanguage): void {
    this.transloco.setActiveLang(lang);

    this.languageSubject.next(
        lang === 'en'
            ? TUI_ENGLISH_LANGUAGE
            : TUI_RUSSIAN_LANGUAGE
    );

    this.langCodeSubject.next(lang);
  }

  getCurrentLanguageCode(): AppLanguage {
    return this.langCodeSubject.value;
  }
}