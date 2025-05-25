
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuestionnaireHeaderProps {
  title: string;
}

const QuestionnaireHeader = ({ title }: QuestionnaireHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="mb-8">
      <Button 
        variant="outline" 
        onClick={() => navigate("/dashboard")}
        className="mb-6"
      >
        <ArrowLeft className="ml-2 h-4 w-4" />
        חזרה ללוח הבקרה
      </Button>
      
      <h1 className="text-3xl font-bold text-memoir-darkGray mb-2">
        {title} - שאלון
      </h1>
      <p className="text-gray-600">
        ענה על השאלות הבאות כדי לבנות את סיפור החיים שלך
      </p>
    </div>
  );
};

export default QuestionnaireHeader;
