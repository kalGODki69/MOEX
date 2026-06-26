import {
  ApplicationConfig,
  inject,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideTaiga } from '@taiga-ui/core';
import { TUI_LANGUAGE } from '@taiga-ui/i18n';
import { provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts';
import {
  provideTransloco,
} from '@jsverse/transloco';
import { routes } from './app.routes';
import { LanguageService } from './services/language';
import { TranslocoHttpLoader } from './transloco-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideTaiga(),

    provideBrowserGlobalErrorListeners(),

    provideHttpClient(),

    provideRouter(routes),

    provideEchartsCore({ echarts }),

    provideTransloco({
      config: {
        availableLangs: ['ru', 'en'],
        defaultLang: 'ru',
        fallbackLang: 'en',
        reRenderOnLangChange: true,
        prodMode: false,
      },
      loader: TranslocoHttpLoader,
    }),

    {
      provide: TUI_LANGUAGE,
      useFactory: () => {
        const languageService = inject(LanguageService);
        return languageService.language$;
      },
    },
  ],
};