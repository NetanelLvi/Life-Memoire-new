
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Share2, Copy } from "lucide-react";
import DraftViewer from "@/components/editor/DraftViewer";
import { useBiography } from "@/hooks/useBiography";
import { ErrorDisplay } from "@/components/ui/error-display";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input"; // Import Input for shareable link
import { Switch } from "@/components/ui/switch"; // Import Switch for publish toggle
import { Label } from "@/components/ui/label"; // Import Label for switch
import { BiographyStatus } from "@/types/biography"; // Import BiographyStatus
import { supabase } from "@/integrations/supabase/client"; // Import supabase client

const BiographyDraft = () => {
  const { biographyId } = useParams<{ biographyId: string }>();
  const navigate = useNavigate();
  const { data: biography, isLoading, error, refetch } = useBiography(biographyId);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublishToggle = async (checked: boolean) => {
    if (!biographyId) return;

    setIsPublishing(true);
    const newStatus = checked ? BiographyStatus.Published : BiographyStatus.Draft; // Corrected to BiographyStatus.Draft

    try {
      const { error } = await supabase
        .from('biographies')
        .update({ status: newStatus })
        .eq('id', biographyId);

      if (error) {
        throw error;
      }

      toast({
        title: "Biography Status Updated",
        description: `Your biography is now ${newStatus}.`,
      });
      refetch(); // Re-fetch biography data to update UI
    } catch (error: any) {
      console.error("Error updating biography status:", error);
      toast({
        title: "Failed to Update Status",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleExport = async (format: 'json') => {
    if (!biographyId) {
      toast({ title: "Error", description: "Biography ID is missing.", variant: "destructive" });
      return;
    }

    setIsExporting(true);
    try {
      let response;
      let filename = `biography_${biographyId}`;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("User not authenticated. Please log in.");
      }
      const authToken = session.access_token;

      if (format === 'json') {
        response = await fetch(`https://dppjfqblgeocraduavor.supabase.co/functions/v1/get-biography-raw-data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ biographyId }),
        });
        filename += '.json';
      } else {
        // For PDF, use generate-export-file function
        response = await fetch(`https://dppjfqblgeocraduavor.supabase.co/functions/v1/generate-export-file`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ biographyId, format }),
        });
        filename += `.${format}`;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to generate ${format.toUpperCase()}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Started",
        description: `Your ${format.toUpperCase()} file is being prepared and will download automatically.`,
      });
    } catch (error: any) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: error.message || "An unexpected error occurred during export.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setExportDialogOpen(false);
    }
  };

  const shareableLink = biographyId ? `${window.location.origin}/view-biography/${biographyId}` : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    toast({
      title: "Link Copied!",
      description: "The shareable link has been copied to your clipboard.",
    });
  };

  // Ensure biographyId is defined before using it
  if (!biographyId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <ErrorDisplay 
          title="Missing biography ID" 
          message="No biography ID provided." 
          onRetry={() => navigate('/dashboard')}
          variant="full"
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !biography) {
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
        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => navigate(`/biography/${biographyId}/toc`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to TOC
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={() => navigate(`/biography/${biographyId}/questionnaire`)}
              >
                Edit Questionnaire
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setExportDialogOpen(true)}
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Exporting...
                  </>
                ) : (
                  <>
                    Export
                  </>
                )}
              </Button>
              
              <Button 
                onClick={() => navigate(`/biography/${biographyId}/editor`)}
                className="flex items-center bg-memoir-yellow text-memoir-darkGray hover:bg-memoir-yellow/90"
              >
                Go to Editor
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold">{biography.title} - Draft</h1>
          <p className="text-gray-600 mb-4">
            Review the AI-generated draft of your biography based on your questionnaire answers
          </p>
        </div>
        
        <DraftViewer biographyId={biographyId} />
        
        <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Biography</DialogTitle>
              <DialogDescription>
                Choose a format to export your complete biography or share a link.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4 py-4">
              {/* Shareable Link */}
              <div className="col-span-2 space-y-2">
                <h3 className="text-lg font-semibold flex items-center">
                  <Share2 className="h-5 w-5 mr-2" /> Shareable Link
                </h3>
                <div className="flex items-center space-x-2">
                  <Input 
                    value={shareableLink} 
                    readOnly 
                    className="flex-grow bg-gray-100" 
                  />
                  <Button onClick={handleCopyLink} variant="outline" size="icon">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Switch
                    id="publish-mode"
                    checked={biography.status === BiographyStatus.Published}
                    onCheckedChange={handlePublishToggle}
                    disabled={isPublishing}
                  />
                  <Label htmlFor="publish-mode">
                    {biography.status === BiographyStatus.Published ? "Publicly Accessible" : "Private"}
                  </Label>
                  {isPublishing && <LoadingSpinner className="ml-2 h-4 w-4" />}
                </div>
                {biography.status !== BiographyStatus.Published && (
                  <p className="text-sm text-red-500 mt-2">
                    Note: Biography must be 'publicly accessible' for the shareable link to work.
                  </p>
                )}
              </div>

            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setExportDialogOpen(false)} disabled={isExporting}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};


export default BiographyDraft;
