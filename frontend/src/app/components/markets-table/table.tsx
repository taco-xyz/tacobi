"use client";

// React Imports
import { FC, useMemo, useState } from "react";

// TacoBI Imports
import { ExtractDatasetRequestRowType } from "@/tacobi";
import { useTacoBI } from "@/app/tacobi-config";

// Tanstack Imports
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  flexRender,
  Column,
} from "@tanstack/react-table";

// Utils Imports
import clsx from "clsx";
import { formatCurrency } from "@/utils/formatCurrency";

// Icons Imports
import {
  ChevronsUpDownIcon,
  ChevronDown,
  ChevronUp,
  ChevronsRight,
} from "lucide-react";

// Component Imports
import {
  ProgressCircle,
  ProgressCircleProps,
} from "./components/ProgressCircle";

/**
 * A header that can be used to sort the table.
 * @param column The column to sort.
 * @param title The title of the column.
 * @returns A button that can be used to sort the table.
 */
const SortableHeader = <TData, TValue>({
  column,
  title,
}: {
  column: Column<TData, TValue>;
  title: string;
}) => (
  <button
    onClick={() => column.toggleSorting()}
    className="flex items-center gap-1 rounded-md px-2 py-1.5 transition-all duration-200 hover:cursor-pointer hover:bg-gray-100"
  >
    {title}
    {column.getIsSorted() === "desc" ? (
      <ChevronDown className="size-4 text-gray-900" />
    ) : column.getIsSorted() === "asc" ? (
      <ChevronUp className="size-4 text-gray-900" />
    ) : (
      <ChevronsUpDownIcon className="size-4 text-gray-500" />
    )}
  </button>
);

/**
 * Displays current markets on Morpho.
 * @returns A table of current markets on Morpho.
 */
