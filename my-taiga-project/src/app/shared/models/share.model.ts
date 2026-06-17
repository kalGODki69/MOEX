export interface Share {
  code: string;
  name: string;
  last: number;
  changePercents: number;
  first: number;
  min: number;
  max: number;
  volume: number;
  time: string;
  isin?: string;
  boardId?: string;
  boardName?: string;
  listLevel?: number;
  lotSize?: number;
  prevDate?: string;
  status?: string;
  value?: number;
  prevPrice?: number;
  open?: number;
  low?: number;
  high?: number;
  valueToday?: number;
  volumeToday?: number;
  numTrades?: number;
  valueTodayRur?: number;
  valueTodayUsd?: number;
}
