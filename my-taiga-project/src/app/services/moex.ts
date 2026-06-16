import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Share } from '../shared/ui/shares-table/shares-table';

@Injectable({ providedIn: 'root' })
export class MoexService {
  private http = inject(HttpClient);
  private baseUrl = 'https://iss.moex.com/iss/engines/stock/markets/shares/boardgroups/57/securities.json?iss.only=marketdata,securities';
  private indexUrl = 'https://iss.moex.com/iss/engines/stock/markets/index/securities.json?iss.only=marketdata,securities';

  getShares(lang: 'ru' | 'en' = 'ru'): Observable<Share[]> {
    const url = `${this.baseUrl}&lang=${lang}&sort_column=SHORTNAME&sort_order=asc`;
    return this.http.get<any>(url).pipe(
      map(response => this.transformResponse(response))
    );
  }

  getIndices(lang: 'ru' | 'en' = 'ru'): Observable<Share[]> {
    const url = `${this.indexUrl}&lang=${lang}&sort_column=SHORTNAME&sort_order=asc`;
    return this.http.get<any>(url).pipe(
      map(response => this.transformResponse(response))
    );
  }

  private transformResponse(raw: any): Share[] {
    const securitiesData = raw.securities?.data || [];
    const securitiesColumns = raw.securities?.columns || [];
    const marketdataData = raw.marketdata?.data || [];
    const marketdataColumns = raw.marketdata?.columns || [];

    const idxCode = securitiesColumns.indexOf('SECID');
    const idxName = securitiesColumns.indexOf('SHORTNAME');

    const idxSecId = marketdataColumns.indexOf('SECID');
    const idxLast = marketdataColumns.indexOf('LAST');
    const idxChange = marketdataColumns.indexOf('CHANGE');
    const idxFirst = marketdataColumns.indexOf('OPEN');
    const idxMin = marketdataColumns.indexOf('LOW');
    const idxMax = marketdataColumns.indexOf('HIGH');
    const idxVolume = marketdataColumns.indexOf('VOLUME');
    const idxTime = marketdataColumns.indexOf('TIME');

    const marketMap = new Map<string, any>();
    for (const row of marketdataData) {
      const secid = row[idxSecId];
      if (secid) {
        const last = parseFloat(row[idxLast]);
        marketMap.set(secid, {
          last: isNaN(last) ? 0 : last,
          changePercents: this.calcChangePercent(row[idxChange], last),
          first: parseFloat(row[idxFirst]) || 0,
          min: parseFloat(row[idxMin]) || 0,
          max: parseFloat(row[idxMax]) || 0,
          volume: parseInt(row[idxVolume], 10) || 0,
          time: row[idxTime] || new Date().toLocaleTimeString(),
        });
      }
    }

    return securitiesData.map((row: any[]) => {
      const secid = row[idxCode];
      const market = marketMap.get(secid) || {};
      return {
        code: secid || '',
        name: row[idxName] || '',
        last: market.last ?? 0,
        changePercents: market.changePercents ?? 0,
        first: market.first ?? 0,
        min: market.min ?? 0,
        max: market.max ?? 0,
        volume: market.volume ?? 0,
        time: market.time ?? new Date().toLocaleTimeString(),
      };
    });
  }

  private calcChangePercent(changeRaw: any, last: number): number {
    const change = parseFloat(changeRaw);
    if (isNaN(change) || last === 0) return 0;
    const prev = last - change;
    if (prev === 0) return 0;
    return (change / prev) * 100;
  }
}
