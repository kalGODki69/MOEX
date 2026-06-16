import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import {TuiTableDirective, TuiTableTbody, TuiTableTd, TuiTableTh} from '@taiga-ui/addon-table';
import {LanguageService} from '../../../services/language';
import { CommonModule } from '@angular/common';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

export interface Share {
  code: string,
  name: string,
  last: number,
  changePercents: number,
  first: number,
  min: number,
  max: number,
  volume: number,
  time: string
}

@Component({
  selector: 'app-shares-table',
  standalone: true,
  imports: [
    CommonModule,
    TuiTableDirective,
    TuiTableTbody,
    TuiTableTh,
    TuiTableTd,
  ],
  templateUrl: './shares-table.html',
  styleUrl: './shares-table.less',
})

export class SharesTableComponent {
  private langService = inject(LanguageService);
  @Input() data: Share[] = [];
  @Output() rowClick = new EventEmitter<string>();

  headers$: Observable<{ key: keyof Share; label: string }[]> = this.langService.langCode$.pipe(
    map(lang => {
      if (lang === 'en') {
        return [
          { key: 'code', label: 'Ticker' },
          { key: 'name', label: 'Name' },
          { key: 'last', label: 'Last' },
          { key: 'changePercents', label: 'Change, %' },
          { key: 'first', label: 'Open' },
          { key: 'min', label: 'Min.' },
          { key: 'max', label: 'Max.' },
          { key: 'volume', label: 'Volume' },
          { key: 'time', label: 'Time' },
        ];
      } else {
        return [
          { key: 'code', label: 'Код' },
          { key: 'name', label: 'Наименование' },
          { key: 'last', label: 'Последняя' },
          { key: 'changePercents', label: 'Изменение, %' },
          { key: 'first', label: 'Первая' },
          { key: 'min', label: 'Мин.' },
          { key: 'max', label: 'Макс.' },
          { key: 'volume', label: 'Объем' },
          { key: 'time', label: 'Время' },
        ];
      }
    })
  );

  onRowClick(secid: string): void {
    this.rowClick.emit(secid);
  }
}
