
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";
import { Save, Check, BookOpen } from "lucide-react";

interface TOCHeaderProps {
  onSave: () => void;
  onApprove: () => void;
  isSaving: boolean;
}

const TOCHeader = ({ onSave, onApprove, isSaving }: TOCHeaderProps) => {
  const navigate = useNavigate();
  const { biographyId } = useParams<{ biographyId: string }>();

  return (
    <div className="flex justify-between items-center flex-wrap gap-2">
      <div>
        <h2 className="text-2xl font-bold">Table of Contents</h2>
        <p className="text-gray-500">
          Organize and structure your biography chapters
        </p>
      </div>
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          onClick={onSave} 
          disabled={isSaving}
        >
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
        
        <Button
          onClick={onApprove}
          disabled={isSaving}
          className="bg-memoir-yellow text-memoir-darkGray hover:bg-memoir-yellow/90"
        >
          <Check className="mr-2 h-4 w-4" />
          Approve & Continue
        </Button>
        
        <Button
          variant="outline"
          onClick={() => navigate(`/biography/${biographyId}/draft`)}
        >
          <BookOpen className="mr-2 h-4 w-4" />
          Generate Draft
        </Button>
      </div>
    </div>
  );
};

export default TOCHeader;
