'use client';

import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, Users, Activity } from 'lucide-react';

const COLORS = ['#4f46e5', '#ec4899', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6'];

export function ReportsDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['reports-summary'],
    queryFn: async () => {
      const res = await fetch('/api/reports/summary');
      if (!res.ok) throw new Error('Failed to fetch summary');
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const summary = data?.data || {
    totalAccounts: 0,
    accountsByType: [],
    accountsByOfficial: [],
    recentContributions: []
  };

  return (
    <div className="space-y-6">
      {/* Top KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-950/50 backdrop-blur-md border border-white/10 text-slate-100 hover:border-indigo-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Accounts Opened</CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{summary.totalAccounts}</div>
            <p className="text-xs text-slate-500 mt-1">Across all officials</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-950/50 backdrop-blur-md border border-white/10 text-slate-100 hover:border-pink-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Top Official</CardTitle>
            <Users className="h-4 w-4 text-pink-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-white truncate">
              {summary.accountsByOfficial[0]?.name || 'N/A'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {summary.accountsByOfficial[0]?.accounts || 0} accounts opened
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-950/50 backdrop-blur-md border border-white/10 text-slate-100 hover:border-sky-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Top Account Type</CardTitle>
            <Activity className="h-4 w-4 text-sky-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-white truncate">
              {summary.accountsByType[0]?.name || 'N/A'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {summary.accountsByType[0]?.value || 0} total accounts
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart: Accounts by Type */}
        <Card className="bg-slate-950/50 backdrop-blur-md border border-white/10 text-slate-100 p-4">
          <CardHeader>
            <CardTitle className="text-lg">Accounts by Type</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary.accountsByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {summary.accountsByType.map((entry: { name: string; value: number }, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.9)', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart: Accounts by Official */}
        <Card className="bg-slate-950/50 backdrop-blur-md border border-white/10 text-slate-100 p-4">
          <CardHeader>
            <CardTitle className="text-lg">Top Performing Officials</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={summary.accountsByOfficial}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="rgba(255,255,255,0.5)" />
                <YAxis dataKey="name" type="category" width={100} stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 12}} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.9)', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '8px' }}
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                />
                <Bar dataKey="accounts" fill="#4f46e5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
