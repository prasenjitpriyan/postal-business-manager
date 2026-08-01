'use client';

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Loader2, TrendingUp, Users, Activity, Building2, 
  Download, Calendar, LineChart as LineChartIcon, LayoutGrid, FileText,
  ShieldCheck, FileSpreadsheet
} from 'lucide-react';
import { toast } from 'sonner';

const ChartSkeleton = () => (
  <div className="flex flex-col items-center justify-center h-80 w-full bg-slate-950/40 rounded-xl border border-white/5 animate-pulse space-y-3">
    <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
    <p className="text-xs text-slate-400">Loading chart visualization...</p>
  </div>
);

const ReportsOverviewCharts = dynamic(
  () => import('./ReportsOverviewCharts').then((mod) => mod.ReportsOverviewCharts),
  { loading: () => <ChartSkeleton />, ssr: false }
);

const ReportsTrendsCharts = dynamic(
  () => import('./ReportsTrendsCharts').then((mod) => mod.ReportsTrendsCharts),
  { loading: () => <ChartSkeleton />, ssr: false }
);

const ReportsOfficesCharts = dynamic(
  () => import('./ReportsOfficesCharts').then((mod) => mod.ReportsOfficesCharts),
  { loading: () => <ChartSkeleton />, ssr: false }
);

