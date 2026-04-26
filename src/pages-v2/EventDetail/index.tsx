import { Navigate, useParams } from 'react-router-dom';

import { EventDetail } from './EventDetail';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  if (!id) return <Navigate to="/" replace />;
  return <EventDetail eventId={id} />;
}
