import React, { useState, useEffect, useRef } from "react";
import CreateAccount from "./createNewAccount/createNewAccount";
import CreateMachine from "./machine/CreateMachine";
import CreateStep from "./CreateStep/CreateStep";
import CreteMachineOpertor from "./CreateMachineOpertor/CreteMachineOpertor";
import CreateMachineType from "./machine/createMachineType";
import Headers from "../../header/Headers";
import  DeviceAccess from './deviceAccess/deviceAccess';
import DiveceAccessCreate from "./deviceAccess/deviceAccessCreate";
import CreateOrderType from "./orderType/CreateOrderType";
import CreatePrintType from "./printType/CreatePrintType";
import CreateExcelExportType from "./excelExportType/CreateExcelExportType";
import CreateReportType from "./reportType/CreateReportType";
import CreateOptionType from "./optionType/CreateOptionType";
import CreateOption from "./option/CreateOption";
import CreateOptionSpec from "./optionSpec/CreateOptionSpec";
import CreateCategory from "./category/CreateCategory";
import ViewTemplateWizard from "./machine/ViewTemplateWizard";
import OperatorEntryView from "./machine/OperatorEntryView";
import CustomerCategory from "./customerCategory/CustomerCategory";
import CustomerParentCompany from "./customerParentCompany/CustomerParentCompany";
import './create.css';
import '../../../main/sidebar/menu.css';
import ErrorBoundary from '../../../error/error';

const Layout = () => {
  const menuSections = [
    {
      title: "Account",
      items: [
        { key: "account", label: "Create Account" },
        { key: "customerCategory", label: "Customer Category" },
        { key: "customerParentCompany", label: "Parent Company" }
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
      title: "Device Access",
      items: [
        { key: "Create Device Access", label: "Create Device Access" },
        { key: "Create Access", label: "Create Access" }
      ]
    },
    {
      title: "Options System",
      items: [
        { key: "category", label: "Create Category" },
        { key: "optionType", label: "Create Option Type" },
        { key: "optionSpec", label: "Create Option Spec" },
        { key: "option", label: "Create Option" }
      ]
    },
    {
      title: "Order Management",
      items: [
        { key: "orderType", label: "Create Order Type" },
        { key: "printType", label: "Create Print Type" },
        { key: "excelExportType", label: "Create Excel Export Type" },
        { key: "reportType", label: "Create Report Type" },
        { key: "viewTemplate", label: "View Template" },

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
    "Device Access": false,
    "Options System": true,
    "Order Management": false
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
      case "customerCategory":
        return <ErrorBoundary><CustomerCategory /></ErrorBoundary>;
      case "customerParentCompany":
        return <ErrorBoundary><CustomerParentCompany /></ErrorBoundary>;
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
      case "category":
        return <ErrorBoundary><CreateCategory /></ErrorBoundary>;
      case "optionType":
        return <ErrorBoundary><CreateOptionType /></ErrorBoundary>;
      case "optionSpec":
        return <ErrorBoundary><CreateOptionSpec /></ErrorBoundary>;
      case "option":
        return <ErrorBoundary><CreateOption /></ErrorBoundary>;
      case "orderType":
        return <CreateOrderType />
      case "printType":
        return <ErrorBoundary><CreatePrintType /></ErrorBoundary>;
      case "excelExportType":
        return <ErrorBoundary><CreateExcelExportType /></ErrorBoundary>;
      case "reportType":
        return <ErrorBoundary><CreateReportType /></ErrorBoundary>;
      case "viewTemplate":
        return <ErrorBoundary><ViewTemplateWizard /></ErrorBoundary>;
 
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
        © 2025 27infinity. All rights reserved.
      </div>
    </div>
  );
};

export default Layout;