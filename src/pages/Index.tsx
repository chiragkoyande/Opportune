import Header from '@/components/Header';
import Hero from '@/components/Hero';
import OpportunityGrid from '@/components/OpportunityGrid';
import Footer from '@/components/Footer';
import CompareBar from '@/components/CompareBar';
import { CompareProvider } from '@/hooks/useCompare';
import { useOpportunities } from '@/hooks/useOpportunities';

const Index = () => {
  const { opportunities, loading, error, refetch } = useOpportunities();

  return (
    <CompareProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Hero />
          <OpportunityGrid 
            opportunities={opportunities} 
            loading={loading} 
            error={error}
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
