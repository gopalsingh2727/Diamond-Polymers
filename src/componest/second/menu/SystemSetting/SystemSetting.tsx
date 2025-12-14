import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import CreateBranch from "./create/createBranch";
import CreateManager from "./create/createManger";
import CreateAdmin from "./create/createAdmin";
import AllSeeMangerAndEdit from "./edit/editManger";
import SeeAllAdminAndEdit from "./edit/editAdmin";
import SeeAllBranchAndEdit from "./edit/editBranch";


import "../../../main/sidebar/menu.css";
import ErrorBoundary from "../../../error/error";
import { BackButton } from "../../../allCompones/BackButton";

interface RootState {
  auth: {
    userData: {
      role?: string;
    } | null;
  };
}

const SystemSetting = () => {
  // Get user role from auth state
  const userData = useSelector((state: RootState) => state.auth.userData);
  const userRole = userData?.role || '';
  const isMasterAdmin = userRole === 'master_admin';

  // All possible menu items with role restrictions
  const allMenuItems = [
    { key: "createBranch", label: "Create Branch", masterAdminOnly: true, section: "create" },
    { key: "createManager", label: "Create Manager", masterAdminOnly: true, section: "create" },
    { key: "createAdmin", label: "Create Admin", masterAdminOnly: true, section: "create" },
    { key: "editBranch", label: "Edit Branch", masterAdminOnly: false, section: "edit" },
    { key: "editManager", label: "Edit Manager", masterAdminOnly: false, section: "edit" },
    { key: "editAdmin", label: "Edit Admin", masterAdminOnly: false, section: "edit" },
  ];

  // Filter menu items based on user role
  const menuItems = useMemo(() => {
    return allMenuItems.filter(item => !item.masterAdminOnly || isMasterAdmin);
  }, [isMasterAdmin]);

  // Set default active component based on available menu items
  const defaultComponent = menuItems.length > 0 ? menuItems[0].key : "editBranch";

  const [activeComponent, setActiveComponent] = useState(defaultComponent);
  const [title, setTitle] = useState(menuItems.length > 0 ? menuItems[0].label : "Edit Branch");
  const buttonRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset to first available menu item when role changes or on mount
  useEffect(() => {
    if (menuItems.length > 0) {
      const currentComponentExists = menuItems.some(item => item.key === activeComponent);
      if (!currentComponentExists) {
        setActiveComponent(menuItems[0].key);
        setSelectedIndex(0);
      }
    }
  }, [menuItems, activeComponent]);

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
              {menuItems.map((item, index) => {
                // Add bottom border when next item is in a different section
                const nextItem = menuItems[index + 1];
                const showSectionBorder = nextItem && nextItem.section !== item.section;

                return (
                <div
                  key={item.key}
                  className={`menu-item-wrapper ${
                    selectedIndex === index ? "selected" : ""
                  } ${showSectionBorder ? "bottom-borders-menu" : ""}`}
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
              );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="item menu-content">{renderContent()}</div>

      {/* Footer */}
      <div className="item menu-footer" style={{ gridColumn: "1 / -1" }}>
        © 2025 27infinity. All rights reserved.
      </div>
    </div>
  );
};

export default SystemSetting;