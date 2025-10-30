import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBranches } from './redux/Branch/BranchActions';
import { setSelectedBranchInAuth } from './redux/login/authActions';
import type { RootState, AppDispatch } from '../store';

import Update from '../components/update';
import './indexComponents.css';
import Menu from './main/sidebar/menu';
import Data from './allCompones/date';

import logo from './main/header/Group1.png'; 
import ErrorBoundary from './second/menu/CreateOders/error';

function IndexComponents() {
  const dispatch: AppDispatch = useDispatch();

  const [hideFooter, setHideFooter] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [branchName, setBranchName] = useState("Loading...");
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [tempSelectedBranch, setTempSelectedBranch] = useState("");

  const menuItems = ["Create", "Edit", "Settings", "Contact"];

  const { branches, loading } = useSelector((state: RootState) => state.branches);
  const { userData } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchBranches());
  }, [dispatch]);

  useEffect(() => {
    if (!loading && branches.length > 0) {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      let selectedBranchId = userData?.selectedBranch?._id || userData?.selectedBranch || null;

      if (userData?.role === "manager") {
        const managerBranch = branches[0];
        selectedBranchId = managerBranch?.id;

        if (!userData.selectedBranch || userData.selectedBranch !== selectedBranchId) {
          const updatedUserData = {
            ...userData,
            selectedBranch: selectedBranchId,
          };
          localStorage.setItem("userData", JSON.stringify(updatedUserData));
        }

        setBranchName(managerBranch?.name || "Branch not found");
      } else if (selectedBranchId) {
        const foundBranch = branches.find((b: any) => b._id === selectedBranchId);
        setBranchName(foundBranch?.name || "Branch not found");
      } else {
        setBranchName("No branch selected");
      }
    }
  }, [branches, loading]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
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
    if (userData?.role === "admin") {
      const currentBranchId = JSON.parse(localStorage.getItem("userData") || "{}")?.selectedBranch;
      setTempSelectedBranch(currentBranchId || "");
      setShowBranchModal(true);
    }
  };

  const handleBranchChange = () => {
    if (!tempSelectedBranch) return;

    const storedUserData = JSON.parse(localStorage.getItem("userData") || "{}");
    const updatedUserData = {
      ...storedUserData,
      selectedBranch: tempSelectedBranch,
    };

    localStorage.setItem("userData", JSON.stringify(updatedUserData));
    dispatch(setSelectedBranchInAuth(tempSelectedBranch));

    const foundBranch = branches.find((b: any) => b._id === tempSelectedBranch);
    setBranchName(foundBranch?.name || "Branch not found");
    
    setShowBranchModal(false);
    
    // Optionally reload the page to refresh all data
    window.location.reload();
  };

  return (
    <div className="App">
      <div className={`container ${hideFooter ? "hidden-footer" : ""}`}>
        <div className="item">
          <div 
            className={`font-semibold text-lg ${userData?.role === "admin" ? "cursor-pointer hover:text-blue-600 transition-colors" : ""}`}
            onClick={handleBranchClick}
            title={userData?.role === "admin" ? "Click to change branch" : ""}
          >
            {branchName}
            {userData?.role === "admin" && (
              <svg className="inline-block ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
          <img src={logo} className="logoHeders" alt="Application Logo" />
          <div><ErrorBoundary><Update /></ErrorBoundary></div>
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
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
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
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-gray-800"
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
                    >
                      Cancel
                    </button>
                    <button
                      className={`flex-1 py-3 px-4 rounded-lg font-medium text-white shadow-md transition-all duration-300 ${
                        !tempSelectedBranch
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
                      }`}
                      onClick={handleBranchChange}
                      disabled={!tempSelectedBranch}
                    >
                      Confirm
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IndexComponents;