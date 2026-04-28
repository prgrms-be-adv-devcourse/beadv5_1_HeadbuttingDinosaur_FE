import { Card } from '@/components-v2';
import type { RefundRowVM } from '../types';
import { RefundRow } from './RefundRow';
import { RefundTableHeader } from './RefundTableHeader';

interface RefundListProps {
  rows: RefundRowVM[];
}

export function RefundList({ rows }: RefundListProps) {
  return (
    <Card variant="solid" padding="none" className="refunds-card">
      <table className="refunds-table">
        <RefundTableHeader />
        <tbody>
          {rows.map((row) => (
            <RefundRow key={row.refundId} row={row} />
          ))}
        </tbody>
      </table>
    </Card>
  );
}
