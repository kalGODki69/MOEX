import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { TuiCardLarge } from '@taiga-ui/layout';
import { TranslocoPipe } from '@jsverse/transloco';
import { Share } from '../../models/share.model';

@Component({
  selector: 'app-trade-data',
  standalone: true,
  imports: [DecimalPipe, TuiCardLarge, TranslocoPipe],
  templateUrl: './trade-data.html',
  styleUrl: './trade-data.less',
})
export class TradeDataComponent {
  @Input({ required: true }) share!: Share;
}
