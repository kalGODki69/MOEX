import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TuiTitle } from '@taiga-ui/core';
import { TuiSegmented, TuiTabs, TuiTab } from '@taiga-ui/kit';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

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
  @Input() title = '';

  private readonly transloco = inject(TranslocoService);

  readonly languages = ['en', 'ru'] as const;

  get activeLangIndex(): number {
    return this.transloco.getActiveLang() === 'en' ? 0 : 1;
  }

  onLangChange(index: number): void {
    this.transloco.setActiveLang(this.languages[index]);
  }
}
