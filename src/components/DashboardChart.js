'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardChart({ data }) {
  if (!data || data.length === 0) {
    return <div style={{ color: 'var(--text-secondary)', textAlign: 'center', paddingTop: '100px' }}>Sem dados suficientes para o gráfico.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
        <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
        <Tooltip 
          contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
          itemStyle={{ color: 'var(--text-primary)' }}
        />
        <Line type="monotone" dataKey="entregues" name="Entregues" stroke="var(--success)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="atrasados" name="Atrasados" stroke="var(--danger)" strokeWidth={3} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
