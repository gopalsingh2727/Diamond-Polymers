import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { createAccount, updateAccount, deleteAccount } from "../../../../redux/create/createNewAccount/NewAccountActions";
import { RootState, AppDispatch } from "../../../../../store";
import { indianStates } from "./indianStates";
import { useInternalBackNavigation } from "../../../../allCompones/BackButton";
import "./createNewAccount.css";
// import imageCompression from 'browser-image-compression';
type AccountFormData = {
  companyName?: string;
  firstName: string;
  lastName: string;
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

type ValidationErrors = Partial<Record<keyof AccountFormData, string>>;

const CreateNewAccount: React.FC<Props> = ({ initialData: propInitialData = {}, onCancel, onSaveSuccess }) => {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const navigate = useNavigate();

  // Get edit data from navigation state (from Edit list) or from props
  const locationState = location.state as LocationState | null;
  const initialData: AccountData = locationState?.initialData || propInitialData;
  const itemId = locationState?.itemId || initialData?._id;
  const editMode = locationState?.editMode || !!initialData?._id;

  const { loading, error: reduxError } = useSelector(
    (state: RootState) => state.createAccount
  );

  const [formValues, setFormValues] = useState<AccountFormData>({
    companyName: initialData.companyName || "",
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
    image: null,
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const existingImageUrl = initialData?.imageUrl;

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

  useInternalBackNavigation(editMode && !showDeleteConfirm, handleBackToList);

  // Load data when initialData changes (edit mode)
  useEffect(() => {
    if (initialData && initialData._id) {
      setFormValues({
        companyName: initialData.companyName || "",
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
        image: null,
      });
    }
  }, [initialData]);

  // Reset form after successful submission (only in create mode)
  useEffect(() => {
    if (!loading && !reduxError && formRef.current && !editMode) {
      formRef.current.reset();
      setFormValues({
        companyName: "",
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
        image: null,
      });

      // Clear file input separately
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [loading, reduxError, editMode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
  };

// const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
// const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif'];


// const [previewUrl, setPreviewUrl] = useState<string | null>(null);

// const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//   const file = e.target.files?.[0] || null;

//   if (!file) return;

//   if (!ALLOWED_MIME_TYPES.includes(file.type)) {
//     setValidationErrors({ image: 'Only JPG, PNG, or GIF images are allowed' });
//     return;
//   }

//   try {
//     let imageFile = file;

//     if (file.size > MAX_IMAGE_SIZE) {
//       const compressedFile = await imageCompression(file, {
//         maxSizeMB: 1,
//         maxWidthOrHeight: 1920,
//         useWebWorker: false,
//       });

//       imageFile = compressedFile;
//       console.log('Image compressed from', file.size, 'to', compressedFile.size);
//     }

//     setValidationErrors(prev => ({ ...prev, image: undefined }));
//     setFormValues(prev => ({ ...prev, image: imageFile }));

//     const reader = new FileReader();
//     reader.onload = () => setPreviewUrl(reader.result as string);
//     reader.readAsDataURL(imageFile);
//   } catch (err) {
//     console.error('Image compression error:', err);
//     setValidationErrors({ image: 'Image compression failed. Try another image.' });
//   }
// };


  const validate = (): boolean => {
    const errors: ValidationErrors = {};



    if (!formValues.firstName.trim()) {
      errors.firstName = "First Name is required";
    }
    if (!formValues.lastName.trim()) {
      errors.lastName = "Last Name is required";
    }

    if (formValues.email && !/\S+@\S+\.\S+/.test(formValues.email)) {
      errors.email = "Invalid email format";
    }
    if (!formValues.phone1.trim()) {
      errors.phone1 = "Phone 1 is required";
    }
    if (!formValues.address1.trim()) {
      errors.address1 = "Address Line 1 is required";
    }
    if (!formValues.state.trim()) {
      errors.state = "State is required";
    }
    if (!formValues.pinCode.trim()) {
      errors.pinCode = "Pin Code is required";
    } else if (!/^\d{6}$/.test(formValues.pinCode)) {
      errors.pinCode = "Pin Code must be exactly 6 digits";
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
      // Update existing account
      const updateData = {
        companyName: formValues.companyName,
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
        pinCode: formValues.pinCode,
      };

      await dispatch(updateAccount(itemId, updateData));

      // Navigate back to edit list after successful update
      if (onSaveSuccess) {
        onSaveSuccess();
      } else {
        navigate('/menu/edit', { state: { activeComponent: 'account' } });
      }
    } else {
      // Create new account
      const formData = new FormData();
      Object.entries(formValues).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === "image" && value instanceof File) {
            formData.append(key, value);
          } else if (typeof value === 'string' && value.trim() !== "") {
            formData.append(key, value);
          }
        }
      });

      dispatch(createAccount(formData));
    }
  };

  const handleDelete = async () => {
    if (!itemId) return;

    setDeleting(true);
    try {
      await dispatch(deleteAccount(itemId));
      setShowDeleteConfirm(false);
      if (onSaveSuccess) {
        onSaveSuccess();
      } else {
        navigate('/menu/edit', { state: { activeComponent: 'account' } });
      }
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div id="CreateAccountCss">
         <div className="CreateAccountTitelCss">
          <h6>{editMode ? 'Edit Account' : 'Create Account'}</h6>
         </div>
      <div className="create-account-container">
          {/* Back button and Delete button for edit mode */}
          {editMode && (
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  style={{ padding: '8px 16px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  ← Back to List
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                style={{
                  padding: '8px 16px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6"/>
                </svg>
                Delete
              </button>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
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
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>Delete Account?</h3>
                <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                  Are you sure you want to delete this account? This action cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    style={{ padding: '10px 24px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    style={{ padding: '10px 24px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Existing Image Preview */}
          {editMode && existingImageUrl && (
            <div style={{ marginBottom: '16px', padding: '12px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#374151' }}>
                Current Image
              </label>
              <img
                src={existingImageUrl}
                alt="Account"
                style={{ maxWidth: '150px', maxHeight: '150px', borderRadius: '8px', objectFit: 'cover' }}
              />
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit} className="form-container">
        <div className="form-group">
          <label>Company Name</label>
          <input
          className="CurstomerAddressInput"
            name="companyName"
            value={formValues.companyName}
            onChange={handleChange}
          />
          {validationErrors.companyName && (
            <small className="error-text">{validationErrors.companyName}</small>
          )}
        </div>

        <div className="form-row ">
          <div className="form-group ">
            <label>First Name *</label>
            <input
              className="CurstomerInput"
              name="firstName"
              value={formValues.firstName}
              onChange={handleChange}
            />
            {validationErrors.firstName && (
              <small className="error-text">{validationErrors.firstName}</small>
            )}
          </div>
          <div className="form-group">
            <label>Last Name *</label>

            <input
            className="CurstomerInput"
              name="lastName"
              value={formValues.lastName}
              onChange={handleChange}
            />
            {validationErrors.lastName && (
              <small className="error-text">{validationErrors.lastName}</small>
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
          className="CurstomerAddressInput"
            type="email"
            name="email"
            value={formValues.email}
            onChange={handleChange}
          />
          {validationErrors.email && (
            <small className="error-text">{validationErrors.email}</small>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Phone 1 *</label>
            <input
            className="CurstomerInput"
              name="phone1"
              value={formValues.phone1}
              onChange={handleChange}
            />
            {validationErrors.phone1 && (
              <small className="error-text">{validationErrors.phone1}</small>
            )}
          </div>
          <div className="form-group">
            <label>Phone 2</label>
            <input
            className="CurstomerInput"
              name="phone2"
              value={formValues.phone2 || ""}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>WhatsApp</label>
            <input
            className="CurstomerInput"
              name="whatsapp"
              value={formValues.whatsapp || ""}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Telephone</label>
            <input
            className="CurstomerInput"
              name="telephone"
              value={formValues.telephone || ""}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">

        </div>

        <div className="form-group">
          <label>Address Line 1 *</label>
          <input
            name="address1"
            className="CurstomerAddressInput"
            value={formValues.address1}
            onChange={handleChange}
          />
          {validationErrors.address1 && (
            <small className="error-text">{validationErrors.address1}</small>
          )}
        </div>

        <div className="form-group">
          <label>Address Line 2</label>
          <input
            name="address2"
            className="CurstomerAddressInput"
            value={formValues.address2 || ""}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>State *</label>
            <select
              name="state"
              value={formValues.state}
              onChange={handleChange}
            >
              <option value="">Select State</option>
              {indianStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            {validationErrors.state && (
              <small className="error-text">{validationErrors.state}</small>
            )}
          </div>

          <div className="form-group">
            <label>Pin Code *</label>
            <input
              name="pinCode"
              className="CurstomerInput"
              value={formValues.pinCode}
              onChange={handleChange}
            />
            {validationErrors.pinCode && (
              <small className="error-text">{validationErrors.pinCode}</small>
            )}
          </div>
        </div>

       <input
  ref={fileInputRef}
  type="file"
  accept="image/*"
  onChange={(e) =>
    setFormValues({
      ...formValues,
      image: e.target.files?.[0],
    })
  }
/>


        {/* Show redux error from API call */}
        {reduxError && <div className="error-text">{reduxError}</div>}

        <div className="form-group">
          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : (editMode ? "Update Account" : "Create Account")}
          </button>
        </div>




      </form>
    </div>
    </div>
  );
};

export default CreateNewAccount;
