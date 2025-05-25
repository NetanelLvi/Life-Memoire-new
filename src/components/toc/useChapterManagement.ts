
import { useState, useEffect } from "react";
import { TOCChapter } from "@/hooks/useTOC";

/**
 * Custom hook for managing chapter state and operations
 */
export const useChapterManagement = (initialChapters: TOCChapter[]) => {
  const [chapters, setChapters] = useState<TOCChapter[]>([]);
  
  useEffect(() => {
    if (initialChapters) {
      setChapters([...initialChapters]);
    }
  }, [initialChapters]);

  const handleAddChapter = () => {
    setChapters([
      ...chapters,
      { title: "New Chapter", description: "Description for this chapter" },
    ]);
  };

  const handleUpdateChapter = (index: number, field: keyof TOCChapter, value: string) => {
    const updatedChapters = [...chapters];
    updatedChapters[index] = {
      ...updatedChapters[index],
      [field]: value,
    };
    setChapters(updatedChapters);
  };

  const handleDeleteChapter = (index: number) => {
    setChapters(chapters.filter((_, i) => i !== index));
  };

  const setChaptersList = (newChapters: TOCChapter[]) => {
    setChapters(newChapters);
  };

  return {
    chapters,
    handleAddChapter,
    handleUpdateChapter,
    handleDeleteChapter,
    setChaptersList
  };
};
