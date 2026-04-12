import ErrorBoundary from '@/components/ui/ErrorBoundary';
import RoleplayScreenClient from './components/RoleplayScreenClient';

export default function RoleplayScreen() {
  return (
    <ErrorBoundary>
      <RoleplayScreenClient />
    </ErrorBoundary>
  );
}