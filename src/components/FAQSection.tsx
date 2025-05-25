
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// FAQ items
const faqItems = [
  {
    question: "Do I need to know how to write?",
    answer: "Not at all! Our platform guides you with prompts and AI assistance to help structure your thoughts. You can simply speak your memories, upload existing writing, or type casually, and our system will help organize and polish your content."
  },
  {
    question: "How long does it take?",
    answer: "The time varies depending on how much content you have. Most users complete their books within 2-8 weeks. You can work at your own pace, and our system allows you to save and continue as you go."
  },
  {
    question: "What if I don't have photos?",
    answer: "While photos enhance your story, they're not required. Many beautiful memoirs focus primarily on text. You can also include other visual elements like documents, letters, recipes, or we can suggest stock imagery that matches your story themes."
  },
  {
    question: "How is my book delivered?",
    answer: "You'll receive a professionally formatted digital PDF. We also offer options for high-quality printing and binding through our network of publishing partners, delivered directly to your address."
  },
  {
    question: "Can I include other family members in the process?",
    answer: "Absolutely! You can invite family members to contribute stories, photos, or review chapters. Our collaborative tools make it easy to build a multi-perspective family history."
  }
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-6 max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-memoir-darkGray">
          Frequently Asked Questions
        </h2>
        
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="mb-4 glass-card border-none">
              <AccordionTrigger className="text-memoir-darkGray text-lg font-medium px-6">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-memoir-darkGray px-6 pb-6 pt-2">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
