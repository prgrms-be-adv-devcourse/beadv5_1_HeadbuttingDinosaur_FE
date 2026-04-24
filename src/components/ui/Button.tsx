import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  full?: boolean
}

export default function Button({
  variant = 'primary',
  size = 'md',
  full,
  className = '',
  ...props
}: Props) {
  const sizeClass = size === 'lg' ? 'btn-lg' : size === 'sm' ? 'btn-sm' : ''
  return (
    <button
      className={`btn btn-${variant} ${sizeClass} ${full ? 'btn-full' : ''} ${className}`.trim()}
      {...props}
    />
  )
}
