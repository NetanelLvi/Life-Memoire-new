
import { useParams } from "react-router-dom";
import { useTOC } from "@/hooks/useTOC";
import TOCHeader from "./TOCHeader";
import ChaptersList from "./ChaptersList";
import { validateTOC } from "./TOCValidation";
import { useChapterManagement } from "./useChapterManagement";

const TOCEditor = () => {
  const { biographyId } = useParams<{ biographyId: string }>();
  const { isLoading, error, updateTOC, chapters, isSaving } = useTOC(biographyId);
  const { 
    chapters: localChapters, 
    handleAddChapter, 
    handleUpdateChapter, 
    handleDeleteChapter,
    setChaptersList
  } = useChapterManagement(chapters);

  const handleSaveTOC = async () => {
    if (!validateTOC(localChapters)) return;
    await updateTOC.mutateAsync({ structure: localChapters });
  };

  const handleApproveAndContinue = async () => {
    if (!validateTOC(localChapters)) return;
    await updateTOC.mutateAsync({
      structure: localChapters,
      approved: true,
    });
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading TOC...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error loading table of contents</div>;
  }

  return (
    <div className="space-y-6">
      <TOCHeader
        onSave={handleSaveTOC}
        onApprove={handleApproveAndContinue}
        isSaving={isSaving}
      />
      
      <ChaptersList
        chapters={localChapters}
        onChaptersChange={setChaptersList}
        onUpdateChapter={handleUpdateChapter}
        onDeleteChapter={handleDeleteChapter}
        onAddChapter={handleAddChapter}
      />
    </div>
  );
};

export default TOCEditor;
