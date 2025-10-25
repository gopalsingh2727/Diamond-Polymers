import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./CreateOders.css";
import { BackButton } from "../../../allCompones/BackButton";
import MaterialInOders from "./odersType/material";
import CustomerName, { CustomerNameRef } from "./account/CurstomerName";
import Notes from "./notes";
import SeleteType from "./SeleteType";
import ProductOdresType from "./odersType/product";
import SaveOrders from "./saveTheOdes";
import StepContainer, { StepContainerRef } from "./stepContainer"; // Import StepContainer
import PrintImage from "./printoptions"; // Import PrintImage component

import { MaterialData } from "./odersType/material";

const CreateOrders = () => {
  const location = useLocation();
  
  // Enhanced edit mode detection
  const { orderData, isEdit, isEditMode } = location.state || {};
  const editMode = Boolean(isEdit || isEditMode || (orderData && orderData._id));
  
  console.log('🔍 CreateOrders - Location state:', location.state);
  console.log('🔍 CreateOrders - Edit mode detected:', editMode);
  console.log('🔍 CreateOrders - Order data:', orderData);
  
  const [selectedType, setSelectedType] = useState("");
  const [showBottomGusset, setShowBottomGusset] = useState(false);
  const [showFlap, setShowFlap] = useState(false);
  const [showAirHole, setShowAirHole] = useState(false);
  
  // Refs to access child component data
  const customerNameRef = useRef<CustomerNameRef>(null);
  const materialRef = useRef<{ getMaterialData: () => MaterialData }>(null);
  const stepContainerRef = useRef<StepContainerRef>(null);

  // Initialize form with order data if editing
  useEffect(() => {
    if (orderData && editMode) {
      console.log('📝 Edit mode - Loading order data:', orderData);
      
      // Determine order type based on available data
      if (orderData.material || orderData.materialType || orderData.materialWeight) {
        console.log('📦 Setting type to material order');
        setSelectedType("material");
      } else if (orderData.product || orderData.productType) {
        console.log('📦 Setting type to product order');
        setSelectedType("product");
      }
      
      // Set additional fields based on order data
      if (orderData.BottomGusset || orderData.bottomGusset) {
        console.log('✅ Setting bottom gusset');
        setShowBottomGusset(true);
      }
      if (orderData.Flap || orderData.flap) {
        console.log('✅ Setting flap');
        setShowFlap(true);
      }
      if (orderData.AirHole || orderData.airHole) {
        console.log('✅ Setting air hole');
        setShowAirHole(true);
      }
    }
  }, [orderData, editMode]);

  return (
    <div className="CreateOrders">
      <div className="CrateOrdersHaders">
        <BackButton />
        <div className="CreateOrdersHaders1">
          <p className="CreteOrdersTitel">
            {editMode ? 'Edit Order' : 'Create Orders'}
          </p>
          {editMode && orderData && (
            <span className="edit-order-id">
              Order ID: {orderData.orderId || orderData._id}
            </span>
          )}
        </div>
      </div>
      
      <div className="CreateOrdersBody">
        <div className="createOdersForm">
          <CustomerName 
            ref={customerNameRef}
            initialData={orderData}
            isEditMode={editMode}
          />
          
          <SeleteType
            selectedOption={selectedType}
            onChange={setSelectedType}
            showBottomGusset={showBottomGusset}
            setShowBottomGusset={setShowBottomGusset}
            showFlap={showFlap}
            setShowFlap={setShowFlap}
            showAirHole={showAirHole}
            setShowAirHole={setShowAirHole}
            initialType={orderData?.materialType || orderData?.productType}
          />
          
          {selectedType === "material" && (
            <MaterialInOders
              ref={materialRef}
              showBottomGusset={showBottomGusset}
              showFlap={showFlap}
              showAirHole={showAirHole}
              initialData={orderData}
              isEditMode={editMode}
            />
          )}
          
          {selectedType === "product" && (
            <ProductOdresType 
              initialData={orderData}
              isEditMode={editMode}
            />
          )}

          {/* Add PrintImage component */}
          {(selectedType === "material" || selectedType === "product") && (
            <PrintImage
              orderData={orderData}
              isEditMode={editMode}
              onPrintDataChange={(printData) => {
                console.log('Print data changed:', printData);
              }}
            />
          )}

          {/* FIXED: Add StepContainer - uncommented and properly configured */}
          {(selectedType === "material" || selectedType === "product") && (
            <StepContainer 
              ref={stepContainerRef}
              initialData={orderData}
              isEditMode={editMode}
              onStepsChange={(steps) => {
                console.log('Steps changed:', steps);
              }}
            />
          )}
        </div>
        
        <div className="CreateOrdersFooter">
          <Notes 
            initialNotes={orderData?.Notes || orderData?.notes}
            isEditMode={editMode}
          />
          <SaveOrders 
            isEditMode={editMode}
            orderId={orderData?._id}
            orderData={orderData}
          />
        </div>
      </div>
      
      <div className="sideMenu">
        <div className="sideMenuPtag">
          <p>Address</p>
          <p>Send Email</p>
          <p>WhatsApp</p>
          <p>Print</p>
        </div>
      </div>
    </div>
  );
};

export default CreateOrders;