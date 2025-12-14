import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ErrorBoundary from "../../../error/error";
import Headers from "../../header/Headers";
import "../create/create.css";
import "../../../main/sidebar/menu.css";

// ========== LIST ONLY Components (for showing lists) ==========
import EditNewAccount from "./EditNewAccount/EditNewAccount";
import EditMachineList from "./EditMachine/EditMachineList";
import EditMachineTypeList from "./EditMachineType/EditMachineTypeList";
import EditMachineOperatorList from "./EditMachineOpertor/EditMachineOperatorList";
import EditStepList from "./EditCreateStep/EditStepList";
import EditDeviceAccess from "./EditDeviceAccess/EditDeviceAccess";
import EditAccessListOnly from "./EditDeviceAccess/EditAccessListOnly";
import EditCategoryListOnly from "./EditCategory/EditCategoryListOnly";
import EditOptionTypeListOnly from "./EditOptionType/EditOptionTypeListOnly";
import EditOptionListOnly from "./EditOption/EditOptionListOnly";
import EditOptionSpecList from "./EditOptionSpec/EditOptionSpecList";
import EditOrderTypeList from "./EditOrderType/EditOrderTypeList";
import EditMachineTemplateList from "./EditMachineTemplate/EditMachineTemplateList";
import EditPrintTypeList from "./EditPrintType/EditPrintTypeList";
import EditExcelExportTypeList from "./EditExcelExportType/EditExcelExportTypeList";
import UpdataIDAndPassword from "./UpdataIDandPassword/UpdataIDAndPassword";

// ========== CREATE Components (reused for both Create & Edit) ==========
import CreateNewAccount from "../create/createNewAccount/createNewAccount";
import CreateMachine from "../create/machine/CreateMachine";
import CreateMachineType from "../create/machine/createMachineType";
import CreateMachineOperator from "../create/CreateMachineOpertor/CreteMachineOpertor";
import CreateStep from "../create/CreateStep/CreateStep";
import CreateCategory from "../create/category/CreateCategory";
import CreateOptionType from "../create/optionType/CreateOptionType";
import CreateOption from "../create/option/CreateOption";
import CreateOrderType from "../create/orderType/CreateOrderType";
import CreatePrintType from "../create/printType/CreatePrintType";
import CreateExcelExportType from "../create/excelExportType/CreateExcelExportType";
import ViewTemplateWizard from "../create/machine/ViewTemplateWizard";
import DeviceAccessCreate from "../create/deviceAccess/deviceAccessCreate";

interface LocationStateType {
  editMode?: boolean;
  editData?: any;
  editType?: string;
  activeComponent?: string;
}

interface EditState {
  editMode: boolean;
  editData: any;
  editType: string;
}

