# Printing Frontend Implementation Guide

## 📋 Overview

Complete implementation guide for Printing Type, Printing Spec, and Printing entity frontend sections including create, edit, and image upload functionality.

---

## 🗂️ File Structure

```
main27/src/
├── componest/redux/create/
│   ├── printingType/
│   │   ├── printingTypeConstants.ts     ✅ CREATED
│   │   ├── printingTypeActions.ts       → CREATE
│   │   └── printingTypeReducer.ts       → CREATE
│   ├── printingSpec/
│   │   ├── printingSpecConstants.ts     → CREATE
│   │   ├── printingSpecActions.ts       → CREATE
│   │   └── printingSpecReducer.ts       → CREATE
│   └── printing/
│       ├── printingConstants.ts         → CREATE
│       ├── printingActions.ts           → CREATE
│       └── printingReducer.ts           → CREATE
│
├── componest/second/menu/create/
│   ├── printing/
│   │   ├── CreatePrintingType.tsx       → CREATE
│   │   ├── CreatePrintingSpec.tsx       → CREATE
│   │   ├── CreatePrinting.tsx           → CREATE
│   │   └── PrintingImageUpload.tsx      → CREATE
│   └── indexCreate.tsx                  → UPDATE (add routes)
│
└── componest/second/menu/Edit/
    ├── EditPrintingType/
    │   └── EditPrintingType.tsx         → CREATE
    ├── EditPrintingSpec/
    │   └── EditPrintingSpec.tsx         → CREATE
    └── EditPrinting/
        ├── EditPrinting.tsx             → CREATE
        └── PrintingImageManager.tsx     → CREATE
```

---

## 📝 Implementation Steps

### Phase 1: Redux Actions & Reducers

#### File 1: `printingTypeActions.ts`

```typescript
import axios from "axios";
import {
  ADD_PRINTING_TYPE_REQUEST,
  ADD_PRINTING_TYPE_SUCCESS,
  ADD_PRINTING_TYPE_FAIL,
  GET_PRINTING_TYPES_REQUEST,
  GET_PRINTING_TYPES_SUCCESS,
  GET_PRINTING_TYPES_FAIL,
  UPDATE_PRINTING_TYPE_REQUEST,
  UPDATE_PRINTING_TYPE_SUCCESS,
  UPDATE_PRINTING_TYPE_FAIL,
  DELETE_PRINTING_TYPE_REQUEST,
  DELETE_PRINTING_TYPE_SUCCESS,
  DELETE_PRINTING_TYPE_FAIL
} from "./printingTypeConstants";
import { Dispatch } from "redux";
import { RootState } from "../../rootReducer";

const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
const apiKey = import.meta.env.VITE_API_KEY || "27infinity.in_5f84c89315f74a2db149c06a93cf4820";

const getToken = (getState: () => RootState): string | null =>
  getState().auth?.token || localStorage.getItem("authToken");

const getHeaders = (token?: string | null): Record<string, string> => ({
  "Content-Type": "application/json",
  Authorization: token ? `Bearer ${token}` : "",
  "x-api-key": apiKey,
});

// Add Printing Type
export const addPrintingType = (
  name: string,
  code: string,
  category: string,
  description?: string,
  minColors?: number,
  maxColors?: number
) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: ADD_PRINTING_TYPE_REQUEST });

    const token = getToken(getState);

    const response = await axios.post(
      `${baseUrl}/printingtype`,
      {
        name,
        code,
        category,
        description,
        minColors,
        maxColors,
        supportsFrontBack: true,
        isGlobal: false
      },
      { headers: getHeaders(token) }
    );

    dispatch({
      type: ADD_PRINTING_TYPE_SUCCESS,
      payload: response.data
    });

    return response.data;
  } catch (error: any) {
    dispatch({
      type: ADD_PRINTING_TYPE_FAIL,
      payload: error.response?.data?.message || error.message
    });
    throw error;
  }
};

// Get All Printing Types
export const getPrintingTypes = () => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: GET_PRINTING_TYPES_REQUEST });

    const token = getToken(getState);

    const response = await axios.get(
      `${baseUrl}/printingtype`,
      { headers: getHeaders(token) }
    );

    dispatch({
      type: GET_PRINTING_TYPES_SUCCESS,
      payload: response.data.printingTypes || []
    });

    return response.data.printingTypes;
  } catch (error: any) {
    dispatch({
      type: GET_PRINTING_TYPES_FAIL,
      payload: error.response?.data?.message || error.message
    });
  }
};

// Update Printing Type
export const updatePrintingType = (
  id: string,
  data: any
) => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({ type: UPDATE_PRINTING_TYPE_REQUEST });

    const token = getToken(getState);

    const response = await axios.put(
      `${baseUrl}/printingtype/${id}`,
      data,
      { headers: getHeaders(token) }
    );

    dispatch({
      type: UPDATE_PRINTING_TYPE_SUCCESS,
      payload: response.data
    });

    return response.data;
  } catch (error: any) {
    dispatch({
      type: UPDATE_PRINTING_TYPE_FAIL,
      payload: error.response?.data?.message || error.message
    });
    throw error;
  }
};

// Delete Printing Type
export const deletePrintingType = (id: string) => async (
  dispatch: Dispatch,
  getState: () => RootState
) => {
  try {
    dispatch({ type: DELETE_PRINTING_TYPE_REQUEST });

    const token = getToken(getState);

    await axios.delete(
      `${baseUrl}/printingtype/${id}`,
      { headers: getHeaders(token) }
    );

    dispatch({
      type: DELETE_PRINTING_TYPE_SUCCESS,
      payload: id
    });
  } catch (error: any) {
    dispatch({
      type: DELETE_PRINTING_TYPE_FAIL,
      payload: error.response?.data?.message || error.message
    });
    throw error;
  }
};
```

