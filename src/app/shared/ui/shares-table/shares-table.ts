import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  TuiTableDirective,
  TuiTableTbody,
  TuiTableTd,
  TuiTableTh,
} from '@taiga-ui/addon-table';
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
    RouterModule,
    TranslocoPipe,
  ],
  templateUrl: './shares-table.html',
  styleUrl: './shares-table.less',
})
export class SharesTableComponent implements OnInit {
  @Input() data: Share[] = [];
  @Input() clickable = false;

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  sortColumn: keyof Share | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

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

  ngOnInit(): void {
    this.updateTotalPages();
  }

  get sortedAndPaginatedData(): Share[] {
    let sortedData = this.data;

    if (this.sortColumn) {
      sortedData = [...this.data].sort((a, b) => {
        const aValue = a[this.sortColumn!];
        const bValue = b[this.sortColumn!];

        if (aValue === undefined || aValue === null) {
          return 1;
        }

        if (bValue === undefined || bValue === null) {
          return -1;
        }

        if (
            typeof aValue === 'string' &&
            typeof bValue === 'string'
        ) {
          return this.sortDirection === 'asc'
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue);
        }

        return this.sortDirection === 'asc'
            ? Number(aValue) - Number(bValue)
            : Number(bValue) - Number(aValue);
      });
    }

    const startIndex =
        (this.currentPage - 1) * this.itemsPerPage;

    return sortedData.slice(
        startIndex,
        startIndex + this.itemsPerPage
    );
  }

  sortBy(column: keyof Share): void {
    if (this.sortColumn === column) {
      this.sortDirection =
          this.sortDirection === 'asc'
              ? 'desc'
              : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.currentPage = 1;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  private updateTotalPages(): void {
    this.totalPages = Math.ceil(
        this.data.length / this.itemsPerPage
    );

    if (
        this.currentPage > this.totalPages &&
        this.totalPages > 0
    ) {
      this.currentPage = 1;
    }
  }
}