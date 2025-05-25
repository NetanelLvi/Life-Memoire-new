
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TOCChapter } from "@/hooks/useTOC";

interface TOCChapterCardProps {
  id: string;
  index: number;
  chapter: TOCChapter;
  onUpdate: (index: number, field: keyof TOCChapter, value: string) => void;
  onDelete: (index: number) => void;
}

const TOCChapterCard = ({ id, index, chapter, onUpdate, onDelete }: TOCChapterCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className="mb-3 p-4 relative"
    >
      <div className="flex items-center">
        <div 
          className="cursor-move mr-2 p-2"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-500 min-w-[100px]">
              Chapter {index + 1}
            </span>
            <Input
              value={chapter.title}
              onChange={(e) => onUpdate(index, 'title', e.target.value)}
              placeholder="Chapter title"
              className="flex-1"
            />
          </div>
          
          <Textarea
            value={chapter.description}
            onChange={(e) => onUpdate(index, 'description', e.target.value)}
            placeholder="Chapter description"
            rows={2}
          />
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="ml-2 text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={() => onDelete(index)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default TOCChapterCard;
