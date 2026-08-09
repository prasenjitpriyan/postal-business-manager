'use client';

import { useState, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Loader2, TrendingUp, Activity, Building2, 
  Download, Calendar, LineChart as LineChartIcon, LayoutGrid, FileText,
  ShieldCheck, FileSpreadsheet, Search, Filter, Printer, Award, Zap
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

const ReportsInsuranceCharts = dynamic(
  () => import('./ReportsInsuranceCharts').then((mod) => mod.ReportsInsuranceCharts),
  { loading: () => <ChartSkeleton />, ssr: false }
);

export function ReportsDashboard() {
  const container = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'offices' | 'insurance_deepdive' | 'audit_log'>('overview');
  const [preset, setPreset] = useState<'all' | 'today' | '30d' | '90d' | 'custom'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedOffice, setSelectedOffice] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['reports-summary', startDate, endDate, selectedOffice],
    queryFn: async () => {
      let url = '/api/reports/summary';
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (selectedOffice && selectedOffice !== 'all') params.append('office', selectedOffice);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch summary');
      return res.json();
    }
  });

  useGSAP(() => {
    if (!container.current || isLoading) return;

    gsap.fromTo('.gsap-report-animate',
      { y: 15, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
    );

    gsap.fromTo('.gsap-kpi-card',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: 'back.out(1.2)' }
    );

  }, { scope: container, dependencies: [isLoading, activeTab] });

  const handlePresetChange = (selected: 'all' | 'today' | '30d' | '90d' | 'custom') => {
    setPreset(selected);
    const today = new Date();
    if (selected === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (selected === 'today') {
      const todayStr = today.toISOString().split('T')[0];
      setStartDate(todayStr);
      setEndDate(todayStr);
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

  const summary = data?.data || {
    totalAccounts: 0,
    totalEntries: 0,
    avgAccountsPerEntry: 0,
    availableOffices: [],
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
      rpliCount: 0,
      pliSumAssured: 0,
      rpliSumAssured: 0,
      pliInitialPremium: 0,
      rpliInitialPremium: 0,
      avgSumAssuredPerPolicy: 0,
      avgInitialPremiumPerPolicy: 0
    },
    insuranceByOffice: [],
    insuranceByOfficial: [],
    insuranceOverTime: [],
    insuranceSlabs: [],
    insuranceContributions: []
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Filter detail tables based on search query
  const filteredContributions = useMemo(() => {
    if (!summary.recentContributions) return [];
    if (!searchQuery.trim()) return summary.recentContributions;
    const q = searchQuery.toLowerCase();
    return summary.recentContributions.filter((item: { official?: { name?: string; office?: string }; contributeOffice?: string; accountType?: string }) => 
      (item.official?.name || '').toLowerCase().includes(q) ||
      (item.contributeOffice || item.official?.office || '').toLowerCase().includes(q) ||
      (item.accountType || '').toLowerCase().includes(q)
    );
  }, [summary.recentContributions, searchQuery]);

  const filteredInsurance = useMemo(() => {
    if (!summary.insuranceContributions) return [];
    if (!searchQuery.trim()) return summary.insuranceContributions;
    const q = searchQuery.toLowerCase();
    return summary.insuranceContributions.filter((item: { official?: { name?: string; office?: string }; officeOfIndexing?: string; insuranceType?: string; remarks?: string }) => 
      (item.official?.name || '').toLowerCase().includes(q) ||
      (item.officeOfIndexing || item.official?.office || '').toLowerCase().includes(q) ||
      (item.insuranceType || '').toLowerCase().includes(q) ||
      (item.remarks || '').toLowerCase().includes(q)
    );
  }, [summary.insuranceContributions, searchQuery]);

  // Combined Post Office Performance Matrix
  const officeMatrix = useMemo(() => {
    const map = new Map<string, { office: string; accounts: number; sumAssured: number; premium: number; officials: Set<string> }>();

    (summary.recentContributions || []).forEach((c: { contributeOffice?: string; officialId?: string; official?: { office?: string; _id?: string }; accountsOpened?: number }) => {
      const offName = c.contributeOffice || c.official?.office || 'Unknown';
      const offId = c.official?._id || c.officialId || 'off';
      if (!map.has(offName)) {
        map.set(offName, { office: offName, accounts: 0, sumAssured: 0, premium: 0, officials: new Set() });
      }
      const item = map.get(offName)!;
      item.accounts += c.accountsOpened || 0;
      if (offId) item.officials.add(String(offId));
    });

    (summary.insuranceContributions || []).forEach((c: { officeOfIndexing?: string; officialId?: string; official?: { office?: string; _id?: string }; sumAssured?: number; initialPremium?: number }) => {
      const offName = c.officeOfIndexing || c.official?.office || 'Unknown';
      const offId = c.official?._id || c.officialId || 'off';
      if (!map.has(offName)) {
        map.set(offName, { office: offName, accounts: 0, sumAssured: 0, premium: 0, officials: new Set() });
      }
      const item = map.get(offName)!;
      item.sumAssured += c.sumAssured || 0;
      item.premium += c.initialPremium || 0;
      if (offId) item.officials.add(String(offId));
    });

    return Array.from(map.values())
      .map(item => ({
        ...item,
        officialCount: item.officials.size
      }))
      .sort((a, b) => (b.accounts + b.sumAssured) - (a.accounts + a.sumAssured));
  }, [summary.recentContributions, summary.insuranceContributions]);

  // Export CSV Functions
  const handleExportAccountsCSV = () => {
    if (!summary.recentContributions || summary.recentContributions.length === 0) {
      toast.error('No account contribution data available to export');
      return;
    }

    const headers = ['Contribution Date', 'Official Name', 'Designation', 'Office', 'Account Type', 'Accounts Opened'];
    const csvRows = [headers.join(',')];

    summary.recentContributions.forEach((c: { contributionDate?: string; official?: { name?: string; designation?: string; office?: string }; contributeOffice?: string; accountType?: string; accountsOpened?: number }) => {
      const row = [
        `"${c.contributionDate ? new Date(c.contributionDate).toLocaleDateString('en-IN') : ''}"`,
        `"${c.official?.name || 'N/A'}"`,
        `"${c.official?.designation || ''}"`,
        `"${c.contributeOffice || c.official?.office || ''}"`,
        `"${c.accountType || ''}"`,
        c.accountsOpened || 0
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `postal_account_contributions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Account contributions CSV exported successfully!');
  };

  const handleExportInsuranceCSV = () => {
    if (!summary.insuranceContributions || summary.insuranceContributions.length === 0) {
      toast.error('No insurance data available to export');
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
    link.download = `postal_insurance_policies_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Insurance policies CSV exported successfully!');
  };

  const handleExportMasterCSV = () => {
    const summaryHeader = [
      ['Metric', 'Value'],
      ['Total Accounts Opened', summary.totalAccounts],
      ['Total Contribution Entries', summary.totalEntries],
      ['Average Accounts per Entry', summary.avgAccountsPerEntry],
      ['Total Insurance Sum Assured', summary.insuranceSummary?.totalSumAssured || 0],
      ['Total Initial Premium Collected', summary.insuranceSummary?.totalInitialPremium || 0],
      ['PLI Policies Count', summary.insuranceSummary?.pliCount || 0],
      ['RPLI Policies Count', summary.insuranceSummary?.rpliCount || 0],
      [],
      ['--- POSTAL ACCOUNT CONTRIBUTIONS LOG ---'],
      ['Date', 'Official Name', 'Office', 'Account Type', 'Accounts Opened']
    ];

    const rows: string[] = summaryHeader.map(r => r.join(','));

    (summary.recentContributions || []).forEach((c: { contributionDate?: string; official?: { name?: string; office?: string }; contributeOffice?: string; accountType?: string; accountsOpened?: number }) => {
      rows.push([
        `"${c.contributionDate ? new Date(c.contributionDate).toLocaleDateString('en-IN') : ''}"`,
        `"${c.official?.name || 'N/A'}"`,
        `"${c.contributeOffice || c.official?.office || ''}"`,
        `"${c.accountType || ''}"`,
        c.accountsOpened || 0
      ].join(','));
    });

    rows.push('', '--- INSURANCE POLICIES LOG ---', 'Date,Official Name,Indexing Office,Insurance Type,Sum Assured,Initial Premium');

    (summary.insuranceContributions || []).forEach((c: { contributionDate?: string; official?: { name?: string }; officeOfIndexing?: string; insuranceType?: string; sumAssured?: number; initialPremium?: number }) => {
      rows.push([
        `"${c.contributionDate ? new Date(c.contributionDate).toLocaleDateString('en-IN') : ''}"`,
        `"${c.official?.name || 'N/A'}"`,
        `"${c.officeOfIndexing || ''}"`,
        `"${c.insuranceType || ''}"`,
        c.sumAssured || 0,
        c.initialPremium || 0
      ].join(','));
    });

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `postal_master_business_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Master business report CSV downloaded!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div ref={container} className="space-y-6">
      
      {/* 1. Advanced Multi-Dimensional Filter Toolbar */}
      <div className="gsap-report-animate bg-slate-900/60 border border-white/10 rounded-3xl p-5 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Advanced Analytics Controls</h3>
              <p className="text-xs text-slate-400">Filter parameters by date, post office, and search query</p>
            </div>
          </div>

          {/* Export Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={handleExportAccountsCSV} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3 py-1.5 h-8 rounded-xl shadow-xs">
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1" /> Accounts CSV
            </Button>
            <Button size="sm" onClick={handleExportInsuranceCSV} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3 py-1.5 h-8 rounded-xl shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Insurance CSV
            </Button>
            <Button size="sm" onClick={handleExportMasterCSV} variant="outline" className="border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-xs px-3 py-1.5 h-8 rounded-xl">
              <Download className="w-3.5 h-3.5 mr-1" /> Master Report
            </Button>
            <Button size="sm" onClick={handlePrint} variant="ghost" className="text-slate-400 hover:text-white text-xs px-2.5 h-8">
              <Printer className="w-3.5 h-3.5 mr-1" /> Print
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-white/5">
          {/* Preset Date Buttons */}
          <div className="space-y-1 sm:col-span-2">
            <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-indigo-400" /> Date Preset
            </label>
            <div className="flex items-center p-1 bg-slate-950/80 border border-white/10 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => handlePresetChange('all')}
                className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all ${preset === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                All Time
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange('today')}
                className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all ${preset === 'today' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange('30d')}
                className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all ${preset === '30d' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                30 Days
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange('90d')}
                className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all ${preset === '90d' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                90 Days
              </button>
            </div>
          </div>

          {/* Post Office Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-teal-400" /> Post Office Location
            </label>
            <select
              value={selectedOffice}
              onChange={(e) => setSelectedOffice(e.target.value)}
              className="w-full h-9 bg-slate-950/80 border border-white/10 rounded-xl px-3 text-xs text-white outline-none"
            >
              <option value="all">All Post Offices</option>
              {(summary.availableOffices || []).map((off: string) => (
                <option key={off} value={off}>{off}</option>
              ))}
            </select>
          </div>

          {/* Keyword Search Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Search className="w-3 h-3 text-amber-400" /> Search Logs & Officials
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search name, office, scheme..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 bg-slate-950/80 border-white/10 text-xs pl-8 rounded-xl"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        {/* Custom Date Pickers (if custom or selected) */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPreset('custom'); }}
              className="bg-slate-950/80 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPreset('custom'); }}
              className="bg-slate-950/80 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
            />
          </div>
          {(startDate || endDate || selectedOffice !== 'all') && (
            <button
              type="button"
              onClick={() => { setStartDate(''); setEndDate(''); setSelectedOffice('all'); setPreset('all'); }}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 2. Top Executive Metric Cards (6 KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="gsap-kpi-card bg-slate-900/60 border border-white/10 rounded-2xl p-4 backdrop-blur-xl space-y-1 relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase">
            <span>Total Accounts</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-white pt-1">{isLoading ? '--' : (summary.totalAccounts || 0).toLocaleString()}</p>
          <p className="text-[10px] text-slate-400">{summary.totalEntries} log entries</p>
        </div>

        <div className="gsap-kpi-card bg-slate-900/60 border border-white/10 rounded-2xl p-4 backdrop-blur-xl space-y-1 relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase">
            <span>Avg / Entry</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-blue-400 pt-1">{isLoading ? '--' : summary.avgAccountsPerEntry}</p>
          <p className="text-[10px] text-slate-400">accounts per submit</p>
        </div>

        <div className="gsap-kpi-card bg-slate-900/60 border border-emerald-500/20 rounded-2xl p-4 backdrop-blur-xl space-y-1 relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase">
            <span>Sum Assured</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-black text-emerald-400 pt-1 truncate" title={formatCurrency(summary.insuranceSummary?.totalSumAssured || 0)}>
            {isLoading ? '--' : formatCurrency(summary.insuranceSummary?.totalSumAssured || 0)}
          </p>
          <p className="text-[10px] text-slate-400">{summary.insuranceSummary?.totalInsuranceEntries || 0} policies</p>
        </div>

        <div className="gsap-kpi-card bg-slate-900/60 border border-teal-500/20 rounded-2xl p-4 backdrop-blur-xl space-y-1 relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase">
            <span>Initial Premium</span>
            <Zap className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-xl font-black text-white pt-1 truncate" title={formatCurrency(summary.insuranceSummary?.totalInitialPremium || 0)}>
            {isLoading ? '--' : formatCurrency(summary.insuranceSummary?.totalInitialPremium || 0)}
          </p>
          <p className="text-[10px] text-slate-400">Revenue collected</p>
        </div>

        <div className="gsap-kpi-card bg-slate-900/60 border border-amber-500/20 rounded-2xl p-4 backdrop-blur-xl space-y-1 relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase">
            <span>PLI vs RPLI</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-black text-amber-300 pt-1">
            {summary.insuranceSummary?.pliCount || 0} : {summary.insuranceSummary?.rpliCount || 0}
          </p>
          <p className="text-[10px] text-slate-400">PLI to RPLI count</p>
        </div>

        <div className="gsap-kpi-card bg-slate-900/60 border border-purple-500/20 rounded-2xl p-4 backdrop-blur-xl space-y-1 relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase">
            <span>Active Offices</span>
            <Building2 className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white pt-1">{isLoading ? '--' : officeMatrix.length}</p>
          <p className="text-[10px] text-slate-400">reporting units</p>
        </div>
      </div>

      {/* 3. Breakdown Section Navigation Tabs */}
      <div className="gsap-report-animate flex items-center p-1.5 bg-slate-900/80 border border-white/10 rounded-2xl overflow-x-auto gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" /> Executive Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('trends')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'trends'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <LineChartIcon className="w-3.5 h-3.5" /> Growth & Trends
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('offices')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'offices'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" /> Office Matrix
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('insurance_deepdive')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'insurance_deepdive'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" /> Insurance Deep-Dive
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('audit_log')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'audit_log'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Detailed Audit Log
        </button>
      </div>

      {/* 4. TAB CONTENTS */}
      <div className="gsap-report-animate">
        {/* TAB 1: Overview Charts */}
        {activeTab === 'overview' && (
          <ReportsOverviewCharts summary={summary} />
        )}

        {/* TAB 2: Time Series & Growth Trends */}
        {activeTab === 'trends' && (
          <ReportsTrendsCharts summary={summary} />
        )}

        {/* TAB 3: Post Office Performance Matrix */}
        {activeTab === 'offices' && (
          <div className="space-y-6">
            <ReportsOfficesCharts summary={summary} />

            <Card className="bg-slate-950/50 backdrop-blur-md border border-white/10 text-slate-100 p-6 rounded-3xl">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-base font-bold text-white flex items-center justify-between">
                  <span>Postal Office Performance Matrix</span>
                  <span className="text-xs text-slate-400">{officeMatrix.length} Offices Registered</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Combined account contributions, insurance sum assured, and active official count by post office
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto rounded-2xl border border-white/5 bg-slate-950/40">
                  <Table className="text-xs">
                    <TableHeader>
                      <TableRow className="border-b border-white/10 bg-white/5 uppercase text-[10px] font-bold tracking-wider text-slate-400">
                        <TableHead className="py-3 px-4">Rank & Office</TableHead>
                        <TableHead className="py-3 px-4 text-center">Active Officials</TableHead>
                        <TableHead className="py-3 px-4 text-right">Accounts Opened</TableHead>
                        <TableHead className="py-3 px-4 text-right">Insurance Sum Assured</TableHead>
                        <TableHead className="py-3 px-4 text-right">Initial Premium</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-white/5">
                      {officeMatrix.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-slate-500">No office matrix records found.</TableCell>
                        </TableRow>
                      ) : (
                        officeMatrix.map((item, idx) => (
                          <TableRow key={`matrix-${idx}`} className="hover:bg-white/5 transition-colors">
                            <TableCell className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                                idx === 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold' :
                                idx === 1 ? 'bg-slate-300/20 text-slate-200 border border-slate-300/30' :
                                idx === 2 ? 'bg-amber-700/20 text-amber-500 border border-amber-700/30' :
                                'bg-slate-800 text-slate-400'
                              }`}>
                                #{idx + 1}
                              </span>
                              {item.office}
                            </TableCell>
                            <TableCell className="py-3.5 px-4 text-center font-semibold text-indigo-300">
                              {item.officialCount} officials
                            </TableCell>
                            <TableCell className="py-3.5 px-4 text-right font-bold text-sky-400">
                              {item.accounts.toLocaleString()}
                            </TableCell>
                            <TableCell className="py-3.5 px-4 text-right font-bold text-emerald-400">
                              {formatCurrency(item.sumAssured)}
                            </TableCell>
                            <TableCell className="py-3.5 px-4 text-right font-semibold text-slate-200">
                              {formatCurrency(item.premium)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 4: Insurance Deep-Dive */}
        {activeTab === 'insurance_deepdive' && (
          <div className="space-y-6">
            <ReportsInsuranceCharts summary={summary} />

            {/* Insurance Champions List */}
            <Card className="bg-slate-950/50 backdrop-blur-md border border-emerald-500/20 text-slate-100 p-6 rounded-3xl">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-base font-bold text-white flex items-center justify-between">
                  <span>Top Producing Officials (Insurance)</span>
                  <span className="text-xs text-emerald-400">Leaderboard</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">Officials ranked by insurance sum assured performance</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto rounded-2xl border border-white/5 bg-slate-950/40">
                  <Table className="text-xs">
                    <TableHeader>
                      <TableRow className="border-b border-white/10 bg-white/5 uppercase text-[10px] font-bold tracking-wider text-slate-400">
                        <TableHead className="py-3 px-4">Rank & Official Name</TableHead>
                        <TableHead className="py-3 px-4">Office & Designation</TableHead>
                        <TableHead className="py-3 px-4 text-center">Policies Logged</TableHead>
                        <TableHead className="py-3 px-4 text-right">Sum Assured</TableHead>
                        <TableHead className="py-3 px-4 text-right">Initial Premium</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-white/5">
                      {!(summary.insuranceByOfficial) || summary.insuranceByOfficial.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-slate-500">No insurance official records found.</TableCell>
                        </TableRow>
                      ) : (
                        summary.insuranceByOfficial.map((off: { name: string; office: string; designation?: string; totalSumAssured: number; totalInitialPremium: number; policies: number }, idx: number) => (
                          <TableRow key={`ins-off-${idx}`} className="hover:bg-white/5 transition-colors">
                            <TableCell className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                                idx === 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold' :
                                idx === 1 ? 'bg-teal-500/20 text-teal-200 border border-teal-500/30' :
                                idx === 2 ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                                'bg-slate-800 text-slate-400'
                              }`}>
                                #{idx + 1}
                              </span>
                              {off.name}
                            </TableCell>
                            <TableCell className="py-3.5 px-4 text-slate-300">
                              {off.office} <span className="text-[10px] text-slate-500">({off.designation || 'Official'})</span>
                            </TableCell>
                            <TableCell className="py-3.5 px-4 text-center font-semibold text-emerald-400">
                              {off.policies} policies
                            </TableCell>
                            <TableCell className="py-3.5 px-4 text-right font-black text-emerald-400">
                              {formatCurrency(off.totalSumAssured)}
                            </TableCell>
                            <TableCell className="py-3.5 px-4 text-right font-semibold text-slate-200">
                              {formatCurrency(off.totalInitialPremium)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 5: Detailed Audit Log */}
        {activeTab === 'audit_log' && (
          <div className="space-y-6">
            {/* Accounts Audit Log */}
            <Card className="bg-slate-950/50 backdrop-blur-md border border-white/10 text-slate-100 p-6 rounded-3xl">
              <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" /> Account Contributions Log
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">Showing {filteredContributions.length} records</CardDescription>
                </div>
                <Button size="sm" onClick={handleExportAccountsCSV} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 h-8 rounded-xl">
                  <Download className="w-3.5 h-3.5 mr-1" /> Export CSV
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto rounded-2xl border border-white/5 bg-slate-950/40">
                  <Table className="text-xs">
                    <TableHeader>
                      <TableRow className="border-b border-white/10 bg-white/5 uppercase text-[10px] font-bold tracking-wider text-slate-400">
                        <TableHead className="py-3 px-4">Date</TableHead>
                        <TableHead className="py-3 px-4">Official Name</TableHead>
                        <TableHead className="py-3 px-4">Office</TableHead>
                        <TableHead className="py-3 px-4">Product Scheme</TableHead>
                        <TableHead className="py-3 px-4 text-right">Accounts Opened</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-white/5">
                      {filteredContributions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-slate-500">No account contribution records match criteria.</TableCell>
                        </TableRow>
                      ) : (
                        filteredContributions.slice(0, 100).map((item: { _id?: string; contributionDate?: string; official?: { name?: string; office?: string }; contributeOffice?: string; accountType?: string; accountsOpened?: number }, idx: number) => (
                          <TableRow key={item._id || `act-${idx}`} className="hover:bg-white/5 transition-colors">
                            <TableCell className="py-3 px-4 text-slate-300 font-mono">
                              {item.contributionDate ? new Date(item.contributionDate).toLocaleDateString('en-IN') : 'N/A'}
                            </TableCell>
                            <TableCell className="py-3 px-4 font-semibold text-white">
                              {item.official?.name || 'Unknown'}
                            </TableCell>
                            <TableCell className="py-3 px-4 text-slate-400">
                              {item.contributeOffice || item.official?.office || 'N/A'}
                            </TableCell>
                            <TableCell className="py-3 px-4">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                {item.accountType || 'N/A'}
                              </span>
                            </TableCell>
                            <TableCell className="py-3 px-4 text-right font-black text-emerald-400">
                              +{item.accountsOpened || 0}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Insurance Audit Log */}
            <Card className="bg-slate-950/50 backdrop-blur-md border border-emerald-500/20 text-slate-100 p-6 rounded-3xl">
              <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Insurance Particulars Log
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">Showing {filteredInsurance.length} records</CardDescription>
                </div>
                <Button size="sm" onClick={handleExportInsuranceCSV} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 h-8 rounded-xl">
                  <Download className="w-3.5 h-3.5 mr-1" /> Export CSV
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto rounded-2xl border border-white/5 bg-slate-950/40">
                  <Table className="text-xs">
                    <TableHeader>
                      <TableRow className="border-b border-white/10 bg-white/5 uppercase text-[10px] font-bold tracking-wider text-slate-400">
                        <TableHead className="py-3 px-4">Date</TableHead>
                        <TableHead className="py-3 px-4">Official Name</TableHead>
                        <TableHead className="py-3 px-4">Indexing Office</TableHead>
                        <TableHead className="py-3 px-4">Type</TableHead>
                        <TableHead className="py-3 px-4 text-right">Sum Assured</TableHead>
                        <TableHead className="py-3 px-4 text-right">Initial Premium</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-white/5">
                      {filteredInsurance.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-slate-500">No insurance policy records match criteria.</TableCell>
                        </TableRow>
                      ) : (
                        filteredInsurance.slice(0, 100).map((item: { _id?: string; contributionDate?: string; official?: { name?: string; office?: string }; officeOfIndexing?: string; insuranceType?: string; sumAssured?: number; initialPremium?: number }, idx: number) => (
                          <TableRow key={item._id || `ins-${idx}`} className="hover:bg-white/5 transition-colors">
                            <TableCell className="py-3 px-4 text-slate-300 font-mono">
                              {item.contributionDate ? new Date(item.contributionDate).toLocaleDateString('en-IN') : 'N/A'}
                            </TableCell>
                            <TableCell className="py-3 px-4 font-semibold text-white">
                              {item.official?.name || 'Unknown'}
                            </TableCell>
                            <TableCell className="py-3 px-4 text-slate-400">
                              {item.officeOfIndexing || item.official?.office || 'N/A'}
                            </TableCell>
                            <TableCell className="py-3 px-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                item.insuranceType === 'PLI'
                                  ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                              }`}>
                                {item.insuranceType || 'N/A'}
                              </span>
                            </TableCell>
                            <TableCell className="py-3 px-4 text-right font-semibold text-slate-200">
                              {formatCurrency(item.sumAssured || 0)}
                            </TableCell>
                            <TableCell className="py-3 px-4 text-right font-black text-emerald-400">
                              {formatCurrency(item.initialPremium || 0)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

    </div>
  );
}
