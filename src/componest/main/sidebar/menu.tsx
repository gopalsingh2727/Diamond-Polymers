import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/login/authActions";
import type { AppDispatch } from '../../../store';
const Menu = () => {
  const navigate = useNavigate();

  const dispatch = useDispatch<AppDispatch>();
const userRole = useSelector((state: any) => state.auth.userData?.role);
console.log(userRole);


  const allMenuItems = [
    { name: "Create", path: "/menu/indexcreateroute" },
    { name: "Edit", path: "/menu/edit" },
    { name: "Create Orders", path: "/menu/orderform" },
    { name: "Day Book", path: "/menu/daybook" },
    { name: "Dispatch", path: "/menu/dispatch" },
    { name: "All Orders", path: "/menu/IndexAllOders" },
    { name: "Account", path: "/menu/Account" },
    { name: "Marketing", path: "/menu/marketing" },
    { name: "Address", path: "/menu/adderss" },
   
    ...(userRole === "admin" ? [{ name: "Settings", path: "/menu/SystemSetting" }] : []),
    { name: "Logout", path: "/login" },
  ];

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
  }, [selectedIndex, allMenuItems]);

  return (
    <div className="menu-container">
      <div className="menu-header-padding">
        <ul id="main-menu">
          {allMenuItems.map((item, index) => {
            const isGroupDivider = index === 1 || index === 6 || index === 9;
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