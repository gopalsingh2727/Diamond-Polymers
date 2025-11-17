import React, { useState, useEffect, useRef } from "react";
import EditNewAccount from "./EditNewAccount/EditNewAccount";
import EditMaterials from "./EditMaterials/EditMaterials";
import EditStep from "./EditCreateStep/EditStep";
import EditDeviceAccess from "./EditDeviceAccess/EditDeviceAccess";
import EditAccess from "./EditDeviceAccess/EditDeviceAccessCreate";
import EditMachine from "./EditMachine/EditMachine";
import MaterialsCategories from "./EditMaterials/MaterialsCategories";
import EditMachineOpertor from "./EditMachineOpertor/EditMachineOPertor";
import EditMachineType from "./EditMachineType/EditMachineyType";
import UpdataIDAndPassword from "./UpdataIDandPassword/UpdataIDAndPassword";
import EditFormula from "./EditFormula/EditFormula";
import EditProductSpec from "./EditProductSpec/EditProductSpec";
import EditProducts from "./EditProducts/EditProduct";
import EditProductCategories from "./EditProducts/EditProductCategoris";
import ErrorBoundary from "../../../error/error";
import Headers from "../../header/Headers";
import "../create/create.css";
import "../../../main/sidebar/menu.css";
import { useSelector } from "react-redux";