#### File 2: `printingTypeReducer.ts`

```typescript
import {
  ADD_PRINTING_TYPE_REQUEST,
  ADD_PRINTING_TYPE_SUCCESS,
  ADD_PRINTING_TYPE_FAIL,
  GET_PRINTING_TYPES_REQUEST,
  GET_PRINTING_TYPES_SUCCESS,
  GET_PRINTING_TYPES_FAIL,
  UPDATE_PRINTING_TYPE_REQUEST,
  UPDATE_PRINTING_TYPE_SUCCESS,
  UPDATE_PRINTING_TYPE_FAIL,
  DELETE_PRINTING_TYPE_REQUEST,
  DELETE_PRINTING_TYPE_SUCCESS,
  DELETE_PRINTING_TYPE_FAIL
} from "./printingTypeConstants";

interface PrintingType {
  _id: string;
  name: string;
  code: string;
  category: string;
  description?: string;
  minColors?: number;
  maxColors?: number;
  isActive: boolean;
}

interface PrintingTypeState {
  printingTypes: PrintingType[];
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: PrintingTypeState = {
  printingTypes: [],
  loading: false,
  error: null,
  success: false
};

export const printingTypeReducer = (
  state = initialState,
  action: any
): PrintingTypeState => {
  switch (action.type) {
    case ADD_PRINTING_TYPE_REQUEST:
    case GET_PRINTING_TYPES_REQUEST:
    case UPDATE_PRINTING_TYPE_REQUEST:
    case DELETE_PRINTING_TYPE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        success: false
      };

    case ADD_PRINTING_TYPE_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        printingTypes: [...state.printingTypes, action.payload.printingType]
      };

    case GET_PRINTING_TYPES_SUCCESS:
      return {
        ...state,
        loading: false,
        printingTypes: action.payload
      };

    case UPDATE_PRINTING_TYPE_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        printingTypes: state.printingTypes.map(pt =>
          pt._id === action.payload.printingType._id
            ? action.payload.printingType
            : pt
        )
      };

    case DELETE_PRINTING_TYPE_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        printingTypes: state.printingTypes.filter(pt => pt._id !== action.payload)
      };

    case ADD_PRINTING_TYPE_FAIL:
    case GET_PRINTING_TYPES_FAIL:
    case UPDATE_PRINTING_TYPE_FAIL:
    case DELETE_PRINTING_TYPE_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false
      };

    default:
      return state;
  }
};
```

---

### Phase 2: Create Components

#### File 3: `CreatePrintingType.tsx`

