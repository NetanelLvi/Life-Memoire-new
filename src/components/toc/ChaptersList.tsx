
import { TOCChapter } from "@/hooks/useTOC";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates
} from "@dnd-kit/sortable";
import TOCChapterCard from "./TOCChapterCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface ChaptersListProps {
  chapters: TOCChapter[];
  onChaptersChange: (chapters: TOCChapter[]) => void;
  onUpdateChapter: (index: number, field: keyof TOCChapter, value: string) => void;
  onDeleteChapter: (index: number) => void;
  onAddChapter: () => void;
}

const ChaptersList = ({
  chapters,
  onChaptersChange,
  onUpdateChapter,
  onDeleteChapter,
  onAddChapter
}: ChaptersListProps) => {
  // DnD functionality
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      const oldIndex = chapters.findIndex((_, i) => `chapter-${i}` === active.id);
      const newIndex = chapters.findIndex((_, i) => `chapter-${i}` === over?.id);
      
      // Create a new array with the item moved
      const updatedChapters = [...chapters];
      const [movedItem] = updatedChapters.splice(oldIndex, 1);
      updatedChapters.splice(newIndex, 0, movedItem);
      
      onChaptersChange(updatedChapters);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chapters</CardTitle>
        <CardDescription>
          Drag to reorder, or edit chapter titles and descriptions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={chapters.map((_, index) => `chapter-${index}`)}
            strategy={verticalListSortingStrategy}
          >
            {chapters.map((chapter, index) => (
              <TOCChapterCard
                key={`chapter-${index}`}
                id={`chapter-${index}`}
                index={index}
                chapter={chapter}
                onUpdate={onUpdateChapter}
                onDelete={onDeleteChapter}
              />
            ))}
          </SortableContext>
        </DndContext>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          onClick={onAddChapter}
          className="w-full"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Chapter
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ChaptersList;
