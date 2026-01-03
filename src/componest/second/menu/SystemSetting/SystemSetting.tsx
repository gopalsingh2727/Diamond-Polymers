import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import CreateBranch from "./create/createBranch";
import CreateManager from "./create/createManger";
import CreateAdmin from "./create/createAdmin";
import CreateEmployee from "./create/createEmployee/CreateEmployee";
import AllSeeMangerAndEdit from "./edit/editManger";
import SeeAllAdminAndEdit from "./edit/editAdmin";
import SeeAllBranchAndEdit from "./edit/editBranch";
import EditEmployeeList from "./edit/editEmployee";
import PayrollDashboard from "./Payroll/PayrollDashboard";


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

  // SVG Icons for menu items
  const getIcon = (key: string) => {
    const icons: Record<string, JSX.Element> = {
      createBranch: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
      createManager: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      createAdmin: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      ),
      createEmployee: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
          <line x1="12" y1="11" x2="12" y2="17"/>
          <line x1="9" y1="14" x2="15" y2="14"/>
        </svg>
      ),
      editBranch: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      ),
      editManager: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
        </svg>
      ),
      editAdmin: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
      ),
      editEmployee: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="5"/>
          <path d="M20 21a8 8 0 1 0-16 0"/>
          <line x1="12" y1="13" x2="12" y2="21"/>
        </svg>
      ),
      payroll: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
    };
    return icons[key] || null;
  };

  // All possible menu items with role restrictions
  const allMenuItems = [
    { key: "createBranch", label: "Create Branch", masterAdminOnly: true, section: "create" },
    { key: "createManager", label: "Create Manager", masterAdminOnly: true, section: "create" },
    { key: "createAdmin", label: "Create Admin", masterAdminOnly: true, section: "create" },
    { key: "createEmployee", label: "Create Employee", masterAdminOnly: false, section: "create" },
    { key: "editBranch", label: "Edit Branch", masterAdminOnly: false, section: "edit" },
    { key: "editManager", label: "Edit Manager", masterAdminOnly: false, section: "edit" },
    { key: "editAdmin", label: "Edit Admin", masterAdminOnly: false, section: "edit" },
    { key: "editEmployee", label: "Edit Employee", masterAdminOnly: false, section: "edit" },
    { key: "payroll", label: "Payroll", masterAdminOnly: false, section: "payroll" },
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
      createEmployee: "Create Employee",
      editBranch: "Edit Branch",
      editManager: "Edit Manager",
      editAdmin: "Edit Admin",
      editEmployee: "Edit Employee",
      payroll: "Payroll",
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
      case "createEmployee":
        return (
          <ErrorBoundary>
            <CreateEmployee />
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
      case "editEmployee":
        return (
          <ErrorBoundary>
            <EditEmployeeList />
          </ErrorBoundary>
        );
      case "payroll":
        return (
          <ErrorBoundary>
            <PayrollDashboard />
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
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    {getIcon(item.key)}
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
