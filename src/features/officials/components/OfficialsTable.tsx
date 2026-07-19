'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Official, OfficialStatus } from '@/types/official'
import { useQuery } from '@tanstack/react-query'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useState } from 'react'
import { AddOfficialDialog } from './AddOfficialDialog'
import { DeleteOfficialDialog } from './DeleteOfficialDialog'
import { EditOfficialDialog } from './EditOfficialDialog'

export function OfficialsTable() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  // Use React Query for fetching
  const fetchOfficials = async (page: number, search: string) => {
    const res = await fetch(`/api/officials?page=${page}&search=${search}`)
    if (!res.ok) throw new Error('Network response was not ok')
    return res.json()
  }

  const { data, isLoading } = useQuery({
    queryKey: ['officials', page, search],
    queryFn: () => fetchOfficials(page, search),
  })

  const columns: ColumnDef<Official>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'designation',
      header: 'Designation',
    },
    {
      accessorKey: 'office',
      header: 'Office',
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium border ${row.getValue('status') === OfficialStatus.ACTIVE ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}
        >
          {row.getValue('status')}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            <EditOfficialDialog official={row.original} />
            <DeleteOfficialDialog officialId={row.original._id} officialName={row.original.name} />
          </div>
        )
      },
    },
  ]

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data?.data?.officials || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Input
          placeholder="Search officials..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-sm"
        />
        <AddOfficialDialog />
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
                      : flexRender(header.column.columnDef.header, header.getContext())}
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
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <div className="text-sm">
          Page {page} of {data?.data?.pagination?.totalPages || 1}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= (data?.data?.pagination?.totalPages || 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
