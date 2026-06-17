import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable, of } from 'rxjs';
import { map, startWith, switchMap, catchError } from 'rxjs/operators';
import { SharesTableComponent, Share } from '../../shared/ui/shares-table/shares-table';
import { MoexService } from '../../services/moex';
import { LanguageService } from '../../services/language';
import { Router } from '@angular/router';
import { Header } from '../../shared/ui/header/header';

@Component({
  selector: 'app-shares',
  standalone: true,
  imports: [
    AsyncPipe,
    SharesTableComponent,
    Header,
  ],
  templateUrl: './shares.html',
  styleUrls: ['./shares.less'],
})
export class Shares implements OnInit {
  private languageService = inject(LanguageService);
  private moexService = inject(MoexService);
  private router = inject(Router);

  shares$!: Observable<Share[]>;
  title$ = this.languageService.langCode$.pipe(
    map(lang => lang === 'ru' ? 'MOEX / Акции' : 'MOEX / Shares')
  );

  navigateToShare(secid: string): void {
    this.router.navigate(['/share', secid]);
  }

  ngOnInit(): void {
    this.shares$ = this.languageService.langCode$.pipe(
      startWith(this.languageService.getCurrentLanguageCode()),
      switchMap(lang => this.moexService.getShares(lang)),
      catchError(err => {
        console.error('Ошибка загрузки данных MOEX', err);
        return of([]);
      })
    );
  }
}
