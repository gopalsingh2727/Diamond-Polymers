import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  createCustomerCategory,
  updateCustomerCategory,
  deleteCustomerCategory,
  getCustomerCategories,
} from "../../../../redux/create/customerCategory/CustomerCategoryActions";
import { RootState, AppDispatch } from "../../../../../store";
import { useInternalBackNavigation } from "../../../../allCompones/BackButton";
import "../createNewAccount/createNewAccount.css";

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

  const locationState = location.state as LocationState | null;
  const initialData: CategoryData = locationState?.initialData || propInitialData;
  const itemId = locationState?.itemId || initialData?._id;
  const editMode = locationState?.editMode || !!initialData?._id;

  const { loading, error: reduxError } = useSelector(
    (state: RootState) => state.createCustomerCategory || { loading: false }
  );

  const [formValues, setFormValues] = useState<CategoryFormData>({
    name: initialData.name || "",
    description: initialData.description || "",
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleBackToList = () => {
    if (onSaveSuccess) {
      onSaveSuccess();
    } else if (onCancel) {
      onCancel();
    } else {
      navigate("/menu/edit", { state: { activeComponent: "customerCategory" } });
    }
  };

  useInternalBackNavigation(editMode && !showDeleteConfirm, handleBackToList);

  useEffect(() => {
    if (initialData && initialData._id) {
      setFormValues({
        name: initialData.name || "",
        description: initialData.description || "",
      });
    }
  }, [initialData]);

  useEffect(() => {
    if (!loading && !reduxError && formRef.current && !editMode) {
      formRef.current.reset();
      setFormValues({
        name: "",
        description: "",
      });
    }
  }, [loading, reduxError, editMode]);

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

    try {
      if (editMode && itemId) {
        await dispatch(
          updateCustomerCategory(itemId, {
            name: formValues.name.trim(),
            description: formValues.description.trim(),
          })
        );

        if (onSaveSuccess) {
          onSaveSuccess();
        } else {
          navigate("/menu/edit", { state: { activeComponent: "customerCategory" } });
        }
      } else {
        await dispatch(
          createCustomerCategory({
            name: formValues.name.trim(),
            description: formValues.description.trim(),
          })
        );

        // Reset form after successful creation
        setFormValues({ name: "", description: "" });
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleDelete = async () => {
    if (!itemId) return;

    setDeleting(true);
    try {
      await dispatch(deleteCustomerCategory(itemId));
      setShowDeleteConfirm(false);
      if (onSaveSuccess) {
        onSaveSuccess();
      } else {
        navigate("/menu/edit", { state: { activeComponent: "customerCategory" } });
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div id="CreateAccountCss">
      <div className="CreateAccountTitelCss">
        <h6>{editMode ? "Edit Customer Category" : "Create Customer Category"}</h6>
      </div>
      <div className="create-account-container">
        {editMode && (
          <div
            style={{
              marginBottom: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
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
                }}
              >
                Back to List
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
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
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" />
              </svg>
              Delete
            </button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
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
              <h3 style={{ margin: "0 0 8px 0", color: "#1f2937" }}>Delete Category?</h3>
              <p style={{ color: "#6b7280", marginBottom: "24px" }}>
                Are you sure you want to delete this category? This action cannot be undone.
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
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
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{
                    padding: "10px 24px",
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="form-container">
          <div className="form-group-createAccount">
            <label>Category Name *</label>
            <input
              className="CurstomerAddressInput"
              name="name"
              value={formValues.name}
              onChange={handleChange}
              placeholder="e.g., Premium, Corporate, Non-Premium"
            />
            {validationErrors.name && (
              <small className="error-text">{validationErrors.name}</small>
            )}
          </div>

          <div className="form-group-createAccount">
            <label>Description</label>
            <textarea
              className="CurstomerAddressInput"
              name="description"
              value={formValues.description}
              onChange={handleChange}
              placeholder="Enter category description..."
              rows={3}
              style={{ resize: "vertical", minHeight: "80px" }}
            />
          </div>

          {reduxError && <div className="error-text">{reduxError}</div>}

          <div className="form-group">
            <button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : editMode
                ? "Update Category"
                : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerCategory;
