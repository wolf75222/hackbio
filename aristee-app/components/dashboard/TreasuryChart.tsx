'use client';

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { MonthlyData } from '@/lib/types/treasury';

interface TreasuryChartProps {
  data: MonthlyData[];
  securityCushion: number;
}

export function TreasuryChart({ data, securityCushion }: TreasuryChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12 }}
          stroke="#6b7280"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          stroke="#6b7280"
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
          formatter={(value: number) => `${value.toLocaleString('fr-FR')} €`}
        />
        <Legend
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="circle"
        />

        {/* Security cushion reference line */}
        <ReferenceLine
          y={securityCushion}
          stroke="#f59e0b"
          strokeDasharray="5 5"
          label={{ value: 'Coussin de sécurité', position: 'right', fill: '#f59e0b', fontSize: 12 }}
        />

        {/* Bars for income and expenses */}
        <Bar
          dataKey="encaissements"
          fill="#10b981"
          name="Encaissements"
          radius={[4, 4, 0, 0]}
          opacity={0.8}
        />
        <Bar
          dataKey="decaissements"
          fill="#ef4444"
          name="Décaissements"
          radius={[4, 4, 0, 0]}
          opacity={0.8}
        />

        {/* Line for treasury balance */}
        <Line
          type="monotone"
          dataKey="tresorerie"
          stroke="#14532d"
          strokeWidth={2}
          name="Trésorerie"
          dot={{ r: 4, fill: '#14532d' }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