export function ReportsDashboard() {
  const container = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'offices' | 'details' | 'insurance_details'>('overview');
  const [preset, setPreset] = useState<'all' | '30d' | '90d' | 'custom'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const handleTabChange = (tab: 'overview' | 'trends' | 'offices' | 'details' | 'insurance_details') => {
    if (tab === activeTab) return;
    if (container.current) {
      const tabContent = container.current.querySelector('.gsap-tab-content');
      if (tabContent) {
        gsap.to(tabContent, {
          opacity: 0,
          y: -10,
          duration: 0.15,
          onComplete: () => {
            setActiveTab(tab);
            gsap.fromTo(tabContent, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
          }
        });
        return;
      }
    }
    setActiveTab(tab);
  };

  useGSAP(() => {
    if (!container.current) return;
    const tl = gsap.timeline();

    tl.fromTo('.gsap-report-filter', 
      { y: -15, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
    )
    .fromTo('.gsap-kpi-card',
      { y: 30, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.08, ease: 'back.out(1.4)' },
      '-=0.2'
    )
    .fromTo('.gsap-report-tabs',
      { y: 15, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' },
      '-=0.2'
    )
    .fromTo('.gsap-tab-content',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' },
      '-=0.1'
    );
  }, { scope: container });

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
    recentContributions: [],
    insuranceSummary: {
      totalSumAssured: 0,
      totalInitialPremium: 0,
      totalInsuranceEntries: 0,
      pliCount: 0,
      rpliCount: 0
    },
    insuranceContributions: []
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const handleExportInsuranceCSV = () => {
    if (!summary.insuranceContributions || summary.insuranceContributions.length === 0) {
      toast.error('No insurance report data available to export for selected range');
      return;
    }

    const headers = ['Contribution Date', 'Official Name', 'Designation', 'Office of Indexing', 'Insurance Type', 'Sum Assured (INR)', 'Initial Premium (INR)', 'Remarks'];
    const csvRows = [headers.join(',')];

    summary.insuranceContributions.forEach((c: { contributionDate?: string; official?: { name?: string; designation?: string }; officeOfIndexing?: string; insuranceType?: string; sumAssured?: number; initialPremium?: number; remarks?: string }) => {
      const row = [
        `"${c.contributionDate ? new Date(c.contributionDate).toLocaleDateString('en-IN') : ''}"`,
        `"${c.official?.name || 'N/A'}"`,
        `"${c.official?.designation || ''}"`,
        `"${c.officeOfIndexing || ''}"`,
        `"${c.insuranceType || ''}"`,
        c.sumAssured || 0,
        c.initialPremium || 0,
        `"${(c.remarks || '').replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Insurance_Particulars_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Insurance Particulars Report exported to CSV successfully!');
  };

  const handleExportBusinessCSV = () => {
    if (!summary.recentContributions || summary.recentContributions.length === 0) {
      toast.error('No business contribution report data available to export');
      return;
    }

    const headers = ['Contribution Date', 'Official Name', 'Contribute Office', 'Account Type', 'Accounts Opened', 'Remarks'];
    const csvRows = [headers.join(',')];

    summary.recentContributions.forEach((c: { contributionDate?: string; official?: { name?: string }; contributeOffice?: string; accountType?: string; accountsOpened?: number; remarks?: string }) => {
      const row = [
        `"${c.contributionDate ? new Date(c.contributionDate).toLocaleDateString('en-IN') : ''}"`,
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
    link.setAttribute('download', `Postal_Business_Contributions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Business Contributions Report exported to CSV!');
  };

  const handleExportCombinedCSV = () => {
    const hasBiz = summary.recentContributions && summary.recentContributions.length > 0;
    const hasIns = summary.insuranceContributions && summary.insuranceContributions.length > 0;

    if (!hasBiz && !hasIns) {
      toast.error('No business or insurance data available for export');
      return;
    }

    const csvRows: string[] = [];

    csvRows.push('=== POSTAL BUSINESS MANAGER - COMBINED REPORT ===');
    csvRows.push(`Export Date: "${new Date().toLocaleDateString('en-IN')}"`);
    csvRows.push('');

    if (hasBiz) {
      csvRows.push('--- ACCOUNT CONTRIBUTIONS ---');
      csvRows.push(['Contribution Date', 'Official Name', 'Contribute Office', 'Account Type', 'Accounts Opened', 'Remarks'].join(','));
      summary.recentContributions.forEach((c: { contributionDate?: string; official?: { name?: string }; contributeOffice?: string; accountType?: string; accountsOpened?: number; remarks?: string }) => {
        csvRows.push([
          `"${c.contributionDate ? new Date(c.contributionDate).toLocaleDateString('en-IN') : ''}"`,
          `"${c.official?.name || 'N/A'}"`,
          `"${c.contributeOffice || ''}"`,
          `"${c.accountType || ''}"`,
          c.accountsOpened || 0,
          `"${(c.remarks || '').replace(/"/g, '""')}"`
        ].join(','));
      });
      csvRows.push('');
    }

    if (hasIns) {
      csvRows.push('--- INSURANCE PARTICULARS (PLI / RPLI) ---');
      csvRows.push(['Contribution Date', 'Official Name', 'Designation', 'Office of Indexing', 'Insurance Type', 'Sum Assured (INR)', 'Initial Premium (INR)', 'Remarks'].join(','));
      summary.insuranceContributions.forEach((c: { contributionDate?: string; official?: { name?: string; designation?: string }; officeOfIndexing?: string; insuranceType?: string; sumAssured?: number; initialPremium?: number; remarks?: string }) => {
        csvRows.push([
          `"${c.contributionDate ? new Date(c.contributionDate).toLocaleDateString('en-IN') : ''}"`,
          `"${c.official?.name || 'N/A'}"`,
          `"${c.official?.designation || ''}"`,
          `"${c.officeOfIndexing || ''}"`,
          `"${c.insuranceType || ''}"`,
          c.sumAssured || 0,
          c.initialPremium || 0,
          `"${(c.remarks || '').replace(/"/g, '""')}"`
        ].join(','));
      });
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Complete_Postal_Business_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Combined Complete Business & Insurance Report exported!');
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
    <div ref={container} className="space-y-6">
      {/* Date Filter & Export Action Bar */}
      <div className="gsap-report-filter flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-slate-950/60 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
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

        {/* Download CSV Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
          <Button
            onClick={handleExportInsuranceCSV}
            variant="outline"
            size="sm"
            className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/30 font-medium text-xs transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Insurance Particulars CSV
          </Button>
          <Button
            onClick={handleExportBusinessCSV}
            variant="outline"
            size="sm"
            className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border-indigo-500/30 font-medium text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> Accounts CSV
          </Button>
          <Button
            onClick={handleExportCombinedCSV}
            variant="default"
            size="sm"
            className="bg-linear-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-emerald-900/30"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" /> Complete Combined CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Business KPIs */}
        <Card className="gsap-kpi-card bg-slate-950/50 backdrop-blur-md border border-white/10 text-slate-100 hover:border-indigo-500/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-400">Total Accounts Opened</CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{summary.totalAccounts.toLocaleString()}</div>
            <p className="text-[11px] text-slate-500 mt-1">{summary.totalEntries} submitted logs</p>
          </CardContent>
        </Card>

        <Card className="gsap-kpi-card bg-slate-950/50 backdrop-blur-md border border-white/10 text-slate-100 hover:border-sky-500/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-400">Top Performing Official</CardTitle>
            <Users className="h-4 w-4 text-sky-400" />
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

        {/* Insurance Particulars KPIs */}
        <Card className="gsap-kpi-card bg-slate-950/50 backdrop-blur-md border border-emerald-500/20 text-slate-100 hover:border-emerald-500/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-emerald-400">Total Insurance Sum Assured</CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(summary.insuranceSummary?.totalSumAssured || 0)}
            </div>
            <p className="text-[11px] text-emerald-500/80 mt-1">Across PLI & RPLI policies</p>
          </CardContent>
        </Card>

        <Card className="gsap-kpi-card bg-slate-950/50 backdrop-blur-md border border-emerald-500/20 text-slate-100 hover:border-emerald-500/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-emerald-400">Total Initial Premium</CardTitle>
            <Activity className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">
              {formatCurrency(summary.insuranceSummary?.totalInitialPremium || 0)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              PLI: {summary.insuranceSummary?.pliCount || 0} | RPLI: {summary.insuranceSummary?.rpliCount || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="gsap-report-tabs flex border-b border-white/10 gap-2 overflow-x-auto">
        <button
          onClick={() => handleTabChange('overview')}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutGrid className="w-4 h-4" /> Overview & Breakdown
        </button>
        <button
          onClick={() => handleTabChange('trends')}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'trends'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <LineChartIcon className="w-4 h-4" /> Growth Trends
        </button>
        <button
          onClick={() => handleTabChange('offices')}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'offices'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" /> Office Analysis
        </button>
        <button
          onClick={() => handleTabChange('details')}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'details'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" /> Business Logs
        </button>
        <button
          onClick={() => handleTabChange('insurance_details')}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'insurance_details'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Insurance Particulars Logs
        </button>
      </div>

      {/* Tab Container */}
      <div className="gsap-tab-content">

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <ReportsOverviewCharts summary={summary} />
      )}

      {/* Tab 2: Growth Trends */}
      {activeTab === 'trends' && (
        <ReportsTrendsCharts summary={summary} />
      )}

      {/* Tab 3: Office Analysis */}
      {activeTab === 'offices' && (
        <ReportsOfficesCharts summary={summary} />
      )}

      {/* Tab 4: Business Logs Table */}
      {activeTab === 'details' && (
        <Card className="bg-slate-950/50 backdrop-blur-md border border-white/10 text-slate-100 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Business Contribution Log</CardTitle>
              <CardDescription className="text-xs text-slate-400">Detailed list of recorded contribution entries</CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={handleExportBusinessCSV} className="text-xs border-white/10 text-slate-300">
              <Download className="w-3.5 h-3.5 mr-1" /> Export CSV
            </Button>
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
                  {!summary.recentContributions || summary.recentContributions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                        No recent business contributions found for selected date range.
                      </TableCell>
                    </TableRow>
                  ) : (
                    summary.recentContributions.map((c: { _id?: string; contributionDate?: string; official?: { name?: string }; contributeOffice?: string; accountType?: string; accountsOpened?: number }, index: number) => (
                      <TableRow key={c._id || `rc-${index}`}>
                        <TableCell className="text-xs text-slate-300 font-mono">
                          {c.contributionDate ? new Date(c.contributionDate).toLocaleDateString('en-IN') : 'N/A'}
                        </TableCell>
                        <TableCell className="text-xs font-medium text-white">
                          {c.official?.name || 'Unknown'}
                        </TableCell>
                        <TableCell className="text-xs text-slate-400">{c.contributeOffice || 'N/A'}</TableCell>
                        <TableCell className="text-xs text-slate-300">{c.accountType || 'N/A'}</TableCell>
                        <TableCell className="text-xs font-semibold text-emerald-400 text-right">
                          +{c.accountsOpened || 0}
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

      {/* Tab 5: Insurance Particulars Logs Table */}
      {activeTab === 'insurance_details' && (
        <Card className="bg-slate-950/50 backdrop-blur-md border border-emerald-500/20 text-slate-100 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-emerald-300">Insurance Particulars Log (PLI / RPLI)</CardTitle>
              <CardDescription className="text-xs text-slate-400">Detailed list of recorded insurance policies and initial premiums</CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={handleExportInsuranceCSV} className="text-xs border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Export Insurance CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-white/10 overflow-x-auto">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow>
                    <TableHead className="text-slate-300">Date</TableHead>
                    <TableHead className="text-slate-300">Official</TableHead>
                    <TableHead className="text-slate-300">Indexing Office</TableHead>
                    <TableHead className="text-slate-300">Type</TableHead>
                    <TableHead className="text-right text-slate-300">Sum Assured</TableHead>
                    <TableHead className="text-right text-slate-300">Initial Premium</TableHead>
                    <TableHead className="text-slate-300">Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!summary.insuranceContributions || summary.insuranceContributions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                        No insurance contributions found for selected date range.
                      </TableCell>
                    </TableRow>
                  ) : (
                    summary.insuranceContributions.map((ic: { _id?: string; contributionDate?: string; official?: { name?: string; designation?: string }; officeOfIndexing?: string; insuranceType?: string; sumAssured?: number; initialPremium?: number; remarks?: string }, index: number) => (
                      <TableRow key={ic._id || `ic-${index}`}>
                        <TableCell className="text-xs text-slate-300 font-mono">
                          {ic.contributionDate ? new Date(ic.contributionDate).toLocaleDateString('en-IN') : 'N/A'}
                        </TableCell>
                        <TableCell className="text-xs font-medium text-white">
                          {ic.official?.name || 'Unknown'}
                        </TableCell>
                        <TableCell className="text-xs text-slate-400">{ic.officeOfIndexing || 'N/A'}</TableCell>
                        <TableCell className="text-xs">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            ic.insuranceType === 'PLI'
                              ? 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                          }`}>
                            {ic.insuranceType || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-slate-200 text-right">
                          {formatCurrency(ic.sumAssured || 0)}
                        </TableCell>
                        <TableCell className="text-xs font-bold text-emerald-400 text-right">
                          {formatCurrency(ic.initialPremium || 0)}
                        </TableCell>
                        <TableCell className="text-xs text-slate-400 max-w-xs truncate">
                          {ic.remarks || '-'}
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
    </div>
  );
}


