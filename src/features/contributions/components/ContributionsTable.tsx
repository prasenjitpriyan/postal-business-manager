'use client';

import { useState } from 'react';
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
import { AddContributionDialog } from './AddContributionDialog';
import { EditContributionDialog } from './EditContributionDialog';
import { DeleteContributionDialog } from './DeleteContributionDialog';


export function ContributionsTable() {
  'use no memo';
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sorting, setSorting] = useState<SortingState>([{ id: 'officialId.name', desc: false }]);

  const fetchContributions = async (page: number, search: string, startDate: string, endDate: string, sortParams: string): Promise<{ data: { contributions: BusinessContribution[], pagination: { totalPages: number } } }> => {
    let url = `/api/contributions?page=${page}&search=${search}&sort=${encodeURIComponent(sortParams)}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
  };

  const sortParams = JSON.stringify(sorting);

  const { data, isLoading } = useQuery({
    queryKey: ['contributions', page, search, startDate, endDate, sortParams],
    queryFn: () => fetchContributions(page, search, startDate, endDate, sortParams),
    placeholderData: keepPreviousData,
  });

  const columns: ColumnDef<BusinessContribution>[] = [
    {
      accessorKey: 'contributionDate',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={(e) => column.toggleSorting(column.getIsSorted() === "asc", e.shiftKey)}
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
      cell: ({ row }) => new Date(row.getValue('contributionDate')).toLocaleDateString(),
    },
    {
      accessorKey: 'officialId.name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={(e) => column.toggleSorting(column.getIsSorted() === "asc", e.shiftKey)}
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
      cell: ({ row }) => (row.original.officialId as { name?: string })?.name || 'Unknown',
    },
    {
      accessorKey: 'contributeOffice',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={(e) => column.toggleSorting(column.getIsSorted() === "asc", e.shiftKey)}
            className="-ml-4 hover:bg-white/5 hover:text-white"
          >
            Office
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
      accessorKey: 'accountType',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={(e) => column.toggleSorting(column.getIsSorted() === "asc", e.shiftKey)}
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
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            <EditContributionDialog contribution={row.original} />
            <DeleteContributionDialog contributionId={row.original._id} />
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
    onSortingChange: setSorting,
    manualSorting: true,
    enableMultiSort: true,
    state: {
      sorting,
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
