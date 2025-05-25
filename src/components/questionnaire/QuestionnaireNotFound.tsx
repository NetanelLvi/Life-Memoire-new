
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import NavBar from "@/components/NavBar";

const QuestionnaireNotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-memoir-darkGray mb-4">הביוגרפיה לא נמצאה</h2>
          <Button 
            onClick={() => navigate("/dashboard")} 
            className="bg-[#5B9AA0] hover:bg-[#4a8288] text-white"
          >
            <ArrowLeft className="ml-2 h-4 w-4" />
            חזרה ללוח הבקרה
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireNotFound;
