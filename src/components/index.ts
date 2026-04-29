/* Component barrel — PR 1 (Primitives) entries. Each subsequent PR adds
 * its components below. Layout chrome stays on its own track and is not
 * re-exported here.
 *
 * FileIcon currently lives inside ./Icon/index.tsx for historical
 * reasons; §3.7 plans to split it into its own ./FileIcon directory in
 * a follow-up. Re-exporting from ./Icon keeps callers stable across
 * that move. */

export { Icon, FileIcon } from './Icon';
export type { IconProps, IconName, FileIconProps, FileIconKind } from './Icon';

export { Kbd } from './Kbd';
export type { KbdProps } from './Kbd';

export { Eyebrow } from './Eyebrow';
export type { EyebrowProps, EyebrowTone, EyebrowSize } from './Eyebrow';

export { StatusChip } from './StatusChip';
export type { StatusChipProps, StatusVariant } from './StatusChip';

export { Chip } from './Chip';
export type { ChipProps } from './Chip';

/* PR 2 — Form / Action */

export { Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';

export { Input } from './Input';
export type { InputProps, InputVariant } from './Input';

/* PR 3 — Container / Display */

export { Card } from './Card';
export type { CardProps, CardVariant, CardPadding } from './Card';

export { SectionHead } from './SectionHead';
export type { SectionHeadProps } from './SectionHead';

/* PR 4 — Composite shared */

export { TermDot } from './TermDot';
export type { TermDotProps, DotTone } from './TermDot';

export { Avatar } from './Avatar';
export type { AvatarProps, AvatarSize } from './Avatar';

export { AccentMediaBox } from './AccentMediaBox';
export type {
  AccentMediaBoxProps,
  AccentMediaVariant,
  AccentMediaSize,
} from './AccentMediaBox';

export { QuantityStepper } from './QuantityStepper';
export type {
  QuantityStepperProps,
  QuantityStepperSize,
} from './QuantityStepper';

export { MetaLine } from './MetaLine';
export type { MetaLineProps } from './MetaLine';

export { EmptyState } from './EmptyState';
export type { EmptyStateProps } from './EmptyState';
