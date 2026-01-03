import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { createCustomerCategoryV2, updateCustomerCategoryV2, deleteCustomerCategoryV2 } from "../../../../redux/unifiedV2";
import { RootState, AppDispatch } from "../../../../../store";
import { useInternalBackNavigation } from "../../../../allCompones/BackButton";
import { useCRUD } from "../../../../../hooks/useCRUD";
import { ToastContainer } from "../../../../../components/shared/Toast";
import "./CustomerCategory.css";

type CategoryFormData = {
  name: string;
  description: string;
};

interface CategoryData extends Partial<CategoryFormData> {
  _id?: string;
}

interface LocationState {
  editMode?: boolean;
  initialData?: CategoryData;
  itemId?: string;
}

interface Props {
  initialData?: CategoryData;
  onCancel?: () => void;
  onSaveSuccess?: () => void;
}

type ValidationErrors = Partial<Record<keyof CategoryFormData, string>>;

const CustomerCategory: React.FC<Props> = ({
  initialData: propInitialData = {},
  onCancel,
  onSaveSuccess,
}) => {
  const formRef = useRef<HTMLFormElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const navigate = useNavigate();
  const { handleSave, handleDelete: crudDelete, saveState, deleteState, confirmDialog, closeConfirmDialog, toast } = useCRUD();

  const locationState = location.state as LocationState | null;
  const initialData: CategoryData = locationState?.initialData || propInitialData;
  const itemId = locationState?.itemId || initialData?._id;
  const editMode = locationState?.editMode || !!initialData?._id;

  const { error: reduxError } = useSelector(
    (state: RootState) => state.v2.customerCategory
  );

  const [formValues, setFormValues] = useState<CategoryFormData>({
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
      navigate("/menu/edit", { state: { activeComponent: "customerCategory" } });
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
      errors.name = "Category name is required";
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
          updateCustomerCategoryV2(itemId, {
            name: formValues.name.trim(),
            description: formValues.description.trim(),
          })
        ),
        {
          successMessage: 'Category updated successfully',
          onSuccess: () => {
            setTimeout(() => {
              if (onSaveSuccess) {
                onSaveSuccess();
              } else {
                navigate("/menu/edit", { state: { activeComponent: "customerCategory" } });
              }
            }, 1500);
          }
        }
      );
    } else {
      handleSave(
        () => dispatch(
          createCustomerCategoryV2({
            name: formValues.name.trim(),
            description: formValues.description.trim(),
          })
        ),
        {
          successMessage: 'Category created successfully',
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
      () => dispatch(deleteCustomerCategoryV2(itemId)),
      {
        confirmTitle: 'Delete Category?',
        confirmMessage: 'Are you sure you want to delete this category? This action cannot be undone.',
        successMessage: 'Category deleted successfully',
        onSuccess: () => {
          // Delay navigation to show toast
          setTimeout(() => {
            if (onSaveSuccess) {
              onSaveSuccess();
            } else {
              navigate("/menu/edit", { state: { activeComponent: "customerCategory" } });
            }
          }, 1500);
        }
      }
    );
  };

  return (
    <div className="customerCategory-container">
      <div className="customerCategory-form">

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
          <div className="customerCategory-header">
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
            <h2 className="customerCategory-header-title">Edit Customer Category</h2>
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

        {!editMode && <h2 className="customerCategory-title">Create Customer Category</h2>}

        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="customerCategory-group">
            <label className="customerCategory-label">Category Name *</label>
            <input
              className="customerCategory-input"
              name="name"
              value={formValues.name}
              onChange={handleChange}
              placeholder="e.g., Premium, Corporate, Non-Premium"
            />
            {validationErrors.name && (
              <small className="customerCategory-error">{validationErrors.name}</small>
            )}
          </div>

          <div className="customerCategory-group">
            <label className="customerCategory-label">Description</label>
            <textarea
              className="customerCategory-textarea"
              name="description"
              value={formValues.description}
              onChange={handleChange}
              placeholder="Enter category description..."
            />
          </div>

          {reduxError && <div className="customerCategory-error">{reduxError}</div>}

          <button className="customerCategory-button" type="submit" disabled={saveState === 'loading'}>
            {saveState === 'loading' ? "Saving..." : editMode ? "Update Category" : "Create Category"}
          </button>
        </form>
      </div>
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

export default CustomerCategory;
