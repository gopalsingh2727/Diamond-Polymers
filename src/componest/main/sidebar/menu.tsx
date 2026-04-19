import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/login/authActions";
import type { AppDispatch } from '../../../store';
import type { RootState } from '../../redux/rootReducer';
import "./menu.css";

const Menu = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { userData } = useSelector((state: RootState) => state.auth);

  // Check if user is master_admin or admin (can create branches)
  const canCreateBranch = userData?.role === 'master_admin' || userData?.role === 'admin';

  // Menu items for all users with keyboard shortcuts
  const allMenuItems = useMemo(() => {
    const baseItems = [
      { name: "Create", path: "/menu/indexcreateroute", shortcut: "C" },
      { name: "Edit", path: "/menu/edit", shortcut: "E" },
      { name: "Create Orders", path: "/menu/orderform", shortcut: "O" },
      { name: "Day Book", path: "/menu/daybook", shortcut: "D" },
      // { name: "Inventory", path: "/menu/inventory", shortcut: "I" },
      { name: "Dispatch", path: "/menu/dispatch", shortcut: "P" },
      { name: "Status", path: "/menu/IndexAllOders", shortcut: "S" },
      { name: "Order Forward", path: "/menu/connections", shortcut: "F" },
      { name: "Account", path: "/menu/Account", shortcut: "A" },
      { name: "Reports", path: "/menu/reports", shortcut: "R" },
    ];

    // Add Create Branch option for master_admin and admin
    if (canCreateBranch) {
      baseItems.push({ name: "Create Branch", path: "/create-branch", shortcut: "B" });
    }

    // Always add Logout at the end
    baseItems.push({ name: "Logout", path: "/login", shortcut: "L" });

    return baseItems;
  }, [canCreateBranch]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleNavigation = () => {
    const selectedItem = allMenuItems[selectedIndex];
    if (selectedItem.name === "Logout") {
      dispatch(logout());
      navigate("/login");
    } else {
      navigate(selectedItem.path);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for shortcut keys (C, E, O, D, P, S, A, R, L)
      const pressedKey = event.key.toUpperCase();
      const menuItemIndex = allMenuItems.findIndex(item => item.shortcut === pressedKey);

      if (menuItemIndex !== -1) {
        event.preventDefault();
        const selectedItem = allMenuItems[menuItemIndex];
        if (selectedItem.name === "Logout") {
          dispatch(logout());
          navigate("/login");
        } else {
          setSelectedIndex(menuItemIndex);
          navigate(selectedItem.path);
        }
        return;
      }

      switch (event.key) {
        case "ArrowDown":
        case "Tab":
          event.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % allMenuItems.length);
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + allMenuItems.length) % allMenuItems.length);
          break;
        case "Enter":
          event.preventDefault();
          handleNavigation();
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, allMenuItems, dispatch, navigate]);

  return (
    <div className="menu-container">
      <div className="menu-header-padding">
        <ul id="main-menu">
          {allMenuItems.map((item, index) => {
            const isGroupDivider = index === 1 || index === 7 || index === 9;
            return (
              <div
                key={item.name}
                className={`menu-item-wrapper ${index === selectedIndex ? "selected" : ""} ${
                  isGroupDivider ? "bottom-borders-menu" : ""
                }`}
              >
                <li
                  tabIndex={index === selectedIndex ? 0 : -1}
                  onClick={() => {
                    if (item.name === "Logout") {
                      dispatch(logout());
                      navigate("/login");
                    } else {
                      setSelectedIndex(index);
                      navigate(item.path);
                    }
                  }}
                >
                  {item.name}
                </li>
              </div>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Menu;