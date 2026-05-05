import { useRenewal } from '../context/RenewalContext';
import CalendarView from '../components/calendar/CalendarView';

export default function Calendar() {
  const { renewals } = useRenewal();
  return <CalendarView renewals={renewals} />;
}
