import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, map, of, tap} from 'rxjs';
import { Share } from '../shared/models/share.model';
import {catchError} from 'rxjs/operators';

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

  getShare(secid: string, lang: 'ru' | 'en' = 'ru'): Observable<Share> {
    const url = `https://iss.moex.com/iss/engines/stock/markets/shares/boardgroups/57/securities/${secid}.json?iss.only=marketdata,securities&lang=${lang}`;
    return this.http.get<any>(url).pipe(
      map(response => {
        const shares = this.transformResponse(response);
        return shares.length > 0 ? shares[0] : null;
      }),
      map(share => share ?? {
        code: secid,
        name: '',
        last: 0,
        changePercents: 0,
        first: 0,
        min: 0,
        max: 0,
        volume: 0,
        time: ''
      })
    );
  }

  private transformResponse(raw: any): Share[] {
    const securitiesData = raw.securities?.data || [];
    const securitiesColumns = raw.securities?.columns || [];
    const marketdataData = raw.marketdata?.data || [];
    const marketdataColumns = raw.marketdata?.columns || [];

    const idxCode = securitiesColumns.indexOf('SECID');
    const idxName = securitiesColumns.indexOf('SHORTNAME');
    const idxIsin = securitiesColumns.indexOf('ISIN');
    const idxBoardId = securitiesColumns.indexOf('BOARDID');
    const idxBoardName = securitiesColumns.indexOf('BOARDNAME');
    const idxListLevel = securitiesColumns.indexOf('LISTLEVEL');
    const idxLotSize = securitiesColumns.indexOf('LOTSIZE');
    const idxPrevDate = securitiesColumns.indexOf('PREVDATE');
    const idxStatus = securitiesColumns.indexOf('STATUS');
    const idxPrevPrice = securitiesColumns.indexOf('PREVPRICE');

    const idxSecId = marketdataColumns.indexOf('SECID');
    const idxLast = this.findColumnIndex(marketdataColumns, ['LAST', 'LASTVALUE', 'CURRENTVALUE', 'CLOSEPRICE']);
    const idxFirst = this.findColumnIndex(marketdataColumns, ['OPEN', 'OPENVALUE', 'FIRST']);
    const idxMin = this.findColumnIndex(marketdataColumns, ['LOW', 'LOWVALUE', 'MIN']);
    const idxMax = this.findColumnIndex(marketdataColumns, ['HIGH', 'HIGHVALUE', 'MAX']);
    const idxVolume = this.findColumnIndex(marketdataColumns, ['VOLUME', 'VOLTODAY', 'QTY']);
    const idxTime = this.findColumnIndex(marketdataColumns, ['TIME', 'UPDATETIME', 'SYSTIME']);

    const idxValueToday = marketdataColumns.indexOf('VALTODAY');
    const idxValueTodayRur = marketdataColumns.indexOf('VALTODAY_RUR');
    const idxValueTodayUsd = marketdataColumns.indexOf('VALTODAY_USD');
    const idxNumTrades = marketdataColumns.indexOf('NUMTRADES');

    const idxLastChangePcnt = marketdataColumns.indexOf('LASTCHANGEPRCNT');
    const idxChange = marketdataColumns.indexOf('CHANGE');

    const marketMap = new Map<string, any>();

    for (const row of marketdataData) {
      const secid = row[idxSecId];
      if (secid) {
        const last = parseFloat(row[idxLast]);
        let changePercents = 0;

        if (idxLastChangePcnt !== -1) {
          const raw = parseFloat(row[idxLastChangePcnt]);
          if (!isNaN(raw)) changePercents = raw;
        }

        if (changePercents === 0 && idxChange !== -1) {
          const change = parseFloat(row[idxChange]);
          if (!isNaN(change) && last !== 0) {
            const prev = last - change;
            if (prev !== 0) changePercents = (change / prev) * 100;
          }
        }

        if (changePercents === 0) {
          const idxChangeValue = this.findColumnIndex(marketdataColumns, ['CHANGEVALUE', 'LASTCHANGE']);
          if (idxChangeValue !== -1) {
            const change = parseFloat(row[idxChangeValue]);
            if (!isNaN(change) && last !== 0) {
              const prev = last - change;
              if (prev !== 0) changePercents = (change / prev) * 100;
            }
          }
        }

        marketMap.set(secid, {
          last: isNaN(last) ? 0 : last,
          changePercents: changePercents,
          first: parseFloat(row[idxFirst]) || 0,
          min: parseFloat(row[idxMin]) || 0,
          max: parseFloat(row[idxMax]) || 0,
          volume: parseInt(row[idxVolume], 10) || 0,
          time: row[idxTime] || new Date().toLocaleTimeString(),

          open: parseFloat(row[idxFirst]) || 0,
          low: parseFloat(row[idxMin]) || 0,
          high: parseFloat(row[idxMax]) || 0,
          valueToday: parseFloat(row[idxValueToday]) || 0,
          valueTodayRur: parseFloat(row[idxValueTodayRur]) || 0,
          valueTodayUsd: parseFloat(row[idxValueTodayUsd]) || 0,
          numTrades: parseInt(row[idxNumTrades], 10) || 0,
          volumeToday: parseInt(row[idxVolume], 10) || 0,
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
        isin: row[idxIsin] || '',
        boardId: row[idxBoardId] || '',
        boardName: row[idxBoardName] || '',
        listLevel: parseInt(row[idxListLevel], 10) || 0,
        lotSize: parseInt(row[idxLotSize], 10) || 0,
        prevDate: row[idxPrevDate] || '',
        status: row[idxStatus] || '',
        prevPrice: parseFloat(row[idxPrevPrice]) || 0,
        open: market.open ?? 0,
        low: market.low ?? 0,
        high: market.high ?? 0,
        valueToday: market.valueToday ?? 0,
        valueTodayRur: market.valueTodayRur ?? 0,
        valueTodayUsd: market.valueTodayUsd ?? 0,
        numTrades: market.numTrades ?? 0,
        volumeToday: market.volumeToday ?? 0,
      };
    });
  }

  private findColumnIndex(columns: string[], possibleNames: string[]): number {
    for (const name of possibleNames) {
      const idx = columns.indexOf(name);
      if (idx !== -1) return idx;
    }
    return -1;
  }

  getCandles(secid: string, from: string, till: string, interval: number = 24, lang: 'ru' | 'en' = 'ru'): Observable<{ date: string; value: number }[]> {
    const url = `https://iss.moex.com/iss/engines/stock/markets/shares/securities/${secid}/candles.json?from=${from}&till=${till}&interval=${interval}&lang=${lang}`;
    console.log('Запрос свечей:', url);
    return this.http.get<any>(url).pipe(
      tap(response => console.log('Ответ от API свечей:', response)),
      map(response => {
        const data = response.candles?.data || [];
        const columns = response.candles?.columns || [];
        const idxClose = columns.indexOf('close');
        const idxTime = columns.indexOf('begin');
        console.log('Индексы: close=', idxClose, 'begin=', idxTime);
        if (idxClose === -1 || idxTime === -1) return [];
        const result = data.map((row: any[]) => {
          const date = row[idxTime].split(' ')[0];
          const value = parseFloat(row[idxClose]);
          return { date, value };
        });
        console.log('Обработанные свечи:', result);
        return result;
      }),
      catchError(err => {
        console.error('Ошибка загрузки свечей:', err);
        return of([]);
      })
    );
  }
}
