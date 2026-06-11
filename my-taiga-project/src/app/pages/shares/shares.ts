import { Component } from '@angular/core';
import {TuiTitle} from '@taiga-ui/core';
import {TuiRadio} from '@taiga-ui/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {TuiComboBox} from '@taiga-ui/kit';

@Component({
  selector: 'app-shares',
  imports: [
    TuiTitle
    , TuiRadio, ReactiveFormsModule, TuiComboBox
  ],
  templateUrl: './shares.html',
  styleUrl: './shares.less',
})
export class Shares {
  form = new FormGroup({
    choice: new FormControl('option1')
  });
}
