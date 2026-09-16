import Badge from '../../../components/ui/Badge';
import { RESERVATION_STATUS_LABELS, RESERVATION_STATUS_TONE } from '../../../constants/roles';

const ReservationStatusBadge = ({ status }) => (
  <Badge variant={RESERVATION_STATUS_TONE[status] || 'neutral'}>
    {RESERVATION_STATUS_LABELS[status] || status}
  </Badge>
);

export default ReservationStatusBadge;
