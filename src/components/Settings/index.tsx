import { useCallback, useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadChatSettings, updateChatSettings } from '../../componest/redux/chat/chatActions';
import { setSelectedBranchInAuth } from '../../componest/redux/login/authActions';
import Modal from '../update/Modal/index';
import MobileQRModal from './MobileQRModal';
import './Settings.css';

// Dropdown Menu Component using createPortal
const DropdownMenu = ({
  isOpen,
  onClose,
  buttonRef,
  children





}: {isOpen: boolean;onClose: () => void;buttonRef: React.RefObject<HTMLButtonElement>;children: React.ReactNode;}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: rect.right - 200 // Align to right edge
      });
    }
  }, [isOpen, buttonRef]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        const dropdownElement = document.querySelector('.settings-dropdown-portal');
        if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
          onClose();
        }
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, buttonRef]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="settings-dropdown-portal"
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 999999,
        minWidth: '200px'
      }}>

      <div className="settings-dropdown-menu">
        {children}
      </div>
    </div>,
    document.body
  );
};

interface ChatSettings {
  assistantName: string;
  voiceGender: 'male' | 'female';
  language: string;
  autoSpeak: boolean;
  speechRate: number;
  isEnabled: boolean;
}

interface ChatRootState {
  chat: {
    settings: ChatSettings | null;
  };
}

type VersionInfo = {
  version: string;
  newVersion: string;
  update: boolean;
  releaseNotes?: string;
};

type ErrorType = {
  message: string;
  [key: string]: any;
};

type DownloadProgress = {
  progress: number;
  downloaded: number;
  total: number;
};

type UpdateStatus = 'idle' | 'checking' | 'downloading' | 'downloaded' | 'installing';

interface BranchOption {
  _id: string;
  name: string;
  code?: string;
}

interface SettingsProps {
  branchName?: string;
  onBranchClick?: () => void;
  showBranchOption?: boolean;
  userBranches?: BranchOption[];
  selectedBranchId?: string;
  userRole?: string;
}

