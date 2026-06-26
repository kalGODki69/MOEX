import { Component, Input } from '@angular/core';
import { TuiCardLarge } from '@taiga-ui/layout';
import { TranslocoPipe } from '@jsverse/transloco';
import { Share } from '../../models/share.model';

@Component({
  selector: 'app-instrument-params',
  standalone: true,
  imports: [TuiCardLarge, TranslocoPipe],
  templateUrl: './instrument-params.html',
  styleUrl: './instrument-params.less',
})
export class InstrumentParamsComponent {
  @Input({ required: true }) share!: Share;
}
