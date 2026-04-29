import { Icon } from '../Icon';

export type QuantityStepperSize = 'sm' | 'md';

export interface QuantityStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: QuantityStepperSize;
  disabled?: boolean;
  className?: string;
}

const ICON_PX: Record<QuantityStepperSize, number> = {
  sm: 11,
  md: 13,
};

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  size = 'md',
  disabled = false,
  className,
}: QuantityStepperProps) {
  const atMin = value <= min;
  const atMax = max !== undefined && value >= max;

  const handleDecrement = () => {
    onChange(Math.max(min, value - 1));
  };
  const handleIncrement = () => {
    onChange(max !== undefined ? Math.min(max, value + 1) : value + 1);
  };

  const classes = [
    'qty-stepper',
    `qty-stepper-${size}`,
    disabled && 'is-disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const iconSize = ICON_PX[size];

  return (
    <div className={classes}>
      <button
        type="button"
        className="qty-stepper-btn"
        onClick={handleDecrement}
        disabled={disabled || atMin}
        aria-label="decrease"
      >
        <Icon name="minus" size={iconSize} />
      </button>
      <span className="qty-stepper-value" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className="qty-stepper-btn"
        onClick={handleIncrement}
        disabled={disabled || atMax}
        aria-label="increase"
      >
        <Icon name="plus" size={iconSize} />
      </button>
    </div>
  );
}

QuantityStepper.displayName = 'QuantityStepper';
