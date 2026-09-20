import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  RowSelectionState,
} from "@tanstack/react-table";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  X,
  Check,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS } from "@/config/constants";
import { cn } from "@/lib/utils";

export { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS };

// ==========================================
// Types & Interfaces
// ==========================================

export interface Column<TData> {
  key: string;
  header: React.ReactNode;
  headerTitle?: string;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: "text" | "select";
  filterOptions?: { label: string; value: string }[];
  render?: (row: TData, index: number, rowContext: any) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
}

export interface TablePaginationConfig {
  isServer?: boolean; // true for server-side pagination, false for client-side
  pageIndex?: number; // 0-based index
  pageSize?: number;
  totalCount?: number;
  pageSizeOptions?: number[];
  onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void;
}

export interface DataTableProps<TData> {
  data: TData[];
  columns: (ColumnDef<TData, any> | Column<TData>)[];

  // 1. Single Unified Pagination Object
  pagination?: TablePaginationConfig;
  enablePagination?: boolean; // Default true. If false, renders all rows without pagination controls

  // 2. Global & Column Filtering Props
  enableGlobalFilter?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof TData)[];
  enableColumnFilters?: boolean;

  // 3. Sorting Props
  enableSorting?: boolean;
  onSortingChange?: (sorting: SortingState) => void;

  // 4. Loading & Empty State
  isLoading?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;

  // 5. Layout & Density
  density?: "compact" | "normal" | "spacious";
  headerActions?: React.ReactNode;
  filterComponent?: React.ReactNode;
  onRowClick?: (row: TData) => void;
  enableRowSelection?: boolean;
  onSelectedRowsChange?: (selectedRows: TData[]) => void;
  stickyHeader?: boolean;
  tableContainerClassName?: string;
  className?: string;
}


// ==========================================
// Isolated Search Input for Butter-Smooth Typing
// ==========================================

interface TableSearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

const TableSearchInput = React.memo<TableSearchInputProps>(({ value, onChange, placeholder }) => {
  const [localVal, setLocalVal] = useState(value || "");

  // Keep in sync if parent resets search externally
  React.useEffect(() => {
    setLocalVal(value || "");
  }, [value]);

  // Debounce table filter by 150ms so typing never lags the table
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localVal !== (value || "")) {
        onChange(localVal);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [localVal, value, onChange]);

  return (
    <Input
      type="text"
      placeholder={placeholder}
      value={localVal}
      onChange={(e) => setLocalVal(e.target.value)}
      leftIcon={<Search size={15} />}
      isClearable={Boolean(localVal)}
      onClear={() => {
        setLocalVal("");
        onChange("");
      }}
      className="h-9 text-xs rounded-xl bg-white border-slate-200/90 focus:border-slate-800"
    />
  );
});
TableSearchInput.displayName = "TableSearchInput";

// ==========================================
// Popover Filter Component for Column Headers
// ==========================================

interface ColumnFilterDialogProps {
  title: string;
  filterValue: string;
  filterType?: "text" | "select";
  filterOptions?: { label: string; value: string }[];
  onApply: (val: string) => void;
  onReset: () => void;
}

