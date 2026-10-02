import Header from '@/components/Header';
import Hero from '@/components/Hero';
import OpportunityGrid from '@/components/OpportunityGrid';
import Footer from '@/components/Footer';
import CompareBar from '@/components/CompareBar';
import { CompareProvider } from '@/hooks/useCompare';
import { useFeaturedOpportunities } from '@/hooks/useOpportunities';

const Index = () => {
  const { data: opportunities = [], isLoading, error, refetch } = useFeaturedOpportunities();

  return (
    <CompareProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1">
          <Hero />
          <OpportunityGrid
            opportunities={opportunities}
            loading={isLoading}
            error={error ? (error as Error).message : null}
            onRefresh={refetch}
          />
        </main>
        <Footer />
        <CompareBar />
      </div>
    </CompareProvider>
  );
};

export default Index;
