import { useState, useEffect } from "react";

interface NotesProps {
  onNotesChange?: (notes: string) => void;
}

const Notes = ({ onNotesChange }: NotesProps) => {
  const [note, setNote] = useState("");

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
    <div >
      <div className="Notes">
        <h3>Notes</h3>
        <textarea
          placeholder="Write your note here..."
          value={note}
          onChange={handleNoteChange}
          className="NotesTextarea"
          rows={4}
        />
      
        
      </div>
     
    </div>
  );
};

export default Notes;