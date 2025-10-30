/**
 * Pure CSS Table Component - No Tailwind, No ShadCN
 */

import { ReactNode, HTMLAttributes } from 'react';

interface TableProps extends HTMLAttributes<HTMLTableElement> {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className = '', ...props }: TableProps) {
  return (
    <div className="table-container">
      <div className="table-wrapper">
        <table className={`table ${className}`} {...props}>
          {children}
        </table>
      </div>
    </div>
  );
}

interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
  className?: string;
}

export function TableHeader({ children, className = '', ...props }: TableHeaderProps) {
  return (
    <thead className={className} {...props}>
      {children}
    </thead>
  );
}

interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
  className?: string;
}

export function TableBody({ children, className = '', ...props }: TableBodyProps) {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  );
}

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
  className?: string;
}

export function TableRow({ children, className = '', ...props }: TableRowProps) {
  return (
    <tr className={className} {...props}>
      {children}
    </tr>
  );
}

interface TableHeadProps extends HTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
  className?: string;
}

export function TableHead({ children, className = '', ...props }: TableHeadProps) {
  return (
    <th className={className} {...props}>
      {children}
    </th>
  );
}

interface TableCellProps extends HTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
  className?: string;
}

export function TableCell({ children, className = '', ...props }: TableCellProps) {
  return (
    <td className={className} {...props}>
      {children}
    </td>
  );
}
