import React, { ReactNode } from 'react'

import './ReportTable.css'

export type CellDetail = {
  data: string | number
  colspan: number
}

type Cell = string | CellDetail

export type Row<T> = [T, T, T, T, T, T]

function cell2str(cell: Cell): string {
  if (typeof cell === 'string') {
    return `${cell}`
  } else {
    return `${cell.data}`
  }
}

type TdProps = {
  children: ReactNode
}

function Td(props: TdProps): JSX.Element {
  return <td className="ReportTable__td">{props.children}</td>
}

type Props = {
  table: Row<Cell>[]
}

export function ReportTable(props: Props): JSX.Element {
  const header = props.table[0]
  const table = props.table.slice(1).map((row) => {
    const key = cell2str(row[0])
    return [key, ...row]
  })

  return (
    <table className="ReportTable">
      <thead className="bg-gray-200">
        <tr>
          {header.map((d) => {
            return <th className="ReportTable__th" key={cell2str(d)}>{d}</th>
          })}
        </tr>
      </thead>
      <tbody>
        {table.map((row) => {
          return (
            <tr className="border-t border-gray-200" key={row[0] as string}>
              <Td>{row[1]}</Td>
              <Td>{row[2]}</Td>
              <Td>{row[3]}</Td>
              <Td>{row[4]}</Td>
              <Td>{row[5]}</Td>
              <Td>{row[6]}</Td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
