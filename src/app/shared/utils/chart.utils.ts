import { EChartsOption } from 'echarts';
import { MONTH_NAMES } from '../constants/share.constants';

interface CandleData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function calculateStats(data: CandleData[]) {
  if (!data?.length) {
    return null;
  }

  const closes = data.map((c) => c.close);
  const open = closes[0];
  const close = closes[closes.length - 1];
  const high = Math.max(...closes);
  const low = Math.min(...closes);
  const changePercent = open !== 0 ? ((close - open) / open) * 100 : 0;
  const totalVolume = data.reduce((sum, c) => sum + c.volume, 0);

  return { open, high, low, close, changePercent, volume: totalVolume };
}

export function buildChartOptions(
  data: CandleData[],
  lang: 'ru' | 'en'
): EChartsOption | null {
  if (!data?.length) {
    return null;
  }

  const dates = data.map((item) => item.date);
  const prices = data.map((item) => item.close);
  const volumes = data.map((item) => item.volume);
  const totalVolume = volumes.reduce((sum, value) => sum + value, 0);

  const barData = data.map((item, index) => {
    let color = '#6d89f9';

    if (index > 0) {
      const prevClose = data[index - 1].close;
      color = item.close >= prevClose ? '#00a651' : '#e53935';
    } else {
      color = item.close >= item.open ? '#00a651' : '#e53935';
    }

    return {
      value: item.volume,
      itemStyle: { color },
    };
  });

  const priceLabel = lang === 'ru' ? 'Цена' : 'Price';
  const volumeLabel = lang === 'ru' ? 'Объём' : 'Volume';
  const volumeText = lang === 'ru' ? 'Объем' : 'Volume';

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        let result = params[0].axisValue + '<br/>';
        params.forEach((p: any) => {
          if (p.seriesName) {
            result += `${p.seriesName}: ${p.value}<br/>`;
          }
        });
        return result;
      },
    },
    graphic: [
      {
        type: 'text',
        left: '5%',
        top: '68%',
        style: {
          text: `${volumeText}: ${totalVolume.toLocaleString()}`,
          fill: '#888',
          fontSize: 14,
          fontWeight: 'bold',
        },
      },
    ],
    grid: [
      { left: '5%', right: '5%', top: '10%', height: '50%' },
      { left: '5%', right: '5%', top: '67%', height: '25%' },
    ],
    xAxis: [
      {
        type: 'category',
        data: dates,
        gridIndex: 0,
        axisLabel: { show: false },
        splitLine: { show: false },
      },
      {
        type: 'category',
        data: dates,
        gridIndex: 1,
        axisLabel: {
          rotate: 30,
          interval: 'auto',
          fontSize: 10,
          color: '#888',
          formatter: (value: string) => {
            const date = new Date(value);
            return `${date.getDate()} ${MONTH_NAMES[lang][date.getMonth()]}`;
          },
        },
        splitLine: { show: false },
      },
    ],
    yAxis: [
      {
        type: 'value',
        gridIndex: 0,
        scale: true,
        splitLine: { show: true },
        position: 'right',
      },
      {
        type: 'value',
        gridIndex: 1,
        scale: true,
        splitLine: { show: true },
        position: 'right',
        max: (value: { max: number; min: number }) => value.max * 1.1,
      },
    ],
    series: [
      {
        name: priceLabel,
        type: 'line',
        data: prices,
        smooth: true,
        lineStyle: { color: '#6d89f9', width: 2 },
        areaStyle: { color: '#0743d6', opacity: 0.1 },
        symbol: 'circle',
        symbolSize: 4,
        xAxisIndex: 0,
        yAxisIndex: 0,
        markLine:
          prices.length > 0
            ? {
                silent: true,
                symbol: 'none',
                lineStyle: { color: 'rgb(52 193 126)', type: 'dashed', width: 2 },
                label: { show: false },
                data: [{ yAxis: prices[prices.length - 1] }],
              }
            : undefined,
      },
      {
        name: volumeLabel,
        type: 'bar',
        data: barData,
        xAxisIndex: 1,
        yAxisIndex: 1,
        barWidth: '80%',
      },
    ],
  };
}
