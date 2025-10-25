import { useState, useEffect, useRef } from "react";
import StepContainer from "./stepContainer"; // Fixed component name

// Define the ref type for StepContainer
interface StepContainerRef {
  getStepData: () => any; // Adjust this type based on your actual StepContainer implementation
}

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
  // Add these props to receive order data and edit mode from parent
  orderData?: any;
  isEditMode?: boolean;
}

const PrintImage: React.FC<PrintImageProps> = ({ 
  onPrintDataChange, 
  customerData,
  orderData,
  isEditMode = false
}) => {
  // State declarations
  const [printWork, setPrintWork] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  
  // Add ref for StepContainer
  const stepContainerRef = useRef<StepContainerRef>(null);

  // Initialize print work from order data if editing
  useEffect(() => {
    if (orderData && isEditMode) {
      if (orderData.printWork) {
        setPrintWork(orderData.printWork);
      }
      // If there's existing print image data, handle it here
      if (orderData.printImageUrl) {
        setPreviewUrl(orderData.printImageUrl);
      }
    }
  }, [orderData, isEditMode]);

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

  // Check if we should show StepContainer
  const shouldShowStepContainer = () => {
    if (printWork === "no") {
      return true; // Show immediately if no print work
    }
    if (printWork === "yes") {
      return true; // Show when print work is selected
    }
    return false;
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && !previewUrl.startsWith('http')) {
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
          <option value="">Select Option</option>
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>

        {printWork === "yes" && (
          <div className="printUploadSection">
            <p>Print is Yes</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="fileInput"
            />
            {previewUrl && (
              <div className="imagePreview">
                <img src={previewUrl} alt="Print preview" style={{ maxWidth: '200px', maxHeight: '200px' }} />
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

   
    </div>
  );
};

export default PrintImage;