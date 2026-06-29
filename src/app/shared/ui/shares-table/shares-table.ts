import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  TuiTableDirective,
  TuiTableTbody,
  TuiTableTd,
  TuiTableTh,
} from '@taiga-ui/addon-table';
import { TuiPagination, TuiSegmented } from '@taiga-ui/kit';
import { RouterModule } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { Share } from '../../models/share.model';

@Component({
  selector: 'app-shares-table',
  standalone: true,
  imports: [
    CommonModule,
    TuiTableDirective,
    TuiTableTbody,
    TuiTableTh,
    TuiTableTd,
    TuiPagination,
    TuiSegmented,
    RouterModule,
    TranslocoPipe,
  ],
  templateUrl: './shares-table.html',
  styleUrl: './shares-table.less',
})
export class SharesTableComponent {
  @Input() data: Share[] = [];
  @Input() clickable = false;

  readonly pageSizeOptions = [10, 25, 50, 100];
  readonly pageSize = signal(10);
  readonly pageIndex = signal(0);

  sortBy = signal<keyof Share | null>(null);
  sortDirection = signal<'asc' | 'desc'>('asc');

  get pageSizeIndex(): number {
    return this.pageSizeOptions.indexOf(this.pageSize());
  }

  onPageSizeChange(index: number): void {
    this.pageSize.set(this.pageSizeOptions[index]);
    this.pageIndex.set(0);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.data.length / this.pageSize()));
  }

  readonly headers: ReadonlyArray<{
    key: keyof Share;
    labelKey: string;
  }> = [
    { key: 'code', labelKey: 'shareTable.code' },
    { key: 'name', labelKey: 'shareTable.name' },
    { key: 'last', labelKey: 'shareTable.last' },
    { key: 'changePercents', labelKey: 'shareTable.changePercents' },
    { key: 'first', labelKey: 'shareTable.first' },
    { key: 'min', labelKey: 'shareTable.min' },
    { key: 'max', labelKey: 'shareTable.max' },
    { key: 'volume', labelKey: 'shareTable.volume' },
    { key: 'time', labelKey: 'shareTable.time' },
  ];

  get sortedData(): Share[] {
    const column = this.sortBy();

    if (!column) {
      return this.data;
    }

    return [...this.data].sort((a, b) => {
      const aVal = a[column];
      const bVal = b[column];

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return this.sortDirection() === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
      }

      return this.sortDirection() === 'asc'
          ? Number(aVal) - Number(bVal)
          : Number(bVal) - Number(aVal);
    });
  }

  get paginatedData(): Share[] {
    const start = this.pageIndex() * this.pageSize();
    return this.sortedData.slice(start, start + this.pageSize());
  }

  onHeaderClick(key: keyof Share): void {
    if (this.sortBy() === key) {
      if (this.sortDirection() === 'asc') {
        this.sortDirection.set('desc');
      } else {
        this.sortBy.set(null);
      }
    } else {
      this.sortBy.set(key);
      this.sortDirection.set('asc');
    }
    this.pageIndex.set(0);
  }
}