const EditIndex = () => {
  const [activeComponent, setActiveComponent] = useState("account");

  const buttonRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  // const [backHandlerRef, setBackHandlerRef] = useState<(() => void) | null>(null);
 
  const userRole = useSelector((state: any) => state.auth.userData?.role);

  // Track which sections are expanded
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "Account": true,
    "Machine Management": false,
    "Products & Materials": false,
    "Device Access": false,
    "Formulas & Calculations": true
  });

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };
  
  const menuSections = [
    {
      title: "Account",
      items: [
        { key: "account", label: "Account" }
      ]
    },
    {
      title: "Machine Management",
      items: [
        { key: "machineType", label: "Machine Type" },
        { key: "machine", label: "Machine" },
        { key: "step", label: "Step" },
        { key: "machineOperator", label: "Machine Operator" }
      ]
    },
    {
      title: "Products & Materials",
      items: [
        { key: "products", label: "Edit Products" },
        { key: "productCategories", label: "Product Categories" },
        { key: "materials", label: "Materials" },
        { key: "materialsCategories", label: "Materials Categories" }
      ]
    },
    {
      title: "Device Access",
      items: [
        { key: "DeviceAccess", label: "Device Access" },
        { key: "Access", label: "Access" }
      ]
    },
    {
      title: "Formulas & Calculations",
      items: [
        { key: "formula", label: "Edit Formula" },
        { key: "productSpec", label: "Edit Product Spec" }
      ]
    }
  ];

  // Add manager-only option
  if (userRole === "manager") {
    menuSections.push({
      title: "Settings",
      items: [
        { key: "updatePassword", label: "Update ID & Password" }
      ]
    });
  }

  const baseComponentsMap: Record<string, JSX.Element> = {
    account: <ErrorBoundary> <EditNewAccount /> </ErrorBoundary>,
    machineType: <ErrorBoundary> <EditMachineType  /> </ErrorBoundary>,
    machine: <ErrorBoundary> <EditMachine /> </ErrorBoundary>,
    step: <ErrorBoundary> <EditStep /> </ErrorBoundary>,
    machineOperator: <ErrorBoundary> <EditMachineOpertor /> </ErrorBoundary>,
    DeviceAccess: <ErrorBoundary> <EditDeviceAccess/></ErrorBoundary>,
    Access: <ErrorBoundary> <EditAccess /></ErrorBoundary>,
    products: <ErrorBoundary> <EditProducts /> </ErrorBoundary>,
    productCategories: <ErrorBoundary> <EditProductCategories /> </ErrorBoundary>,
    materials: <ErrorBoundary> <EditMaterials  /> </ErrorBoundary>,
    materialsCategories: <ErrorBoundary> <MaterialsCategories /></ErrorBoundary>,
    formula: <ErrorBoundary> <EditFormula /> </ErrorBoundary>,
    productSpec: <ErrorBoundary> <EditProductSpec /> </ErrorBoundary>,
  };

  const baseTitlesMap: Record<string, string> = {
    account: "Account",
    machineType: "Machine Type",
    machine: "Machine",
    step: "Step",
    machineOperator: "Machine Operator",
    DeviceAccess: "Device Access",
    Access: "Access",
    products: "Edit Products",
    productCategories: "Product Categories",
    materials: "Materials",
    materialsCategories: "Materials Categories",
    formula: "Edit Formula",
    productSpec: "Edit Product Spec"
  };

  if (userRole === "manager") {
    baseComponentsMap["updatePassword"] = <UpdataIDAndPassword />;
    baseTitlesMap["updatePassword"] = "Update ID & Password";
  }

  const componentsMap = baseComponentsMap;


  // Flatten all items for navigation
  const menuItems = menuSections.flatMap(section => section.items);

 

  useEffect(() => {
    buttonRefs.current[selectedIndex]?.focus();
  }, [selectedIndex]);

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
      setActiveComponent(menuItems[index].key);
    }
  };




  return (
    <div className="container" style={{ marginTop: 0 }}>
      {/* Header with conditional back button */}
      <div className="item menu-header" style={{ gridColumn: "1 / -1" }}>
       <Headers 
  // title={title}
  // showBackButton={true}
  // onBackClick={handleBackFromChild}
/>
      </div>

      {/* Sidebar */}
      <div className="item">
        <div className="menu-container-create">
          <div className="menu-header-padding">
            <ul id="main-menu" style={{ listStyle: "none", padding: 0 }}>
              {menuSections.map((section, sectionIndex) => {
                const isExpanded = expandedSections[section.title];
                const hasMultipleItems = section.items.length > 1;

                return (
                  <div key={section.title}>
                    {/* Section Title - Clickable if multiple items */}
                    <div
                      onClick={() => hasMultipleItems && toggleSection(section.title)}
                      style={{
                        padding: "8px 10px",
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                        color: "#6b7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginTop: sectionIndex > 0 ? "10px" : "0",
                        cursor: hasMultipleItems ? "pointer" : "default",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        userSelect: "none"
                      }}
                    >
                      <span>{section.title}</span>
                      {hasMultipleItems && (
                        <span style={{
                          fontSize: "1rem",
                          transition: "transform 0.2s ease",
                          transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)"
                        }}>
                          ▼
                        </span>
                      )}
                    </div>

                    {/* Section Items - Collapsible */}
                    <div style={{
                      maxHeight: isExpanded ? "1000px" : "0",
                      overflow: "hidden",
                      transition: "max-height 0.3s ease-in-out"
                    }}>
                      {section.items.map((item) => {
                        const globalIndex = menuItems.findIndex(mi => mi.key === item.key);
                        return (
                          <div
                            key={item.key}
                            className={`menu-item-wrapper ${selectedIndex === globalIndex ? "selected" : ""}`}
                          >
                            <li
                              ref={(el) => (buttonRefs.current[globalIndex] = el)}
                              tabIndex={0}
                              onClick={() => {
                                setActiveComponent(item.key);
                                setSelectedIndex(globalIndex);
                              }}
                              onKeyDown={(e) => handleKeyDown(e, globalIndex)}
                              style={{
                                outline: "none",
                                borderRadius: "24px",
                                cursor: "pointer",
                                fontWeight: 900,
                                textAlign: "center"
                              }}
                            >
                              {item.label}
                            </li>
                          </div>
                        );
                      })}
                    </div>

                    {/* Section Divider */}
                    {sectionIndex < menuSections.length - 1 && (
                      <div style={{
                        height: "1px",
                        background: "#e5e7eb",
                        margin: "8px 10px"
                      }} />
                    )}
                  </div>
                );
              })}
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