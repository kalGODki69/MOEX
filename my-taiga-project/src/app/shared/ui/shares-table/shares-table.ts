import { Component, inject, Input, OnInit } from '@angular/core';
import { TuiTableDirective, TuiTableTbody, TuiTableTd, TuiTableTh } from '@taiga-ui/addon-table';
import { LanguageService } from '../../../services/language';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Share } from '../../models/share.model';
import { RouterModule } from '@angular/router';

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
  ],
  templateUrl: './shares-table.html',
  styleUrl: './shares-table.less',
})
export class SharesTableComponent implements OnInit {
  private langService = inject(LanguageService);
  @Input() data: Share[] = [];
  @Input() clickable: boolean = false;

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  sortColumn: keyof Share | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  get sortedAndPaginatedData(): Share[] {
    let sortedData = this.data;
    if (this.sortColumn) {
      sortedData = [...this.data].sort((a, b) => {
        const aValue = a[this.sortColumn!];
        const bValue = b[this.sortColumn!];

        if (aValue === undefined || aValue === null) return 1;
        if (bValue === undefined || bValue === null) return -1;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return this.sortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        } else {
          return this.sortDirection === 'asc'
            ? (aValue as number) - (bValue as number)
            : (bValue as number) - (aValue as number);
        }
      });
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return sortedData.slice(startIndex, endIndex);
  }


  headers$: Observable<{ key: keyof Share; label: string }[]> = this.langService.langCode$.pipe(
    map((lang) => {
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

  ngOnInit() {
    this.updateTotalPages();
  }

  private updateTotalPages() {
    this.totalPages = Math.ceil(this.data.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = 1;
    }
  }

  sortBy(column: keyof Share) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.currentPage = 1;
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  paginationLabels$: Observable<{ previous: string; next: string; pageInfo: string }> =
    this.langService.langCode$.pipe(
      map((lang) => {
        if (lang === 'en') {
          return {
            previous: '← Previous',
            next: 'Next →',
            pageInfo: 'Page {{current}} of {{total}}',
          };
        } else {
          return {
            previous: '← Назад',
            next: 'Вперед →',
            pageInfo: 'Страница {{current}} из {{total}}',
          };
        }
      })
    );
}
