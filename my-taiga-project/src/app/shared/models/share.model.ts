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
  prevPrice?: number;
  open?: number;
  low?: number;
  high?: number;
  value?: number;
  numTrades?: number;
}
