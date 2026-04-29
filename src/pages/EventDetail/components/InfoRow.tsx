import type { ReactNode } from 'react';

export interface InfoRowProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}

export function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="ed-info-row">
      <span className="ed-info-row__icon" aria-hidden="true">
        {icon}
      </span>
      <div className="ed-info-row__label">{label}</div>
      <div className="ed-info-row__value">{value}</div>
    </div>
  );
}

InfoRow.displayName = 'InfoRow';
