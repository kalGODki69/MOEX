import { ApplicationConfig, provideBrowserGlobalErrorListeners, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideTaiga } from '@taiga-ui/core';
import { TUI_LANGUAGE } from '@taiga-ui/i18n';
import { LanguageService } from './services/language';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideTaiga(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    {
      provide: TUI_LANGUAGE,
      useFactory: () => {
        const languageService = inject(LanguageService);
        return languageService.language$;
      }
    }
  ]
};
