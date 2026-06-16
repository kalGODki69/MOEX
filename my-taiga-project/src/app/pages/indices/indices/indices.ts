import { Component, inject, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TuiTitle, TuiRadio } from '@taiga-ui/core';
import { LanguageService } from '../../../services/language';
import { map, startWith, switchMap, catchError } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { Observable, of } from 'rxjs';
import { SharesTableComponent, Share } from '../../../shared/ui/shares-table/shares-table';
import { MoexService } from '../../../services/moex';
import {Router} from '@angular/router';

@Component({
  selector: 'app-indices',
  standalone: true,
  imports: [
    TuiTitle,
    TuiRadio,
    ReactiveFormsModule,
    AsyncPipe,
    SharesTableComponent,
  ],
  templateUrl: './indices.html',
  styleUrls: ['./indices.less'],
})
export class Indices implements OnInit {
  private languageService = inject(LanguageService);
  private moexService = inject(MoexService);
  private destroyRef = inject(DestroyRef);

  private router = inject(Router);

  navigateToInstrument(secid: string): void {
    this.router.navigate(['/share/index', secid]);
  }

  form = new FormGroup({
    choice: new FormControl<'en' | 'ru'>('ru'),
  });

  indices$!: Observable<Share[]>;
  title$ = this.languageService.langCode$.pipe(
    map(lang => lang === 'ru' ? 'MOEX / Индексы' : 'MOEX / Indices')
  );

  constructor() {
    this.form.controls.choice.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(lang => {
        if (lang) this.languageService.setLanguage(lang);
      });
  }

  ngOnInit(): void {
    this.indices$ = this.languageService.langCode$.pipe(
      startWith(this.languageService.getCurrentLanguageCode()),
      switchMap(lang => this.moexService.getIndices(lang)),
      catchError(err => {
        console.error('Ошибка загрузки данных MOEX индексов', err);
        return of([]);
      })
    );
  }
}
