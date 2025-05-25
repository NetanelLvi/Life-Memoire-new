
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "@/hooks/use-toast";

interface AutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  saveDelay?: number;
  onError?: (error: unknown) => void;
}

/**
 * Custom hook to provide auto-save functionality with debouncing
 */
export function useAutoSave<T>({
  data,
  onSave,
  saveDelay = 2000,
  onError
}: AutoSaveOptions<T>) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedData, setLastSavedData] = useState<T>(data);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dataRef = useRef<T>(data);

  // Update dataRef when data changes
  useEffect(() => {
    dataRef.current = data;
    
    // Check if data has changed from last saved state
    const isChanged = JSON.stringify(data) !== JSON.stringify(lastSavedData);
    setHasUnsavedChanges(isChanged);
  }, [data, lastSavedData]);

  const saveData = useCallback(async () => {
    if (!hasUnsavedChanges) return;
    
    try {
      setIsSaving(true);
      await onSave(dataRef.current);
      setLastSavedData(dataRef.current);
      setHasUnsavedChanges(false);
    } catch (error) {
      if (onError) {
        onError(error);
      } else {
        console.error("Auto-save failed:", error);
        toast({
          title: "Auto-save failed",
          description: "Your changes couldn't be saved automatically",
          variant: "destructive",
        });
      }
    } finally {
      setIsSaving(false);
    }
  }, [hasUnsavedChanges, onSave, onError]);

  // Set up debounced save
  useEffect(() => {
    if (hasUnsavedChanges) {
      // Clear previous timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      // Set new timer
      timerRef.current = setTimeout(saveData, saveDelay);
    }
    
    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [data, hasUnsavedChanges, saveData, saveDelay]);

  // Force save function for manual saving
  const forceSave = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    await saveData();
  }, [saveData]);

  return {
    isSaving,
    hasUnsavedChanges,
    forceSave,
    lastSavedAt: lastSavedData !== data ? null : new Date()
  };
}
