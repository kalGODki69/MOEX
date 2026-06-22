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
  itemsPerPage: number = 10; // Можно сделать 10, 25, 50
  totalPages: number = 1;

  // Геттер, который возвращает данные для текущей страницы
  get paginatedData(): Share[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.data.slice(startIndex, endIndex);
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
    // Пересчитываем общее количество страниц при каждом изменении данных
    this.updateTotalPages();
  }

  // Обновляем количество страниц
  private updateTotalPages() {
    this.totalPages = Math.ceil(this.data.length / this.itemsPerPage);
    // Если текущая страница стала больше общего количества, сбрасываем на первую
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = 1;
    }
  }

  // Переключение на предыдущую страницу
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // Переключение на следующую страницу
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
}
