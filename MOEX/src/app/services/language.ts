import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TuiLanguage, TUI_RUSSIAN_LANGUAGE, TUI_ENGLISH_LANGUAGE } from '@taiga-ui/i18n';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private languageSubject = new BehaviorSubject<TuiLanguage>(TUI_RUSSIAN_LANGUAGE);
  public language$ = this.languageSubject.asObservable();

  private langCodeSubject = new BehaviorSubject<'ru' | 'en'>('ru');
  public langCode$ = this.langCodeSubject.asObservable();

  setLanguage(lang: 'en' | 'ru'): void {
    const newLanguage = lang === 'en' ? TUI_ENGLISH_LANGUAGE : TUI_RUSSIAN_LANGUAGE;
    this.languageSubject.next(newLanguage);
    this.langCodeSubject.next(lang);
  }

  getCurrentLanguageCode(): 'ru' | 'en' {
    return this.langCodeSubject.value;
  }
}
