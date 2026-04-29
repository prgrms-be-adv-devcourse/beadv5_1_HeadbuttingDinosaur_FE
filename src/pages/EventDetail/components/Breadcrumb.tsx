import { Link } from 'react-router-dom';

export interface BreadcrumbProps {
  title: string;
}

export function Breadcrumb({ title }: BreadcrumbProps) {
  return (
    <nav className="ed-breadcrumb" aria-label="breadcrumb">
      <Link to="/" className="ed-breadcrumb__link">
        이벤트
      </Link>
      <span className="ed-breadcrumb__sep" aria-hidden="true">
        ›
      </span>
      <span className="ed-breadcrumb__current truncate">{title}</span>
    </nav>
  );
}

Breadcrumb.displayName = 'Breadcrumb';
