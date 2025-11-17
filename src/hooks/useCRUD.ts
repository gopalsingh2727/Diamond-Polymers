import { useState, useCallback } from 'react';
import { ActionState } from '../components/shared/ActionButton';
import { useToast } from './useToast';

export interface CRUDOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  showToast?: boolean;
}

export interface CRUDState {
  saveState: ActionState;
  updateState: ActionState;
  deleteState: ActionState;
}

export const useCRUD = <T = any>() => {
  const toast = useToast();
  const [crudState, setCrudState] = useState<CRUDState>({
    saveState: 'idle',
    updateState: 'idle',
    deleteState: 'idle'
  });

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    message: string;
    title: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    message: '',
    title: '',
    onConfirm: () => {}
  });

  // Save Operation
  const handleSave = useCallback(async (
    saveFunction: () => Promise<T>,
    options: CRUDOptions<T> = {}
  ) => {
    const {
      onSuccess,
      onError,
      successMessage = 'Data saved successfully',
      errorMessage = 'Failed to save data',
      showToast = true
    } = options;

    try {
      setCrudState(prev => ({ ...prev, saveState: 'loading' }));

      const result = await saveFunction();

      setCrudState(prev => ({ ...prev, saveState: 'success' }));

      if (showToast) {
        toast.success('Saved!', successMessage);
      }

      if (onSuccess) {
        onSuccess(result);
      }

      // Reset to idle after animation
      setTimeout(() => {
        setCrudState(prev => ({ ...prev, saveState: 'idle' }));
      }, 2000);

      return result;
    } catch (error) {
      setCrudState(prev => ({ ...prev, saveState: 'error' }));

      if (showToast) {
        toast.error('Save Failed', error instanceof Error ? error.message : errorMessage);
      }

      if (onError) {
        onError(error instanceof Error ? error : new Error(errorMessage));
      }

      // Reset to idle after showing error
      setTimeout(() => {
        setCrudState(prev => ({ ...prev, saveState: 'idle' }));
      }, 2000);

      throw error;
    }
  }, [toast]);

  // Update Operation
  const handleUpdate = useCallback(async (
    updateFunction: () => Promise<T>,
    options: CRUDOptions<T> = {}
  ) => {
    const {
      onSuccess,
      onError,
      successMessage = 'Data updated successfully',
      errorMessage = 'Failed to update data',
      showToast = true
    } = options;

    try {
      setCrudState(prev => ({ ...prev, updateState: 'loading' }));

      const result = await updateFunction();

      setCrudState(prev => ({ ...prev, updateState: 'success' }));

      if (showToast) {
        toast.success('Updated!', successMessage);
      }

      if (onSuccess) {
        onSuccess(result);
      }

      setTimeout(() => {
        setCrudState(prev => ({ ...prev, updateState: 'idle' }));
      }, 2000);

      return result;
    } catch (error) {
      setCrudState(prev => ({ ...prev, updateState: 'error' }));

      if (showToast) {
        toast.error('Update Failed', error instanceof Error ? error.message : errorMessage);
      }

      if (onError) {
        onError(error instanceof Error ? error : new Error(errorMessage));
      }

      setTimeout(() => {
        setCrudState(prev => ({ ...prev, updateState: 'idle' }));
      }, 2000);

      throw error;
    }
  }, [toast]);

  // Delete Operation (with confirmation)
  const handleDelete = useCallback(async (
    deleteFunction: () => Promise<T>,
    options: CRUDOptions<T> & { confirmMessage?: string; confirmTitle?: string } = {}
  ) => {
    const {
      onSuccess,
      onError,
      successMessage = 'Data deleted successfully',
      errorMessage = 'Failed to delete data',
      showToast = true,
      confirmMessage = 'Are you sure you want to delete this? This action cannot be undone.',
      confirmTitle = 'Confirm Delete'
    } = options;

    return new Promise<T>((resolve, reject) => {
      setConfirmDialog({
        isOpen: true,
        message: confirmMessage,
        title: confirmTitle,
        onConfirm: async () => {
          setConfirmDialog({ isOpen: false, message: '', title: '', onConfirm: () => {} });

          try {
            setCrudState(prev => ({ ...prev, deleteState: 'loading' }));

            const result = await deleteFunction();

            setCrudState(prev => ({ ...prev, deleteState: 'success' }));

            if (showToast) {
              toast.success('Deleted!', successMessage);
            }

            if (onSuccess) {
              onSuccess(result);
            }

            setTimeout(() => {
              setCrudState(prev => ({ ...prev, deleteState: 'idle' }));
            }, 2000);

            resolve(result);
          } catch (error) {
            setCrudState(prev => ({ ...prev, deleteState: 'error' }));

            if (showToast) {
              toast.error('Delete Failed', error instanceof Error ? error.message : errorMessage);
            }

            if (onError) {
              onError(error instanceof Error ? error : new Error(errorMessage));
            }

            setTimeout(() => {
              setCrudState(prev => ({ ...prev, deleteState: 'idle' }));
            }, 2000);

            reject(error);
          }
        }
      });
    });
  }, [toast]);

  const closeConfirmDialog = useCallback(() => {
    setConfirmDialog({ isOpen: false, message: '', title: '', onConfirm: () => {} });
  }, []);

  return {
    ...crudState,
    handleSave,
    handleUpdate,
    handleDelete,
    confirmDialog,
    closeConfirmDialog,
    toast,
    resetStates: () => setCrudState({
      saveState: 'idle',
      updateState: 'idle',
      deleteState: 'idle'
    })
  };
};
