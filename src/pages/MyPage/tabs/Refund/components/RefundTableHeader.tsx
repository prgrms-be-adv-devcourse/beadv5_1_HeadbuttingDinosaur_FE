import { REFUND_COLUMNS } from '../columns';

export function RefundTableHeader() {
  return (
    <thead className="refunds-table-header">
      <tr>
        {REFUND_COLUMNS.map((col) => (
          <th
            key={col.key}
            scope="col"
            className={`refunds-th refunds-th-${col.key}`}
            style={{ textAlign: col.align }}
          >
            {col.label}
          </th>
        ))}
      </tr>
    </thead>
  );
}
