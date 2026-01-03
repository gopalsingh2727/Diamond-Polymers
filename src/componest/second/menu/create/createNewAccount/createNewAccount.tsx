import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { createAccountV2, updateAccountV2, deleteAccountV2, getCustomerCategoriesV2, getParentCompaniesV2 } from "../../../../redux/unifiedV2";
import { RootState, AppDispatch } from "../../../../../store";
import { indianStates } from "./indianStates";
import { useInternalBackNavigation } from "../../../../allCompones/BackButton";
import { useCRUD } from "../../../../../hooks/useCRUD";
import { ToastContainer } from "../../../../../components/shared/Toast";
import ImportProgressPopup from "../../../../../components/shared/ImportProgressPopup";
import ImportAccountPopup from "../../../../../components/shared/ImportAccountPopup";
import * as XLSX from 'xlsx';
import "./createNewAccount.css";

type AccountFormData = {
  companyName: string;
  gstNumber?: string;
  categoryId?: string;
  parentCompanyId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone1: string;
  phone2?: string;
  whatsapp?: string;
  telephone?: string;
  address1: string;
  address2?: string;
  state: string;
  pinCode: string;
  image?: File | null;
};

interface AccountData extends Partial<AccountFormData> {
  _id?: string;
  imageUrl?: string;
}

interface LocationState {
  editMode?: boolean;
  initialData?: AccountData;
  itemId?: string;
}

interface Props {
  initialData?: AccountData;
  onCancel?: () => void;
  onSaveSuccess?: () => void;
}

interface CustomerCategory {
  _id: string;
  name: string;
  description?: string;
}

interface CustomerParentCompany {
  _id: string;
  name: string;
  description?: string;
}

type ValidationErrors = Partial<Record<keyof AccountFormData, string>>;

