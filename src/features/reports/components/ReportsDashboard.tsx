'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, 
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Loader2, TrendingUp, Users, Activity, Building2, 
  Download, Calendar, BarChart3, LineChart as LineChartIcon, LayoutGrid, FileText
} from 'lucide-react';
import { toast } from 'sonner';

const COLORS = ['#4f46e5', '#ec4899', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#3b82f6'];

export function ReportsDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'offices' | 'details'>('overview');
  const [preset, setPreset] = useState<'all' | '30d' | '90d' | 'custom'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const handlePresetChange = (selected: 'all' | '30d' | '90d' | 'custom') => {
    setPreset(selected);
    const today = new Date();
    if (selected === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (selected === '30d') {
      const past = new Date();
      past.setDate(today.getDate() - 30);
      setStartDate(past.toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);
    } else if (selected === '90d') {
      const past = new Date();
      past.setDate(today.getDate() - 90);
      setStartDate(past.toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ['reports-summary', startDate, endDate],
    queryFn: async () => {
      let url = '/api/reports/summary';
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch summary');
      return res.json();
    }
  });

  const summary = data?.data || {
    totalAccounts: 0,
    totalEntries: 0,
    avgAccountsPerEntry: 0,
    accountsByType: [],
    accountsByOffice: [],
    accountsByOfficial: [],
    contributionsOverTime: [],
    recentContributions: []
  };

  const handleExportCSV = () => {
    if (!summary.recentContributions || summary.recentContributions.length === 0) {
      toast.error('No report data available to export');
      return;
    }

    const headers = ['Contribution Date', 'Official Name', 'Contribute Office', 'Account Type', 'Accounts Opened', 'Remarks'];
    const csvRows = [headers.join(',')];

    summary.recentContributions.forEach((c: { contributionDate?: string; official?: { name?: string }; contributeOffice?: string; accountType?: string; accountsOpened?: number; remarks?: string }) => {
      const row = [
        `"${c.contributionDate ? new Date(c.contributionDate).toLocaleDateString() : ''}"`,
        `"${c.official?.name || 'N/A'}"`,
        `"${c.contributeOffice || ''}"`,
        `"${c.accountType || ''}"`,
        c.accountsOpened || 0,
        `"${(c.remarks || '').replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Postal_Business_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report exported to CSV successfully!');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-80 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        <p className="text-sm text-slate-400">Loading analytics & report metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Filter & Action Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-slate-950/60 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mr-2">
            <Calendar className="w-4 h-4 text-indigo-400" /> Date Range:
          </div>
          <Button
            variant={preset === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePresetChange('all')}
            className={preset === 'all' ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'border-white/10 text-slate-300'}
          >
            All Time
          </Button>
          <Button
            variant={preset === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePresetChange('30d')}
            className={preset === '30d' ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'border-white/10 text-slate-300'}
          >
            Last 30 Days
          </Button>
          <Button
            variant={preset === '90d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePresetChange('90d')}
            className={preset === '90d' ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'border-white/10 text-slate-300'}
          >
            Last 90 Days
          </Button>
          
          <div className="flex items-center gap-2 ml-auto sm:ml-0">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                setPreset('custom');
                setStartDate(e.target.value);
              }}
              className="w-36 text-xs bg-slate-900 border-white/10 text-slate-200 scheme-dark"
              title="Start Date"
            />
            <span className="text-slate-500 text-xs">to</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                setPreset('custom');
                setEndDate(e.target.value);
              }}
              className="w-36 text-xs bg-slate-900 border-white/10 text-slate-200 scheme-dark"
              title="End Date"
            />
          </div>
        </div>

        <Button
          onClick={handleExportCSV}
          variant="outline"
          size="sm"
          className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/30 font-medium transition-colors w-full lg:w-auto"
        >
          <Download className="w-4 h-4 mr-2" /> Export CSV Report
        </Button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-slate-950/50 backdrop-blur-md border border-white/10 text-slate-100 hover:border-indigo-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-400">Total Accounts</CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{summary.totalAccounts.toLocaleString()}</div>
            <p className="text-[11px] text-slate-500 mt-1">Total volume opened</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-950/50 backdrop-blur-md border border-white/10 text-slate-100 hover:border-sky-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-400">Total Entries</CardTitle>
            <Activity className="h-4 w-4 text-sky-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{summary.totalEntries.toLocaleString()}</div>
            <p className="text-[11px] text-slate-500 mt-1">Submitted logs</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-950/50 backdrop-blur-md border border-white/10 text-slate-100 hover:border-purple-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-400">Avg. Per Entry</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{summary.avgAccountsPerEntry}</div>
            <p className="text-[11px] text-slate-500 mt-1">Accounts / submission</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-950/50 backdrop-blur-md border border-white/10 text-slate-100 hover:border-pink-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-400">Top Official</CardTitle>
            <Users className="h-4 w-4 text-pink-400" />
          </CardHeader>
          <CardContent>
            <div className="text-base font-bold text-white truncate">
              {summary.accountsByOfficial[0]?.name || 'N/A'}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 truncate">
              {summary.accountsByOfficial[0]?.accounts || 0} accounts opened
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-950/50 backdrop-blur-md border border-white/10 text-slate-100 hover:border-amber-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-400">Top Office</CardTitle>
            <Building2 className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-base font-bold text-white truncate">
              {summary.accountsByOffice[0]?.name || 'N/A'}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 truncate">
              {summary.accountsByOffice[0]?.accounts || 0} accounts opened
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-white/10 gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutGrid className="w-4 h-4" /> Overview & Breakdown
        </button>
        <button
          onClick={() => setActiveTab('trends')}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'trends'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <LineChartIcon className="w-4 h-4" /> Growth Trends
        </button>
        <button
          onClick={() => setActiveTab('offices')}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'offices'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" /> Office Analysis
        </button>
        <button
          onClick={() => setActiveTab('details')}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'details'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" /> Report Logs
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart: Accounts by Type */}
          <Card className="bg-slate-950/50 backdrop-blur-md border border-white/10 text-slate-100 p-4">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Accounts Distribution by Type</CardTitle>
              <CardDescription className="text-xs text-slate-400">Ratio of business account products</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {summary.accountsByType.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">No account data found</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={summary.accountsByType}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                    >
                      {summary.accountsByType.map((_: { name: string; value: number }, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.95)', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Bar Chart: Top Officials */}
          <Card className="bg-slate-950/50 backdrop-blur-md border border-white/10 text-slate-100 p-4">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Top Performing Officials</CardTitle>
              <CardDescription className="text-xs text-slate-400">Total accounts opened per official</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {summary.accountsByOfficial.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">No official data found</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={summary.accountsByOfficial}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" horizontal={true} vertical={false} />
                    <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                    <YAxis dataKey="name" type="category" width={110} stroke="rgba(255,255,255,0.4)" tick={{fill: 'rgba(255,255,255,0.8)', fontSize: 11}} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.95)', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '8px' }}
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    />
                    <Bar dataKey="accounts" name="Accounts Opened" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Growth Trends */}
      {activeTab === 'trends' && (
        <Card className="bg-slate-950/50 backdrop-blur-md border border-white/10 text-slate-100 p-4">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Contribution Growth Over Time</CardTitle>
            <CardDescription className="text-xs text-slate-400">Timeline of total accounts opened per date</CardDescription>
          </CardHeader>
          <CardContent className="h-96">
            {summary.contributionsOverTime.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">No trend data available for this range</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={summary.contributionsOverTime}
                  margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="colorAccounts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.95)', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '8px' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Area type="monotone" dataKey="accounts" name="Accounts Opened" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorAccounts)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Office Analysis */}
      {activeTab === 'offices' && (
        <Card className="bg-slate-950/50 backdrop-blur-md border border-white/10 text-slate-100 p-4">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Postal Office Performance Ranking</CardTitle>
            <CardDescription className="text-xs text-slate-400">Total volume of accounts opened across offices</CardDescription>
          </CardHeader>
          <CardContent className="h-96">
            {summary.accountsByOffice.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">No office data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={summary.accountsByOffice}
                  margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} angle={-25} textAnchor="end" />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.95)', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '8px' }}
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  />
                  <Bar dataKey="accounts" name="Accounts Opened" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Details Table */}
      {activeTab === 'details' && (
        <Card className="bg-slate-950/50 backdrop-blur-md border border-white/10 text-slate-100 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Recent Contribution Log</CardTitle>
            <CardDescription className="text-xs text-slate-400">Detailed list of recorded contribution entries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-white/10 overflow-x-auto">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow>
                    <TableHead className="text-slate-300">Date</TableHead>
                    <TableHead className="text-slate-300">Official</TableHead>
                    <TableHead className="text-slate-300">Office</TableHead>
                    <TableHead className="text-slate-300">Account Type</TableHead>
                    <TableHead className="text-right text-slate-300">Accounts Opened</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.recentContributions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                        No recent contributions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    summary.recentContributions.map((c: { _id?: string; contributionDate?: string; official?: { name?: string }; contributeOffice?: string; accountType?: string; accountsOpened?: number }, index: number) => (
                      <TableRow key={c._id || `rc-${index}`}>
                        <TableCell className="text-xs text-slate-300">
                          {c.contributionDate ? new Date(c.contributionDate).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell className="text-xs font-medium text-white">
                          {c.official?.name || 'Unknown'}
                        </TableCell>
                        <TableCell className="text-xs text-slate-400">{c.contributeOffice || 'N/A'}</TableCell>
                        <TableCell className="text-xs text-slate-300">{c.accountType || 'N/A'}</TableCell>
                        <TableCell className="text-xs font-semibold text-emerald-400 text-right">
                          {c.accountsOpened || 0}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
