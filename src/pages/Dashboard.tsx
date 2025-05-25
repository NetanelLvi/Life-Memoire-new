
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from "sonner";
import NavBar from '@/components/NavBar';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import ErrorBoundary from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Biography, BiographyCard } from '@/components/dashboard/BiographyCard';
import { EmptyState } from '@/components/dashboard/EmptyState';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Use react-query to fetch biographies with proper error handling
  const { 
    data: biographies = [], 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['biographies'],
    queryFn: async (): Promise<Biography[]> => {
      try {
        const { data, error } = await supabase
          .from('biographies')
          .select('*')
          .order('updated_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        return data || [];
      } catch (error) {
        console.error('Error fetching biographies:', error);
        throw error;
      }
    },
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    enabled: !!user
  });

  const handleCreateBiography = async () => {
    try {
      if (!user?.id) {
        toast.error("User authentication error. Please log in again.");
        return;
      }

      const title = `New Biography - ${format(new Date(), 'MMM d, yyyy')}`;
      
      const { data, error } = await supabase
        .from('biographies')
        .insert({
          title, 
          user_id: user.id
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success("New biography created");
      refetch(); // Refetch to update the list
      
      // Navigate to the questionnaire
      navigate(`/biography/${data.id}/questionnaire`);
    } catch (error) {
      console.error('Error creating biography:', error);
      toast.error("Failed to create new biography");
    }
  };

  const handleDeleteBiography = async (id: string) => {
    try {
      const { error } = await supabase
        .from('biographies')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      refetch(); // Refresh the list after deletion
      toast.success("Biography deleted successfully");
    } catch (error) {
      console.error('Error deleting biography:', error);
      toast.error("Failed to delete biography");
    }
  };

  // Handle retry logic for data fetching
  const handleRetry = () => {
    refetch();
  };

  // Render biography cards or empty state
  const renderBiographyContent = () => {
    if (!biographies.length) {
      return <EmptyState onCreateBiography={handleCreateBiography} />;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {biographies.map((biography) => (
          <BiographyCard 
            key={biography.id} 
            biography={biography} 
            onDelete={handleDeleteBiography} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      
      <ErrorBoundary>
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-memoir-darkGray">My Biographies</h1>
              <p className="text-memoir-darkGray mt-2">Manage your life stories</p>
            </div>
            <Button 
              className="bg-[#FFD217] hover:bg-[#f8ca00] text-memoir-darkGray"
              onClick={handleCreateBiography}
              disabled={isLoading}
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              New Biography
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size="lg" text="Loading your biographies..." />
            </div>
          ) : error ? (
            <Alert className="bg-red-50 border-red-200 my-4">
              <AlertDescription className="flex flex-col items-center py-4">
                <div className="text-red-600 mb-2 text-center">
                  Failed to load your biographies
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleRetry}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            renderBiographyContent()
          )}
        </div>
      </ErrorBoundary>
    </div>
  );
};

export default Dashboard;
