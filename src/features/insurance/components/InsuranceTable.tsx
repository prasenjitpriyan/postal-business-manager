'use client';

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpDown, ArrowUp, ArrowDown, ShieldCheck, IndianRupee, FileCheck, Layers, Download } from 'lucide-react';
import { InsuranceContribution, InsuranceType } from '@/types/insurance';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { toast } from 'sonner';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const AddInsuranceDialog = dynamic(
  () => import('./AddInsuranceDialog').then((mod) => mod.AddInsuranceDialog),
  { ssr: false }
);
const EditInsuranceDialog = dynamic(
  () => import('./EditInsuranceDialog').then((mod) => mod.EditInsuranceDialog),
  { ssr: false }
);
const DeleteInsuranceDialog = dynamic(
  () => import('./DeleteInsuranceDialog').then((mod) => mod.DeleteInsuranceDialog),
  { ssr: false }
);

export function InsuranceTable() {
  'use no memo';
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [typeFilter, setTypeFilter] = useState<InsuranceType | 'ALL'>('ALL');
  const [sorting, setSorting] = useState<SortingState>([{ id: 'contributionDate', desc: true }]);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const fetchInsurance = async () => {
    let url = `/api/insurance?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&sort=${encodeURIComponent(JSON.stringify(sorting))}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    if (typeFilter !== 'ALL') url += `&insuranceType=${typeFilter}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch insurance contributions');
    return res.json();
  };

  const sortParams = JSON.stringify(sorting);

  const { data, isLoading } = useQuery({
    queryKey: ['insuranceContributions', page, limit, search, startDate, endDate, typeFilter, sortParams],
    queryFn: fetchInsurance,
    placeholderData: keepPreviousData,
  });

  const handleExportCSV = async () => {
    try {
      let url = `/api/insurance?page=1&limit=10000&search=${encodeURIComponent(search)}&sort=${encodeURIComponent(JSON.stringify(sorting))}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      if (typeFilter !== 'ALL') url += `&insuranceType=${typeFilter}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch insurance data for export');
      const responseData = await res.json();
      const contributions = responseData?.data?.contributions || [];

      if (contributions.length === 0) {
        toast.error('No insurance records match current filters to export.');
        return;
      }

      const headers = ['Contribution Date', 'Official Name', 'Office of Indexing', 'Insurance Type', 'Sum Assured (INR)', 'Initial Premium (INR)', 'Remarks'];
      const csvRows = [headers.join(',')];

      contributions.forEach((c: InsuranceContribution) => {
        const official = c.officialId as { name?: string };
        const row = [
          `"${c.contributionDate ? new Date(c.contributionDate).toLocaleDateString('en-IN') : ''}"`,
          `"${official?.name || 'N/A'}"`,
          `"${c.officeOfIndexing || ''}"`,
          `"${c.insuranceType || ''}"`,
          c.sumAssured || 0,
          c.initialPremium || 0,
          `"${(c.remarks || '').replace(/"/g, '""')}"`
        ];
        csvRows.push(row.join(','));
      });

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `Insurance_Particulars_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Insurance records exported to CSV!');
    } catch (err) {
      console.error('Error exporting insurance CSV:', err);
      toast.error('Failed to export CSV report');
    }
  };

  useGSAP(
    () => {
      if (!isLoading && data?.data?.contributions && data.data.contributions.length > 0) {
        const rows = tableContainerRef.current?.querySelectorAll('.gsap-table-row');
        if (rows && rows.length > 0) {
          gsap.fromTo(
            rows,
            { opacity: 0, y: 15, scale: 0.98 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.45,
              stagger: 0.04,
              ease: 'back.out(1.2)',
              scrollTrigger: {
                trigger: tableContainerRef.current,
                start: 'top 88%',
                toggleActions: 'play none none none',
              }
            }
          );
        }
      }
    },
    { scope: tableContainerRef, dependencies: [data, isLoading] }
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const columns: ColumnDef<InsuranceContribution>[] = [
    {
      accessorKey: 'contributionDate',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={(e) => column.toggleSorting(column.getIsSorted() === 'asc', e.shiftKey)}
          className="-ml-4 hover:bg-white/5 hover:text-white"
        >
          Date
          {{
            asc: <ArrowUp className="ml-2 h-4 w-4" />,
            desc: <ArrowDown className="ml-2 h-4 w-4" />,
          }[column.getIsSorted() as string] ?? <ArrowUpDown className="ml-2 h-4 w-4 text-white/30" />}
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-slate-300">
          {new Date(row.getValue('contributionDate')).toLocaleDateString('en-IN')}
        </span>
      ),
    },
    {
      accessorKey: 'officialId.name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={(e) => column.toggleSorting(column.getIsSorted() === 'asc', e.shiftKey)}
          className="-ml-4 hover:bg-white/5 hover:text-white"
        >
          Official
          {{
            asc: <ArrowUp className="ml-2 h-4 w-4" />,
            desc: <ArrowDown className="ml-2 h-4 w-4" />,
          }[column.getIsSorted() as string] ?? <ArrowUpDown className="ml-2 h-4 w-4 text-white/30" />}
        </Button>
      ),
      cell: ({ row }) => {
        const official = row.original.officialId as { name?: string; designation?: string };
        return (
          <div>
            <div className="font-medium text-white text-sm">{official?.name || 'Unknown'}</div>
            {official?.designation && (
              <div className="text-[11px] text-slate-400">{official.designation}</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'officeOfIndexing',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={(e) => column.toggleSorting(column.getIsSorted() === 'asc', e.shiftKey)}
          className="-ml-4 hover:bg-white/5 hover:text-white"
        >
          Office of Indexing
          {{
            asc: <ArrowUp className="ml-2 h-4 w-4" />,
            desc: <ArrowDown className="ml-2 h-4 w-4" />,
          }[column.getIsSorted() as string] ?? <ArrowUpDown className="ml-2 h-4 w-4 text-white/30" />}
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-slate-300 text-sm font-medium">{row.getValue('officeOfIndexing')}</span>
      ),
    },
    {
      accessorKey: 'insuranceType',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={(e) => column.toggleSorting(column.getIsSorted() === 'asc', e.shiftKey)}
          className="-ml-4 hover:bg-white/5 hover:text-white"
        >
          PLI / RPLI
          {{
            asc: <ArrowUp className="ml-2 h-4 w-4" />,
            desc: <ArrowDown className="ml-2 h-4 w-4" />,
          }[column.getIsSorted() as string] ?? <ArrowUpDown className="ml-2 h-4 w-4 text-white/30" />}
        </Button>
      ),
      cell: ({ row }) => {
        const type = row.getValue('insuranceType') as string;
        const isPLI = type === 'PLI';
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              isPLI
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}
          >
            {type}
          </span>
        );
      },
    },
    {
      accessorKey: 'sumAssured',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={(e) => column.toggleSorting(column.getIsSorted() === 'asc', e.shiftKey)}
          className="-ml-4 hover:bg-white/5 hover:text-white"
        >
          Sum Assured
          {{
            asc: <ArrowUp className="ml-2 h-4 w-4" />,
            desc: <ArrowDown className="ml-2 h-4 w-4" />,
          }[column.getIsSorted() as string] ?? <ArrowUpDown className="ml-2 h-4 w-4 text-white/30" />}
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-semibold text-white text-sm">
          {formatCurrency(row.getValue('sumAssured'))}
        </span>
      ),
    },
    {
      accessorKey: 'initialPremium',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={(e) => column.toggleSorting(column.getIsSorted() === 'asc', e.shiftKey)}
          className="-ml-4 hover:bg-white/5 hover:text-white"
        >
          Initial Premium
          {{
            asc: <ArrowUp className="ml-2 h-4 w-4" />,
            desc: <ArrowDown className="ml-2 h-4 w-4" />,
          }[column.getIsSorted() as string] ?? <ArrowUpDown className="ml-2 h-4 w-4 text-white/30" />}
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-semibold text-emerald-400 text-sm">
          {formatCurrency(row.getValue('initialPremium'))}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <EditInsuranceDialog contribution={row.original} />
          <DeleteInsuranceDialog id={row.original._id} />
        </div>
      ),
    },
  ];

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data?.data?.contributions || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    manualSorting: true,
    manualPagination: true,
    pageCount: data?.data?.pagination?.totalPages || 1,
    enableMultiSort: true,
    state: {
      sorting,
      pagination: {
        pageIndex: page - 1,
        pageSize: limit,
      },
    },
  });

  const summary = data?.data?.summary || {
    totalSumAssured: 0,
    totalInitialPremium: 0,
    pliCount: 0,
    rpliCount: 0,
  };

  return (
    <div className="space-y-6">
      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-950/50 backdrop-blur-md border border-white/10">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Sum Assured</p>
              <p className="text-xl font-bold text-white mt-1">
                {isLoading ? '--' : formatCurrency(summary.totalSumAssured)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-950/50 backdrop-blur-md border border-white/10">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Initial Premium</p>
              <p className="text-xl font-bold text-emerald-400 mt-1">
                {isLoading ? '--' : formatCurrency(summary.totalInitialPremium)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <IndianRupee className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-950/50 backdrop-blur-md border border-white/10">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">PLI Policies</p>
              <p className="text-xl font-bold text-white mt-1">
                {isLoading ? '--' : summary.pliCount}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <FileCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-950/50 backdrop-blur-md border border-white/10">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">RPLI Policies</p>
              <p className="text-xl font-bold text-white mt-1">
                {isLoading ? '--' : summary.rpliCount}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Layers className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Actions Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search official or office..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-60 bg-slate-950/60 border-white/10 text-slate-100"
          />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as InsuranceType | 'ALL')}
            className="flex h-10 rounded-md border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">All Types (PLI & RPLI)</option>
            <option value="PLI">PLI Only</option>
            <option value="RPLI">RPLI Only</option>
          </select>

          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-36 text-xs bg-slate-950/60 border-white/10 text-slate-100 scheme-dark"
              title="Start Date"
            />
            <span className="text-slate-500 text-xs">to</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-36 text-xs bg-slate-950/60 border-white/10 text-slate-100 scheme-dark"
              title="End Date"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/30 font-medium transition-colors"
          >
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <AddInsuranceDialog />
        </div>
      </div>

      {/* Main Data Table */}
      <div
        ref={tableContainerRef}
        className="rounded-xl border border-white/10 bg-slate-950/50 backdrop-blur-sm overflow-x-auto"
      >
        <Table>
          <TableHeader className="bg-white/5">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-slate-300">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-slate-400">
                  Loading insurance records...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="gsap-table-row hover:bg-white/5">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-slate-500">
                  No PLI / RPLI contributions found matching the criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3">
        <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-400">
          <span>Rows per page:</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
          >
            {[10, 20, 30, 50, 100].map((pageSize) => (
              <option key={pageSize} value={pageSize} className="bg-slate-900 text-white">
                {pageSize}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="border-white/10 text-slate-300 hover:bg-white/10 text-xs"
          >
            Previous
          </Button>
          <div className="text-xs text-slate-400 font-medium">
            Page {page} of {data?.data?.pagination?.totalPages || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= (data?.data?.pagination?.totalPages || 1)}
            className="border-white/10 text-slate-300 hover:bg-white/10 text-xs"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
