import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBranches } from './redux/Branch/BranchActions';
import { setSelectedBranchInAuth, checkAndRefreshToken, clearSessionExpiredAndLogout } from './redux/login/authActions';
import type { RootState, AppDispatch } from '../store';


import Settings from '../components/Settings';
import './indexComponents.css';
import Menu from './main/sidebar/menu';
import Data from './allCompones/date';

import ErrorBoundary from './second/menu/CreateOders/error';

function IndexComponents() {
  const dispatch: AppDispatch = useDispatch();

  const [hideFooter, setHideFooter] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [branchName, setBranchName] = useState("Loading...");
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [tempSelectedBranch, setTempSelectedBranch] = useState("");
  const [isBranchChanging, setIsBranchChanging] = useState(false);

  // Ref to track if we've already set the manager's branch
  const hasSetManagerBranch = useRef(false);

  const menuItems = ["Create", "Edit", "Settings", "Contact"];

  const { branches, loading } = useSelector((state: RootState) => state.branches);
  const { userData, sessionExpired } = useSelector((state: RootState) => state.auth);
  const orderFormDataLoading = useSelector((state: RootState) => state.orderFormData?.loading ?? false);

  // Fetch branches on mount
  useEffect(() => {
    dispatch(fetchBranches());
  }, [dispatch]);

  // ✅ FIX: Check and refresh token when laptop wakes from sleep
  // setTimeout stops during sleep, so we need to check on visibility change
  useEffect(() => {
    let lastCheckTime = Date.now();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const timeSinceLastCheck = Date.now() - lastCheckTime;

        // If more than 1 minute has passed, check token
        if (timeSinceLastCheck > 60 * 1000) {
          console.log('🔄 App became visible after sleep, checking token...');
          dispatch(checkAndRefreshToken() as any);
        }
        lastCheckTime = Date.now();
      }
    };

    const handleFocus = () => {
      const timeSinceLastCheck = Date.now() - lastCheckTime;

      // If more than 1 minute has passed, check token
      if (timeSinceLastCheck > 60 * 1000) {
        console.log('🔄 Window focused after idle, checking token...');
        dispatch(checkAndRefreshToken() as any);
      }
      lastCheckTime = Date.now();
    };

    // Listen for page visibility change (laptop sleep/wake)
    document.addEventListener('visibilitychange', handleVisibilityChange);
    // Listen for window focus (switching back to app)
    window.addEventListener('focus', handleFocus);

    // Initial check on mount
    dispatch(checkAndRefreshToken() as any);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [dispatch]);

  // Update branch name when branches or userData changes
  useEffect(() => {
    if (!loading && branches.length > 0 && userData) {
      if (userData?.role === "manager") {
        const managerBranch = branches[0];
        const managerBranchId = managerBranch?.id || (managerBranch as any)?._id;

        // Get current selected branch ID
        const currentSelectedId = userData.selectedBranch?._id || userData.selectedBranch;

        // Only set the branch once if it's not set or doesn't match
        if (!hasSetManagerBranch.current && (!currentSelectedId || currentSelectedId !== managerBranchId)) {
          if (managerBranchId) {
            hasSetManagerBranch.current = true;
            dispatch(setSelectedBranchInAuth(managerBranchId));
            return; // Exit early
          }
        }

        setBranchName(managerBranch?.name || "Branch not found");
      } else {
        // Admin or other roles
        const selectedBranchId = userData?.selectedBranch?._id || userData?.selectedBranch || null;
        
        if (selectedBranchId) {
          const foundBranch = branches.find((b: any) => b._id === selectedBranchId || b.id === selectedBranchId);
          setBranchName(foundBranch?.name || "Branch not found");
        } else {
          setBranchName("No branch selected");
        }
      }
    }
  }, [branches, loading, userData, dispatch]);

  // Reset the ref when user data changes significantly (e.g., logout/login)
  useEffect(() => {
    if (!userData) {
      hasSetManagerBranch.current = false;
    }
  }, [userData?.role]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore keyboard shortcuts when user is typing in input fields or chatbot
      const activeElement = document.activeElement;
      const isTyping = activeElement?.tagName === 'INPUT' ||
                       activeElement?.tagName === 'TEXTAREA' ||
                       (activeElement as HTMLElement)?.contentEditable === 'true';

      if (isTyping) {
        return; // Let the input field handle the keyboard event
      }

      if (event.metaKey && event.key === "n") {
        event.preventDefault();
        setHideFooter(prev => !prev);
      }
      switch (event.key) {
        case "ArrowDown":
        case "Tab":
          event.preventDefault();
          setSelectedIndex(prev => (prev + 1) % menuItems.length);
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex(prev => (prev - 1 + menuItems.length) % menuItems.length);
          break;
        case "Enter":
          event.preventDefault();
          console.log("Enter pressed on:", menuItems[selectedIndex]);
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown as EventListener);
    return () => document.removeEventListener("keydown", handleKeyDown as EventListener);
  }, [selectedIndex, menuItems.length]);

  const handleBranchClick = () => {
    if (userData?.role === "admin" || userData?.role === "master_admin") {
      const currentBranchId = userData?.selectedBranch?._id || userData?.selectedBranch || "";
      setTempSelectedBranch(currentBranchId);
      setShowBranchModal(true);
    }
  };

  const handleBranchChange = async () => {
    if (!tempSelectedBranch) return;

    setIsBranchChanging(true);
    try {
      // Dispatch action to update Redux and localStorage
      await dispatch(setSelectedBranchInAuth(tempSelectedBranch));

      // Update branch name immediately
      const foundBranch = branches.find((b: any) => b._id === tempSelectedBranch);
      setBranchName(foundBranch?.name || "Branch not found");

      // Close modal
      setShowBranchModal(false);
    } finally {
      setIsBranchChanging(false);
    }
  };

  return (
    <div className="App">
      <div className={`container ${hideFooter ? "hidden-footer" : ""}`}>
        <div className="item">
          {/* Left side - Logo, Brand, Branch */}
          <div className="flex items-center gap-4">
            {/* Fire Eagle Logo - Same as InfinityLoader */}
            <svg
              width="50"
              height="50"
              viewBox="0 0 180 180"
              className="eagle-header-logo -scale-x-100"
            >
              <defs>
                <linearGradient id="headerFireGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#FF6B35" />
                  <stop offset="50%" stopColor="#FFA500" />
                  <stop offset="100%" stopColor="#FFD700" />
                </linearGradient>
              </defs>
              <g>
                {/* Eagle Head - Side Profile */}
                <path
                  d="M50 90
                     C50 50 80 20 120 25
                     C140 28 155 40 160 60
                     C162 70 158 80 150 85
                     L140 88
                     C145 92 148 98 145 105
                     C142 112 135 115 125 112
                     L115 108
                     C110 115 100 118 90 115
                     C75 110 60 100 50 90"
                  fill="url(#headerFireGradient)"
                />

                {/* White Head (Bald Eagle style) */}
                <path
                  d="M60 85
                     C60 55 85 30 115 32
                     C135 34 150 45 154 62
                     C156 72 152 80 145 84
                     L135 86
                     C130 82 120 80 110 82
                     C95 85 75 85 60 85"
                  fill="#FFF"
                  opacity="0.9"
                />

                {/* Fierce Eye */}
                <circle cx="105" cy="55" r="8" fill="#000" />
                <circle cx="103" cy="52" r="3" fill="#FFF" />

                {/* Eye ridge - Angry look */}
                <path d="M90 45 C100 42 110 45 115 50" stroke="#8B4513" strokeWidth="4" fill="none" />

                {/* Hooked Beak - Eagle Signature */}
                <path
                  d="M145 84
                     C155 82 165 88 168 95
                     C170 100 168 108 162 112
                     C155 118 145 118 140 112
                     L135 105
                     C140 100 142 92 145 84"
                  fill="#FFD700"
                />

                {/* Beak detail */}
                <path
                  d="M150 95
                     C158 93 164 98 165 105
                     C166 110 162 115 155 115
                     L148 110"
                  fill="#CC8800"
                />

                {/* Neck feathers */}
                <path
                  d="M90 115
                     C100 120 110 118 115 108
                     L110 125
                     C100 135 85 135 75 125
                     C65 115 60 105 60 95"
                  fill="url(#headerFireGradient)"
                />
              </g>
            </svg>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#FF6B35] via-[#FFA500] to-[#FF6B35] bg-clip-text text-transparent">
              27 Manufacturing
            </h1>
          </div>
          {/* Right side - Branch selector + Settings */}
          <div className="flex items-center gap-3">
            {/* Branch Dropdown - Near Settings for admin/master_admin */}
            {(userData?.role === "admin" || userData?.role === "master_admin") && (
              <div className="header-branch-selector">
                {loading ? (
                  <span className="header-no-branch">Loading...</span>
                ) : branches.length > 0 ? (
                  <div className="relative">
                    <select
                      className={`header-branch-dropdown ${isBranchChanging || orderFormDataLoading ? 'opacity-50' : ''}`}
                      value={userData?.selectedBranch?._id || userData?.selectedBranch || ''}
                      disabled={isBranchChanging || orderFormDataLoading}
                      onChange={async (e) => {
                        const newBranchId = e.target.value;
                        const currentBranchId = userData?.selectedBranch?._id || userData?.selectedBranch;

                        if (newBranchId && newBranchId !== currentBranchId) {
                          setIsBranchChanging(true);
                          try {
                            await dispatch(setSelectedBranchInAuth(newBranchId));
                            const foundBranch = branches.find((b: any) => b._id === newBranchId);
                            setBranchName(foundBranch?.name || "Branch not found");
                          } finally {
                            setIsBranchChanging(false);
                          }
                        }
                      }}
                    >
                      <option value="" disabled>Select Branch</option>
                      {branches.map((branch: any) => (
                        <option key={branch._id} value={branch._id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                    {(isBranchChanging || orderFormDataLoading) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 rounded-lg">
                        <div className="w-4 h-4 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="header-no-branch">No branches</span>
                )}
              </div>
            )}
            <ErrorBoundary>
              <Settings
                branchName={branchName}
                onBranchClick={handleBranchClick}
                showBranchOption={false}
                userBranches={userData?.branches || []}
                selectedBranchId={userData?.selectedBranch || ''}
                userRole={userData?.role}
              />
            </ErrorBoundary>
          </div>
        </div>
        <div className="item"><ErrorBoundary><Menu/></ErrorBoundary></div>
        <div className="item">{/* Reserved for future use */}</div>
        <div className="item"><ErrorBoundary><Data /></ErrorBoundary></div>
      </div>

      {/* Branch Selection Modal */}
      {showBranchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-md border border-gray-200">
            <div className="p-6 text-center border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800">Change Branch</h2>
              <p className="text-gray-600 mt-2">Select a different branch</p>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex flex-col items-center py-8">
                  <div className="w-12 h-12 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600">Loading branches...</p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">Available Branches</label>
                    <div className="relative">
                      <svg
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <select
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent appearance-none text-gray-800"
                        value={tempSelectedBranch}
                        onChange={(e) => setTempSelectedBranch(e.target.value)}
                      >
                        <option value="">-- Select a branch --</option>
                        {branches.map((branch: any) => (
                          <option key={branch._id} value={branch._id}>
                            {branch.name} • {branch.location}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg
                          className="fill-current h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      className="flex-1 py-3 px-4 rounded-lg font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 transition-all duration-300"
                      onClick={() => setShowBranchModal(false)}
                      disabled={isBranchChanging}
                    >
                      Cancel
                    </button>
                    <button
                      className={`flex-1 py-3 px-4 rounded-lg font-medium text-white shadow-md transition-all duration-300 ${
                        !tempSelectedBranch || isBranchChanging
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-[#FF6B35] hover:bg-[#E55A2B] hover:shadow-lg"
                      }`}
                      onClick={handleBranchChange}
                      disabled={!tempSelectedBranch || isBranchChanging}
                    >
                      {isBranchChanging ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Switching...
                        </span>
                      ) : (
                        'Confirm'
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ✅ Session Expired Modal */}
      {sessionExpired && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-md">
            <div className="p-6 text-center">
              {/* Warning Icon */}
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <h2 className="text-xl font-bold text-gray-800 mb-2">Session Expired</h2>
              <p className="text-gray-600 mb-6">
                Your session has expired due to inactivity. Please log in again to continue using the application.
              </p>

              <button
                className="w-full py-3 px-4 rounded-lg font-medium text-white bg-[#FF6B35] hover:bg-[#E55A2B] transition-all duration-300"
                onClick={() => dispatch(clearSessionExpiredAndLogout() as any)}
              >
                Log In Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IndexComponents;