import { ORDER_COLUMNS } from '../columns';

export function OrdersTableHeader() {
  return (
    <thead className="orders-table-header">
      <tr>
        {ORDER_COLUMNS.map((col) => (
          <th
            key={col.key}
            scope="col"
            className={`orders-th orders-th-${col.key}`}
            style={{ textAlign: col.align }}
          >
            {col.label}
          </th>
        ))}
      </tr>
    </thead>
  );
}