const EditIndex = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as LocationStateType | null;

  const [activeComponent, setActiveComponent] = useState("account");
  const [editState, setEditState] = useState<EditState | null>(null);
  const buttonRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const userRole = useSelector((state: any) => state.auth.userData?.role);

  useEffect(() => {
    if (locationState?.editMode && locationState?.editData) {
      setEditState({
        editMode: true,
        editData: locationState.editData,
        editType: locationState.editType || activeComponent
      });
      if (locationState.editType) {
        setActiveComponent(locationState.editType);
      }
      navigate(location.pathname, { replace: true, state: null });
    } else if (locationState?.activeComponent) {
      setEditState(null);
      setActiveComponent(locationState.activeComponent);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [locationState]);

  const clearEditState = () => {
    setEditState(null);
  };

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "Accounting": true,
    "Machine Management": false,
    "Device Access": false,
    "Options System": false,
    "Order Management": false
  });

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => {
      const newState: Record<string, boolean> = {};
      Object.keys(prev).forEach(key => { newState[key] = false; });
      newState[sectionTitle] = !prev[sectionTitle];
      return newState;
    });
  };

  const menuSections = [
    { title: "Accounting", items: [{ key: "account", label: "Account" }] },
    { title: "Machine Management", items: [
      { key: "machineType", label: "Machine Type" },
      { key: "machine", label: "Machine" },
      { key: "machineTemplate", label: "Machine Template" },
      { key: "step", label: "Step" },
      { key: "machineOperator", label: "Machine Operator" }
    ]},
    { title: "Device Access", items: [
      { key: "DeviceAccess", label: "Device Access" },
      { key: "Access", label: "Access" }
    ]},
    { title: "Options System", items: [
      { key: "category", label: "Category" },
      { key: "optionType", label: "Option Type" },
      { key: "option", label: "Option" },
      { key: "optionSpec", label: "Option Spec" }
    ]},
    { title: "Order Management", items: [
      { key: "orderType", label: "Order Type" },
      { key: "printType", label: "Print Type" },
      { key: "excelExportType", label: "Excel Export Type" }
    ]}
  ];

  if (userRole === "manager") {
    menuSections.push({ title: "Settings", items: [{ key: "updatePassword", label: "Update ID & Password" }] });
  }

  // ========== RENDER: Edit mode shows Create component, otherwise shows List ==========
  const renderComponent = (key: string) => {
    // If in edit mode, show the CREATE component with initialData
    if (editState?.editMode && editState?.editType === key) {
      switch (key) {
        case 'account':
          return <ErrorBoundary><CreateNewAccount initialData={editState.editData} onCancel={clearEditState} onSaveSuccess={clearEditState} /></ErrorBoundary>;
        case 'machine':
          return <ErrorBoundary><CreateMachine initialData={editState.editData} onCancel={clearEditState} onSaveSuccess={clearEditState} /></ErrorBoundary>;
        case 'machineType':
          return <ErrorBoundary><CreateMachineType initialData={editState.editData} onCancel={clearEditState} onSaveSuccess={clearEditState} /></ErrorBoundary>;
        case 'machineOperator':
          return <ErrorBoundary><CreateMachineOperator initialData={editState.editData} onCancel={clearEditState} onSaveSuccess={clearEditState} /></ErrorBoundary>;
        case 'step':
          return <ErrorBoundary><CreateStep initialData={editState.editData} onCancel={clearEditState} onSaveSuccess={clearEditState} /></ErrorBoundary>;
        case 'category':
          return <ErrorBoundary><CreateCategory initialData={editState.editData} onCancel={clearEditState} onSaveSuccess={clearEditState} /></ErrorBoundary>;
        case 'optionType':
          return <ErrorBoundary><CreateOptionType initialData={editState.editData} onCancel={clearEditState} onSaveSuccess={clearEditState} /></ErrorBoundary>;
        case 'option':
          return <ErrorBoundary><CreateOption initialData={editState.editData} onCancel={clearEditState} onSaveSuccess={clearEditState} /></ErrorBoundary>;
        case 'orderType':
          return <ErrorBoundary><CreateOrderType initialData={editState.editData} onCancel={clearEditState} onSaveSuccess={clearEditState} /></ErrorBoundary>;
        case 'printType':
          return <ErrorBoundary><CreatePrintType initialData={editState.editData} onCancel={clearEditState} onSaveSuccess={clearEditState} /></ErrorBoundary>;
        case 'excelExportType':
          return <ErrorBoundary><CreateExcelExportType initialData={editState.editData} onCancel={clearEditState} onSaveSuccess={clearEditState} /></ErrorBoundary>;
        case 'machineTemplate':
          return <ErrorBoundary><ViewTemplateWizard initialData={editState.editData} onCancel={clearEditState} onSaveSuccess={clearEditState} /></ErrorBoundary>;
        case 'Access':
          return <ErrorBoundary><DeviceAccessCreate initialData={editState.editData} onCancel={clearEditState} onSaveSuccess={clearEditState} /></ErrorBoundary>;
        default:
          break;
      }
    }

    // Default: show LIST view with onEdit callback
    const setEdit = (type: string) => (data: any) => setEditState({ editMode: true, editData: data, editType: type });

    const baseComponentsMap: Record<string, JSX.Element> = {
      account: <ErrorBoundary><EditNewAccount onEdit={setEdit('account')} /></ErrorBoundary>,
      machineType: <ErrorBoundary><EditMachineTypeList onEdit={setEdit('machineType')} /></ErrorBoundary>,
      machine: <ErrorBoundary><EditMachineList onEdit={setEdit('machine')} /></ErrorBoundary>,
      step: <ErrorBoundary><EditStepList onEdit={setEdit('step')} /></ErrorBoundary>,
      machineOperator: <ErrorBoundary><EditMachineOperatorList onEdit={setEdit('machineOperator')} /></ErrorBoundary>,
      DeviceAccess: <ErrorBoundary><EditDeviceAccess /></ErrorBoundary>,
      Access: <ErrorBoundary><EditAccessListOnly onEdit={setEdit('Access')} /></ErrorBoundary>,
      category: <ErrorBoundary><EditCategoryListOnly onEdit={setEdit('category')} /></ErrorBoundary>,
      optionType: <ErrorBoundary><EditOptionTypeListOnly onEdit={setEdit('optionType')} /></ErrorBoundary>,
      option: <ErrorBoundary><EditOptionListOnly onEdit={setEdit('option')} /></ErrorBoundary>,
      optionSpec: <ErrorBoundary><EditOptionSpecList /></ErrorBoundary>,
      orderType: <ErrorBoundary><EditOrderTypeList onEdit={setEdit('orderType')} /></ErrorBoundary>,
      printType: <ErrorBoundary><EditPrintTypeList /></ErrorBoundary>,
      excelExportType: <ErrorBoundary><EditExcelExportTypeList /></ErrorBoundary>,
      machineTemplate: <ErrorBoundary><EditMachineTemplateList onEdit={setEdit('machineTemplate')} /></ErrorBoundary>
    };

    if (userRole === "manager") {
      baseComponentsMap["updatePassword"] = <UpdataIDAndPassword />;
    }

    return baseComponentsMap[key] || <div>Select an option</div>;
  };

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
      clearEditState();
    }
  };

  return (
    <div className="container" style={{ marginTop: 0 }}>
      <div className="item menu-header" style={{ gridColumn: "1 / -1" }}>
        <Headers />
      </div>

      <div className="item">
        <div className="menu-container-create">
          <div className="menu-header-padding">
            <ul id="main-menu" style={{ listStyle: "none", padding: 0 }}>
              {menuSections.map((section, sectionIndex) => {
                const isExpanded = expandedSections[section.title];
                const hasMultipleItems = section.items.length > 1;

                return (
                  <div key={section.title}>
                    <div
                      onClick={() => {
                        if (hasMultipleItems) {
                          toggleSection(section.title);
                        } else {
                          const item = section.items[0];
                          const globalIndex = menuItems.findIndex(mi => mi.key === item.key);
                          setActiveComponent(item.key);
                          setSelectedIndex(globalIndex);
                          setExpandedSections(prev => {
                            const newState: Record<string, boolean> = {};
                            Object.keys(prev).forEach(key => { newState[key] = false; });
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
                                clearEditState();
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

                    {sectionIndex < menuSections.length - 1 && (
                      <div style={{ height: "1px", background: "#e5e7eb", margin: "8px 10px" }} />
                    )}
                  </div>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      <div className="item menu-content">
        {renderComponent(activeComponent)}
      </div>

      <div className="item menu-footer" style={{ gridColumn: "1 / -1" }}>
        © 2025 27infinity. All rights reserved.
      </div>
    </div>
  );
};

export default EditIndex;
