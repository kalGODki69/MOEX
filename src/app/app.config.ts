import {
  ApplicationConfig,
  APP_INITIALIZER,
  inject,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { provideTaiga } from '@taiga-ui/core';
import { TUI_LANGUAGE, TUI_RUSSIAN_LANGUAGE, TUI_ENGLISH_LANGUAGE } from '@taiga-ui/i18n';
import { provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts';
import {
  provideTransloco,
  TranslocoService,
} from '@jsverse/transloco';
import { first, map } from 'rxjs';
import { routes } from './app.routes';
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
      provide: APP_INITIALIZER,
      useFactory: () => {
        const transloco = inject(TranslocoService);
        return () => transloco.load('ru').pipe(first()).toPromise();
      },
      multi: true,
    },

    {
      provide: TUI_LANGUAGE,
      useFactory: () => {
        const transloco = inject(TranslocoService);
        return toSignal(
          transloco.langChanges$.pipe(
            map((lang) => lang === 'en' ? TUI_ENGLISH_LANGUAGE : TUI_RUSSIAN_LANGUAGE),
          ),
          { initialValue: TUI_RUSSIAN_LANGUAGE },
        );
      },
    },
  ],
};