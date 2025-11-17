import { useState, useEffect } from "react";


// Define the ref type for StepContainer


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

  orderData,
  isEditMode = false
}) => {
  // State declarations
  const [printWork, setPrintWork] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  
  
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



  // Check if we should show StepContainer


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
        <label htmlFor="printSelect" className="printSelectLabel ManufacturingStepsTitel" >Print:</label>
        <select
          id="printSelect"
          value={printWork}
          onChange={handleChangePrint}
        >
          {/* <option value="">Select Option</option> */}
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>

        {printWork === "yes" && (
          <div className="printUploadSection">
            <p className="ManufacturingStepsTitel">Print is Yes</p>
            
          </div>
        )}

        {printWork === "no" && (
          <div className="noPrintMessage">
            <p className="ManufacturingStepsTitel">✓ No print work selected. Ready to proceed to next step.</p>
          </div>
        )}
      </div>

   
    </div>
  );
};

export default PrintImage;