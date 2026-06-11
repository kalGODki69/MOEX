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
  ];
}
