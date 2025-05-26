import { useState } from "react";
import { isStringRecord } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Save, RefreshCw, Sparkles } from "lucide-react";
import { useBiographyDraft } from "@/hooks/useBiographyDraft";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import RichTextEditor from "./RichTextEditor";
import { Chapter } from "@/types/biography";

import { useEffect } from "react";

// Helper to extract chapter number from title (e.g., "Chapter 1: Title" -> 1, "פרק 1: Title" -> 1)
const getChapterNumber = (title: string): number | null => {
  const matchEnglish = title.match(/Chapter (\d+):/);
  if (matchEnglish) return parseInt(matchEnglish[1]);

  const matchHebrew = title.match(/פרק (\d+):/);
  if (matchHebrew) return parseInt(matchHebrew[1]);

  return null;
};

interface DraftViewerProps {
  biographyId: string;
  editorChapters: Chapter[];
  onUpdateChapter?: (chapterId: string, content: string, doRefetch?: boolean) => void;
  onCloseModal?: () => void;
  onApplyAllChaptersSuccess?: () => void;
}

const DraftViewer = ({ biographyId, editorChapters, onUpdateChapter, onCloseModal, onApplyAllChaptersSuccess }: DraftViewerProps) => {
  const [activeTab, setActiveTab] = useState("full");
  const { draft, isLoading, error, generateDraft, isGenerating, refetchDraft } = useBiographyDraft(biographyId);

  useEffect(() => {
    if (draft?.chapter_content && Object.keys(draft.chapter_content).length > 0 && activeTab === "full") {
      setActiveTab(Object.keys(draft.chapter_content)[0]);
    }
  }, [draft, activeTab]);

  const handleUpdateFromDraft = (chapterTitle: string) => {
    if (!draft?.chapter_content || !onUpdateChapter) {
      toast({
        title: "Error",
        description: "Cannot apply draft content - editor not ready",
        variant: "destructive",
      });
      return;
    }
    
    if (!isStringRecord(draft.chapter_content)) {
      toast({
        title: "Error",
        description: "Invalid chapter content format",
        variant: "destructive",
      });
      return;
    }
    
    const chapterContent = draft.chapter_content[chapterTitle];
    if (typeof chapterContent !== 'string') {
      toast({
        title: "Error", 
        description: "Chapter content not found",
        variant: "destructive",
      });
      return;
    }

    const targetChapter = editorChapters.find(chap => chap.title === chapterTitle);

    if (targetChapter) {
      onUpdateChapter(targetChapter.id, chapterContent);
      toast({
        title: "Success", 
        description: "Draft content applied to chapter",
      });
      onCloseModal?.();
    } else {
      toast({
        title: "Error",
        description: `Could not find chapter "${chapterTitle}" in editor to update.`,
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your complete biography draft is being prepared for download.",
    });
  };

  const renderChapterTabs = () => {
    if (!draft) return null;

    if (!isStringRecord(draft.chapter_content)) {
      const errorAlert = (
        <Alert variant="destructive">
          <AlertTitle>Invalid data format</AlertTitle>
          <AlertDescription>
            The chapter content data is not in the expected format.
          </AlertDescription>
        </Alert>
      );
      return errorAlert;
    }

    const chapters = draft.chapter_content && typeof draft.chapter_content === 'object'
      ? Object.keys(draft.chapter_content)
      : [];
    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full overflow-x-auto">
          <TabsTrigger value="full">Full Biography</TabsTrigger>
          {chapters.map((title) => (
            <TabsTrigger key={title} value={title}>
              {title}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="full" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Full Biography Draft</span>
                {/* Removed Export button as it's not fully implemented */}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor content={draft.full_content || ''} onContentChange={() => {}} editable={false} />
            </CardContent>
          </Card>
        </TabsContent>

        {chapters.map((title) => {
          const chapterContent = draft.chapter_content[title];
          return (
            <TabsContent key={title} value={title} className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{title}</span>
                    {onUpdateChapter && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUpdateFromDraft(title)}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Use in Editor
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RichTextEditor content={chapterContent || ''} onContentChange={() => {}} editable={false} />
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error loading draft</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : "Failed to load draft"}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Biography Draft</h2>
        <div className="flex space-x-2">
          <Button
            onClick={() => {
              console.log("Generate Draft button clicked. Calling generateDraft()...");
              generateDraft();
            }}
            disabled={isGenerating}
            className="bg-memoir-yellow text-memoir-darkGray hover:bg-memoir-yellow/90"
          >
            {isGenerating ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                Generating...
              </>
            ) : draft ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate Draft
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Draft
              </>
            )}
          </Button>
          {draft && onUpdateChapter && (
            <Button
              onClick={async () => {
                console.log("[DraftViewer] 'Apply All Chapters to Editor' button clicked.");
                if (!draft.chapter_content || !onUpdateChapter) {
                  console.error("[DraftViewer] Missing draft content or onUpdateChapter.");
                  toast({
                    title: "Error",
                    description: "Cannot apply draft content - editor not ready.",
                    variant: "destructive",
                  });
                  return;
                }
                if (!isStringRecord(draft.chapter_content)) {
                  console.error("[DraftViewer] Invalid chapter content format for bulk update.");
                  toast({
                    title: "Error",
                    description: "Invalid chapter content format for bulk update.",
                    variant: "destructive",
                  });
                  return;
                }

                try {
                  let chaptersUpdatedCount = 0;
                  // Iterate through editorChapters to ensure correct ID mapping
                  for (const editorChapter of editorChapters) {
                    const editorChapterNum = getChapterNumber(editorChapter.title);
                    if (editorChapterNum === null) {
                      console.warn(`[DraftViewer] Could not parse chapter number from editor chapter title: ${editorChapter.title}`);
                      toast({
                        title: "Warning",
                        description: `Skipping chapter "${editorChapter.title}": Could not parse chapter number.`,
                        variant: "default",
                      });
                      continue;
                    }

                    let draftContentFound = false;
                    for (const draftTitle of Object.keys(draft.chapter_content)) {
                      const draftChapterNum = getChapterNumber(draftTitle);
                      if (draftChapterNum === editorChapterNum) {
                        const content = draft.chapter_content[draftTitle];
                        if (typeof content === 'string') {
                          console.log(`[DraftViewer] Applying content for chapter ${editorChapter.title} (ID: ${editorChapter.id})`);
                          await onUpdateChapter(editorChapter.id, content, false); // Pass chapter ID
                          draftContentFound = true;
                          chaptersUpdatedCount++;
                          break;
                        }
                      }
                    }
                    if (!draftContentFound) {
                      console.warn(`[DraftViewer] No matching draft content found for editor chapter: ${editorChapter.title}`);
                      toast({
                        title: "Warning",
                        description: `No draft content found for chapter: "${editorChapter.title}".`,
                        variant: "default",
                      });
                    }
                  }
                  toast({
                    title: "Success",
                    description: `Successfully applied content to ${chaptersUpdatedCount} chapters.`,
                  });
                  onCloseModal?.();
                  onApplyAllChaptersSuccess?.();
                } catch (e: any) {
                  console.error("[DraftViewer] Error applying all chapters:", e);
                  toast({
                    title: "Error",
                    description: `Failed to apply all chapters: ${e.message || "Unknown error"}`,
                    variant: "destructive",
                  });
                }
              }}
              disabled={isGenerating}
              variant="outline"
            >
              <Save className="mr-2 h-4 w-4" />
              Apply All Chapters to Editor
            </Button>
          )}
        </div>
      </div>

      {isGenerating && (
        <Alert>
          <AlertTitle>Generating Draft</AlertTitle>
          <AlertDescription>
            We're generating your biography draft. This may take a few moments...
          </AlertDescription>
        </Alert>
      )}

      {draft ? (
        renderChapterTabs()
      ) : !isGenerating ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500 mb-4">
              No draft has been generated yet. Click the "Generate Draft" button to create a complete draft of your biography.
            </p>
            <p className="text-sm text-gray-400">
              This will use your questionnaire answers and approved table of contents to create a comprehensive draft.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default DraftViewer;
