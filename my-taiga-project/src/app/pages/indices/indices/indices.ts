import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import {combineLatest, interval, Observable, of} from 'rxjs';
import { map, startWith, switchMap, catchError } from 'rxjs/operators';
import { SharesTableComponent } from '../../../shared/ui/shares-table/shares-table';
import { Share } from '../../../shared/models/share.model';
import { MoexService } from '../../../services/moex';
import { LanguageService } from '../../../services/language';
import { Header } from '../../../shared/ui/header/header';

@Component({
  selector: 'app-indices',
  standalone: true,
  imports: [
    AsyncPipe,
    SharesTableComponent,
    Header,
  ],
  templateUrl: './indices.html',
  styleUrls: ['./indices.less'],
})
export class Indices implements OnInit {
  private languageService = inject(LanguageService);
  private moexService = inject(MoexService);

  indices$!: Observable<Share[]>;
  title$ = this.languageService.langCode$.pipe(
    map(lang => lang === 'ru' ? 'MOEX / Индексы' : 'MOEX / Indices')
  );

  ngOnInit(): void {
    const refreshInterval$ = interval(30000).pipe(startWith(0));
    this.indices$ = combineLatest([
      this.languageService.langCode$,
      refreshInterval$
    ]).pipe(
      switchMap(([lang]) => this.moexService.getIndices(lang)),
      catchError(err => {
        console.error('Ошибка загрузки данных MOEX индексов', err);
        return of([]);
      })
    );
  }
}