const ColumnFilterDialog: React.FC<ColumnFilterDialogProps> = ({
  title,
  filterValue,
  filterType = "text",
  filterOptions,
  onApply,
  onReset,
}) => {
  const [localVal, setLocalVal] = useState(filterValue || "");
  const [isOpen, setIsOpen] = useState(false);

  // Sync with prop when filterValue changes externally
  React.useEffect(() => {
    setLocalVal(filterValue || "");
  }, [filterValue]);

  // Apply filter with 150ms debounce so typing is silky smooth without table re-renders
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localVal !== (filterValue || "")) {
        onApply(localVal);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [localVal, filterValue, onApply]);

  const handleChange = (val: string) => {
    setLocalVal(val);
  };

  const handleClear = () => {
    setLocalVal("");
    onReset();
  };

  const isFiltered = Boolean(filterValue && filterValue.trim().length > 0);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "p-1 rounded-md transition-colors cursor-pointer ml-1 inline-flex items-center justify-center",
            isFiltered
              ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
              : "text-slate-400 hover:text-slate-700 hover:bg-slate-100 opacity-60 hover:opacity-100"
          )}
          title={`Filter by ${title}`}
        >
          <Filter size={11} className={isFiltered ? "fill-indigo-600" : ""} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-64 p-3 space-y-2.5 bg-white rounded-2xl shadow-xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
          <span className="text-xs font-semibold text-slate-800">
            Filter {title}
          </span>
          {isFiltered && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {filterType === "select" && filterOptions ? (
          <div className="space-y-1 max-h-48 overflow-y-auto">
            <button
              type="button"
              onClick={() => handleChange("")}
              className={cn(
                "w-full text-left text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer",
                !localVal
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <span>All</span>
              {!localVal && <Check size={13} className="text-indigo-600" />}
            </button>
            {filterOptions.map((opt) => {
              const isSelected = localVal === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleChange(isSelected ? "" : opt.value)}
                  className={cn(
                    "w-full text-left text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer",
                    isSelected
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check size={13} className="text-indigo-600" />}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="relative">
            <Input
              type="text"
              placeholder={`Type to filter ${title}...`}
              value={localVal}
              onChange={(e) => handleChange(e.target.value)}
              className="h-8 text-xs pr-7 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white"
              autoFocus
            />
            {localVal && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Clear input"
              >
                <X size={12} />
              </button>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

// ==========================================
// Main Standardized DataTable Component
// ==========================================

export function DataTable<TData extends Record<string, any>>({
  data = [],
  columns: propColumns,
  pagination,
  enableGlobalFilter = true,
  searchPlaceholder = "Search records...",
  searchKeys,
  enableColumnFilters = true,
  enableSorting = true,
  onSortingChange: propOnSortingChange,
  isLoading = false,
  emptyTitle = "No records found",
  emptyMessage = "There are no records matching your criteria.",
  emptyActionLabel,
  onEmptyAction,
  density = "compact",
  headerActions,
  filterComponent,
  onRowClick,
  enableRowSelection = false,
  onSelectedRowsChange,
  stickyHeader = false,
  tableContainerClassName,
  enablePagination = true,
  className,
}: DataTableProps<TData>) {
  // Mode detection
  const isServerPagination = Boolean(pagination?.isServer);
  const defaultPageSize = pagination?.pageSize ?? DEFAULT_PAGE_SIZE;
  const pageSizeOptions = pagination?.pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS;

  // States
  const [globalFilter, setGlobalFilter] = useState("");
  const deferredGlobalFilter = React.useDeferredValue(globalFilter);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  // Keep existing rows visible during background refetches. Skeletons are
  // reserved for the initial request when no data has arrived yet.
  const showLoading = isLoading && data.length === 0;

  // Client pagination state if in client mode
  const [clientPagination, setClientPagination] = useState({
    pageIndex: pagination?.pageIndex ?? 0,
    pageSize: defaultPageSize,
  });

  // Active pagination state
  const activePagination = useMemo(() => {
    if (!enablePagination) {
      return {
        pageIndex: 0,
        pageSize: 100000,
      };
    }
    if (isServerPagination) {
      return {
        pageIndex: pagination?.pageIndex ?? 0,
        pageSize: pagination?.pageSize ?? defaultPageSize,
      };
    }
    return clientPagination;
  }, [enablePagination, isServerPagination, pagination?.pageIndex, pagination?.pageSize, defaultPageSize, clientPagination]);


  // Convert Columns to TanStack ColumnDef with Sorting & Column Filters
  const normalizedColumns = useMemo<ColumnDef<TData, any>[]>(() => {
    return propColumns.map((col: any) => {
      // If already a TanStack ColumnDef
      if (col.accessorKey || col.id || (col.cell && typeof col.cell === "function")) {
        return col;
      }

      // If Column<TData> format
      const customCol = col as Column<TData>;
      const isSrNo =
        customCol.key === "sr_no" ||
        customCol.key === "srno" ||
        customCol.key === "sr" ||
        customCol.key === "index" ||
        (typeof customCol.header === "string" &&
          (customCol.header.toLowerCase().includes("sr. no") ||
            customCol.header.toLowerCase().includes("sr no") ||
            customCol.header === "#"));
      const isAction =
        customCol.key === "actions" ||
        customCol.key === "action" ||
        (typeof customCol.header === "string" &&
          (customCol.header.toLowerCase() === "actions" ||
            customCol.header.toLowerCase() === "action" ||
            customCol.header.toLowerCase() === "document"));

      const isColSortable =
        enableSorting &&
        (customCol.sortable !== undefined
          ? customCol.sortable
          : !isAction && !isSrNo);
      const isColFilterable =
        enableColumnFilters && (customCol.filterable !== undefined ? customCol.filterable : false);

      return {
        id: customCol.key,
        accessorKey: customCol.key,
        enableSorting: isColSortable,
        enableColumnFilter: isColFilterable,
        header: ({ column }: any) => {
          const filterValue = (column.getFilterValue() as string) ?? "";
          const isRightExplicit =
            customCol.className?.includes("text-right") ||
            customCol.headerClassName?.includes("text-right") ||
            customCol.headerClassName?.includes("justify-end");
          const isCenterExplicit =
            customCol.className?.includes("text-center") ||
            customCol.headerClassName?.includes("text-center") ||
            customCol.headerClassName?.includes("justify-center");
          const isCenterAligned =
            isCenterExplicit || (isAction && !isRightExplicit) || isSrNo;
          const isRightAligned = isRightExplicit && !isCenterAligned;

          return (
            <div
              className={cn(
                "flex items-center gap-1.5 w-full whitespace-nowrap",
                isCenterAligned
                  ? "justify-center text-center"
                  : isRightAligned
                  ? "justify-end text-right"
                  : "justify-start text-left",
                customCol.headerClassName
              )}
            >
              {/* Header Title with 3-State Click-to-Sort (None -> Asc -> Desc -> Reset) */}
              {isColSortable ? (
                <button
                  type="button"
                  onClick={() => {
                    const currentSort = column.getIsSorted();
                    if (!currentSort) {
                      column.toggleSorting(false); // 1. Ascending
                    } else if (currentSort === "asc") {
                      column.toggleSorting(true); // 2. Descending
                    } else {
                      column.clearSorting(); // 3. Reset to None / Original Order
                    }
                  }}
                  className="inline-flex items-center gap-1 p-0 m-0 border-0 bg-transparent hover:text-slate-900 transition-colors select-none font-semibold cursor-pointer group text-xs text-left whitespace-nowrap outline-none focus:outline-none focus-visible:outline-none focus:ring-0"
                  title={
                    column.getIsSorted() === "asc"
                      ? "Sorted Ascending (Click for Descending)"
                      : column.getIsSorted() === "desc"
                      ? "Sorted Descending (Click to Reset)"
                      : "Click to sort Ascending"
                  }
                >
                  <span className="whitespace-nowrap">{customCol.header}</span>
                  {column.getIsSorted() === "asc" ? (
                    <ArrowUp size={13} className="text-indigo-600 shrink-0" />
                  ) : column.getIsSorted() === "desc" ? (
                    <ArrowDown size={13} className="text-indigo-600 shrink-0" />
                  ) : (
                    <ArrowUpDown
                      size={12}
                      className="text-slate-400 opacity-50 group-hover:opacity-100 shrink-0"
                    />
                  )}
                </button>
              ) : (
                <span className="font-semibold text-xs text-slate-600 whitespace-nowrap">
                  {customCol.header}
                </span>
              )}

              {/* Column Filter Icon & Popover Dialog */}
              {isColFilterable && (
                <ColumnFilterDialog
                  title={
                    customCol.headerTitle ||
                    (typeof customCol.header === "string"
                      ? customCol.header
                      : String(customCol.key))
                  }
                  filterValue={filterValue}
                  filterType={customCol.filterType}
                  filterOptions={customCol.filterOptions}
                  onApply={(val) => column.setFilterValue(val || undefined)}
                  onReset={() => column.setFilterValue(undefined)}
                />
              )}
            </div>
          );
        },
        cell: ({ row }: any) => {
          if (customCol.render) {
            // In client mode, TanStack row.index is already the continuous dataset index (0 to N-1).
            // In server mode, current page rows are 0-based, so we offset by (pageIndex * pageSize).
            const globalIndex = isServerPagination
              ? ((pagination?.pageIndex ?? 0) * (pagination?.pageSize ?? defaultPageSize)) + row.index
              : row.index;

            return customCol.render(row.original, globalIndex, row);
          }
          const val = row.original[customCol.key];
          return val != null ? String(val) : <span className="text-slate-400">-</span>;
        },
      };
    });
  }, [propColumns, enableSorting, enableColumnFilters]);

  // Global search filtering logic
  const globalFilterFn = useMemo(() => {
    return (row: any, _columnId: string, filterValue: string) => {
      if (!filterValue) return true;
      const term = String(filterValue).toLowerCase().trim();
      const original = row.original;

      if (searchKeys && searchKeys.length > 0) {
        return searchKeys.some((key) => {
          const val = original[key];
          return val != null && String(val).toLowerCase().includes(term);
        });
      }

      // Search all string/number primitive values in row
      return Object.values(original).some(
        (val) => val != null && String(val).toLowerCase().includes(term)
      );
    };
  }, [searchKeys]);

  // Total server page count calculation
  const totalCount = isServerPagination ? (pagination?.totalCount ?? data.length) : data.length;
  const pageCount = isServerPagination
    ? Math.ceil(totalCount / activePagination.pageSize) || 1
    : undefined;

  const table = useReactTable({
    data,
    columns: normalizedColumns,
    state: {
      globalFilter: deferredGlobalFilter,
      columnFilters,
      sorting,
      rowSelection,
      pagination: activePagination,
    },
    // Server vs Client mode flags
    manualPagination: isServerPagination,
    pageCount,
    enableSortingRemoval: true,
    enableRowSelection,
    onRowSelectionChange: (updater) => {
      const nextSelection =
        typeof updater === "function" ? updater(rowSelection) : updater;
      setRowSelection(nextSelection);
      if (onSelectedRowsChange) {
        const selectedIndices = Object.keys(nextSelection).filter((k) => nextSelection[k]);
        const selectedRows = selectedIndices.map((idx) => data[Number(idx)]).filter(Boolean);
        onSelectedRowsChange(selectedRows);
      }
    },
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      setSorting(next);
      propOnSortingChange?.(next);
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater(activePagination) : updater;
      if (isServerPagination) {
        pagination?.onPaginationChange?.(next);
      } else {
        setClientPagination(next);
        pagination?.onPaginationChange?.(next);
      }
    },
    globalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const totalFilteredRows = isServerPagination
    ? totalCount
    : table.getFilteredRowModel().rows.length;

  const pageIndex = table.getState().pagination.pageIndex;
  const currentPageSize = table.getState().pagination.pageSize;
  const calculatedPageCount = table.getPageCount();

  const startRecord = totalFilteredRows === 0 ? 0 : pageIndex * currentPageSize + 1;
  const endRecord = isServerPagination
    ? Math.min((pageIndex + 1) * currentPageSize, totalFilteredRows)
    : Math.min((pageIndex + 1) * currentPageSize, totalFilteredRows);

  const hasActiveFilters = Boolean(globalFilter || columnFilters.length > 0);

  // Density styles map
  const densityStyles = {
    compact: {
      head: "h-8.5 px-3 py-1.5 text-xs font-semibold text-slate-500 whitespace-nowrap",
      cell: "px-3 py-1.5 text-xs leading-normal",
      skeleton: "h-3.5",
      pagination: "px-4 py-2.5 text-xs",
      controlHeight: "h-8",
    },
    normal: {
      head: "h-9.5 px-3.5 py-2 text-xs font-semibold text-slate-500 whitespace-nowrap",
      cell: "px-3.5 py-2 text-xs leading-normal",
      skeleton: "h-4",
      pagination: "px-4 py-3 text-xs",
      controlHeight: "h-8.5",
    },
    spacious: {
      head: "h-11 px-4 py-3.5 text-sm font-semibold text-slate-500 whitespace-nowrap",
      cell: "px-4 py-3 text-sm leading-relaxed",
      skeleton: "h-4.5",
      pagination: "px-6 py-3.5 text-xs",
      controlHeight: "h-9",
    },
  }[density];

  // Helper to compute effective column width (defaults action column to 72px and sr_no column to 64px if not specified)
  const getEffectiveColumnWidth = (customCol?: Column<any> | any) => {
    if (!customCol) return undefined;
    if (customCol.width !== undefined && customCol.width !== null && customCol.width !== "") {
      return typeof customCol.width === "number" ? `${customCol.width}px` : customCol.width;
    }
    const keyOrId = String(customCol.key || customCol.id || customCol.accessorKey || "").toLowerCase();
    const headerStr = typeof customCol.header === "string" ? customCol.header.toLowerCase() : "";
    if (keyOrId === "actions" || keyOrId === "action" || headerStr === "actions" || headerStr === "action") {
      return "72px";
    }
    if (
      keyOrId === "sr_no" ||
      keyOrId === "srno" ||
      keyOrId === "sr" ||
      keyOrId === "index" ||
      headerStr.includes("sr. no") ||
      headerStr.includes("sr no") ||
      headerStr === "#"
    ) {
      return "64px";
    }
    return undefined;
  };

  return (
    <div className={cn("space-y-3.5", className)}>
      {/* Top Controls: Search Bar + Custom Filters + Header Action Slots */}
      {(enableGlobalFilter || filterComponent || headerActions) && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            {enableGlobalFilter && (
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <TableSearchInput
                  placeholder={searchPlaceholder}
                  value={globalFilter}
                  onChange={setGlobalFilter}
                />
              </div>
            )}
            {filterComponent}

            {/* Clear All Active Column Filters Pill */}
            {columnFilters.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setColumnFilters([])}
                className="h-8.5 px-2.5 rounded-xl border-dashed border-slate-300 text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
              >
                <span>Clear {columnFilters.length} column filter{columnFilters.length > 1 ? "s" : ""}</span>
                <X size={12} />
              </Button>
            )}
          </div>

          {headerActions && (
            <div className="flex items-center gap-2 shrink-0">{headerActions}</div>
          )}
        </div>
      )}

      {/* Main Table Card with Smooth Horizontal Touch Scroll */}
      <div className="overflow-hidden bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <Table
          className="w-full table-fixed min-w-[680px] sm:min-w-[760px]"
          containerClassName={cn(
            "overflow-x-auto overscroll-x-contain",
            stickyHeader && "overflow-y-auto max-h-[55vh] overscroll-contain",
            tableContainerClassName
          )}
        >
          {/* Colgroup locks column widths so headers NEVER jump on empty state or filter */}
          <colgroup>
            {propColumns.map((col: any, idx) => {
              const effectiveWidth = getEffectiveColumnWidth(col);
              return (
                <col
                  key={`col-${col.key || col.id || 'c'}-${idx}`}
                  style={effectiveWidth ? { width: effectiveWidth } : undefined}
                />
              );
            })}
          </colgroup>

          <TableHeader className={cn(stickyHeader && "sticky top-0 z-20 bg-slate-50/95 backdrop-blur-xs shadow-2xs")}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const customCol = propColumns.find(
                    (c: any) => (c.key || c.id) === header.column.id
                  ) as Column<TData> | undefined;
                  const effectiveWidth = getEffectiveColumnWidth(customCol);

                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        width: effectiveWidth,
                        minWidth: customCol?.minWidth,
                        maxWidth: customCol?.maxWidth,
                      }}
                      className={cn(
                        densityStyles.head,
                        stickyHeader && "sticky top-0 z-20 bg-slate-50/95 backdrop-blur-xs",
                        customCol?.headerClassName,
                        customCol?.className
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>


          <TableBody>
            {showLoading ? (
              // Loading Skeleton State
              Array.from({ length: currentPageSize > 5 ? 5 : currentPageSize }).map((_, rIdx) => (
                <TableRow key={`skeleton-${rIdx}`}>
                  {normalizedColumns.map((col: any, cIdx) => {
                    const customCol = propColumns.find(
                      (c: any) => (c.key || c.id) === col.id
                    ) as Column<TData> | undefined;
                    const effectiveWidth = getEffectiveColumnWidth(customCol);

                    return (
                      <TableCell
                        key={`skeleton-cell-${cIdx}`}
                        style={{
                          width: effectiveWidth,
                          minWidth: customCol?.minWidth,
                          maxWidth: customCol?.maxWidth,
                        }}
                        className={cn(densityStyles.cell, customCol?.className)}
                      >
                        <Skeleton className={cn("w-full max-w-[120px] rounded-md bg-slate-100", densityStyles.skeleton)} />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length > 0 ? (
              // Active Data Rows
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onRowClick && onRowClick(row.original)}
                  className={cn(
                    "hover:bg-slate-50/70 transition-colors",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {row.getVisibleCells().map((cell) => {
                    const customCol = propColumns.find(
                      (c: any) => (c.key || c.id) === cell.column.id
                    ) as Column<TData> | undefined;
                    const effectiveWidth = getEffectiveColumnWidth(customCol);

                    return (
                      <TableCell
                        key={cell.id}
                        style={{
                          width: effectiveWidth,
                          minWidth: customCol?.minWidth,
                          maxWidth: customCol?.maxWidth,
                        }}
                        className={cn(densityStyles.cell, customCol?.className)}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              // Empty Data State
              <TableRow>
                <TableCell
                  colSpan={normalizedColumns.length}
                  className="h-64 text-center"
                >
                  <EmptyState
                    title={emptyTitle}
                    description={
                      hasActiveFilters
                        ? "No results matched your search or column filter criteria. Try refining your keywords."
                        : emptyMessage
                    }
                    actionLabel={hasActiveFilters ? undefined : emptyActionLabel}
                    onAction={hasActiveFilters ? undefined : onEmptyAction}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Bottom Pagination Bar */}
        {!showLoading && totalFilteredRows > 0 && enablePagination && (
          <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 text-slate-500", densityStyles.pagination)}>

            {/* Left: Record Count Summary */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
              <span>
                Showing <strong className="text-slate-800 px-0.5">{startRecord}</strong> to
                <strong className="text-slate-800 px-0.5">{endRecord}</strong> of
                <strong className="text-slate-800 px-0.5">{totalFilteredRows}</strong> records
              </span>

              {/* Page Size Selector */}
              {pageSizeOptions && pageSizeOptions.length > 1 && (
                <div className="flex items-center gap-1.5 ml-1 border-l border-slate-200 pl-2">
                  <span>Show</span>
                  <Select
                    size="sm"
                    containerClassName="w-auto"
                    className={cn(
                      densityStyles.controlHeight,
                      "w-[68px] rounded-lg text-xs font-medium text-slate-700 bg-white border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800/10 shadow-none px-2"
                    )}
                    value={currentPageSize}
                    onChange={(e) => table.setPageSize(Number(e.target.value))}
                    options={pageSizeOptions.map((opt) => ({
                      value: opt,
                      label: opt,
                    }))}
                  />
                </div>
              )}
            </div>

            {/* Right: Page Navigation Buttons */}
            <div className="flex items-center justify-center gap-1.5 w-full sm:w-auto flex-wrap">
              {/* First Page Button */}
              <button
                type="button"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className={cn(
                  densityStyles.controlHeight,
                  "w-8.5 h-8.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center transition-colors"
                )}
                title="First Page"
              >
                <ChevronsLeft size={14} />
              </button>

              {/* Previous Page Button */}
              <button
                type="button"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className={cn(
                  densityStyles.controlHeight,
                  "h-8.5 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center gap-1 transition-colors"
                )}
              >
                <ChevronLeft size={14} />
                <span>Prev</span>
              </button>

              {/* Page Number Indicator */}
              <div
                className={cn(
                  densityStyles.controlHeight,
                  "h-8.5 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 inline-flex items-center justify-center select-none"
                )}
              >
                Page {pageIndex + 1} of {calculatedPageCount || 1}
              </div>

              {/* Next Page Button */}
              <button
                type="button"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className={cn(
                  densityStyles.controlHeight,
                  "h-8.5 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center gap-1 transition-colors"
                )}
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>

              {/* Last Page Button */}
              <button
                type="button"
                onClick={() => table.setPageIndex((calculatedPageCount || 1) - 1)}
                disabled={!table.getCanNextPage()}
                className={cn(
                  densityStyles.controlHeight,
                  "w-8.5 h-8.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center transition-colors"
                )}
                title="Last Page"
              >
                <ChevronsRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DataTable;
