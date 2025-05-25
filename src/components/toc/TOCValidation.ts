
import { TOCChapter } from "@/hooks/useTOC";
import { toast } from "@/hooks/use-toast";

export const validateTOC = (chapters: TOCChapter[]): boolean => {
  if (chapters.length === 0) {
    toast({
      title: "Validation Error",
      description: "Please add at least one chapter before continuing",
      variant: "destructive",
    });
    return false;
  }

  if (chapters.some(chapter => !chapter.title.trim())) {
    toast({
      title: "Validation Error",
      description: "All chapters must have a title",
      variant: "destructive",
    });
    return false;
  }

  return true;
};
