import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Mock data for testimonials
const testimonials = [
  {
    id: 1,
    quote: "I turned my family story into a touching book in just two weeks!",
    name: "Sarah Johnson",
    age: 67
  },
  {
    id: 2,
    quote: "The easiest way I've found to preserve my husband's memories for our grandchildren.",
    name: "Robert Miller",
    age: 72
  },
  {
    id: 3,
    quote: "What started as a simple project became our family's most treasured possession.",
    name: "Emily Davis",
    age: 58
  },
  {
    id: 4,
    quote: "I wish I had this when my parents were still alive. Now I'm doing it for my kids.",
    name: "Michael Brown",
    age: 63
  },
  {
    id: 5,
    quote: "The AI suggestions helped me organize decades of scattered memories.",
    name: "Patricia Wilson",
    age: 70
  }
];

const TestimonialsSection = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.querySelector('div')?.clientWidth || 0;
      const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
      
      container.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="testimonials" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-memoir-darkGray">
          Hear From Our Authors
        </h2>
        
        <div className="relative">
          {/* Left scroll button */}
          <button 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            <ChevronLeft size={24} className="text-memoir-darkGray" />
          </button>
          
          {/* Testimonials container */}
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-6 pb-8 hide-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {testimonials.map((testimonial) => (
              <div 
                key={testimonial.id}
                className="flex-none w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] glass-card bg-memoir-lightGray"
              >
                <div className="p-6">
                  <p className="text-lg italic mb-6 text-memoir-darkGray">"{testimonial.quote}"</p>
                  <div className="flex items-center">
                    <div className="bg-memoir-blueGray rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">
                      {testimonial.name[0]}
                    </div>
                    <div className="ml-4">
                      <p className="font-semibold text-memoir-darkGray">{testimonial.name}</p>
                      <p className="text-sm text-memoir-darkGray">Age {testimonial.age}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Right scroll button */}
          <button 
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            <ChevronRight size={24} className="text-memoir-darkGray" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
