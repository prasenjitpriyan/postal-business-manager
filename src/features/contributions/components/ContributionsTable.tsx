'use client';

import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BusinessContribution } from '@/types/contribution';
import { AddContributionDialog } from './AddContributionDialog';


export function ContributionsTable() {
  'use no memo';
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Use React Query for fetching
  const fetchContributions = async (page: number, search: string, startDate: string, endDate: string): Promise<{ data: { contributions: BusinessContribution[], pagination: { totalPages: number } } }> => {
    let url = `/api/contributions?page=${page}&search=${search}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
  };

  const { data, isLoading } = useQuery({
    queryKey: ['contributions', page, search, startDate, endDate],
    queryFn: () => fetchContributions(page, search, startDate, endDate),
    placeholderData: keepPreviousData,
  });

  const columns: ColumnDef<BusinessContribution>[] = [
    {
      accessorKey: 'contributionDate',
      header: 'Date',
      cell: ({ row }) => new Date(row.getValue('contributionDate')).toLocaleDateString(),
    },
    {
      accessorKey: 'officialId.name',
      header: 'Official',
      cell: ({ row }) => (row.original.officialId as { name?: string })?.name || 'Unknown',
    },
    {
      accessorKey: 'contributeOffice',
      header: 'Office',
    },
    {
      accessorKey: 'accountType',
      header: 'Type',
    },
    {
      accessorKey: 'accountsOpened',
      header: 'Accounts Opened',
    },
    {
      id: 'actions',
      cell: () => {
        return (
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-colors h-8 w-8" title="Edit Contribution">
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors h-8 w-8" title="Delete Contribution">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data?.data?.contributions || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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
        <AddContributionDialog />
      </div>

      <div className="rounded-md border border-white/10 bg-slate-950/50 backdrop-blur-sm overflow-x-auto">
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
                <TableRow key={row.id}>
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

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <div className="text-sm">Page {page} of {data?.data?.pagination?.totalPages || 1}</div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(p => p + 1)}
          disabled={page >= (data?.data?.pagination?.totalPages || 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
