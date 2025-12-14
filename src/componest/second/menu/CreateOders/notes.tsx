import { useState, useEffect } from "react";

interface NotesProps {
  onNotesChange?: (notes: string) => void;
  initialNotes?: string;
  isEditMode?: boolean;
}

const Notes = ({ onNotesChange, initialNotes }: NotesProps) => {
  const [note, setNote] = useState(initialNotes || "");

  // Initialize note from initial data
  useEffect(() => {
    if (initialNotes) {
      setNote(initialNotes);
    }
  }, [initialNotes]);

  // Call the parent callback whenever notes change
  useEffect(() => {
    if (onNotesChange) {
      onNotesChange(note);
    }
  }, [note, onNotesChange]);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value);
  };

  return (
    <div className="NotesSection">
      <label>Notes:</label>
      <textarea
        placeholder="Write your note here..."
        value={note}
        onChange={handleNoteChange}
        className="NotesTextarea"
        name="notes"
      />
    </div>
  );
};

export default Notes;