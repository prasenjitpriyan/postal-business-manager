'use client';

import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const COLORS = ['#6366f1', '#ec4899', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#3b82f6', '#14b8a6'];

type TooltipValue = number | string | ReadonlyArray<number | string> | undefined;
type TooltipName = number | string | undefined;

interface ReportsOverviewChartsProps {
  summary: {
    accountsByType: Array<{ name: string; value: number; percentage?: number; formattedPercentage?: string }>;
    accountsByOfficial: Array<{ name: string; accounts: number }>;
  };
}

export function ReportsOverviewCharts({ summary }: ReportsOverviewChartsProps) {
  const accountsData = summary.accountsByType || [];
  const totalAccountSum = accountsData.reduce((acc, curr) => acc + (curr.value || 0), 0);

  // Format ratio percentage with precision
  const getPercentageString = (val: number) => {
    if (totalAccountSum === 0) return '0%';
    const pct = (val / totalAccountSum) * 100;
    if (pct > 0 && pct < 0.1) return '<0.1%';
    return `${pct.toFixed(1)}%`;
  };

  // Helper to format official names into a clean single line (e.g. "SAILENDRA C. DAS")
  const formatOneLinerName = (name: string) => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length <= 2) return name;
    const first = parts[0];
    const last = parts[parts.length - 1];
    const middles = parts.slice(1, -1).map(m => `${m.charAt(0)}.`).join(' ');
    return `${first} ${middles} ${last}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pie & Ratio Breakdown Card: Accounts by Type */}
      <Card className="bg-slate-950/50 backdrop-blur-md border border-white/10 text-slate-100 p-4 flex flex-col justify-between">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-white flex items-center justify-between">
            <span>Accounts Distribution by Type</span>
            <span className="text-xs font-normal text-indigo-400">Total: {totalAccountSum.toLocaleString()}</span>
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">Exact volume ratio of business account products</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {accountsData.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-xs text-slate-500">No account data found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
              {/* Pie Chart */}
              <div className="h-60 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={accountsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {accountsData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.95)', borderColor: 'rgba(99, 102, 241, 0.3)', color: '#fff', borderRadius: '12px' }}
                      formatter={(val: TooltipValue, name: TooltipName) => [
                        `${(Number(val) || 0).toLocaleString()} accounts (${getPercentageString(Number(val) || 0)})`,
                        `Scheme: ${name}`
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Exact Percentage Ratio Table Legend */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/5 pb-1">
                  Product Ratio Breakdown
                </p>
                {accountsData.map((item, idx) => {
                  const color = COLORS[idx % COLORS.length];
                  const pctStr = item.formattedPercentage || getPercentageString(item.value);
                  return (
                    <div key={`ratio-${idx}`} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-white/3 hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <span className="font-semibold text-white truncate" title={item.name}>{item.name}</span>
                      </div>
                      <div className="text-right shrink-0 font-mono">
                        <span className="font-bold text-slate-200">{item.value.toLocaleString()}</span>
                        <span className="text-[11px] text-indigo-400 font-bold ml-2">({pctStr})</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bar Chart: Top Officials */}
      <Card className="bg-slate-950/50 backdrop-blur-md border border-white/10 text-slate-100 p-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-white">Top Performing Officials</CardTitle>
          <CardDescription className="text-xs text-slate-400">Total volume of accounts opened per official</CardDescription>
        </CardHeader>
        <CardContent className="h-80 pt-2">
          {summary.accountsByOfficial.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-slate-500">No official data found</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={summary.accountsByOfficial}
                layout="vertical"
                margin={{ top: 5, right: 25, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={180} 
                  interval={0}
                  stroke="rgba(255,255,255,0.4)" 
                  tick={{ fill: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: 600 }}
                  tickFormatter={(val: string) => String(val || '')}
                />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.95)', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '12px' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  formatter={(val: TooltipValue, _name: TooltipName, item: any) => [
                    `${(Number(val) || 0).toLocaleString()} accounts`,
                    item?.payload?.name || 'Accounts Opened'
                  ]}
                />
                <Bar dataKey="accounts" name="Accounts Opened" fill="#4f46e5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
