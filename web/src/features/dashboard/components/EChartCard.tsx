import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

interface EChartCardProps {
  title: string;
  description?: string;
  option: EChartsOption;
  height?: number;
}

export function EChartCard({ title, description, option, height = 280 }: EChartCardProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current, undefined, { renderer: 'canvas' });
    chartInstanceRef.current = chart;
    chart.setOption(option);

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
      chartInstanceRef.current = null;
    };
  }, [option]);

  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
      <div className="mb-4">
        <h3 className="text-sm font-semibold tracking-[0.18em] text-slate-100 uppercase">{title}</h3>
        {description && <p className="mt-1 text-xs leading-6 text-slate-400">{description}</p>}
      </div>
      <div ref={chartRef} style={{ height }} />
    </section>
  );
}