```typescript
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addPrintingType } from "../../../../redux/create/printingType/printingTypeActions";
import { RootState } from "../../../../redux/rootReducer";
import { AppDispatch } from "../../../../../store";
import { ActionButton } from '../../../../../components/shared/ActionButton';
import { ToastContainer } from '../../../../../components/shared/Toast';
import { useCRUD } from '../../../../../hooks/useCRUD';
import "../CreateStep/createStep.css";
import "../../CreateOders/CreateOders.css";

const CreatePrintingType: React.FC = () => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [category, setCategory] = useState("digital");
  const [description, setDescription] = useState("");
  const [minColors, setMinColors] = useState(1);
  const [maxColors, setMaxColors] = useState(8);

  const dispatch = useDispatch<AppDispatch>();
  const { saveState, handleSave, toast } = useCRUD();

  const { loading } = useSelector(
    (state: RootState) => state.printingType
  );

  const handleSubmit = () => {
    if (!name.trim() || !code.trim()) {
      toast.error('Validation Error', 'Please fill all required fields');
      return;
    }

    handleSave(
      () => dispatch(addPrintingType(
        name.trim(),
        code.trim().toUpperCase(),
        category,
        description,
        minColors,
        maxColors
      )),
      {
        successMessage: 'Printing type created successfully!',
        onSuccess: () => {
          setName("");
          setCode("");
          setDescription("");
          setMinColors(1);
          setMaxColors(8);
        }
      }
    );
  };

  return (
    <div className="create-step-container">
      <div className="step-form-wrapper">
        <h2 className="form-title">Create Printing Type</h2>

        <div className="step-name-group">
          <label className="form-label">Printing Type Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="createDivInput createDivInputwidth"
            placeholder="e.g., Flexo Printing, Digital Print"
          />
        </div>

        <div className="step-name-group">
          <label className="form-label">Code *</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="createDivInput createDivInputwidth"
            placeholder="e.g., FLEXO, DIGITAL"
          />
        </div>

        <div className="step-name-group">
          <label className="form-label">Category *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="createDivInput createDivInputwidth"
          >
            <option value="digital">Digital</option>
            <option value="offset">Offset</option>
            <option value="flexo">Flexo</option>
            <option value="screen">Screen Printing</option>
            <option value="gravure">Gravure</option>
            <option value="letterpress">Letterpress</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="step-name-group">
          <label className="form-label">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="createDivInput createDivInputwidth"
            placeholder="Enter description"
            rows={3}
          />
        </div>

        <div className="step-name-group">
          <label className="form-label">Min Colors</label>
          <input
            type="number"
            value={minColors}
            onChange={(e) => setMinColors(Number(e.target.value))}
            className="createDivInput createDivInputwidth"
            min="1"
          />
        </div>

        <div className="step-name-group">
          <label className="form-label">Max Colors</label>
          <input
            type="number"
            value={maxColors}
            onChange={(e) => setMaxColors(Number(e.target.value))}
            className="createDivInput createDivInputwidth"
            min="1"
          />
        </div>

        <ActionButton
          type="save"
          state={saveState}
          onClick={handleSubmit}
          className="save-button"
          disabled={!name.trim() || !code.trim()}
        >
          Create Printing Type
        </ActionButton>

        <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
      </div>
    </div>
  );
};

export default CreatePrintingType;
```

---

### Phase 3: Image Upload Component

#### File 4: `PrintingImageUpload.tsx`

