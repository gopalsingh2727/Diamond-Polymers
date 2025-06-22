import { useState } from "react";
import StepContainre from "./stepContainer";

const PrintImage = () => {
  // State declarations
  const [printWork, setPrintWork] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Handler functions
  const handleChangePrint = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPrintWork(e.target.value);
    // Reset file when changing print option
    if (e.target.value !== "yes") {
      setSelectedFile(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Handle file upload logic here
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      console.log("Selected file:", file.name);
      // Add your file processing logic here
    }
  };

  // Check if we should show StepContainre
  const shouldShowStepContainer = () => {
    if (printWork === "no") {
      return true; // Show immediately if no print work
    }
    if (printWork === "yes" && selectedFile) {
      return true; // Show only after image is selected
    }
    return false; // Don't show otherwise
  };

  return (
    <div className="printSection">
      <div className="printForm">
        <label htmlFor="printSelect" className="printSelectLabel">Print:</label>
        <select
          id="printSelect"
          value={printWork}
          onChange={handleChangePrint}
        >
          <option value="">-- Select --</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>

        {printWork === "yes" && (
          <div className="imageUpload">
            <input
              type="file"
              id="printImage"
              accept="image/*"
              onChange={handleFileChange}
            />
            {selectedFile && (
              <div className="fileSelected">
                <p>✓ Image selected: {selectedFile.name}</p>
              </div>
            )}
          </div>
        )}

        {printWork === "no" && (
          <div className="noPrintMessage">
            <p>✓ No print work selected. Ready to proceed to next step.</p>
          </div>
        )}
      </div>

    
      {shouldShowStepContainer() && <StepContainre />}
    </div>
  );
};

export default PrintImage;