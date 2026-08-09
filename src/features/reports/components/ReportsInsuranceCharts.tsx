'use client';

import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type TooltipValue = number | string | ReadonlyArray<number | string> | undefined;
type TooltipName = number | string | undefined;

interface ReportsInsuranceChartsProps {
  summary: {
    insuranceSlabs?: Array<{ slabLabel: string; count: number; totalSumAssured: number }>;
    insuranceByOffice?: Array<{ name: string; totalSumAssured: number; totalInitialPremium: number; policies: number }>;
  };
}

export function ReportsInsuranceCharts({ summary }: ReportsInsuranceChartsProps) {
  const slabsData = summary.insuranceSlabs || [];
  const officeData = summary.insuranceByOffice || [];

  const formatCurrencyShort = (val: TooltipValue) => {
    const num = typeof val === 'number' ? val : Number(val) || 0;
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(0)}k`;
    return `₹${num}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Policy Sum Assured Slab Distribution */}
      <Card className="bg-slate-950/50 backdrop-blur-md border border-emerald-500/20 text-slate-100 p-4">
        <CardHeader>
          <CardTitle className="text-base font-bold text-white flex items-center justify-between">
            <span>Insurance Policy Size Slabs</span>
            <span className="text-xs font-normal text-emerald-400">Sum Assured Brackets</span>
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">Distribution of policies by Sum Assured amount</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {slabsData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-slate-500">No slab data available</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={slabsData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="slabLabel" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} allowDecimals={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.95)', borderColor: 'rgba(16, 185, 129, 0.3)', color: '#fff', borderRadius: '12px' }}
                  formatter={(value: TooltipValue, name: TooltipName) => [
                    name === 'count' ? `${value || 0} policies` : formatCurrencyShort(value),
                    name === 'count' ? 'Policies' : 'Total Sum Assured'
                  ]}
                />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="count" name="Policy Count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Chart 2: Top Indexing Offices for Insurance */}
      <Card className="bg-slate-950/50 backdrop-blur-md border border-emerald-500/20 text-slate-100 p-4">
        <CardHeader>
          <CardTitle className="text-base font-bold text-white flex items-center justify-between">
            <span>Top Indexing Offices (Insurance)</span>
            <span className="text-xs font-normal text-teal-400">Sum Assured</span>
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">Top post offices by insurance sum assured volume</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {officeData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-slate-500">No indexing office data available</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={officeData} layout="vertical" margin={{ top: 5, right: 25, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={11} tickFormatter={formatCurrencyShort} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={130} 
                  stroke="rgba(255,255,255,0.4)" 
                  tick={{ fill: 'rgba(255,255,255,0.85)', fontSize: 10, fontWeight: 500 }}
                  tickFormatter={(val: string) => (val && val.length > 17 ? `${val.slice(0, 16)}…` : val)}
                />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.95)', borderColor: 'rgba(20, 184, 166, 0.3)', color: '#fff', borderRadius: '12px' }}
                  formatter={(val: TooltipValue) => [formatCurrencyShort(val), 'Sum Assured']}
                />
                <Bar dataKey="totalSumAssured" name="Sum Assured" fill="#14b8a6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