```typescript
import React, { useState } from "react";
import axios from "axios";
import "./printingImageUpload.css";

interface ImageUploadProps {
  printingId: string;
  onUploadComplete?: () => void;
}

const PrintingImageUpload: React.FC<ImageUploadProps> = ({ printingId, onUploadComplete }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [sides, setSides] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{[key: number]: number}>({});

  const baseUrl = import.meta.env.VITE_API_27INFINITY_IN;
  const apiKey = import.meta.env.VITE_API_KEY;
  const token = localStorage.getItem("authToken");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
      setSides(prev => [...prev, ...files.map(() => 'front')]);
    }
  };

  const handleSideChange = (index: number, side: string) => {
    setSides(prev => {
      const newSides = [...prev];
      newSides[index] = side;
      return newSides;
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setSides(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);

    try {
      const formData = new FormData();

      selectedFiles.forEach((file, index) => {
        formData.append('file', file);
        formData.append(`side_${index}`, sides[index]);
      });

      const response = await axios.post(
        `${baseUrl}/printing/${printingId}/images/upload`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-api-key': apiKey,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setProgress({ 0: percentCompleted });
            }
          }
        }
      );

      console.log('Upload response:', response.data);
      alert(`${response.data.message}\n\nCompression saved: ${response.data.uploadResults.map((r: any) =>
        r.compressed ? `${r.originalSizeMB}MB → ${r.finalSizeMB}MB` : 'No compression needed'
      ).join('\n')}`);

      // Clear form
      setSelectedFiles([]);
      setSides([]);
      setProgress({});

      if (onUploadComplete) {
        onUploadComplete();
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-upload-container">
      <h3>Upload Printing Images</h3>

      <div className="upload-section">
        <label className="file-input-label">
          <input
            type="file"
            multiple
            accept="image/*,application/pdf"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          <span>Choose Images</span>
        </label>

        {selectedFiles.length > 0 && (
          <div className="selected-files">
            <h4>Selected Images ({selectedFiles.length})</h4>
            {selectedFiles.map((file, index) => (
              <div key={index} className="file-item">
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="file-preview"
                />
                <div className="file-info">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <select
                  value={sides[index]}
                  onChange={(e) => handleSideChange(index, e.target.value)}
                  className="side-select"
                >
                  <option value="front">Front</option>
                  <option value="back">Back</option>
                  <option value="both">Both</option>
                  <option value="side">Side</option>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                </select>
                <button
                  onClick={() => removeFile(index)}
                  className="remove-btn"
                  disabled={uploading}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {selectedFiles.length > 0 && (
          <button
            onClick={uploadImages}
            disabled={uploading}
            className="upload-btn"
          >
            {uploading ? `Uploading... ${progress[0] || 0}%` : 'Upload Images'}
          </button>
        )}
      </div>

      <div className="upload-info">
        <p>✅ Supported formats: JPEG, PNG, SVG, WebP, PDF</p>
        <p>✅ Images over 5MB will be automatically compressed</p>
        <p>✅ Thumbnails generated automatically</p>
      </div>
    </div>
  );
};

export default PrintingImageUpload;
```

#### File 5: `printingImageUpload.css`

```css
.image-upload-container {
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.upload-section {
  margin: 20px 0;
}

.file-input-label {
  display: inline-block;
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.file-input-label:hover {
  background: #2563eb;
}

.file-input-label input {
  display: none;
}

.selected-files {
  margin-top: 20px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
  margin-bottom: 10px;
}

.file-preview {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.file-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.file-size {
  font-size: 12px;
  color: #6b7280;
}

.side-select {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}

.remove-btn {
  padding: 8px 12px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.remove-btn:hover {
  background: #dc2626;
}

.upload-btn {
  margin-top: 16px;
  padding: 12px 32px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.upload-btn:hover {
  background: #059669;
}

.upload-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.upload-info {
  margin-top: 20px;
  padding: 16px;
  background: #eff6ff;
  border-left: 4px solid #3b82f6;
  border-radius: 4px;
}

.upload-info p {
  margin: 4px 0;
  font-size: 14px;
  color: #1e40af;
}
```

---

## 🔗 Integration with rootReducer

Add to `/Users/gopalsingh/Desktop/27/27mainAll/main27/src/componest/redux/rootReducer.tsx`:

```typescript
import { printingTypeReducer } from './create/printingType/printingTypeReducer';
import { printingSpecReducer } from './create/printingSpec/printingSpecReducer';
import { printingReducer } from './create/printing/printingReducer';

// In combineReducers:
export const rootReducer = combineReducers({
  // ... existing reducers ...
  printingType: printingTypeReducer,
  printingSpec: printingSpecReducer,
  printing: printingReducer,
});
```

---

## 🚀 Quick Start

### Test Printing Type Creation:

1. Navigate to Create → Printing Type
2. Fill form:
   - Name: "Flexo Printing"
   - Code: "FLEXO"
   - Category: "flexo"
   - Min Colors: 1
   - Max Colors: 8
3. Click "Create Printing Type"
4. Success! ✅

### Test Image Upload:

1. Create a Printing configuration
2. Open Edit → Printing
3. Select image files (can be > 5MB)
4. Choose side (front/back) for each
5. Click "Upload Images"
6. Images automatically compressed! 📸

---

## 📊 Summary

**Total Files to Create: 20+**

- ✅ 1 Redux Constants (created)
- 📝 2 Redux Actions
- 📝 2 Redux Reducers
- 📝 3 Create Components
- 📝 3 Edit Components
- 📝 2 Image Management Components
- 📝 1 CSS File
- 📝 Integration with rootReducer

**Features:**
- Complete CRUD for Printing Types, Specs, and Instances
- Image upload with automatic compression
- Front/Back side designation
- Thumbnail generation
- Firebase Storage integration
- Progress indicators
- Error handling

---

**Status**: Ready for implementation
**Next Step**: Create the remaining Redux actions/reducers, then components
