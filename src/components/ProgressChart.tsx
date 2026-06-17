"use client";

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

interface ChartData {
  day: string;
  missions: number;
}

interface ProgressChartProps {
  data: ChartData[];
}

export default function ProgressChart({ data }: ProgressChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
        {/* Garis background putus-putus biar elegan */}
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        
        {/* Sumbu X (Hari) */}
        <XAxis 
          dataKey="day" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} 
          dy={10}
        />
        
        {/* Sumbu Y (Jumlah Misi) */}
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: '#94a3b8' }}
          allowDecimals={false}
        />
        
        {/* Tooltip pas bar-nya diklik/hover */}
        <Tooltip 
          cursor={{ fill: '#f8fafc' }}
          contentStyle={{ 
            borderRadius: '12px', 
            border: 'none', 
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            fontWeight: 'bold',
            color: '#334155'
          }}
        />
        
        {/* Batang Grafik (Warna Ungu Kidokids) */}
        <Bar 
          dataKey="missions" 
          name="Misi Selesai"
          fill="#9333ea" 
          radius={[6, 6, 0, 0]} 
          barSize={28} 
        />
      </BarChart>
    </ResponsiveContainer>
  );
}