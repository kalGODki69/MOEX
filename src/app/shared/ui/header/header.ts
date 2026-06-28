import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TuiTitle } from '@taiga-ui/core';
import { TuiSegmented, TuiTabs, TuiTab } from '@taiga-ui/kit';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { LayoutService } from '../../../services/layout.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TuiTitle,
    TuiSegmented,
    TuiTabs,
    TuiTab,
    TranslocoPipe,
  ],
  templateUrl: './header.html',
  styleUrl: './header.less',
})
export class Header {
  private readonly transloco = inject(TranslocoService);
  private readonly router = inject(Router);
  protected readonly layout = inject(LayoutService);

  readonly languages = ['en', 'ru'] as const;

  get activeLangIndex(): number {
    return this.transloco.getActiveLang() === 'en' ? 0 : 1;
  }

  onLangChange(index: number): void {
    this.transloco.setActiveLang(this.languages[index]);
  }

  // Показываем навигацию только если мы не на странице акции (share/:secid)
  get showNavigation(): boolean {
    return !this.router.url.startsWith('/share/');
  }
}