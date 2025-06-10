import { useState } from "react";
import "./NotificationBell.css";

const notificationSound = new Audio("https://shorturl.at/fxXY0");

const NotificationBell = () => {
  const [count, setCount] = useState(3);
  const [isOpen, setIsOpen] = useState(false);

  const toggleNotification = () => {
    setIsOpen(!isOpen);

    if (!isOpen) {
      setCount(0);
    } else {
      setCount((prev) => prev + 1);
    }

    playNotificationSound();
    animateNotification();
  };

  const playNotificationSound = () => {
    if (notificationSound && !notificationSound.muted) {
      notificationSound.play();
    }
  };

  const animateNotification = () => {
    const icon = document.querySelector(".bell-con");
    const countEl = document.querySelector(".notification-count");

    if (icon) {
      icon.classList.add("animate-bell");
      setTimeout(() => icon.classList.remove("animate-bell"), 1000);
    }

    if (countEl) {
      countEl.classList.add("pulse");
      setTimeout(() => countEl.classList.remove("pulse"), 1000);
    }
  };

  return (
    <div
      className={`notification-bell ${isOpen ? "open" : ""}`}
      onClick={toggleNotification}
      title="Click to view notifications"
    >
      <svg className="bell-con" viewBox="0 0 448 512" width="50" >
        <path d="M224 512c35.32 0 63.97-28.65 63.97-64H160.03c0 35.35 28.65 64 63.97 64zm215.39-149.71c-19.32-20.76-55.47-51.99-55.47-154.29 0-77.7-54.48-139.9-127.94-155.16V32c0-17.67-14.32-32-31.98-32s-31.98 14.33-31.98 32v20.84C118.56 68.1 64.08 130.3 64.08 208c0 102.3-36.15 133.53-55.47 154.29-6 6.45-8.66 14.16-8.61 21.71.11 16.4 12.98 32 32.1 32h383.8c19.12 0 32-15.6 32.1-32 .05-7.55-2.61-15.27-8.61-21.71z" />
      </svg>
      {count > 0 && <span className="notification-count">{count}</span>}
    </div>
  );
};

export default NotificationBell;