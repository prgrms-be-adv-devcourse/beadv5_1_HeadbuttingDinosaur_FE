import type { InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, id, className = '', ...props }: Props) {
  const inputId = id ?? props.name
  return (
    <div className="form-group">
      {label && <label className="form-label" htmlFor={inputId}>{label}</label>}
      <input id={inputId} className={`form-input ${className}`.trim()} {...props} />
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}
