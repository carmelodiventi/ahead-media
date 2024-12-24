import {
  AccessorKeyColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import Loader from "../loader/Loader";

import {
  Box,
  Flex,
  IconButton,
  Select,
  Table as TableUI,
  Text,
} from "@radix-ui/themes";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import React from "react";

interface Props<T> {
  data: NonNullable<T>[];
  columns: AccessorKeyColumnDef<T, string>[];
  onPageChange?: (page: number) => void;
  loading: boolean;
}

function DataTable<T>({ data, columns, loading }: Props<T>) {
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    columns,
    data,
    debugTable: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    //no need to pass pageCount or rowCount with client-side pagination as it is calculated automatically
    state: {
      pagination,
    },
    // autoResetPageIndex: false, // turn off page index reset when sorting or filtering
  });

  return (
    <Box width="100%" height="100%">
      <Loader showing={loading} />
      <Flex direction="column" className="relative z-10" justify="between" height="100%">
        <TableUI.Root>
          <TableUI.Header>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableUI.Row key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableUI.RowHeaderCell
                      key={header.id}
                      colSpan={header.colSpan}
                    >
                      <Box
                        {...{
                          className: header.column.getCanSort()
                            ? "cursor-pointer select-none"
                            : "",
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: " 🔼",
                          desc: " 🔽",
                        }[header.column.getIsSorted() as string] ?? null}
                        {header.column.getCanFilter() ? (
                          <Box>
                            {/*<Filter column={header.column} table={table}/>*/}
                          </Box>
                        ) : null}
                      </Box>
                    </TableUI.RowHeaderCell>
                  );
                })}
              </TableUI.Row>
            ))}
          </TableUI.Header>
          <TableUI.Body>
            {table.getRowModel().rows.map((row) => {
              return (
                <TableUI.Row key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <TableUI.Cell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableUI.Cell>
                    );
                  })}
                </TableUI.Row>
              );
            })}
          </TableUI.Body>
        </TableUI.Root>

        <Flex width="full" align={"center"} justify={"between"} mt={"4"} px={"3"}>
          <Flex
            flexGrow="1"
            gap="4"
            direction={{
              sm: "column",
              md: "row",
            }}
            align="center"
          >
            <Text size={"2"}>
              Page
              <Text as={"span"} weight="bold" className="px-2">
                {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount().toLocaleString()}
              </Text>
            </Text>

            <Select.Root
              value={String(table.getState().pagination.pageSize)}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <Select.Content>
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <Select.Item key={pageSize} value={String(pageSize)}>
                    Show {pageSize}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Flex>

          <Flex
            flexGrow={"1"}
            align="center"
            justify="end"
            width={{
              sm: "full",
              md: "auto",
            }}
          >
            <IconButton
              onClick={() => table.firstPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <DoubleArrowLeftIcon className="h-4 text-[#B2B2B2] dark:text-slate-500" />
            </IconButton>
            <IconButton
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeftIcon className="h-4 text-[#B2B2B2] dark:text-slate-500" />
            </IconButton>
            <IconButton
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRightIcon className="h-4 text-[#B2B2B2] dark:text-slate-500" />
            </IconButton>
            <IconButton
              onClick={() => table.lastPage()}
              disabled={!table.getCanNextPage()}
            >
              <DoubleArrowRightIcon className="h-4 text-[#B2B2B2] dark:text-slate-500" />
            </IconButton>{" "}
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
}

export default DataTable;
