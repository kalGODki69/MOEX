import { Routes } from '@angular/router';
import { Shares } from './pages/shares/shares';
import {Share} from './pages/share/share';

export const routes: Routes = [
  {path: 'shares', component: Shares},
  { path: 'share/:secid', component: Share },
];
