import { BackButton } from "../../../allCompones/BackButton";
import  { useEffect, useState } from "react";
import './marketing.css';

const Marketing = () => {
  const [showEmail, setShowEmail] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [showSMS, setShowSMS] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const menu = [
    { label: "Update Data" },
    { label: "Template" },
    { divider: true },

    { label: "Email", toggle: "email" },
    ...(showEmail
      ? [
          { label: "Email Template Show" },
          { label: "Update Email Template" },
        ]
      : []),
    

    { label: "WhatsApp", toggle: "whatsapp" },
    ...(showWhatsApp
      ? [
          { label: "WhatsApp Template Show" },
          { label: "Update WhatsApp Template" },
        ]
      : []),


    { label: "SMS", toggle: "sms" },
    ...(showSMS
      ? [
          { label: "SMS Template Show" },
          { label: "Update SMS Template" },
        ]
      : []),
    { divider: true },
    {label:"Download Data"},

    { label: "Delete Data" },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        let nextIndex = selectedIndex;
        do {
          nextIndex = (nextIndex + 1) % menu.length;
        } while (menu[nextIndex].divider);
        setSelectedIndex(nextIndex);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        let prevIndex = selectedIndex;
        do {
          prevIndex = (prevIndex - 1 + menu.length) % menu.length;
        } while (menu[prevIndex].divider);
        setSelectedIndex(prevIndex);
      } else if (e.key === "Enter") {
        const current = menu[selectedIndex];
        if (current.toggle === "email") setShowEmail((prev) => !prev);
        else if (current.toggle === "whatsapp") setShowWhatsApp((prev) => !prev);
        else if (current.toggle === "sms") setShowSMS((prev) => !prev);
        else if (current.label) alert(`Selected: ${current.label}`);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menu, selectedIndex]);

  return (
    <div className="container">
      <div className="item">
        <BackButton />
      </div>

      <div className="item">
        <ul className="menu-list">
          {menu.map((item, index) =>
            item.divider ? (
              <hr key={`divider-${index}`} className="menu-divider" />
            ) : (
              <li
                key={index}
                className={`menu-item ${
                  index === selectedIndex ? "selected" : ""
                } ${item.toggle ? "toggle" : ""}`}
                tabIndex={index === selectedIndex ? 0 : -1}
                aria-selected={index === selectedIndex}
                onClick={() => {
                  setSelectedIndex(index);
                  if (item.toggle === "email") setShowEmail((prev) => !prev);
                  else if (item.toggle === "whatsapp") setShowWhatsApp((prev) => !prev);
                  else if (item.toggle === "sms") setShowSMS((prev) => !prev);
                  else alert(`Clicked: ${item.label}`);
                }}
              >
                {item.label}
              </li>
            )
          )}
        </ul>
      </div>

      <div className="item" />
      <div className="item">
        <div className="Upload-Data" />
      </div>
    </div>
  );
};

export default Marketing;
