import { useState } from "react";





const Notes  = () =>{
      const [note, setNote] = useState("");
       return(
         <div className="CreateOrdersFooter">
        <div className="Notes">
          <h3>Notes</h3>
          <textarea
            placeholder="Write your note here..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="NotesTextarea "
            rows={4}
          />
        </div>
      </div>



       )
}





export default Notes;
