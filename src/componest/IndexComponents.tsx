import { useEffect, useState, KeyboardEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBranches } from './redux/Branch/BranchActions'; 
import type { RootState, AppDispatch } from '../store'; 

import Update from '../components/update';
import './indexComponents.css';
import Menu from './main/sidebar/menu';

import Data from './allCompones/date';

function IndexComponentes() {
  const dispatch: AppDispatch = useDispatch();

  const [hideFooter, setHideFooter] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [branchName, setBranchName] = useState("Loading...");

  const menuItems = ["Create", "Edit", "Settings", "Contact"];

  const { branches, loading } = useSelector((state: RootState) => state.branches);

  // Fetch branches on first load
  useEffect(() => {
    dispatch(fetchBranches());
  }, [dispatch]);

  // Determine and set branch name
  useEffect(() => {
    if (!loading && branches.length > 0) {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");

      let selectedBranchId =
        userData?.selectedBranch?._id || userData?.selectedBranch || null;

      if (userData?.role === "manager") {
        const managerBranch = branches[0];
        selectedBranchId = managerBranch?.id;

        // Save selected branch to localStorage if needed
        if (!userData.selectedBranch || userData.selectedBranch !== selectedBranchId) {
          const updatedUserData = {
            ...userData,
            selectedBranch: selectedBranchId,
          };
          localStorage.setItem("userData", JSON.stringify(updatedUserData));
        }

        setBranchName(managerBranch?.name || "Branch not found");
      }
      // Admin: look up selected branch
      else if (selectedBranchId) {
        const foundBranch = branches.find((b: any) => b._id === selectedBranchId);
        setBranchName(foundBranch?.name || "Branch not found");
      } else {
        setBranchName("No branch selected");
      }
    }
  }, [branches, loading]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey && event.key === "n") {
        event.preventDefault();
        setHideFooter((prev) => !prev);
      }
      switch (event.key) {
        case "ArrowDown":
        case "Tab":
          event.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % menuItems.length);
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + menuItems.length) % menuItems.length);
          break;
        case "Enter":
          event.preventDefault();
          console.log("Enter pressed on:", menuItems[selectedIndex]);
          break;
        default:
          break;
      }
    };

    // Note: need to cast event handler to EventListener because TS complains about KeyboardEvent type here
    document.addEventListener("keydown", handleKeyDown as unknown as EventListener);
    return () => document.removeEventListener("keydown", handleKeyDown as unknown as EventListener);
  }, [selectedIndex, menuItems.length]);

  return (
    <div className="App">
      <div className={`container ${hideFooter ? "hidden-footer" : ""}`}>
        <div className="item">
          <div className="font-semibold text-lg">
            {branchName}
          </div>
          <img
            src="src/componest/main/header/Group1.png"
            className="logoHeders"
            alt="Application Logo"
          />
          <div>
            <Update/>
          </div>
        </div>
        <div className="item">
          
          <Menu />
        </div>
        <div className="item">s</div>
        <div className="item">
          <Data />
        </div>
      </div>
    </div>
  );
}

export default IndexComponentes;