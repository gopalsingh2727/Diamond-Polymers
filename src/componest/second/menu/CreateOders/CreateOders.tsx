
import "./CreateOders.css";
import {BackButton }from "../../../allCompones/BackButton";

import MaterialAndProduct from "./materialAndProduct/MaterialAndProduct";

const CreateOrders = () => {
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
          {/* <AccountDetails /> */}
  
          <MaterialAndProduct />
         

          <div className="CreateOrdersFooter">
    
          
          </div>
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