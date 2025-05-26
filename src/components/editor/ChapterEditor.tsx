import { useState, useEffect } from "react";
import { Chapter } from "@/types/biography";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Check, Sparkles } from "lucide-react";
import { useAutoSave } from "@/hooks/useAutoSave";
import { toast } from "@/hooks/use-toast";
import RichTextEditor from "./RichTextEditor"; // Import RichTextEditor
import { supabase } from "@/integrations/supabase/client"; // Ensure supabase is imported
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import DraftViewer from "./DraftViewer";

interface ChapterEditorProps {
  chapter: Chapter;
  onSave: (chapter: Partial<Chapter> & { id: string }) => Promise<void>;
  onSaveSuccess?: () => void;
  onOpenDraftModal?: () => void; // New prop to open the draft modal from parent
}

const ChapterEditor = ({ chapter, onSave, onSaveSuccess, onOpenDraftModal }: ChapterEditorProps) => {
  const [title, setTitle] = useState(chapter.title);
  const [content, setContent] = useState(chapter.content || "");
  const [editedChapter, setEditedChapter] = useState<Partial<Chapter> & { id: string }>({
    id: chapter.id,
    title: chapter.title,
    content: chapter.content || "",
  });
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Update local state when chapter prop changes (e.g., when switching chapters)
  useEffect(() => {
    setTitle(chapter.title);
    setContent(chapter.content || "");
    setEditedChapter({
      id: chapter.id,
      title: chapter.title,
      content: chapter.content || "",
    });
  }, [chapter]);

  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setEditedChapter(prev => ({ ...prev, title: newTitle }));
  };

  // Handle content change (now receives HTML string from RichTextEditor)
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setEditedChapter(prev => ({ ...prev, content: newContent }));
  };

  // Auto-save hook
  const { isSaving, hasUnsavedChanges, forceSave, lastSavedAt } = useAutoSave({
    data: editedChapter,
    onSave: async (data) => {
      await onSave(data);
      if (onSaveSuccess) {
        onSaveSuccess();
      }
    },
    saveDelay: 3000,
  });

  const handleExport = async (format: 'html') => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-export-file", {
        body: { biographyId: chapter.biography_id, format: format },
      });

      if (error) throw error;

      const blob = new Blob([new Uint8Array(data.data)], { type: data.contentType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `Your ${format.toUpperCase()} file has been downloaded.`,
      });
    } catch (error: any) {
      console.error("Error exporting file:", error);
      toast({
        title: "Export Failed",
        description: `Failed to export file: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setExportDialogOpen(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <Input
            value={title}
            onChange={handleTitleChange}
            className="text-xl font-bold"
            placeholder="Chapter Title"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExportDialogOpen(true)}
            disabled={isExporting}
          >
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </CardTitle>
        <div className="text-xs text-muted-foreground mt-1">
          {isSaving ? (
            <span className="text-amber-500">Saving...</span>
          ) : hasUnsavedChanges ? (
            <span className="text-amber-500">Unsaved changes</span>
          ) : lastSavedAt ? (
            <span className="text-green-600 flex items-center">
              <Check className="h-3 w-3 mr-1" />
              Saved
            </span>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <RichTextEditor
          key={chapter.id}
          content={content}
          onContentChange={handleContentChange}
          editable={true}
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onOpenDraftModal}>
          <Sparkles className="mr-2 h-4 w-4" />
          Use AI Draft
        </Button>

        <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Chapter</DialogTitle>
              <DialogDescription>
                Choose a format to export your chapter
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-4 py-4">
              <Button
                onClick={() => handleExport('html')}
                className="h-28 flex flex-col"
                disabled={isExporting}
              >
                <span>HTML (.html)</span>
                <span className="text-xs mt-1">Web Page Format</span>
              </Button>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button
          onClick={forceSave}
          disabled={isSaving || !hasUnsavedChanges}
          className="px-4"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Chapter"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ChapterEditor;
