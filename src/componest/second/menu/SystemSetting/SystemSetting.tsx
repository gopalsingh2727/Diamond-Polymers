import React, { useState, useEffect, useRef } from "react";
import CreateBranch from "./create/createBranch";
import CreateManager from "./create/createManger";
import CreateAdmin from "./create/createAdmin";
import AllSeeMangerAndEdit from "./edit/editManger";
import SeeAllAdminAndEdit from "./edit/editAdmin";
import SeeAllBranchAndEdit from "./edit/editBranch";


import "../../../main/sidebar/menu.css";
import ErrorBoundary from "../../../error/error";
import { BackButton } from "../../../allCompones/BackButton";

const SystemSetting = () => {
  const [activeComponent, setActiveComponent] = useState("createBranch");
  const [title, setTitle] = useState("Create Branch"); 
  const buttonRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const menuItems = [
    { key: "createBranch", label: "Create Branch" },
    { key: "createManager", label: "Create Manager" },
    { key: "createAdmin", label: "Create Admin" },
    { key: "editBranch", label: "Edit Branch" },
    { key: "editManager", label: "Edit Manager" },
    { key: "editAdmin", label: "Edit Admin" },
  ];

  useEffect(() => {
    const titles: Record<string, string> = {
      createBranch: "Create Branch",
      createManager: "Create Manager",
      createAdmin: "Create Admin",
      editBranch: "Edit Branch",
      editManager: "Edit Manager",
      editAdmin: "Edit Admin",
    };
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
      const component = menuItems[index].key;
      setActiveComponent(component);
    }
  };

  const renderContent = () => {
    switch (activeComponent) {
      case "createBranch":
        return (
          <ErrorBoundary>
            <CreateBranch />
          </ErrorBoundary>
        );
      case "createManager":
        return (
          <ErrorBoundary>
            <CreateManager />
          </ErrorBoundary>
        );
      case "createAdmin":
        return (
          <ErrorBoundary>
            <CreateAdmin />
          </ErrorBoundary>
        );
      case "editBranch":
        return (
          <ErrorBoundary>
            <SeeAllBranchAndEdit />
          </ErrorBoundary>
        );
      case "editManager":
        return (
          <ErrorBoundary>
            <AllSeeMangerAndEdit />
          </ErrorBoundary>
        );
      case "editAdmin":
        return (
          <ErrorBoundary>
            <SeeAllAdminAndEdit />
          </ErrorBoundary>
        );
      default:
        return <div>Select an option</div>;
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <div className="item menu-header" style={{ gridColumn: "1 / -1" }}>
        <BackButton/>
      </div>

      {/* Sidebar Menu */}
      <div className="item">
        <h2>{title}</h2>
        <div className="menu-container-create">
          <div className="menu-header-padding">
            <ul id="main-menu" style={{ listStyle: "none", padding: 0 }}>
              {menuItems.map((item, index) => (
                <div
                  key={item.key}
                  className={`menu-item-wrapper ${
                    selectedIndex === index ? "selected" : ""
                  } ${index === 2 || index === 4 ? "bottom-borders-menu" : ""}`}
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
                      textAlign: "center",
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
      <div className="item menu-content">{renderContent()}</div>

      {/* Footer */}
      <div className="item menu-footer" style={{ gridColumn: "1 / -1" }}>
        © 2024 Your Company Name. All rights reserved.
      </div>
    </div>
  );
};

export default SystemSetting;