const CreateNewAccount: React.FC<Props> = ({ initialData: propInitialData = {}, onCancel, onSaveSuccess }) => {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const navigate = useNavigate();

  // useCRUD hook for save/delete operations
  const { handleSave, handleDelete: crudDelete, saveState, deleteState, confirmDialog, closeConfirmDialog, toast } = useCRUD();

  // Get edit data from navigation state (from Edit list) or from props
  const locationState = location.state as LocationState | null;
  const initialData: AccountData = locationState?.initialData || propInitialData;
  const itemId = locationState?.itemId || initialData?._id;
  const editMode = locationState?.editMode || !!initialData?._id;

  const { error: reduxError } = useSelector(
    (state: RootState) => state.v2.account
  );

  // Get categories and parent companies from Redux store
  const customerCategoryState = useSelector(
    (state: RootState) => state.v2.customerCategory
  );
  const rawCategoriesData = customerCategoryState?.list;
  const categoriesRaw = Array.isArray(rawCategoriesData) ? rawCategoriesData : [];
  const parentCompanyState = useSelector(
    (state: RootState) => state.v2.parentCompany
  );
  const rawParentCompaniesData = parentCompanyState?.list;
  const parentCompaniesRaw = Array.isArray(rawParentCompaniesData) ? rawParentCompaniesData : [];

  // Defensive extraction - handle both array and nested object formats
  const categories = Array.isArray(categoriesRaw) ?
  categoriesRaw :
  (categoriesRaw as any)?.data || [];
  const parentCompanies = Array.isArray(parentCompaniesRaw) ?
  parentCompaniesRaw :
  (parentCompaniesRaw as any)?.data || [];

  const [formValues, setFormValues] = useState<AccountFormData>({
    companyName: initialData.companyName || "",
    gstNumber: initialData.gstNumber || "",
    categoryId: initialData.categoryId || "",
    parentCompanyId: initialData.parentCompanyId || "",
    firstName: initialData.firstName || "",
    lastName: initialData.lastName || "",
    email: initialData.email || "",
    phone1: initialData.phone1 || "",
    phone2: initialData.phone2 || "",
    whatsapp: initialData.whatsapp || "",
    telephone: initialData.telephone || "",
    address1: initialData.address1 || "",
    address2: initialData.address2 || "",
    state: initialData.state || "",
    pinCode: initialData.pinCode || "",
    image: null
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const existingImageUrl = initialData?.imageUrl;

  // Excel import state
  const [showImportPopup, setShowImportPopup] = useState(false);
  const [bulkImporting, setBulkImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({
    current: 0,
    total: 0,
    success: 0,
    failed: 0,
    percentage: 0,
  });
  const [importSummary, setImportSummary] = useState<{
    total: number;
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  // Fetch categories and parent companies on component mount
  useEffect(() => {

    dispatch(getCustomerCategoriesV2());
    dispatch(getParentCompaniesV2());
  }, [dispatch]);

  // Debug log to check if data is loaded
  useEffect(() => {


  }, [categories, parentCompanies]);

  // Handle ESC key to go back to list in edit mode
  const handleBackToList = () => {
    if (onSaveSuccess) {
      onSaveSuccess();
    } else if (onCancel) {
      onCancel();
    } else {
      navigate('/menu/edit', { state: { activeComponent: 'account' } });
    }
  };

  useInternalBackNavigation(editMode && !confirmDialog.isOpen, handleBackToList);

  // Load data when initialData changes (edit mode)
  useEffect(() => {
    if (initialData && initialData._id) {
      setFormValues({
        companyName: initialData.companyName || "",
        gstNumber: initialData.gstNumber || "",
        categoryId: initialData.categoryId || "",
        parentCompanyId: initialData.parentCompanyId || "",
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        email: initialData.email || "",
        phone1: initialData.phone1 || "",
        phone2: initialData.phone2 || "",
        whatsapp: initialData.whatsapp || "",
        telephone: initialData.telephone || "",
        address1: initialData.address1 || "",
        address2: initialData.address2 || "",
        state: initialData.state || "",
        pinCode: initialData.pinCode || "",
        image: null
      });
    }
  }, [initialData]);

  // Reset form after successful submission (only in create mode)
  useEffect(() => {
    if (saveState === 'success' && !reduxError && formRef.current && !editMode) {
      formRef.current.reset();
      setFormValues({
        companyName: "",
        gstNumber: "",
        categoryId: "",
        parentCompanyId: "",
        firstName: "",
        lastName: "",
        email: "",
        phone1: "",
        phone2: "",
        whatsapp: "",
        telephone: "",
        address1: "",
        address2: "",
        state: "",
        pinCode: "",
        image: null
      });

      // Clear file input separately
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [saveState, reduxError, editMode]);

  const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
  {
    const { name, value } = e.target;
    // Auto-convert GST to uppercase
    const processedValue = name === 'gstNumber' ? value.toUpperCase() : value;
    setFormValues((prev) => ({ ...prev, [name]: processedValue }));
    setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = (): boolean => {
    const errors: ValidationErrors = {};

    // Only Company Name and State are required
    if (!formValues.companyName.trim()) {
      errors.companyName = "Company Name is required";
    }

    if (!formValues.state?.trim()) {
      errors.state = "State is required";
    }

    // Optional validation: Pin Code format (only if provided)
    if (formValues.pinCode?.trim() && !/^\d{6}$/.test(formValues.pinCode)) {
      errors.pinCode = "Pin Code must be exactly 6 digits";
    }

    // Validate GST if provided - simple validation: 2 digits + 13 alphanumeric = 15 chars
    if (formValues.gstNumber && formValues.gstNumber.trim()) {
      const gst = formValues.gstNumber.trim().toUpperCase();
      if (gst.length !== 15 || !/^[0-9]{2}[A-Z0-9]{13}$/.test(gst)) {
        errors.gstNumber = "GST must be 15 characters: 2 digits + 13 alphanumeric";
      }
    }

    setValidationErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (editMode && itemId) {
      // Update existing account - use accountName for backend API
      const updateData = {
        accountName: formValues.companyName,
        gstNumber: formValues.gstNumber,
        categoryId: formValues.categoryId || null,
        parentCompanyId: formValues.parentCompanyId || null,
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        email: formValues.email,
        phone1: formValues.phone1,
        phone2: formValues.phone2,
        whatsapp: formValues.whatsapp,
        telephone: formValues.telephone,
        address1: formValues.address1,
        address2: formValues.address2,
        state: formValues.state,
        pinCode: formValues.pinCode
      };

      handleSave(
        () => dispatch(updateAccountV2(itemId, updateData)),
        {
          successMessage: 'Account updated successfully',
          onSuccess: () => {
            setTimeout(() => {
              if (onSaveSuccess) {
                onSaveSuccess();
              } else {
                navigate('/menu/edit', { state: { activeComponent: 'account' } });
              }
            }, 1500);
          }
        }
      );
    } else {
      // Create new account - send JSON object (not FormData)
      const createData = {
        accountName: formValues.companyName,
        gstNumber: formValues.gstNumber || undefined,
        categoryId: formValues.categoryId || undefined,
        parentCompanyId: formValues.parentCompanyId || undefined,
        firstName: formValues.firstName || undefined,
        lastName: formValues.lastName || undefined,
        email: formValues.email || undefined,
        phone1: formValues.phone1 || undefined,
        phone2: formValues.phone2 || undefined,
        whatsapp: formValues.whatsapp || undefined,
        telephone: formValues.telephone || undefined,
        address1: formValues.address1 || undefined,
        address2: formValues.address2 || undefined,
        state: formValues.state,
        pinCode: formValues.pinCode || undefined
      };

      // Remove undefined values
      Object.keys(createData).forEach((key) => {
        if (createData[key as keyof typeof createData] === undefined) {
          delete createData[key as keyof typeof createData];
        }
      });

      handleSave(
        () => dispatch(createAccountV2(createData) as any),
        {
          successMessage: 'Account created successfully'
        }
      );
    }
  };

  const handleDeleteClick = () => {
    if (!itemId) return;

    crudDelete(
      () => dispatch(deleteAccountV2(itemId)),
      {
        confirmTitle: 'Delete Account?',
        confirmMessage: 'Are you sure you want to delete this account? This action cannot be undone.',
        successMessage: 'Account deleted successfully',
        onSuccess: () => {
          // Delay navigation to show toast
          setTimeout(() => {
            if (onSaveSuccess) {
              onSaveSuccess();
            } else {
              navigate('/menu/edit', { state: { activeComponent: 'account' } });
            }
          }, 1500);
        }
      }
    );
  };

  // Excel import functions
  const downloadExcelTemplate = () => {
    // Create instructions sheet data
    const instructions = [
      ['Account Bulk Import Template'],
      [''],
      ['INSTRUCTIONS:'],
      ['1. Maximum 500 accounts per import'],
      ['2. Required fields are marked with * in column headers'],
      ['3. Delete the example rows before adding your data'],
      ['4. State must match exactly (see list below)'],
      ['5. Category and Parent Company will be auto-matched by name (case-insensitive)'],
      [''],
      ['FIELD DESCRIPTIONS:'],
      [''],
      ['Company Name * - Required. Business name (1-200 characters)'],
      ['GST Number - Optional. Must be 15 characters if provided (2 digits + 13 alphanumeric)'],
      ['Category - Optional. Customer category name (auto-lookup by name)'],
      ['Parent Company - Optional. Parent company name (auto-lookup by name)'],
      ['Contact First Name - Optional. Contact person first name'],
      ['Contact Last Name - Optional. Contact person last name'],
      ['Email - Optional. Valid email address'],
      ['Phone 1 * - Required. Primary phone number (10-15 digits)'],
      ['Phone 2 - Optional. Secondary phone number'],
      ['WhatsApp - Optional. WhatsApp number'],
      ['Telephone - Optional. Landline number'],
      ['Address Line 1 * - Required. Primary address'],
      ['Address Line 2 - Optional. Secondary address'],
      ['State * - Required. Must match one of the valid states below'],
      ['Pin Code * - Required. Must be exactly 6 digits'],
      [''],
      ['VALID STATES (must match exactly):'],
      [indianStates.join(', ')],
      [''],
      ['VALIDATION RULES:'],
      ['- GST Number: 2 digits followed by 13 alphanumeric characters (e.g., 27AABCU9603R1ZM)'],
      ['- Pin Code: Exactly 6 digits (e.g., 560001)'],
      ['- Phone: 10-15 digits, may include +, -, spaces, parentheses'],
      ['- Category/Parent Company: Will be matched by name (case-insensitive). Leave blank if not found.'],
    ];

    // Create template sheet with example data
    const templateData = [
      {
        'Company Name *': 'Kalyan Jewellers - MG Road',
        'GST Number': '29AABCU9603R1ZM',
        'Category': 'Retail',
        'Parent Company': 'Kalyan Jewellers India Ltd',
        'Contact First Name': 'Ramesh',
        'Contact Last Name': 'Kumar',
        'Email': 'ramesh@kalyanjewellers.net',
        'Phone 1 *': '9876543210',
        'Phone 2': '9876543211',
        'WhatsApp': '9876543210',
        'Telephone': '08012345678',
        'Address Line 1 *': 'MG Road, Shivaji Nagar',
        'Address Line 2': 'Near Metro Station',
        'State *': 'Karnataka',
        'Pin Code *': '560001',
      },
      {
        'Company Name *': 'Local Print Shop',
        'GST Number': '',
        'Category': '',
        'Parent Company': '',
        'Contact First Name': '',
        'Contact Last Name': '',
        'Email': '',
        'Phone 1 *': '9123456789',
        'Phone 2': '',
        'WhatsApp': '',
        'Telephone': '',
        'Address Line 1 *': '123 Main Street',
        'Address Line 2': '',
        'State *': 'Maharashtra',
        'Pin Code *': '400001',
      },
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Add Instructions sheet
    const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

    // Add Template sheet
    const wsTemplate = XLSX.utils.json_to_sheet(templateData);
    XLSX.utils.book_append_sheet(wb, wsTemplate, 'Template');

    // Download file
    XLSX.writeFile(wb, 'Account_Import_Template.xlsx');

    toast.addToast({
      type: 'success',
      title: 'Success',
      message: 'Template downloaded successfully',
    });
  };

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Read file
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);

      // Check if Template sheet exists
      if (!workbook.Sheets['Template']) {
        toast.addToast({
          type: 'error',
          title: 'Import Error',
          message: 'Template sheet not found. Please use the downloaded template.',
        });
        return;
      }

      // Parse Template sheet
      const worksheet = workbook.Sheets['Template'];
      let jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        toast.addToast({
          type: 'error',
          title: 'Import Error',
          message: 'No data found in Template sheet',
        });
        return;
      }

      // Limit to 500 accounts
      if (jsonData.length > 500) {
        toast.addToast({
          type: 'warning',
          title: 'Import Limit',
          message: `Limiting import to first 500 accounts (found ${jsonData.length})`,
        });
        jsonData = jsonData.slice(0, 500);
      }

      // Validate and process data
      const validationErrors: string[] = [];
      const processedData: any[] = [];

      jsonData.forEach((row, index) => {
        const rowNum = index + 2; // Excel row number (header is row 1)
        const errors: string[] = [];

        // Required: Company Name
        const companyName = row['Company Name *']?.toString().trim();
        if (!companyName) {
          errors.push(`Row ${rowNum}: Missing Company Name`);
        }

        // Required: State
        const state = row['State *']?.toString().trim();
        if (!state) {
          errors.push(`Row ${rowNum}: Missing State`);
        } else if (!indianStates.includes(state)) {
          errors.push(`Row ${rowNum}: Invalid state "${state}". Must match exactly from valid states list.`);
        }

        // Required: Address Line 1
        const address1 = row['Address Line 1 *']?.toString().trim();
        if (!address1) {
          errors.push(`Row ${rowNum}: Missing Address Line 1`);
        }

        // Required: Phone 1
        const phone1 = row['Phone 1 *']?.toString().trim();
        if (!phone1) {
          errors.push(`Row ${rowNum}: Missing Phone 1`);
        }

        // Required: Pin Code (6 digits)
        const pinCode = row['Pin Code *']?.toString().trim();
        if (!pinCode) {
          errors.push(`Row ${rowNum}: Missing Pin Code`);
        } else if (!/^\d{6}$/.test(pinCode)) {
          errors.push(`Row ${rowNum}: Pin Code must be exactly 6 digits (got "${pinCode}")`);
        }

        // Optional: GST Number (15 chars if provided)
        const gstNumber = row['GST Number']?.toString().trim().toUpperCase();
        if (gstNumber && gstNumber.length > 0) {
          if (!/^[0-9]{2}[A-Z0-9]{13}$/.test(gstNumber)) {
            errors.push(`Row ${rowNum}: Invalid GST format "${gstNumber}". Must be 2 digits + 13 alphanumeric.`);
          }
        }

        // If there are validation errors, skip this row
        if (errors.length > 0) {
          validationErrors.push(...errors);
          return;
        }

        // Auto-lookup categoryId by name
        let categoryId: string | undefined = undefined;
        const categoryName = row['Category']?.toString().trim();
        if (categoryName && categoryName.length > 0) {
          const category = (categories as CustomerCategory[]).find(
            (c) => c.name.toLowerCase() === categoryName.toLowerCase()
          );
          if (category) {
            categoryId = category._id;
          } else {
            validationErrors.push(`Row ${rowNum}: Category "${categoryName}" not found (will be skipped)`);
          }
        }

        // Auto-lookup parentCompanyId by name
        let parentCompanyId: string | undefined = undefined;
        const parentCompanyName = row['Parent Company']?.toString().trim();
        if (parentCompanyName && parentCompanyName.length > 0) {
          const parentCompany = (parentCompanies as CustomerParentCompany[]).find(
            (p) => p.name.toLowerCase() === parentCompanyName.toLowerCase()
          );
          if (parentCompany) {
            parentCompanyId = parentCompany._id;
          } else {
            validationErrors.push(`Row ${rowNum}: Parent Company "${parentCompanyName}" not found (will be skipped)`);
          }
        }

        // Build account data object
        const accountData: any = {
          accountName: companyName,
          state: state,
          address1: address1,
          phone1: phone1,
          pinCode: pinCode,
        };

        // Add optional fields if provided
        if (gstNumber) accountData.gstNumber = gstNumber;
        if (categoryId) accountData.categoryId = categoryId;
        if (parentCompanyId) accountData.parentCompanyId = parentCompanyId;

        const firstName = row['Contact First Name']?.toString().trim();
        if (firstName) accountData.firstName = firstName;

        const lastName = row['Contact Last Name']?.toString().trim();
        if (lastName) accountData.lastName = lastName;

        const email = row['Email']?.toString().trim();
        if (email) accountData.email = email;

        const phone2 = row['Phone 2']?.toString().trim();
        if (phone2) accountData.phone2 = phone2;

        const whatsapp = row['WhatsApp']?.toString().trim();
        if (whatsapp) accountData.whatsapp = whatsapp;

        const telephone = row['Telephone']?.toString().trim();
        if (telephone) accountData.telephone = telephone;

        const address2 = row['Address Line 2']?.toString().trim();
        if (address2) accountData.address2 = address2;

        processedData.push(accountData);
      });

      // Show confirmation dialog
      const validCount = processedData.length;
      const errorCount = validationErrors.length;

      const confirmMessage =
        `Ready to import ${validCount} accounts.\n` +
        (errorCount > 0 ? `${errorCount} validation issues found (see console for details).\n` : '') +
        '\nProceed with import?';

      if (errorCount > 0) {
        console.warn('Import Validation Errors:', validationErrors);
      }

      const confirmed = window.confirm(confirmMessage);
      if (!confirmed) {
        return;
      }

      // Start bulk import
      setBulkImporting(true);
      let successCount = 0;
      let failCount = 0;
      const importErrors: string[] = [];

      for (let i = 0; i < processedData.length; i++) {
        const accountData = processedData[i];

        // Update progress
        setImportProgress({
          current: i + 1,
          total: processedData.length,
          success: successCount,
          failed: failCount,
          percentage: Math.round(((i + 1) / processedData.length) * 100),
        });

        try {
          await dispatch(createAccountV2(accountData) as any);
          successCount++;
        } catch (error: any) {
          failCount++;
          const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
          importErrors.push(
            `Row ${i + 2} (${accountData.accountName}): ${errorMsg}`
          );
        }

        // Rate limiting prevention (50ms delay = 20 accounts/second)
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      setBulkImporting(false);

      // Show summary modal
      setImportSummary({
        total: processedData.length,
        success: successCount,
        failed: failCount,
        errors: importErrors,
      });

      // Show toast
      if (successCount > 0) {
        toast.addToast({
          type: 'success',
          title: 'Import Complete',
          message: `Successfully imported ${successCount} account(s)`,
        });
      }
    } catch (error: any) {
      console.error('Excel import error:', error);
      toast.addToast({
        type: 'error',
        title: 'Import Failed',
        message: `Failed to import Excel file: ${error.message}`,
      });
      setBulkImporting(false);
    }
  };

  return (
    <div id="CreateAccountCss">
      {editMode ?
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 1.5rem',
        marginBottom: '8px',
        borderBottom: '1px solid #ccc',
        paddingBottom: '6px'
      }}>
          {onCancel &&
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '8px 16px',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}>

              Back to List
            </button>
        }
          <h6 style={{
          margin: 0,
          fontSize: '1.1rem',
          textAlign: 'center',
          flex: 1
        }}>
            Edit Account
          </h6>
          <button
          type="button"
          onClick={handleDeleteClick}
          disabled={deleteState === 'loading'}
          style={{
            padding: '8px 16px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: deleteState === 'loading' ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            opacity: deleteState === 'loading' ? 0.7 : 1
          }}>

            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" />
            </svg>
            {deleteState === 'loading' ? 'Deleting...' : 'Delete'}
          </button>
        </div> :

      <div className="createaccount-title-row">
          <h6>
            Create Account
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px', verticalAlign: 'middle' }}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </h6>

          {/* Import Button on same line - Only in Create Mode */}
          {!editMode && (
            <button
              type="button"
              onClick={() => setShowImportPopup(true)}
              className="import-accounts-title-btn"
              disabled={bulkImporting}
            >
              Import Accounts
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
            </button>
          )}
        </div>
      }

      {/* Import Account Popup */}
      <ImportAccountPopup
        isOpen={showImportPopup}
        onClose={() => setShowImportPopup(false)}
        onDownloadTemplate={downloadExcelTemplate}
        onFileSelect={(e) => {
          handleExcelImport(e);
          setShowImportPopup(false);
        }}
        isImporting={bulkImporting}
      />

      {/* Import Progress Popup */}
      <ImportProgressPopup
        isOpen={bulkImporting}
        currentIndex={importProgress.current}
        total={importProgress.total}
        successCount={importProgress.success}
        failedCount={importProgress.failed}
      />

      <div className="createaccount-container">

          {/* Delete Confirmation Modal */}
          {confirmDialog.isOpen &&
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
              <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center'
          }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>Warning</div>
                <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>{confirmDialog.title}</h3>
                <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                  {confirmDialog.message}
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button
                type="button"
                onClick={closeConfirmDialog}
                style={{ padding: '10px 24px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>

                    Cancel
                  </button>
                  <button
                type="button"
                onClick={confirmDialog.onConfirm}
                disabled={deleteState === 'loading'}
                style={{ padding: '10px 24px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>

                    {deleteState === 'loading' ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
        }

          <form ref={formRef} onSubmit={handleSubmit} className="createaccount-form">
        {/* Company Name, GST Number, and Image Preview - One Row */}
        <div className="createaccount-row">
          <div className="createaccount-field">
            <label>Company Name *</label>
            <input
                className="createaccount-input"
                name="companyName"
                value={formValues.companyName}
                onChange={handleChange}
                placeholder="e.g., Kalyan Jewellers - MG Road" />

            {validationErrors.companyName &&
              <small className="createaccount-error">{validationErrors.companyName}</small>
              }
          </div>

          <div className="createaccount-field">
            <label>GST Number</label>
            <input
                className="createaccount-input"
                name="gstNumber"
                value={formValues.gstNumber || ""}
                onChange={handleChange}
                placeholder="e.g., 27AABCU9603R1ZM"
                style={{ textTransform: 'uppercase' }} />

            {validationErrors.gstNumber &&
              <small className="createaccount-error">{validationErrors.gstNumber}</small>
              }
          </div>

          <div className="createaccount-field">
            <label>Image Preview</label>
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFormValues({
                      ...formValues,
                      image: file
                    });
                  }
                }}
                style={{ display: 'none' }} />

            {/* Clickable image preview */}
            {formValues.image || existingImageUrl ?
              <img
                src={formValues.image ? URL.createObjectURL(formValues.image) : existingImageUrl}
                alt="Preview"
                title="Click to change image or preview"
                style={{
                  width: '50px',
                  height: '50px',
                  objectFit: 'cover',
                  borderRadius: '50%',
                  border: '2px solid #e5e7eb',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  // Check if clicked with specific intent (right side for preview, left for upload)
                  // For simplicity, show preview modal
                  const imageUrl = formValues.image ?
                  URL.createObjectURL(formValues.image) :
                  existingImageUrl;
                  if (imageUrl) {
                    setPreviewImageUrl(imageUrl);
                    setShowImagePreview(true);
                  }
                }}
                onDoubleClick={() => {
                  // Double click to select new image
                  fileInputRef.current?.click();
                }} /> :


              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  border: '2px dashed #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9ca3af',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
                title="Click to select image"
                onClick={() => fileInputRef.current?.click()}>

                No
              </div>
              }
          </div>
        </div>

        {/* Contact Person Name, Customer Category, and Parent Company - One Row */}
        <div className="createaccount-row">
          <div className="createaccount-field">
            <label>Contact First Name</label>
            <input
                className="createaccount-input"
                name="firstName"
                value={formValues.firstName || ""}
                onChange={handleChange} />

          </div>
          <div className="createaccount-field">
            <label>Contact Last Name</label>
            <input
                className="createaccount-input"
                name="lastName"
                value={formValues.lastName || ""}
                onChange={handleChange} />

          </div>
          <div className="createaccount-field">
            <label>Customer Category</label>
            <select
                className="createaccount-select"
                name="categoryId"
                value={formValues.categoryId || ""}
                onChange={handleChange}>

              <option value="">
                {categories.length === 0 ? "No categories - Create first" : "Select Category"}
              </option>
              {(categories as CustomerCategory[]).map((cat) =>
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
                )}
            </select>
          </div>
          <div className="createaccount-field">
            <label>Parent Company</label>
            <select
                className="createaccount-select"
                name="parentCompanyId"
                value={formValues.parentCompanyId || ""}
                onChange={handleChange}>

              <option value="">
                {parentCompanies.length === 0 ? "No companies - Create first" : "Select Parent Company"}
              </option>
              {(parentCompanies as CustomerParentCompany[]).map((company) =>
                <option key={company._id} value={company._id}>
                  {company.name}
                </option>
                )}
            </select>
          </div>
        </div>

        {/* Email */}
        <div className="createaccount-field">
          <label>Email</label>
          <input
              className="createaccount-input"
              type="email"
              name="email"
              value={formValues.email || ""}
              onChange={handleChange} />

          {validationErrors.email &&
            <small className="createaccount-error">{validationErrors.email}</small>
            }
        </div>

        <div className="createaccount-row">
          <div className="createaccount-field">
            <label>Phone 1 *</label>
            <input
                className="createaccount-input"
                name="phone1"
                value={formValues.phone1}
                onChange={handleChange} />

            {validationErrors.phone1 &&
              <small className="createaccount-error">{validationErrors.phone1}</small>
              }
          </div>
          <div className="createaccount-field">
            <label>Phone 2</label>
            <input
                className="createaccount-input"
                name="phone2"
                value={formValues.phone2 || ""}
                onChange={handleChange} />

          </div>
          <div className="createaccount-field">
            <label>WhatsApp</label>
            <input
                className="createaccount-input"
                name="whatsapp"
                value={formValues.whatsapp || ""}
                onChange={handleChange} />

          </div>
          <div className="createaccount-field">
            <label>Telephone</label>
            <input
                className="createaccount-input"
                name="telephone"
                value={formValues.telephone || ""}
                onChange={handleChange} />

          </div>
        </div>

        {/* Address Line 1 and 2 - One Row */}
        <div className="createaccount-row">
          <div className="createaccount-field">
            <label>Address Line 1 *</label>
            <input
                name="address1"
                className="createaccount-input"
                value={formValues.address1}
                onChange={handleChange} />

            {validationErrors.address1 &&
              <small className="createaccount-error">{validationErrors.address1}</small>
              }
          </div>

          <div className="createaccount-field">
            <label>Address Line 2</label>
            <input
                name="address2"
                className="createaccount-input"
                value={formValues.address2 || ""}
                onChange={handleChange} />

          </div>
        </div>

        {/* State and Pin Code - One Row */}
        <div className="createaccount-row">
          <div className="createaccount-field">
            <label>State *</label>
            <select
                className="createaccount-select"
                name="state"
                value={formValues.state}
                onChange={handleChange}>

              <option value="">Select State</option>
              {indianStates.map((state) =>
                <option key={state} value={state}>
                  {state}
                </option>
                )}
            </select>
            {validationErrors.state &&
              <small className="createaccount-error">{validationErrors.state}</small>
              }
          </div>

          <div className="createaccount-field">
            <label>Pin Code *</label>
            <input
                name="pinCode"
                className="createaccount-input"
                value={formValues.pinCode}
                onChange={handleChange} />

            {validationErrors.pinCode &&
              <small className="createaccount-error">{validationErrors.pinCode}</small>
              }
          </div>
        </div>

        {/* Image Preview Modal */}
        {showImagePreview && previewImageUrl &&
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
              padding: '20px',
              flexDirection: 'column',
              gap: '20px'
            }}
            onClick={() => {
              setShowImagePreview(false);
              setPreviewImageUrl(null);
            }}>

            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'white',
                borderRadius: '8px',
                padding: '8px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                width: '20vw',
                height: '20vw'
              }}
              onClick={(e) => e.stopPropagation()}>

              <button
                type="button"
                onClick={() => {
                  setShowImagePreview(false);
                  setPreviewImageUrl(null);
                }}
                style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '-12px',
                  background: '#ef4444',
                  color: 'white',
                  border: '2px solid white',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  cursor: 'pointer',
                  fontSize: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                }}>

                ×
              </button>
              <img
                src={previewImageUrl}
                alt="Preview"
                style={{
                  display: 'block',
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: '4px'
                }} />

            </div>
            {/* Button to select new image */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
                setShowImagePreview(false);
                setPreviewImageUrl(null);
              }}
              style={{
                padding: '12px 24px',
                background: '#FF6B35',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: '0 2px 8px rgba(255, 107, 53, 0.3)'
              }}>

              Change Image
            </button>
          </div>
          }


        {/* Show redux error from API call */}
        {reduxError && <div className="createaccount-error">{reduxError}</div>}

        <div className="createaccount-submit">
          <button type="submit" disabled={saveState === 'loading'}>
            {saveState === 'loading' ? "Saving..." : editMode ? "Update Account" : "Create Account"}
          </button>
        </div>




      </form>

      {/* Import Summary Modal */}
      {importSummary && (
        <div
          className="import-summary-overlay"
          onClick={() => setImportSummary(null)}
        >
          <div
            className="import-summary-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 24px 0', textAlign: 'center', fontSize: '1.5rem' }}>
              Import Complete
            </h3>

            <div className="summary-stats">
              <div className="stat-box success">
                <div className="stat-number">{importSummary.success}</div>
                <div className="stat-label">Successful</div>
              </div>
              <div className="stat-box failed">
                <div className="stat-number">{importSummary.failed}</div>
                <div className="stat-label">Failed</div>
              </div>
            </div>

            {importSummary.errors.length > 0 && (
              <div className="error-list">
                <h4 style={{ margin: '20px 0 12px 0', fontSize: '1rem' }}>Errors:</h4>
                <ul style={{ margin: 0, padding: '0 0 0 20px', maxHeight: '200px', overflowY: 'auto' }}>
                  {importSummary.errors.slice(0, 10).map((err, i) => (
                    <li key={i} style={{ marginBottom: '8px', fontSize: '0.9rem', color: '#666' }}>
                      {err}
                    </li>
                  ))}
                  {importSummary.errors.length > 10 && (
                    <li style={{ marginTop: '8px', fontWeight: 'bold', color: '#333' }}>
                      ...and {importSummary.errors.length - 10} more errors
                    </li>
                  )}
                </ul>
              </div>
            )}

            <button
              onClick={() => setImportSummary(null)}
              style={{
                marginTop: '24px',
                padding: '12px 32px',
                background: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                width: '100%'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
    <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>);

};

export default CreateNewAccount;