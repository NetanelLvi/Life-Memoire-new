
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuestionPaginationProps {
  currentQuestionIndex: number;
  questions: any[];
  onQuestionSelect?: (index: number) => void;
}

const QuestionPagination = ({ 
  currentQuestionIndex, 
  questions,
  onQuestionSelect
}: QuestionPaginationProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  
  // Check if we need scroll buttons based on container width
  useEffect(() => {
    const checkOverflow = () => {
      if (scrollContainerRef.current) {
        const { scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowScrollButtons(scrollWidth > clientWidth);
      }
    };
    
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    
    return () => window.removeEventListener("resize", checkOverflow);
  }, [questions.length]);
  
  // Scroll to make current indicator visible
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const indicatorWidth = 16; // Approximate width of each dot with margins
      
      const scrollPosition = currentQuestionIndex * indicatorWidth - container.clientWidth / 2 + indicatorWidth;
      
      container.scrollTo({
        left: Math.max(0, scrollPosition),
        behavior: 'smooth'
      });
    }
  }, [currentQuestionIndex]);
  
  // Handle scroll buttons
  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.75;
      
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="flex justify-center items-center relative w-full max-w-full">
      {showScrollButtons && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 z-10 rounded-full"
          onClick={() => handleScroll('left')}
          aria-label="גלול שמאלה"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}
      
      <div 
        ref={scrollContainerRef}
        className="flex space-x-2 overflow-x-auto scrollbar-hide py-2 px-4 max-w-full"
      >
        {questions.map((_, index) => (
          <button
            key={index}
            onClick={() => onQuestionSelect?.(index)}
            className={cn(
              "w-3 h-3 rounded-full transition-colors flex-shrink-0",
              index === currentQuestionIndex
                ? "bg-[#FFD217]"
                : "bg-gray-300 hover:bg-gray-400"
            )}
            aria-label={`עבור לשאלה ${index + 1}`}
            aria-current={index === currentQuestionIndex ? "true" : "false"}
          />
        ))}
      </div>
      
      {showScrollButtons && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 z-10 rounded-full"
          onClick={() => handleScroll('right')}
          aria-label="גלול ימינה"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default QuestionPagination;
