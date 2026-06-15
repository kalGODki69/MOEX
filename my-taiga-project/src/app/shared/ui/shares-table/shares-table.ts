import {Component, Input} from '@angular/core';
import {TuiTableDirective, TuiTableTbody, TuiTableTh} from '@taiga-ui/addon-table';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiFormatNumberPipe } from '@taiga-ui/core';

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
  imports: [
    TuiTableDirective,
    TuiTableTbody,
    TuiTableTh
  ],
  templateUrl: './shares-table.html',
  styleUrl: './shares-table.less',
})
export class SharesTableComponent {
  @Input() data: Share[] = [];
  @Input() language: 'en' | 'ru' = 'ru';

  get headers(): {key: keyof Share; label: string}[] {
    if(this.language=='en') {
      return [
        {key: 'code', label: 'Ticker'},
        {key: 'name', label: 'Name'},
        {key: 'last', label: 'Last'},
        {key: 'changePercents', label: 'Change, %'},
        {key: 'first', label: 'Open'},
        {key: 'min', label: 'Min.'},
        {key: 'max', label: 'Max.'},
        {key: 'volume', label: 'Volume'},
        {key: 'time', label: 'Timer'},
      ];
    } else {
      return [
        {key: 'code', label: 'Код'},
        {key: 'name', label: 'Наименование'},
        {key: 'last', label: 'Последняя'},
        {key: 'changePercents', label: 'Изменение, %'},
        {key: 'first', label: 'Первая'},
        {key: 'min', label: 'Мин.'},
        {key: 'max', label: 'Макс.'},
        {key: 'volume', label: 'Объем'},
        {key: 'time', label: 'Время'},
        ];
    }
  };
}
