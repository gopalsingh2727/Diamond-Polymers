import React, { useState, useEffect, useRef } from "react";
import CreateAccount from "./createNewAccount/createNewAccount";
import CreateMachine from "./machine/CreateMachine";
import CreateStep from "./CreateStep/CreateStep";
import CreteMachineOpertor from "./CreateMachineOpertor/CreteMachineOpertor";
// import Products from "./products/products";
// import ProductCategories from "./products/productsCategories";

import CreateMaterials from "./Materials/createMaterials";
import MaterialsCategories from "./Materials/materialsCategories";
import CreateMachineType from "./machine/createMachineType";
import Headers from "../../header/Headers";
import  DeviceAccess from './deviceAccess/deviceAccess';
import DiveceAccessCreate from "./deviceAccess/deviceAccessCreate";
import './create.css';
import '../../../main/sidebar/menu.css';
import ErrorBoundary from '../../../error/error';

const Layout = () => {
  const menuItems = [
    { key: "account", label: "Create Account" },
    { key: "machineType", label: "Create Machine Type" },
    { key: "machine", label: "Create Machine" },
    { key: "step", label: "Create Step" },
    { key: "Create Machine Operator", label: "Create Machine Operator" },
    {key:"Create Device Access" , label: "Create Device Access"},
    {key:"Create Access" , label:"Create Access"},

    // { key: "products", label: "Products" },
    // { key: "categories", label: "Product Categories" },
    { key: "materials", label: "Create Materials" },
    { key: "materialsCategories", label: "Materials Categories" }
  ];

  const [activeComponent, setActiveComponent] = useState("account");
  const [title, setTitle] = useState("Create Account");
  const buttonRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const titles: Record<string, string> = {};
    menuItems.forEach(item => {
      titles[item.key] = item.label;
    });
    setTitle(titles[activeComponent] || "Select an Option");
  }, [activeComponent]);

  useEffect(() => {
    if (buttonRefs.current[selectedIndex]) {
      buttonRefs.current[selectedIndex]?.focus();
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLLIElement>, index: number) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = (index + 1) % menuItems.length;
      setSelectedIndex(nextIndex);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex = (index - 1 + menuItems.length) % menuItems.length;
      setSelectedIndex(prevIndex);
    } else if (e.key === "Enter") {
      e.preventDefault();
      setActiveComponent(menuItems[index].key);
    }
  };

  const renderContent = () => {
    switch (activeComponent) {
      case "account":
        return <ErrorBoundary><CreateAccount /></ErrorBoundary>;
      case "machineType":
        return <ErrorBoundary><CreateMachineType /></ErrorBoundary>;
      case "machine":
        return <ErrorBoundary><CreateMachine /></ErrorBoundary>;
      case "step":
        return <ErrorBoundary><CreateStep /></ErrorBoundary>;
      case "Create Machine Operator":
        return <ErrorBoundary><CreteMachineOpertor /></ErrorBoundary>;
      case "Create Device Access":
        return <ErrorBoundary><DiveceAccessCreate/></ErrorBoundary> 
      case "Create Access":
        return <ErrorBoundary><DeviceAccess/></ErrorBoundary>
      // case "products":
      //   return <ErrorBoundary><Products /></ErrorBoundary>;
      // case "categories":
      //   return <ErrorBoundary><ProductCategories /></ErrorBoundary>;
      case "materials":
        return <ErrorBoundary><CreateMaterials /></ErrorBoundary>;
      case "materialsCategories":
        return <ErrorBoundary><MaterialsCategories /></ErrorBoundary>;
      default:
        return <div>Select an option</div>;
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <div className="item menu-header" style={{ gridColumn: "1 / -1" }}>
        <Headers title={title} />
      </div>

      {/* Sidebar */}
      <div className="item">
        <div className="menu-container-create">
          <div className="menu-header-padding">
            <ul id="main-menu" style={{ listStyle: "none", padding: 0 }}>
              {menuItems.map((item, index) => (
                <div
                  key={item.key}
                  className={`menu-item-wrapper ${selectedIndex === index ? "selected" : ""} ${
                    index === 0 || index === 4 || index === 6 ? "bottom-borders-menu" : ""
                  }`}
                >
                  <li
                    ref={(el) => (buttonRefs.current[index] = el)}
                    tabIndex={0}
                    onClick={() => {
                      setActiveComponent(item.key);
                      setSelectedIndex(index);
                    }}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    style={{
                      outline: "none",
                      padding: "5px",
                      borderRadius: "24px",
                      cursor: "pointer",
                      fontWeight: 900,
                      textAlign: "center"
                    }}
                  >
                    {item.label}
                  </li>
                </div>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="item menu-content">
        {renderContent()}
      </div>

      {/* Footer */}
      <div className="item menu-footer" style={{ gridColumn: "1 / -1" }}>
        © 2024 Your Company Name. All rights reserved.
      </div>
    </div>
  );
};

export default Layout;