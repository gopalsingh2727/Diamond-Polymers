import { useState, useEffect } from "react";
import StepContainre from "./stepContainer";

interface PrintImageProps {
  onPrintDataChange?: (printData: { printWork: string; selectedFile: File | null }) => void;
  customerData?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    companyName: string;
    imageUrl: string;
  };
}

const PrintImage: React.FC<PrintImageProps> = ({ onPrintDataChange, customerData }) => {
  // State declarations
  const [printWork, setPrintWork] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // Effect to notify parent component of changes
  useEffect(() => {
    if (onPrintDataChange) {
      onPrintDataChange({ printWork, selectedFile });
    }
  }, [printWork, selectedFile, onPrintDataChange]);

  // Handler functions
  const handleChangePrint = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPrintWork(e.target.value);
    // Reset file when changing print option
    if (e.target.value !== "yes") {
      setSelectedFile(null);
      setPreviewUrl("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Handle file upload logic here
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
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

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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
            {/* Customer Info Display when print is selected */}
            {customerData && (
              <div className="customerPrintInfo">
                <h6>Print Details for:</h6>
                <div className="customerPrintDetails">
                  <p><strong>Name:</strong> {customerData.name}</p>
                  <p><strong>Company:</strong> {customerData.companyName}</p>
                  <p><strong>Address:</strong> {customerData.address}</p>
                  <p><strong>Phone:</strong> {customerData.phone}</p>
                  <p><strong>Email:</strong> {customerData.email}</p>
                </div>
              </div>
            )}
            
            <div className="fileUploadSection">
              <label htmlFor="printImage">Upload Print Image:</label>
              <input
                type="file"
                id="printImage"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            {selectedFile && (
              <div className="fileSelected">
                <p>✓ Image selected: {selectedFile.name}</p>
                {previewUrl && (
                  <div className="imagePreview">
                    <img 
                      src={previewUrl} 
                      alt="Print preview" 
                      style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain' }}
                    />
                  </div>
                )}
                <div className="printSummary">
                  <p><strong>Ready for printing:</strong></p>
                  <p>Customer: {customerData?.name || 'Unknown'}</p>
                  <p>Image: {selectedFile.name}</p>
                  <p>Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
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