import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createAccount } from "../../../../redux/create/createNewAccount/NewAccountActions";
import { RootState } from "../../../../../store";
import { indianStates } from "./indianStates";
import "./CreateNewAccount.css";
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

interface Props {
  initialData?: Partial<AccountFormData>;
}

type ValidationErrors = Partial<Record<keyof AccountFormData, string>>;

const CreateNewAccount: React.FC<Props> = ({ initialData = {} }) => {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();

  const { loading, error: reduxError } = useSelector(
    (state: RootState) => state.account
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

  // Reset form after successful submission
  useEffect(() => {
    if (!loading && !reduxError && formRef.current) {
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
  }, [loading, reduxError]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
     
    if (!validate()) {
      return;
    }

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

    dispatch(createAccount(formData) as any);
  };

  return (
    <div id="CreateAccountCss">
         <div className="CreateAccountTitelCss">
          <h6>Create Account</h6>
         </div>
      <div className="create-account-container">
            
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
            {loading ? "Saving..." : "Create Account"}
          </button>
        </div>
    

       
      
      </form>
    </div>
    </div>
  );
};

export default CreateNewAccount;