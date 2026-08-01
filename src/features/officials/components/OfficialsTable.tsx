'use client'

import { useState, useRef, useMemo } from 'react'
import dynamic from 'next/dynamic'
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
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
} from '@tanstack/react-table'
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react'
import { useAuthStore } from '@/store/useAuthStore'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const AddOfficialDialog = dynamic(
  () => import('./AddOfficialDialog').then((mod) => mod.AddOfficialDialog),
  { ssr: false }
)
const EditOfficialDialog = dynamic(
  () => import('./EditOfficialDialog').then((mod) => mod.EditOfficialDialog),
  { ssr: false }
)
const DeleteOfficialDialog = dynamic(
  () => import('./DeleteOfficialDialog').then((mod) => mod.DeleteOfficialDialog),
  { ssr: false }
)

export function OfficialsTable() {
  'use no memo';
  const user = useAuthStore((state) => state.user)
  const isAdmin = user?.role === 'Admin'

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState('')
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }])
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const fetchOfficials = async (page: number, limit: number, search: string, sortParams: string): Promise<{ data: { officials: Official[], pagination: { totalPages: number } } }> => {
    const res = await fetch(`/api/officials?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&sort=${encodeURIComponent(sortParams)}`)
    if (!res.ok) throw new Error('Network response was not ok')
    return res.json()
  }

  const sortParams = JSON.stringify(sorting)

  const { data, isLoading } = useQuery({
    queryKey: ['officials', page, limit, search, sortParams],
    queryFn: () => fetchOfficials(page, limit, search, sortParams),
    placeholderData: keepPreviousData,
  })

  useGSAP(
    () => {
      if (!isLoading && data?.data?.officials && data.data.officials.length > 0) {
        const rows = tableContainerRef.current?.querySelectorAll('.gsap-table-row')
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
          )
        }
      }
    },
    { scope: tableContainerRef, dependencies: [data, isLoading] }
  )

  const columns: ColumnDef<Official>[] = useMemo(() => {
    const cols: ColumnDef<Official>[] = [
      {
        accessorKey: 'name',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4 hover:bg-white/5 hover:text-white"
            >
              Name
              {{
                asc: <ArrowUp className="ml-2 h-4 w-4" />,
                desc: <ArrowDown className="ml-2 h-4 w-4" />,
              }[column.getIsSorted() as string] ?? <ArrowUpDown className="ml-2 h-4 w-4 text-white/30" />}
              {column.getSortIndex() !== -1 && sorting.length > 1 && (
                <span className="ml-1 text-[10px] text-white/50">{column.getSortIndex() + 1}</span>
              )}
            </Button>
          )
        },
      },
      {
        accessorKey: 'designation',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4 hover:bg-white/5 hover:text-white"
            >
              Designation
              {{
                asc: <ArrowUp className="ml-2 h-4 w-4" />,
                desc: <ArrowDown className="ml-2 h-4 w-4" />,
              }[column.getIsSorted() as string] ?? <ArrowUpDown className="ml-2 h-4 w-4 text-white/30" />}
              {column.getSortIndex() !== -1 && sorting.length > 1 && (
                <span className="ml-1 text-[10px] text-white/50">{column.getSortIndex() + 1}</span>
              )}
            </Button>
          )
        },
      },
      {
        accessorKey: 'facilityId',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4 hover:bg-white/5 hover:text-white"
            >
              Facility ID
              {{
                asc: <ArrowUp className="ml-2 h-4 w-4" />,
                desc: <ArrowDown className="ml-2 h-4 w-4" />,
              }[column.getIsSorted() as string] ?? <ArrowUpDown className="ml-2 h-4 w-4 text-white/30" />}
              {column.getSortIndex() !== -1 && sorting.length > 1 && (
                <span className="ml-1 text-[10px] text-white/50">{column.getSortIndex() + 1}</span>
              )}
            </Button>
          )
        },
      },
      {
        accessorKey: 'office',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
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
          )
        },
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
    ]

    if (isAdmin) {
      cols.push({
        id: 'actions',
        cell: ({ row }) => {
          return (
            <div className="flex gap-2">
              <EditOfficialDialog official={row.original} />
              <DeleteOfficialDialog officialId={row.original._id} officialName={row.original.name} />
            </div>
          )
        },
      })
    }

    return cols
  }, [isAdmin, sorting])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data?.data?.officials || [],
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
        {isAdmin ? (
          <AddOfficialDialog />
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
              setLimit(Number(e.target.value))
              setPage(1)
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
  )
}
