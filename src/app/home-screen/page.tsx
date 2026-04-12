import ErrorBoundary from '@/components/ui/ErrorBoundary';
import HomeScreenClient from './components/HomeScreenClient';

export default function HomeScreen() {
  return (
    <ErrorBoundary>
      <HomeScreenClient />
    </ErrorBoundary>
  );
}