import Badge from '../../../components/ui/Badge';
import { RESERVATION_STATUS_LABELS, RESERVATION_STATUS_COLORS } from '../../../constants/reservationStatus';

const ReservationStatusBadge = ({ status }) => (
  <Badge
    status={status}
    label={RESERVATION_STATUS_LABELS[status] || status}
    color={RESERVATION_STATUS_COLORS[status]}
  />
);

export default ReservationStatusBadge;
