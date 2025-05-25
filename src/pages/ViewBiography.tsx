import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import NavBar from "@/components/NavBar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorDisplay } from "@/components/ui/error-display";
import { BiographyStatus } from "@/types/biography";

const ViewBiography = () => {
  const { biographyId } = useParams<{ biographyId: string }>();

  const { data: biography, isLoading, error } = useQuery({
    queryKey: ["view-biography", biographyId],
    queryFn: async () => {
      if (!biographyId) throw new Error("Biography ID is required");

      // Fetch biography details
      const { data: bio, error: bioError } = await supabase
        .from("biographies")
        .select("*")
        .eq("id", biographyId)
        .single();

      if (bioError) throw bioError;
      if (!bio) throw new Error("Biography not found.");

      // Check if biography is published
      if (bio.status !== BiographyStatus.Published) {
        throw new Error("This biography is not published and cannot be viewed publicly.");
      }

      // Fetch all chapters for the biography
      const { data: chapters, error: chaptersError } = await supabase
        .from("biography_chapters")
        .select("*")
        .eq("biography_id", biographyId)
        .order("chapter_order", { ascending: true });

      if (chaptersError) throw chaptersError;

      return { bio, chapters };
    },
    enabled: !!biographyId,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <NavBar />
        <div className="container mx-auto px-4 py-8 pt-24 flex justify-center items-center">
          <LoadingSpinner size="lg" text="Loading biography..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <NavBar />
        <div className="container mx-auto px-4 py-8 pt-24">
          <ErrorDisplay 
            title="Error Loading Biography" 
            message={error.message}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  if (!biography) {
    return (
      <div className="min-h-screen bg-white">
        <NavBar />
        <div className="container mx-auto px-4 py-8 pt-24">
          <ErrorDisplay
            title="Biography not found"
            message="The biography you're looking for doesn't exist."
            onRetry={() => window.location.href = "/"}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-4xl font-bold mb-4 text-center">{biography.bio.title}</h1>
        <p className="text-gray-600 text-center mb-8">A life story by {biography.bio.user_id}</p> {/* Placeholder for author name */}

        <div className="prose lg:prose-xl mx-auto">
          {biography.chapters.length === 0 && (
            <p className="text-center text-gray-500">No content available for this biography yet.</p>
          )}
          {biography.chapters.map((chapter) => (
            <div key={chapter.id} className="mb-8">
              <h2 className="text-3xl font-semibold mb-2">{chapter.title}</h2>
              <div dangerouslySetInnerHTML={{ __html: chapter.content || '' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewBiography;
