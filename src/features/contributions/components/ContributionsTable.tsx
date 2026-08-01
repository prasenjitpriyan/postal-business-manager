'use client';

import { useState, useRef, useMemo } from 'react';
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
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { BusinessContribution } from '@/types/contribution';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useAuthStore } from '@/store/useAuthStore';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const AddContributionDialog = dynamic(
  () => import('./AddContributionDialog').then((mod) => mod.AddContributionDialog),
  { ssr: false }
);
const EditContributionDialog = dynamic(
  () => import('./EditContributionDialog').then((mod) => mod.EditContributionDialog),
  { ssr: false }
);
const DeleteContributionDialog = dynamic(
  () => import('./DeleteContributionDialog').then((mod) => mod.DeleteContributionDialog),
  { ssr: false }
);


export function ContributionsTable() {
  'use no memo';
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'Admin';
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sorting, setSorting] = useState<SortingState>([{ id: 'contributionDate', desc: true }]);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const fetchContributions = async (page: number, limit: number, search: string, startDate?: string, endDate?: string, sort?: string) => {
    let url = `/api/contributions?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    if (sort) url += `&sort=${encodeURIComponent(sort)}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch contributions');
    return res.json();
  };

  const sortParams = JSON.stringify(sorting);

  const { data, isLoading } = useQuery({
    queryKey: ['contributions', page, limit, search, startDate, endDate, sortParams],
    queryFn: () => fetchContributions(page, limit, search, startDate, endDate, sortParams),
    placeholderData: keepPreviousData,
  });

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
              stagger: 0.05,
              ease: 'power2.out',
            }
          );
        }
      }
    },
    { scope: tableContainerRef, dependencies: [data, isLoading] }
  );

  const columns: ColumnDef<BusinessContribution>[] = useMemo(() => {
    const cols: ColumnDef<BusinessContribution>[] = [
      {
        accessorKey: 'officialId.name',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4 hover:bg-white/5 hover:text-white"
            >
              Official
              {{
                asc: <ArrowUp className="ml-2 h-4 w-4" />,
                desc: <ArrowDown className="ml-2 h-4 w-4" />,
              }[column.getIsSorted() as string] ?? <ArrowUpDown className="ml-2 h-4 w-4 text-white/30" />}
              {column.getSortIndex() !== -1 && sorting.length > 1 && (
                <span className="ml-1 text-[10px] text-white/50">{column.getSortIndex() + 1}</span>
              )}
            </Button>
          );
        },
        cell: ({ row }) => {
          const official = row.original.officialId;
          return typeof official === 'object' && official?.name ? official.name : 'N/A';
        },
      },
      {
        accessorKey: 'contributeOffice',
        header: 'Office',
        cell: ({ row }) => row.getValue('contributeOffice') || 'N/A',
      },
      {
        accessorKey: 'contributionDate',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4 hover:bg-white/5 hover:text-white"
            >
              Date
              {{
                asc: <ArrowUp className="ml-2 h-4 w-4" />,
                desc: <ArrowDown className="ml-2 h-4 w-4" />,
              }[column.getIsSorted() as string] ?? <ArrowUpDown className="ml-2 h-4 w-4 text-white/30" />}
              {column.getSortIndex() !== -1 && sorting.length > 1 && (
                <span className="ml-1 text-[10px] text-white/50">{column.getSortIndex() + 1}</span>
              )}
            </Button>
          );
        },
        cell: ({ row }) =>
          new Date(row.getValue('contributionDate')).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
      },
      {
        accessorKey: 'accountType',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4 hover:bg-white/5 hover:text-white"
            >
              Type
              {{
                asc: <ArrowUp className="ml-2 h-4 w-4" />,
                desc: <ArrowDown className="ml-2 h-4 w-4" />,
              }[column.getIsSorted() as string] ?? <ArrowUpDown className="ml-2 h-4 w-4 text-white/30" />}
              {column.getSortIndex() !== -1 && sorting.length > 1 && (
                <span className="ml-1 text-[10px] text-white/50">{column.getSortIndex() + 1}</span>
              )}
            </Button>
          );
        },
      },
      {
        accessorKey: 'accountsOpened',
        header: 'Accounts Opened',
      },
    ];

    if (isAdmin) {
      cols.push({
        id: 'actions',
        cell: ({ row }) => {
          return (
            <div className="flex gap-2">
              <EditContributionDialog contribution={row.original} />
              <DeleteContributionDialog contributionId={row.original._id} />
            </div>
          );
        },
      });
    }

    return cols;
  }, [isAdmin, sorting]);

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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search contributions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-60"
          />
          <div className="flex gap-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full sm:w-36 text-sm bg-slate-950/50 border-white/10 text-slate-100 scheme-dark"
              title="Start Date"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full sm:w-36 text-sm bg-slate-950/50 border-white/10 text-slate-100 scheme-dark"
              title="End Date"
            />
          </div>
        </div>
        {isAdmin ? (
          <AddContributionDialog />
        ) : (
          <span className="text-xs px-3 py-1.5 rounded-full bg-slate-900 border border-white/10 text-slate-400 font-medium">
            Read-Only Mode (Viewer)
          </span>
        )}
      </div>

      <div ref={tableContainerRef} className="rounded-md border border-white/10 bg-slate-950/50 backdrop-blur-sm overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="gsap-table-row">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
        <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-400">
          <span>Rows per page:</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
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
            className="text-xs"
          >
            Previous
          </Button>
          <div className="text-xs font-medium text-slate-300">
            Page {page} of {data?.data?.pagination?.totalPages || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= (data?.data?.pagination?.totalPages || 1)}
            className="text-xs"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
