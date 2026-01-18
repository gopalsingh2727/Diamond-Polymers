import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { createCustomerCategoryV2, updateCustomerCategoryV2, deleteCustomerCategoryV2 } from "../../../../redux/unifiedV2";
import { RootState, AppDispatch } from "../../../../../store";
import { useInternalBackNavigation } from "../../../../allCompones/BackButton";
import { useCRUD } from "../../../../../hooks/useCRUD";
import { ToastContainer } from "../../../../../components/shared/Toast";
import HelpDocModal, { HelpButton } from "../../../../../components/shared/HelpDocModal";
import { customerCategoryHelp } from "../../../../../components/shared/helpContent";
import { useFormDataCache } from "../../Edit/hooks/useFormDataCache";
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
  const itemId = locationState?.itemId || initialData?._id || (initialData as any)?.id;
  const editMode = locationState?.editMode || !!(initialData?._id || (initialData as any)?.id);

  const { error: reduxError } = useSelector(
    (state: RootState) => state.v2.customerCategory
  );

  // Get customers from cache
  const { customers } = useFormDataCache();

  // Filter customers that use this category
  const relatedCustomers = useMemo(() => {
    if (!editMode || !itemId) return [];
    return customers.filter((customer: any) => {
      const categoryId = typeof customer.categoryId === 'object'
        ? customer.categoryId?._id
        : customer.categoryId;
      return categoryId === itemId;
    });
  }, [customers, itemId, editMode]);

  const [formValues, setFormValues] = useState<CategoryFormData>({
    name: initialData.name || "",
    description: initialData.description || "",
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showHelpModal, setShowHelpModal] = useState(false);

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
    const hasId = initialData && (initialData._id || (initialData as any)?.id);
    if (hasId) {
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
    <div className={`customerCategory-container ${editMode ? 'edit-mode' : ''}`}>
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
          <div className="customerCategory-top-buttons">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="customerCategory-back-btn"
              >
                Back to List
              </button>
            )}
            <button
              type="button"
              onClick={handleDeleteClick}
              disabled={deleteState === 'loading'}
              className="customerCategory-delete-btn"
            >
              {deleteState === 'loading' ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}

        {!editMode && (
          <div className="customerCategory-title-row">
            <h2 className="customerCategory-title">Create Customer Category</h2>
            <HelpButton onClick={() => setShowHelpModal(true)} size="medium" />
          </div>
        )}
        {editMode && (
          <div className="customerCategory-title-row">
            <h2 className="customerCategory-title">Edit Customer Category</h2>
            <HelpButton onClick={() => setShowHelpModal(true)} size="medium" />
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit}>
          {editMode ? (
            <div className="customerCategory-form-row">
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
                <input
                  className="customerCategory-input"
                  name="description"
                  value={formValues.description}
                  onChange={handleChange}
                  placeholder="Enter category description..."
                />
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}

          {reduxError && <div className="customerCategory-error">{reduxError}</div>}

          <button className="customerCategory-button" type="submit" disabled={saveState === 'loading'}>
            {saveState === 'loading' ? "Saving..." : editMode ? "Update Category" : "Create Category"}
          </button>
        </form>
      </div>

      {/* Related Customers Table - Only in Edit Mode */}
      {editMode && relatedCustomers.length > 0 && (
        <div className="customerCategory-customers-section">
          <h3 className="customerCategory-customers-title">
            Customers in this Category ({relatedCustomers.length})
          </h3>
          <div className="customerCategory-table-wrapper">
            <table className="customerCategory-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Company Name</th>
                  <th>Contact Name</th>
                  <th>Phone</th>
                  <th>State</th>
                </tr>
              </thead>
              <tbody>
                {relatedCustomers.map((customer: any, index: number) => (
                  <tr key={customer._id}>
                    <td>{index + 1}</td>
                    <td>{customer.companyName || "N/A"}</td>
                    <td>
                      {[customer.firstName, customer.lastName].filter(Boolean).join(" ") || "N/A"}
                    </td>
                    <td>{customer.phone1 || "N/A"}</td>
                    <td>{customer.state || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Help Documentation Modal */}
      <HelpDocModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        content={customerCategoryHelp}
      />

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

export default CustomerCategory;