const MarketsTable: FC = () => {
  const { useDatasets } = useTacoBI();
  const [marketStats] = useDatasets(["markets-current"]);

  // Extract the row type of the market stats dataset request so that we can
  // use it for the the Tanstack Table generics.
  type MarketStatsRowType = ExtractDatasetRequestRowType<typeof marketStats>;

  const [sorting, setSorting] = useState<SortingState>([]);

  const defaultColumns = useMemo(() => {
    const columnHelper = createColumnHelper<MarketStatsRowType>();
    return [
      columnHelper.accessor("market_address", {
        header: "Market",
        cell: ({ getValue, row }) => {
          const address = getValue();

          // Format the display value with truncation if needed
          const addressShort =
            typeof address === "string" && address.length > 10
              ? `${address.substring(0, 5)}..${address.substring(address.length - 3)}`
              : address;

          return (
            <div className="flex flex-col gap-0.5 text-sm">
              <div className="flex flex-row items-center gap-0.5 font-medium text-gray-800">
                {row.original.supply_asset_symbol}
                <ChevronsRight className="size-4 text-gray-500" />
                {row.original.borrow_asset_symbol}
              </div>
              <div className="flex flex-row items-center gap-1 text-xs text-gray-500">
                <a
                  href="https://morpho.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-blue-500 hover:underline"
                >
                  {" "}
                  {addressShort}
                </a>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("supply_assets_USD", {
        id: "supply",
        header: ({ column }) => (
          <SortableHeader column={column} title="Supply" />
        ),
        cell: ({ getValue, row }) => {
          const dollars = getValue();
          const tokens = row.original.morpho_tokens;
          const assetSymbol =
            row.original.supply_asset_symbol.length > 5
              ? `${row.original.supply_asset_symbol.slice(0, 5)}.`
              : row.original.supply_asset_symbol;
          return (
            <div className="flex flex-col gap-0.5 pl-1.5">
              <span className="text-sm text-gray-900">
                {formatCurrency(dollars)}
              </span>
              <span className="font-mono text-xs text-gray-500">
                {tokens.toFixed(2)} {assetSymbol}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor("borrow_assets_USD", {
        id: "borrow",
        header: ({ column }) => (
          <SortableHeader column={column} title="Borrow" />
        ),
        cell: ({ getValue, row }) => {
          const dollars = getValue();
          const tokens = row.original.morpho_tokens;
          const assetSymbol =
            row.original.borrow_asset_symbol.length > 5
              ? `${row.original.borrow_asset_symbol.slice(0, 5)}.`
              : row.original.borrow_asset_symbol;
          return (
            <div className="flex flex-col gap-0.5 pl-1.5">
              <span className="text-sm text-gray-900">
                {formatCurrency(dollars)}
              </span>
              <span className="font-mono text-xs text-gray-500">
                {tokens.toFixed(2)} {assetSymbol}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor("utilization", {
        id: "utilization",
        header: ({ column }) => (
          <SortableHeader column={column} title="Utilization" />
        ),
        cell: ({ getValue }) => {
          const utilization = getValue();

          // Multiply utilization by 100 and round to the nearest integer
          const utilizationPercentage = Math.round(utilization * 100);

          // Pick a color based on the utilization
          let variant: ProgressCircleProps["variant"] = "error";
          if (utilization > 50) {
            variant = "default";
          } else if (utilization > 25) {
            variant = "warning";
          }

          return (
            <div className="relative ml-1.5 w-fit">
              <p className="absolute flex size-full items-center justify-center text-xs font-semibold text-gray-700">
                {utilizationPercentage}
              </p>
              <ProgressCircle
                value={utilizationPercentage}
                radius={17}
                variant={variant}
                strokeWidth={4}
                showAnimation={true}
                className="w-fit"
                backgroundClassName="stroke-gray-200"
                foregroundClassName="stroke-blue-400"
                foregroundOpacity={utilization + 0.15}
              />
            </div>
          );
        },
      }),
      columnHelper.accessor("morpho_tokens", {
        id: "morpho_tokens",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting()}
            className="flex items-center gap-1 rounded-md px-2 py-1.5 transition-all duration-200 hover:cursor-pointer hover:bg-gray-100"
          >
            $MORPHO Rewards
            {column.getIsSorted() === "desc" ? (
              <ChevronDown className="size-4 text-gray-900" />
            ) : column.getIsSorted() === "asc" ? (
              <ChevronUp className="size-4 text-gray-900" />
            ) : (
              <ChevronsUpDownIcon className="size-4 text-gray-500" />
            )}
          </button>
        ),
        cell: ({ getValue, row }) => {
          const tokens = getValue();
          return (
            <div className="flex flex-col gap-0.5 pl-1.5">
              <span className="font-mono text-sm text-gray-900">
                {tokens.toFixed(2)} Today
              </span>
              <span className="font-mono text-xs text-gray-500">
                {row.original.morpho_tokens_cumulative.toFixed(2)} Total
              </span>
            </div>
          );
        },
      }),
    ];
  }, []);

  const tableOptions = useMemo(
    () => ({
      data:
        marketStats.state === "loaded" ? marketStats.source.slice(0, 100) : [],
      columns: defaultColumns,
      state: { sorting },
      onSortingChange: setSorting,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
    }),
    [marketStats, defaultColumns, sorting],
  );

  const table = useReactTable(tableOptions);

  return (
    <div className="flex w-full flex-col items-start">
      {/* <span className="mb-3 flex flex-row items-center gap-2">
        <div className="my-2 flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-black">Markets</h1>
          <p className="w-2xl text-sm text-gray-700">
            Existing markets on Morpho
          </p>
        </div>
      </span> */}
      {marketStats.state === "loaded" && (
        <table className="w-full border-collapse text-gray-700">
          <thead className="text-xs text-gray-900">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="border-b border-gray-300 px-3 py-2 text-left"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="text-sm text-gray-500">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={clsx("border-b border-gray-300 px-3 py-2")}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export { MarketsTable };
