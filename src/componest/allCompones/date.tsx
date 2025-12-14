import  { useEffect, useState } from "react";

const Data = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000); // Update every 1 second

        return () => clearInterval(timer); // Cleanup on unmount
    }, []);

    const dateOptions: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
    };

    const timeOptions: Intl.DateTimeFormatOptions = {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
    };

    const formattedDate = currentTime.toLocaleString("en-US", dateOptions);
    const formattedTime = currentTime.toLocaleString("en-US", timeOptions);

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#6b7280' }}>
            <span>{formattedDate}</span>
            <span>|</span>
            <span>{formattedTime}</span>
        </div>
    );
};

export default Data;