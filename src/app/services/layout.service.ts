import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LayoutService {
    // Сигнал для заголовка
    readonly title = signal<string>('MOEX');
}