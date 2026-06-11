import { Component } from '@angular/core';
import { TuiTitle, TuiRadio } from '@taiga-ui/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TuiComboBox } from '@taiga-ui/kit';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiFormatNumberPipe } from '@taiga-ui/core';

@Component({
  selector: 'app-shares',
  imports: [TuiTitle, TuiRadio, ReactiveFormsModule, TuiComboBox, TuiTable, TuiFormatNumberPipe],
  templateUrl: './shares.html',
  styleUrl: './shares.less',
})
export class Shares {
  form = new FormGroup({
    choice: new FormControl('option1')
  });

  protected readonly data = [
    { name: 'Сбербанк', ticker: 'SBER', price: 312.5, change: 1.2 },
    { name: 'Газпром', ticker: 'GAZP', price: 164.8, change: -0.8 },
    { name: 'Лукойл', ticker: 'LKOH', price: 7240.0, change: 2.1 },
    { name: 'Яндекс', ticker: 'YNDX', price: 4150.0, change: 0.5 },
  ];
}
