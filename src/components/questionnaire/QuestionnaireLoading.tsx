
import { Loader2 } from "lucide-react";
import NavBar from "@/components/NavBar";

const QuestionnaireLoading = () => {
  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#5B9AA0]" />
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireLoading;
