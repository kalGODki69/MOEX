import { Routes } from '@angular/router';
import { Shares } from './pages/shares/shares';
import { Share } from './pages/share/share';
import { Indices } from './pages/indices/indices/indices';

export const routes: Routes = [
  { path: 'shares', component: Shares },
  { path: 'share/:secid', component: Share },
  { path: 'indices', component: Indices },
  { path: '', redirectTo: '/shares', pathMatch: 'full' },
];
