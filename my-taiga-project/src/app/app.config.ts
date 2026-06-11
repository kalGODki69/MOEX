import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {provideTaiga} from '@taiga-ui/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideTaiga(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes)
  ]
};
