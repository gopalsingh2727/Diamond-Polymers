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
import CreateFormula from "./formula/CreateFormula";
import CreateProductSpec from "./productSpec/CreateProductSpec";
import CreateMaterialSpec from "./materialSpec/CreateMaterialSpec";
import CreateOrderType from "./orderType/CreateOrderType";
import './create.css';
import '../../../main/sidebar/menu.css';
import ErrorBoundary from '../../../error/error';
import Products from "./products/products";
import ProductCategories from "./products/productsCategories";

const Layout = () => {
  const menuSections = [
    {
      title: "Account",
      items: [
        { key: "account", label: "Create Account" }
      ]
    },
    {
      title: "Machine Management",
      items: [
        { key: "machineType", label: "Create Machine Type" },
        { key: "machine", label: "Create Machine" },
        { key: "step", label: "Create Step" },
        { key: "Create Machine Operator", label: "Create Machine Operator" }
      ]
    },
    {
      title: "Products & Materials",
      items: [
        { key: "products", label: "Products" },
        { key: "categories", label: "Product Categories" },
        { key: "materials", label: "Create Materials" },
        { key: "materialsCategories", label: "Materials Categories" }
      ]
    },
    {
      title: "Device Access",
      items: [
        { key: "Create Device Access", label: "Create Device Access" },
        { key: "Create Access", label: "Create Access" }
      ]
    },
    {
      title: "Specifications",
      items: [
        { key: "productSpec", label: "Create Product Spec" },
        { key: "materialSpec", label: "Create Material Spec" },
        { key: "orderType", label: "Create Order Type" }
      ]
    },
    {
      title: "Formulas & Calculations",
      items: [
        { key: "formula", label: "Create Formula" }
      ]
    }
  ];

  // Flatten all items for navigation
  const menuItems = menuSections.flatMap(section => section.items);

  const [activeComponent, setActiveComponent] = useState("account");

  const buttonRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Track which sections are expanded (default: all collapsed except Account)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "Account": true,
    "Machine Management": false,
    "Products & Materials": false,
    "Device Access": false,
    "Specifications": true,
    "Formulas & Calculations": true
  });

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => {
      // Close all sections first, then toggle the clicked one (accordion behavior)
      const newState: Record<string, boolean> = {};
      Object.keys(prev).forEach(key => {
        newState[key] = false;
      });
      // Toggle the clicked section (if it was closed, open it; if open, close it)
      newState[sectionTitle] = !prev[sectionTitle];
      return newState;
    });
  };

  useEffect(() => {
    const titles: Record<string, string> = {};
    menuItems.forEach(item => {
      titles[item.key] = item.label;
    });
   
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
      case "products":
        return <ErrorBoundary><Products /></ErrorBoundary>;
      case "categories":
        return <ErrorBoundary><ProductCategories/></ErrorBoundary>;
      case "materials":
        return <ErrorBoundary><CreateMaterials /></ErrorBoundary>;
      case "materialsCategories":
        return <ErrorBoundary><MaterialsCategories /></ErrorBoundary>;
      case "formula":
        return <ErrorBoundary><CreateFormula /></ErrorBoundary>;
      case "productSpec":
        return <ErrorBoundary><CreateProductSpec /></ErrorBoundary>;
      case "materialSpec":
        return <ErrorBoundary><CreateMaterialSpec /></ErrorBoundary>;
      case "orderType":
        return <ErrorBoundary><CreateOrderType /></ErrorBoundary>;
      default:
        return <div>Select an option</div>;
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <div className="item menu-header" style={{ gridColumn: "1 / -1" }}>
        <Headers  />
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
                    {/* Section Title - Clickable */}
                    <div
                      onClick={() => {
                        if (hasMultipleItems) {
                          toggleSection(section.title);
                        } else {
                          // For single-item sections, select the item directly
                          const item = section.items[0];
                          const globalIndex = menuItems.findIndex(mi => mi.key === item.key);
                          setActiveComponent(item.key);
                          setSelectedIndex(globalIndex);
                          // Close all multi-item sections
                          setExpandedSections(prev => {
                            const newState: Record<string, boolean> = {};
                            Object.keys(prev).forEach(key => {
                              newState[key] = false;
                            });
                            return newState;
                          });
                        }
                      }}
                      style={{
                        padding: "8px 10px",
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                        color: "#6b7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginTop: sectionIndex > 0 ? "10px" : "0",
                        cursor: "pointer",
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