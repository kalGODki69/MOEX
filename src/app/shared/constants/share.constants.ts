export const INTERVAL_LABELS = [
  { value: 1, labelKey: 'share.intervalLabels.1m' },
  { value: 5, labelKey: 'share.intervalLabels.5m' },
  { value: 30, labelKey: 'share.intervalLabels.30m' },
  { value: 60, labelKey: 'share.intervalLabels.60m' },
  { value: 1440, labelKey: 'share.intervalLabels.1440m' },
] as const;

export const MONTH_NAMES: Record<'ru' | 'en', string[]> = {
  ru: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

export const CHART_REFRESH_INTERVAL = 5000;
export const LIST_REFRESH_INTERVAL = 30000;
