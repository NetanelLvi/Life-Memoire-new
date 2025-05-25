
import { PlusCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  onCreateBiography: () => void;
}

/**
 * Displayed when there are no biographies to show
 */
export const EmptyState = ({ onCreateBiography }: EmptyStateProps) => {
  return (
    <Card className="border border-dashed border-gray-300 bg-gray-50">
      <CardContent className="pt-6 pb-10 flex flex-col items-center justify-center">
        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <PlusCircle className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No biographies yet</h3>
        <p className="text-gray-500 text-center max-w-md mb-6">
          Start documenting your life story or the story of a loved one. Create your first biography now.
        </p>
        <Button 
          className="bg-[#FFD217] hover:bg-[#f8ca00] text-memoir-darkGray"
          onClick={onCreateBiography}
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Create Your First Biography
        </Button>
      </CardContent>
    </Card>
  );
};
