import ErrorBoundary from '@/components/ui/ErrorBoundary';
import ScoreScreenClient from './components/ScoreScreenClient';

export default function ScoreScreen() {
  return (
    <ErrorBoundary>
      <ScoreScreenClient />
    </ErrorBoundary>
  );
}