const Settings = ({ branchName, onBranchClick, showBranchOption = false, userBranches = [], selectedBranchId = '', userRole }: SettingsProps) => {
  const dispatch = useDispatch();
  const chatSettings = useSelector((state: ChatRootState) => state.chat?.settings);

  const [isOpen, setIsOpen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showChatSettings, setShowChatSettings] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Chat settings local state
  const [localChatSettings, setLocalChatSettings] = useState<ChatSettings>({
    assistantName: 'Assistant',
    voiceGender: 'female',
    language: 'en-IN',
    autoSpeak: false,
    speechRate: 1,
    isEnabled: true
  });

  // Update states
  const [status, setStatus] = useState<UpdateStatus>('idle');
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [versionInfo, setVersionInfo] = useState<VersionInfo>();
  const [updateError, setUpdateError] = useState<ErrorType>();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({ progress: 0, downloaded: 0, total: 0 });

  // Theme state
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) {
        return saved === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Theme effect
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    setIsOpen(false);
  };

  // Load chat settings on mount
  useEffect(() => {
    dispatch(loadChatSettings() as any);
  }, [dispatch]);

  // Sync local state with Redux
  useEffect(() => {
    if (chatSettings) {
      setLocalChatSettings(chatSettings);
    }
  }, [chatSettings]);

  const handleSaveChatSettings = async () => {
    await dispatch(updateChatSettings(localChatSettings) as any);
    setShowChatSettings(false);
  };


  const checkUpdate = async () => {
    setIsOpen(false);
    setStatus('checking');
    const result = await window.ipcRenderer.invoke('check-update');
    setStatus('idle');
    setModalOpen(true);

    if (result?.error) {
      setUpdateAvailable(false);
      setUpdateError(result?.error);
      if (result?.version) {
        setVersionInfo({
          version: result.version,
          newVersion: result.version,
          update: false
        });
      }
    } else {
      setVersionInfo(result);
      setUpdateError(undefined);
      setUpdateAvailable(result.update);
    }
  };

  const onUpdateCanAvailable = useCallback(
    (_event: Electron.IpcRendererEvent, info: VersionInfo) => {
      setVersionInfo(info);
      setUpdateError(undefined);
      setUpdateAvailable(info.update);

      if (info.update) {
        setModalOpen(true);
      }
    },
    []
  );

  const onUpdateError = useCallback(
    (_event: Electron.IpcRendererEvent, err: ErrorType) => {
      setUpdateAvailable(false);
      setUpdateError(err);
      setStatus('idle');
    },
    []
  );

  const onDownloadProgress = useCallback(
    (_event: Electron.IpcRendererEvent, progress: DownloadProgress) => {
      setDownloadProgress(progress);
    },
    []
  );

  const startDownload = async () => {
    try {
      setStatus('downloading');
      setDownloadProgress({ progress: 0, downloaded: 0, total: 0 });

      const result = await window.ipcRenderer.invoke('download-update');

      if (result.success) {
        setStatus('downloaded');
      } else {
        setUpdateError({ message: result.error || 'Download failed' });
        setStatus('idle');
      }
    } catch (err) {

      setUpdateError({ message: 'Download failed' });
      setStatus('idle');
    }
  };

  const installUpdate = async () => {
    try {
      setStatus('installing');
      const result = await window.ipcRenderer.invoke('install-update');

      if (!result.success) {
        setUpdateError({ message: result.error || 'Installation failed' });
        setStatus('downloaded');
      }
    } catch (err) {

      setUpdateError({ message: 'Installation failed' });
      setStatus('downloaded');
    }
  };

  const openDownloadPage = async () => {
    try {
      await window.ipcRenderer.invoke('open-download-page');
    } catch (err) {

    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getModalButtons = () => {
    if (status === 'downloading') {
      return {
        okText: 'Downloading...',
        cancelText: 'Cancel',
        onOk: () => {},
        onCancel: () => setModalOpen(false)
      };
    }

    if (status === 'downloaded') {
      return {
        okText: 'Install Now',
        cancelText: 'Later',
        onOk: installUpdate,
        onCancel: () => setModalOpen(false)
      };
    }

    if (status === 'installing') {
      return {
        okText: 'Installing...',
        cancelText: 'Cancel',
        onOk: () => {},
        onCancel: () => {}
      };
    }

    if (updateAvailable) {
      return {
        okText: 'Download',
        cancelText: 'Later',
        onOk: startDownload,
        onCancel: () => setModalOpen(false)
      };
    }

    return {
      okText: 'OK',
      cancelText: 'Close',
      onOk: () => setModalOpen(false),
      onCancel: () => setModalOpen(false)
    };
  };

  useEffect(() => {
    window.ipcRenderer.on('update-can-available', onUpdateCanAvailable);
    window.ipcRenderer.on('update-error', onUpdateError);
    window.ipcRenderer.on('download-progress', onDownloadProgress);

    return () => {
      window.ipcRenderer.off('update-can-available', onUpdateCanAvailable);
      window.ipcRenderer.off('update-error', onUpdateError);
      window.ipcRenderer.off('download-progress', onDownloadProgress);
    };
  }, [onUpdateCanAvailable, onUpdateError, onDownloadProgress]);

  const modalButtons = getModalButtons();

  return (
    <div className="settings-container">
      {/* Settings Icon Button */}
      <button
        ref={buttonRef}
        className="settings-icon-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Settings">

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          width="20"
          height="20">

          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </button>

      {/* Settings Dropdown Menu - Using createPortal */}
      <DropdownMenu
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        buttonRef={buttonRef}>

        {showBranchOption && (
        userBranches.length > 0 ?
        <div className="settings-branch-selector">
              <div className="settings-branch-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>Branch</span>
              </div>
              <select
            className="settings-branch-dropdown"
            value={selectedBranchId}
            onChange={(e) => {
              dispatch(setSelectedBranchInAuth(e.target.value) as any);
            }}>

                {!selectedBranchId &&
            <option value="" disabled>Select Branch</option>
            }
                {userBranches.map((branch) =>
            <option key={branch._id} value={branch._id}>
                    {branch.name} {branch.code ? `(${branch.code})` : ''}
                  </option>
            )}
              </select>
            </div> :
        userRole === 'master_admin' ?
        <div className="settings-menu-item settings-no-branches">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              No branches - Create in Settings
            </div> :

        <button
          className="settings-menu-item"
          onClick={() => {
            if (onBranchClick) onBranchClick();
            setIsOpen(false);
          }}>

              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              {branchName || 'Select Branch'}
            </button>)

        }

        {/* Master Admin Only - Create & Management Section */}
        {userRole === 'master_admin' &&
        <>
            <div className="settings-section-divider">
              <span className="settings-section-label">Create & Manage</span>
            </div>
            <button
            className="settings-menu-item"
            onClick={() => {
              window.location.hash = '/menu/SystemSetting';
              setIsOpen(false);
            }}>

              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
  <line x1="4" y1="21" x2="4" y2="14"></line>
  <line x1="4" y1="10" x2="4" y2="3"></line>
  <line x1="12" y1="21" x2="12" y2="12"></line>
  <line x1="12" y1="8" x2="12" y2="3"></line>
  <line x1="20" y1="21" x2="20" y2="16"></line>
  <line x1="20" y1="12" x2="20" y2="3"></line>
  <line x1="1" y1="14" x2="7" y2="14"></line>
  <line x1="9" y1="8" x2="15" y2="8"></line>
  <line x1="17" y1="16" x2="23" y2="16"></line>
            </svg>
              Create and Manage 
            </button>
        

       
     

            <div className="settings-section-divider">
              <span className="settings-section-label">Integrations</span>
            </div>
            <button
            className="settings-menu-item"
            onClick={() => {
              window.location.hash = '/settings/master';
              setIsOpen(false);
            }}>

              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              Email Settings
            </button>
            <button
            className="settings-menu-item"
            onClick={() => {
              window.location.hash = '/settings/master';
              setIsOpen(false);
            }}>

              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              WhatsApp Settings
            </button>
            <button
            className="settings-menu-item"
            onClick={() => {
              window.location.hash = '/settings/master';
              setIsOpen(false);
            }}>

              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              API Keys
            </button>

            <div className="settings-section-divider">
              <span className="settings-section-label">Payroll & Employees</span>
            </div>
            <button
            className="settings-menu-item"
            onClick={() => {
              window.location.hash = '/menu/create-employee';
              setIsOpen(false);
            }}>

              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
              Create Employee
            </button>
            <button
            className="settings-menu-item"
            onClick={() => {
              window.location.hash = '/menu/edit-employee';
              setIsOpen(false);
            }}>

              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Edit Employee
            </button>
            <button
            className="settings-menu-item"
            onClick={() => {
              window.location.hash = '/menu/payroll';
              setIsOpen(false);
            }}>

              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
              Payroll Management
            </button>
            <button
            className="settings-menu-item"
            onClick={() => {
              window.location.hash = '/menu/payroll-settings';
              setIsOpen(false);
            }}>

              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
              </svg>
              Payroll Settings
            </button>

            <div className="settings-section-divider">
              <span className="settings-section-label">Billing</span>
            </div>
            <button
            className="settings-menu-item"
            onClick={() => {
              window.location.hash = '/menu/Account';
              setIsOpen(false);
            }}>

              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
              Current Bill
            </button>
            <button
            className="settings-menu-item"
            onClick={() => {
              window.location.hash = '/menu/AccountInfo';
              setIsOpen(false);
            }}>

              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Payment History
            </button>
          </>
        }

        {/* Manager Only - Create & Edit Section */}
        {userRole === 'manager' &&
        <>
            <div className="settings-section-divider">
              <span className="settings-section-label">Create & Manage</span>
            </div>
            <button
            className="settings-menu-item"
            onClick={() => {
              window.location.hash = '/menu/create-employee';
              setIsOpen(false);
            }}>

              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
              Create Employee
            </button>

            <div className="settings-section-divider">
              <span className="settings-section-label">Payroll & Employees</span>
            </div>
            <button
            className="settings-menu-item"
            onClick={() => {
              window.location.hash = '/menu/edit-employee';
              setIsOpen(false);
            }}>

              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Edit Employee
            </button>
            <button
            className="settings-menu-item"
            onClick={() => {
              window.location.hash = '/menu/payroll';
              setIsOpen(false);
            }}>

              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
              Payroll Management
            </button>
            <button
            className="settings-menu-item"
            onClick={() => {
              window.location.hash = '/menu/payroll-settings';
              setIsOpen(false);
            }}>

              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
              </svg>
              Payroll Settings
            </button>
          </>
        }

        <div className="settings-section-divider">
          <span className="settings-section-label">General</span>
        </div>

        {/* Mobile QR Login - Admin Only */}
        {(userRole === 'master_admin' || userRole === 'admin') &&
        <button
          className="settings-menu-item"
          onClick={() => {
            setShowQRModal(true);
            setIsOpen(false);
          }}>

            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
              <rect x="14" y="14" width="3" height="3"></rect>
              <rect x="18" y="14" width="3" height="3"></rect>
              <rect x="14" y="18" width="3" height="3"></rect>
              <rect x="18" y="18" width="3" height="3"></rect>
            </svg>
            Mobile QR Login
          </button>
        }

        <button
          className="settings-menu-item"
          onClick={() => {
            setShowAbout(true);
            setIsOpen(false);
          }}>

          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          About
        </button>
        <button
          className="settings-menu-item"
          onClick={() => {
            setShowChatSettings(true);
            setIsOpen(false);
          }}>

          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          Chat Assistant
        </button>
        <button
          className="settings-menu-item"
          onClick={checkUpdate}
          disabled={status === 'checking'}>

          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
          </svg>
          {status === 'checking' ? 'Checking...' : 'Check for Updates'}
        </button>
        <button
          className="settings-menu-item"
          onClick={toggleTheme}>

          {isDark ?
          <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Switch to Light Mode
            </> :

          <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              Switch to Dark Mode
            </>
          }
        </button>
      </DropdownMenu>

      {/* About Modal - Using the same Modal component */}
      <Modal
        open={showAbout}
        okText="OK"
        cancelText=""
        onOk={() => setShowAbout(false)}
        onCancel={() => setShowAbout(false)}>

        <div style={{ textAlign: 'center', padding: '10px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 16px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #FF6B35, #FFA500)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '32px', fontWeight: '700', color: 'white' }}>27</span>
          </div>
          <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: '600' }}>27 Manufacturing</h2>
          <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#666' }}>Version 1.0.10</p>
          <p style={{ margin: '0 0 20px', fontSize: '14px', color: '#555', lineHeight: '1.5' }}>
            Manufacturing management system for orders, machines, operators, and analytics.
          </p>
          <div style={{
            textAlign: 'left',
            padding: '16px',
            background: '#f8f9fa',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <p style={{ margin: '4px 0', fontSize: '13px', color: '#555' }}>
              <strong style={{ color: '#333' }}>Author:</strong> 27 Infinity
            </p>
            <p style={{ margin: '4px 0', fontSize: '13px', color: '#555' }}>
              <strong style={{ color: '#333' }}>Website:</strong>{' '}
              <a href="https://27infinity.in" target="_blank" rel="noopener noreferrer" style={{ color: '#FF6B35', textDecoration: 'none' }}>
                27infinity.in
              </a>
            </p>
            <p style={{ margin: '4px 0', fontSize: '13px', color: '#555' }}>
              <strong style={{ color: '#333' }}>Email:</strong> contact@27infinity.in
            </p>
          </div>
          <p style={{ margin: '0', fontSize: '12px', color: '#999' }}>
            &copy; {new Date().getFullYear()} 27 Infinity. All rights reserved.
          </p>
        </div>
      </Modal>

      {/* Chat Settings Modal - Using the same Modal component */}
      <Modal
        open={showChatSettings}
        okText="Save Settings"
        cancelText="Cancel"
        onOk={handleSaveChatSettings}
        onCancel={() => setShowChatSettings(false)}>

        <div style={{ padding: '10px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: '#FF6B35' }}>
            Chat Assistant Settings
          </h3>

          {/* Enable/Disable */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={localChatSettings.isEnabled}
                onChange={(e) => setLocalChatSettings({ ...localChatSettings, isEnabled: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#FF6B00' }} />

              <span style={{ fontWeight: '500' }}>Enable Chat Assistant</span>
            </label>
          </div>

          {/* Assistant Name */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
              Assistant Name
            </label>
            <input
              type="text"
              value={localChatSettings.assistantName}
              onChange={(e) => setLocalChatSettings({ ...localChatSettings, assistantName: e.target.value })}
              placeholder="e.g., KALESHI, Helper"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '14px',
                boxSizing: 'border-box'
              }} />

          </div>

          {/* Voice Gender */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
              Voice Gender
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="voiceGender"
                  checked={localChatSettings.voiceGender === 'female'}
                  onChange={() => setLocalChatSettings({ ...localChatSettings, voiceGender: 'female' })}
                  style={{ accentColor: '#FF6B00' }} />

                Female
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="voiceGender"
                  checked={localChatSettings.voiceGender === 'male'}
                  onChange={() => setLocalChatSettings({ ...localChatSettings, voiceGender: 'male' })}
                  style={{ accentColor: '#FF6B00' }} />

                Male
              </label>
            </div>
          </div>

          {/* Language */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
              Language
            </label>
            <select
              value={localChatSettings.language}
              onChange={(e) => setLocalChatSettings({ ...localChatSettings, language: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}>

              <option value="en-IN">English (India)</option>
              <option value="en-US">English (US)</option>
              <option value="hi-IN">Hindi</option>
            </select>
          </div>

          {/* Auto Speak */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={localChatSettings.autoSpeak}
                onChange={(e) => setLocalChatSettings({ ...localChatSettings, autoSpeak: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#FF6B00' }} />

              <span style={{ fontWeight: '500' }}>Auto-speak responses</span>
            </label>
          </div>

          {/* Speech Rate */}
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
              Speech Rate: {localChatSettings.speechRate}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={localChatSettings.speechRate}
              onChange={(e) => setLocalChatSettings({ ...localChatSettings, speechRate: parseFloat(e.target.value) })}
              style={{ width: '100%', accentColor: '#FF6B00' }} />

          </div>
        </div>
      </Modal>

      {/* Update Modal */}
      <Modal
        open={modalOpen}
        cancelText={modalButtons.cancelText}
        okText={modalButtons.okText}
        onCancel={modalButtons.onCancel}
        onOk={modalButtons.onOk}>

        <div className="modal-slot">
          {updateError ?
          <div>
              <p>Error checking for updates.</p>
              <p>{updateError.message}</p>
              <p className="website-fallback">
                <span
                className="website-link"
                onClick={openDownloadPage}>

                  Download from website instead
                </span>
              </p>
            </div> :
          status === 'downloading' ?
          <div>
              <div className="update-available-title">Downloading Update...</div>
              <div className="download-progress-container">
                <div className="progress-bar">
                  <div
                  className="progress-fill"
                  style={{ width: `${downloadProgress.progress}%` }} />

                </div>
                <div className="progress-text">
                  {downloadProgress.progress}% - {formatBytes(downloadProgress.downloaded)} / {formatBytes(downloadProgress.total)}
                </div>
              </div>
              <p className="update-instruction">
                Please wait while the update is being downloaded...
              </p>
              <p className="website-fallback">
                Having issues? <span className="website-link" onClick={openDownloadPage}>Download from website</span>
              </p>
            </div> :
          status === 'downloaded' ?
          <div>
              <div className="update-available-title">Download Complete!</div>
              <div className="new-version__target">
                v{versionInfo?.version} → v{versionInfo?.newVersion}
              </div>
              <p className="update-instruction">
                Click "Install Now" to close the app and run the installer.
                The new version will replace the current version.
              </p>
            </div> :
          status === 'installing' ?
          <div>
              <div className="update-available-title">Installing Update...</div>
              <p className="update-instruction">
                The installer is starting. The app will close automatically.
              </p>
            </div> :
          updateAvailable ?
          <div>
              <div className="update-available-title">New Update Available!</div>
              <div className="new-version__target">
                v{versionInfo?.version} → v{versionInfo?.newVersion}
              </div>
              <p className="update-instruction">
                Click "Download" to download the update within the app.
              </p>
              <p className="website-fallback">
                Or <span className="website-link" onClick={openDownloadPage}>download from website</span>
              </p>
            </div> :

          <div className="can-not-available">
              {versionInfo?.version ?
            `You are on the latest version: v${versionInfo.version}` :
            `Checking version...`}
            </div>
          }
        </div>
      </Modal>

      {/* Mobile QR Login Modal */}
      <MobileQRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)} />

    </div>);

};

export default Settings;