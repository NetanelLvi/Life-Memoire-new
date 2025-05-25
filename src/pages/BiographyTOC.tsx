
import { useParams } from "react-router-dom";
import NavBar from "@/components/NavBar";
import TOCEditor from "@/components/toc/TOCEditor";
import TOCLoading from "@/components/toc/TOCLoading";
import { useBiography } from "@/hooks/useBiography";
import { useTOCGenerate } from "@/hooks/useTOCGenerate";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { ErrorDisplay } from "@/components/ui/error-display";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";

const BiographyTOC = () => {
  const { biographyId } = useParams<{ biographyId: string }>();
  const { data: biography, isLoading: biographyLoading, error: biographyError } = useBiography(biographyId);
  const { generateTOC, isGenerating } = useTOCGenerate();

  // Validate biographyId format
  useEffect(() => {
    if (biographyId) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(biographyId)) {
        toast({
          title: "שגיאה",
          description: "מזהה הביוגרפיה אינו בפורמט תקין",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "שגיאה",
        description: "מזהה ביוגרפיה חסר",
        variant: "destructive"
      });
    }
  }, [biographyId]);

  const handleRegenerateTOC = async () => {
    if (!biographyId) {
      toast({
        title: "שגיאה",
        description: "מזהה ביוגרפיה חסר",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log(`Regenerating TOC for biography: ${biographyId}`);
      await generateTOC(biographyId);
    } catch (error) {
      console.error("Error regenerating TOC:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת יצירת תוכן העניינים מחדש",
        variant: "destructive"
      });
    }
  };

  if (biographyLoading) {
    return <TOCLoading />;
  }
  
  if (biographyError || !biography) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <ErrorDisplay 
          title="Failed to load biography" 
          message="Unable to load biography details. Please try again." 
          onRetry={() => window.location.reload()}
          variant="full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{biography?.title}</h1>
          <div className="flex justify-between items-center">
            <p className="text-gray-600">Organize the chapters of your biography</p>
            <Button
              variant="outline"
              onClick={handleRegenerateTOC}
              disabled={isGenerating}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
              {isGenerating ? "Regenerating..." : "Regenerate TOC"}
            </Button>
          </div>
        </div>
        
        <TOCEditor />
      </div>
    </div>
  );
};

export default BiographyTOC;
