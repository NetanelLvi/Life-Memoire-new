
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useState } from "react";

interface SaveExitButtonProps {
  onSaveAndExit: () => Promise<void> | void;
}

const SaveExitButton = ({ onSaveAndExit }: SaveExitButtonProps) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveAndExit = async () => {
    setIsSaving(true);
    try {
      await onSaveAndExit();
    } catch (error) {
      console.error("Error saving and exiting:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleSaveAndExit}
      disabled={isSaving}
    >
      {isSaving ? (
        <>
          <span className="animate-pulse">שומר...</span>
        </>
      ) : (
        <>
          <Save className="ml-2 h-4 w-4" />
          שמור וצא
        </>
      )}
    </Button>
  );
};

export default SaveExitButton;
