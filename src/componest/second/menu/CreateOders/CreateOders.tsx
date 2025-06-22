import { useState } from "react";
import "./CreateOders.css";
import { BackButton } from "../../../allCompones/BackButton";


import MaterialInOders from "./odersType/material";


import CustomerName from "./account/CurstomerName";
import Notes from "./notes";
import SeleteType from "./SeleteType";
import ProductOdresType from "./odersType/product";

const CreateOrders = () => {
  const [selectedType, setSelectedType] = useState("");
   
 

  // ✅ Feature toggles lifted up
  const [showBottomGusset, setShowBottomGusset] = useState(false);
  const [showFlap, setShowFlap] = useState(false);
  const [showAirHole, setShowAirHole] = useState(false);

  return (
    <div className="CreateOrders">
      <div className="CrateOrdersHaders">
        <BackButton />
        <div className="CreateOrdersHaders1">
          <p className="CreteOrdersTitel">Create Orders</p>
        </div>
      </div>

      <div className="CreateOrdersBody">
        <div className="createOdersForm">
          <CustomerName />
          <SeleteType
            selectedOption={selectedType}
            onChange={setSelectedType}
            showBottomGusset={showBottomGusset}
            setShowBottomGusset={setShowBottomGusset}
            showFlap={showFlap}
            setShowFlap={setShowFlap}
            showAirHole={showAirHole}
            setShowAirHole={setShowAirHole}
          />

        

         {selectedType === "material" && (
  <MaterialInOders
    showBottomGusset={showBottomGusset}
    showFlap={showFlap}
    showAirHole={showAirHole}
  
/>
  
)}



          {selectedType === "product" && (
            <>
              <ProductOdresType />
            </>
          )}

 
          
          <Notes />
        </div>

        <div className="CreateOrdersFooter"></div>
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