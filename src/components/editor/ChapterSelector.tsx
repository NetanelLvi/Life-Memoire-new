
import { Chapter } from "@/types/biography";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChapterSelectorProps {
  chapters: Chapter[];
  activeChapterId: string | null;
  setActiveChapterId: (id: string) => void;
}

const ChapterSelector = ({
  chapters,
  activeChapterId,
  setActiveChapterId,
}: ChapterSelectorProps) => {
  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-4">Chapters</h3>
        <div className="space-y-2">
          {chapters.map((chapter) => (
            <Button
              key={chapter.id}
              variant="ghost"
              className={cn(
                "w-full justify-start text-left h-auto py-3 px-3",
                activeChapterId === chapter.id
                  ? "bg-memoir-blueGray/20 text-memoir-darkGray font-medium"
                  : ""
              )}
              onClick={() => setActiveChapterId(chapter.id)}
            >
              <div className="flex items-center">
                <span className="w-6 h-6 rounded-full bg-memoir-blueGray/20 flex items-center justify-center mr-2 text-xs">
                  {chapter.chapter_order + 1}
                </span>
                <span className="truncate">{chapter.title}</span>
              </div>
            </Button>
          ))}

          {chapters.length === 0 && (
            <div className="text-center p-4 text-gray-500">
              <p>No chapters available.</p>
              <p className="text-sm mt-2">
                Go back to the TOC page to generate chapters based on your approved structure.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChapterSelector;
