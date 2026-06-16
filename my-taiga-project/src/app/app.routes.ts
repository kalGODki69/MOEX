import { Routes } from '@angular/router';
import { Shares } from './pages/shares/shares';
import { Indices } from './pages/indices/indices/indices';
import { Share } from './pages/share/share';

export const routes: Routes = [
  { path: '', redirectTo: '/shares', pathMatch: 'full' },
  { path: 'shares', component: Shares },
  { path: 'indices', component: Indices },
  { path: 'share/:type/:secid', component: Share },
];
