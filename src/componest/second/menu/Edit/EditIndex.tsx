import React, { useState, useEffect, useRef } from "react";
import EditNewAccount from "./EditNewAccount/EditNewAccount";
import EditMaterials from "./EditMaterials/EditMaterials";
import EditStep from "./EditCreateStep/EditStep";
// import EditProduct from "./EditProducts/EditProduct";
// import EditProductCategoris from "./EditProducts/EditProductCategoris";
import EditDeviceAccess from "./EditDeviceAccess/EditDeviceAccess";
import EditAccess from "./EditDeviceAccess/EditDeviceAccessCreate";
import EditMachine from "./EditMachine/EditMachine";
import MaterialsCategories from "./EditMaterials/MaterialsCategories";
import EditMachineOpertor from "./EditMachineOpertor/EditMachineOPertor";
import EditMachineType from "./EditMachineType/EditMachineyType";
import UpdataIDAndPassword from "./UpdataIDandPassword/UpdataIDAndPassword";
import ErrorBoundary from "../../../error/error";  
import Headers from "../../header/Headers";
import "../create/create.css";
import "../../../main/sidebar/menu.css";
import { useSelector } from "react-redux";

const EditIndex = () => {
  const [activeComponent, setActiveComponent] = useState("account");
  const [title, setTitle] = useState("Account");
  const buttonRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
    
  
 const userRole = useSelector((state: any) => state.auth.userData?.role);
 console.log(userRole , "this Role Me");
 
  const baseComponentsMap: Record<string, JSX.Element> = {
    account: <ErrorBoundary> <EditNewAccount /> </ErrorBoundary>,
    machineType: <ErrorBoundary> <EditMachineType /> </ErrorBoundary>,
    machine: <ErrorBoundary> <EditMachine /> </ErrorBoundary>,
    step: <ErrorBoundary> <EditStep /> </ErrorBoundary>,
    machineOperator: <ErrorBoundary> <EditMachineOpertor /> </ErrorBoundary>,
    DeviceAccess: <ErrorBoundary> <EditDeviceAccess /></ErrorBoundary>,
    Access: <ErrorBoundary> <EditAccess /></ErrorBoundary>,
    // products: <EditProduct />,
    // categories: <EditProductCategoris />,

    materials: <ErrorBoundary> <EditMaterials /> </ErrorBoundary>,
    materialsCategories: <ErrorBoundary> <MaterialsCategories /></ErrorBoundary> ,
  };

  const baseTitlesMap: Record<string, string> = {
    account: "Account",
    machineType: "Machine Type",
    machine: "Machine",
    step: "Step",
    machineOperator: "Machine Operator",
    DeviceAccess: "Device Access",
    Access: "Access",
    // products: "Products",
    // categories: "Product Categories",
    materials: "Materials",
    materialsCategories: "Materials Categories"
  };

  if (userRole === "manager") {
    baseComponentsMap["updatePassword"] = <UpdataIDAndPassword />;
    baseTitlesMap["updatePassword"] = "Update ID & Password";
  }

  const componentsMap = baseComponentsMap;
  const titlesMap = baseTitlesMap;

  useEffect(() => {
    setTitle(titlesMap[activeComponent] || "Select an Option");
  }, [activeComponent]);

  useEffect(() => {
    buttonRefs.current[selectedIndex]?.focus();
  }, [selectedIndex]);

  const menuItems = Object.entries(titlesMap);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLLIElement>, index: number) => {
    const total = menuItems.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((index + 1) % total);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((index - 1 + total) % total);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const key = menuItems[index][0];
      setActiveComponent(key);
    }
  };

  return (
    <div className="container" style={{ marginTop: 0 }}>
      {/* Header */}
      <div className="item menu-header" style={{ gridColumn: "1 / -1" }}>
        <Headers title={title} />
      </div>

      {/* Sidebar */}
      <div className="item">
        <div className="menu-container-create">
          <div className="menu-header-padding">
            <ul id="main-menu" style={{ listStyle: "none", padding: 0 }}>
              {menuItems.map(([key, label], index) => (
                <div
                  key={key}
                  className={`menu-item-wrapper ${selectedIndex === index ? "selected" : ""} ${
                    index === 0 || index === 4 || index === 6 ? "bottom-borders-menu" : ""
                  }`}
                >
                  <li
                    ref={(el) => (buttonRefs.current[index] = el)}
                    tabIndex={0}
                    onClick={() => {
                      setActiveComponent(key);
                      setSelectedIndex(index);
                    }}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    style={{
                      outline: "none",
                      borderRadius: "24px",
                      cursor: "pointer",
                      fontWeight: 900,
                      textAlign: "center"
                    }}
                  >
                    {label}
                  </li>
                </div>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="item menu-content">
        {componentsMap[activeComponent]}
      </div>

      {/* Footer */}
      <div className="item menu-footer" style={{ gridColumn: "1 / -1" }}>
        © 2024 Your Company Name. All rights reserved.
      </div>
    </div>
  );
};

export default EditIndex;