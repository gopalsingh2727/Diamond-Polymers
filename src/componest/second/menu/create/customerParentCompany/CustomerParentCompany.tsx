import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { createParentCompanyV2, updateParentCompanyV2, deleteParentCompanyV2 } from "../../../../redux/unifiedV2";
import { RootState, AppDispatch } from "../../../../../store";
import { useInternalBackNavigation } from "../../../../allCompones/BackButton";
import { useCRUD } from "../../../../../hooks/useCRUD";
import { ToastContainer } from "../../../../../components/shared/Toast";
import "./CustomerParentCompany.css";

type ParentCompanyFormData = {
  name: string;
  description: string;
};

interface ParentCompanyData extends Partial<ParentCompanyFormData> {
  _id?: string;
}

interface LocationState {
  editMode?: boolean;
  initialData?: ParentCompanyData;
  itemId?: string;
}

interface Props {
  initialData?: ParentCompanyData;
  onCancel?: () => void;
  onSaveSuccess?: () => void;
}

type ValidationErrors = Partial<Record<keyof ParentCompanyFormData, string>>;

const CustomerParentCompany: React.FC<Props> = ({
  initialData: propInitialData = {},
  onCancel,
  onSaveSuccess,
}) => {
  const formRef = useRef<HTMLFormElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const navigate = useNavigate();

  const locationState = location.state as LocationState | null;
  const initialData: ParentCompanyData = locationState?.initialData || propInitialData;
  const itemId = locationState?.itemId || initialData?._id;
  const editMode = locationState?.editMode || !!initialData?._id;

  const { error: reduxError } = useSelector(
    (state: RootState) => state.v2.parentCompany
  );

  const { handleSave, handleDelete: crudDelete, saveState, deleteState, confirmDialog, closeConfirmDialog, toast } = useCRUD();

  const [formValues, setFormValues] = useState<ParentCompanyFormData>({
    name: initialData.name || "",
    description: initialData.description || "",
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const handleBackToList = () => {
    if (onSaveSuccess) {
      onSaveSuccess();
    } else if (onCancel) {
      onCancel();
    } else {
      navigate("/menu/edit", { state: { activeComponent: "customerParentCompany" } });
    }
  };

  useInternalBackNavigation(editMode && !confirmDialog.isOpen, handleBackToList);

  useEffect(() => {
    if (initialData && initialData._id) {
      setFormValues({
        name: initialData.name || "",
        description: initialData.description || "",
      });
    }
  }, [initialData]);

  useEffect(() => {
    if (saveState === 'success' && !reduxError && formRef.current && !editMode) {
      formRef.current.reset();
      setFormValues({
        name: "",
        description: "",
      });
    }
  }, [saveState, reduxError, editMode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = (): boolean => {
    const errors: ValidationErrors = {};

    if (!formValues.name.trim()) {
      errors.name = "Company name is required";
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
      handleSave(
        () => dispatch(
          updateParentCompanyV2(itemId, {
            name: formValues.name.trim(),
            description: formValues.description.trim(),
          })
        ),
        {
          successMessage: 'Parent company updated successfully',
          onSuccess: () => {
            setTimeout(() => {
              if (onSaveSuccess) {
                onSaveSuccess();
              } else {
                navigate("/menu/edit", { state: { activeComponent: "customerParentCompany" } });
              }
            }, 1500);
          }
        }
      );
    } else {
      handleSave(
        () => dispatch(
          createParentCompanyV2({
            name: formValues.name.trim(),
            description: formValues.description.trim(),
          })
        ),
        {
          successMessage: 'Parent company created successfully',
          onSuccess: () => {
            setFormValues({ name: "", description: "" });
          }
        }
      );
    }
  };

  const handleDeleteClick = () => {
    if (!itemId) return;

    crudDelete(
      () => dispatch(deleteParentCompanyV2(itemId)),
      {
        confirmTitle: 'Delete Parent Company?',
        confirmMessage: 'Are you sure you want to delete this parent company? This action cannot be undone.',
        successMessage: 'Parent company deleted successfully',
        onSuccess: () => {
          // Delay navigation to show toast
          setTimeout(() => {
            if (onSaveSuccess) {
              onSaveSuccess();
            } else {
              navigate("/menu/edit", { state: { activeComponent: "customerParentCompany" } });
            }
          }, 1500);
        }
      }
    );
  };

  return (
    <div className="customerParentCompany-container">
      <div className="customerParentCompany-form">

        {/* Delete Confirmation Modal */}
        {confirmDialog.isOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: "white",
                padding: "24px",
                borderRadius: "12px",
                maxWidth: "400px",
                width: "90%",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>Warning</div>
              <h3 style={{ margin: "0 0 8px 0", color: "#1f2937" }}>{confirmDialog.title}</h3>
              <p style={{ color: "#6b7280", marginBottom: "24px" }}>
                {confirmDialog.message}
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <button
                  type="button"
                  onClick={closeConfirmDialog}
                  style={{
                    padding: "10px 24px",
                    background: "#e5e7eb",
                    color: "#374151",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDialog.onConfirm}
                  disabled={deleteState === 'loading'}
                  style={{
                    padding: "10px 24px",
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  {deleteState === 'loading' ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {editMode && (
          <div className="customerParentCompany-header">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                style={{
                  padding: "8px 16px",
                  background: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                Back to List
              </button>
            )}
            <h2 className="customerParentCompany-header-title">Edit Parent Company</h2>
            <button
              type="button"
              onClick={handleDeleteClick}
              disabled={deleteState === 'loading'}
              style={{
                padding: "8px 16px",
                background: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "14px"
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" />
              </svg>
              {deleteState === 'loading' ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}

        {!editMode && <h2 className="customerParentCompany-title">Create Parent Company</h2>}

        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="customerParentCompany-group">
            <label className="customerParentCompany-label">Company Name *</label>
            <input
              className="customerParentCompany-input"
              name="name"
              value={formValues.name}
              onChange={handleChange}
              placeholder="e.g., Kalyan Jewellers, Malabar Gold"
            />
            {validationErrors.name && (
              <small className="customerParentCompany-error">{validationErrors.name}</small>
            )}
          </div>

          <div className="customerParentCompany-group">
            <label className="customerParentCompany-label">Description</label>
            <textarea
              className="customerParentCompany-textarea"
              name="description"
              value={formValues.description}
              onChange={handleChange}
              placeholder="Enter company description..."
            />
          </div>

          {reduxError && <div className="customerParentCompany-error">{reduxError}</div>}

          <button className="customerParentCompany-button" type="submit" disabled={saveState === 'loading'}>
            {saveState === 'loading' ? "Saving..." : editMode ? "Update Parent Company" : "Create Parent Company"}
          </button>
        </form>
      </div>
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

export default CustomerParentCompany;
