import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ErrorBoundary from "../../../error/error";

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
import EditCustomerCategoryList from "./EditCustomerCategory/EditCustomerCategoryList";
import EditParentCompanyList from "./EditParentCompany/EditParentCompanyList";
import EditInventoryList from "./EditInventory/EditInventoryList";
import EditReportTypeList from "./EditReportType/EditReportTypeList";
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
import CustomerCategory from "../create/customerCategory/CustomerCategory";
import CustomerParentCompany from "../create/customerParentCompany/CustomerParentCompany";
import CreateInventory from "../create/inventory/CreateInventory";
import CreateReportType from "../create/reportType/CreateReportType";
import { BackButton } from "@/componest/allCompones/BackButton";
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
  const [componentKey, setComponentKey] = useState(0); // Force re-render on branch change
  const userRole = useSelector((state: any) => state.auth.userData?.role);
  const selectedBranch = useSelector((state: any) => state.auth.userData?.selectedBranch);

  // Listen for branch changes and force refresh
  useEffect(() => {
    if (selectedBranch) {
      // Clear edit state and force re-render when branch changes
      setEditState(null);
      setComponentKey(prev => prev + 1);
      console.log('🔄 Edit lists refreshing for new branch:', selectedBranch);
    }
  }, [selectedBranch]);

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
    "Order Management": false,
    "Report": false
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
    { title: "Accounting", items: [
      { key: "account", label: "Account" },
      { key: "customerCategory", label: "Customer Category" },
      { key: "parentCompany", label: "Parent Company" }
    ]},
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
      { key: "inventory", label: "Inventory" },
      { key: "printType", label: "Print Type" },
      { key: "excelExportType", label: "Excel Export Type" }
    ]},
    { title: "Report", items: [
      { key: "reportType", label: "Report Type" }
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
          return <ErrorBoundary key={`edit-account-${componentKey}`}><CreateNewAccount initialData={editState.editData} onCancel={clearEditState} onSaveSuccess={clearEditState} /></ErrorBoundary>;
        case 'customerCategory':
          return <ErrorBoundary key={`edit-customerCategory-${componentKey}`}><CustomerCategory initialData={editState.editData} onCancel={clearEditState} onSaveSuccess={clearEditState} /></ErrorBoundary>;
        case 'parentCompany':
          return <ErrorBoundary key={`edit-parentCompany-${componentKey}`}><CustomerParentCompany initialData={editState.editData} onCancel={clearEditState} onSaveSuccess={clearEditState} /></ErrorBoundary>;
        case 'machine':
          return <ErrorBoundary key={`edit-machine-${componentKey}`}><CreateMachine initialData={editState.editData} onCancel={clearEditState} onSaveSuccess={clearEditState} /></ErrorBoundary>;
        case 'machineType':
          return <ErrorBoundary key={`edit-machineType-${componentKey}`}><CreateMachineType initialData={editState.editData} onCancel={clearEditState} onSaveSuccess={clearEditState} /></ErrorBoundary>;
        case 'machineOperator':
          return <ErrorBoundary key={`edit-machineOperator-${componentKey}`}><CreateMachineOperator initialData={editState.editData} onCancel={clearEditState} onSaveSuccess={clearEditState} /></ErrorBoundary>;
        case 'step':
          return <ErrorBoundary key={`edit-step-${componentKey}`}><CreateStep initialData={editState.editData} onCancel={clearEditState} onSaveSuccess={clearEditState} /></ErrorBoundary>;
        case 'category':
          return <ErrorBoundary key={`edit-category-${componentKey}`}><CreateCategory initialData={editState.editData} onCancel={clearEditState} onSaveSuccess={clearEditState} /></ErrorBoundary>;
        case 'optionType':
          return <ErrorBoundary key={`edit-optionType-${componentKey}`}><CreateOptionType initialData={editState.editData} onCancel={clearEditState} onSaveSuccess={clearEditState} /></ErrorBoundary>;
        case 'option':
          return <ErrorBoundary key={`edit-option-${componentKey}`}><CreateOption initialData={editState.editData} onCancel={clearEditState} onSaveSuccess={clearEditState} /></ErrorBoundary>;
        case 'orderType':
          return <ErrorBoundary key={`edit-orderType-${componentKey}`}><CreateOrderType initialData={editState.editData} onCancel={clearEditState} onSaveSuccess={clearEditState} /></ErrorBoundary>;
        case 'printType':
          return <ErrorBoundary key={`edit-printType-${componentKey}`}><CreatePrintType initialData={editState.editData} onCancel={clearEditState} onSaveSuccess={clearEditState} /></ErrorBoundary>;
        case 'excelExportType':
          return <ErrorBoundary key={`edit-excelExportType-${componentKey}`}><CreateExcelExportType initialData={editState.editData} onCancel={clearEditState} onSaveSuccess={clearEditState} /></ErrorBoundary>;
        case 'inventory':
          return <ErrorBoundary key={`edit-inventory-${componentKey}`}><CreateInventory initialData={editState.editData} onCancel={clearEditState} onSaveSuccess={clearEditState} /></ErrorBoundary>;
        case 'reportType':
          return <ErrorBoundary key={`edit-reportType-${componentKey}`}><CreateReportType initialData={editState.editData} onCancel={clearEditState} onSaveSuccess={clearEditState} /></ErrorBoundary>;
        case 'machineTemplate':
          return <ErrorBoundary key={`edit-machineTemplate-${componentKey}`}><ViewTemplateWizard initialData={editState.editData} onCancel={clearEditState} onSaveSuccess={clearEditState} /></ErrorBoundary>;
        case 'Access':
          return <ErrorBoundary key={`edit-Access-${componentKey}`}><DeviceAccessCreate initialData={editState.editData} onCancel={clearEditState} onSaveSuccess={clearEditState} /></ErrorBoundary>;
        default:
          break;
      }
    }

    // Default: show LIST view with onEdit callback
    const setEdit = (type: string) => (data: any) => setEditState({ editMode: true, editData: data, editType: type });

    const baseComponentsMap: Record<string, JSX.Element> = {
      account: <ErrorBoundary key={`account-${componentKey}`}><EditNewAccount onEdit={setEdit('account')} /></ErrorBoundary>,
      customerCategory: <ErrorBoundary key={`customerCategory-${componentKey}`}><EditCustomerCategoryList onEdit={setEdit('customerCategory')} /></ErrorBoundary>,
      parentCompany: <ErrorBoundary key={`parentCompany-${componentKey}`}><EditParentCompanyList onEdit={setEdit('parentCompany')} /></ErrorBoundary>,
      machineType: <ErrorBoundary key={`machineType-${componentKey}`}><EditMachineTypeList onEdit={setEdit('machineType')} /></ErrorBoundary>,
      machine: <ErrorBoundary key={`machine-${componentKey}`}><EditMachineList onEdit={setEdit('machine')} /></ErrorBoundary>,
      step: <ErrorBoundary key={`step-${componentKey}`}><EditStepList onEdit={setEdit('step')} /></ErrorBoundary>,
      machineOperator: <ErrorBoundary key={`machineOperator-${componentKey}`}><EditMachineOperatorList onEdit={setEdit('machineOperator')} /></ErrorBoundary>,
      DeviceAccess: <ErrorBoundary key={`DeviceAccess-${componentKey}`}><EditDeviceAccess /></ErrorBoundary>,
      Access: <ErrorBoundary key={`Access-${componentKey}`}><EditAccessListOnly onEdit={setEdit('Access')} /></ErrorBoundary>,
      category: <ErrorBoundary key={`category-${componentKey}`}><EditCategoryListOnly onEdit={setEdit('category')} /></ErrorBoundary>,
      optionType: <ErrorBoundary key={`optionType-${componentKey}`}><EditOptionTypeListOnly onEdit={setEdit('optionType')} /></ErrorBoundary>,
      option: <ErrorBoundary key={`option-${componentKey}`}><EditOptionListOnly onEdit={setEdit('option')} /></ErrorBoundary>,
      optionSpec: <ErrorBoundary key={`optionSpec-${componentKey}`}><EditOptionSpecList /></ErrorBoundary>,
      orderType: <ErrorBoundary key={`orderType-${componentKey}`}><EditOrderTypeList onEdit={setEdit('orderType')} /></ErrorBoundary>,
      inventory: <ErrorBoundary key={`inventory-${componentKey}`}><EditInventoryList onEdit={setEdit('inventory')} /></ErrorBoundary>,
      reportType: <ErrorBoundary key={`reportType-${componentKey}`}><EditReportTypeList onEdit={setEdit('reportType')} /></ErrorBoundary>,
      printType: <ErrorBoundary key={`printType-${componentKey}`}><EditPrintTypeList /></ErrorBoundary>,
      excelExportType: <ErrorBoundary key={`excelExportType-${componentKey}`}><EditExcelExportTypeList /></ErrorBoundary>,
      machineTemplate: <ErrorBoundary key={`machineTemplate-${componentKey}`}><EditMachineTemplateList onEdit={setEdit('machineTemplate')} /></ErrorBoundary>
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
        <BackButton/>
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
