import type { ReactNode } from 'react'

export type DataTableColumn<T> = {
  header: string
  render: (row: T) => ReactNode
}

export type DataTableProps<T> = {
  columns: DataTableColumn<T>[]
  rows: T[]
  getRowKey: (row: T) => string
}

export function DataTable<T>({ columns, getRowKey, rows }: DataTableProps<T>) {
  return (
    <div className="table-responsive">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.header}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)}>
              {columns.map((column) => (
                <td key={column.header}>{column.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
