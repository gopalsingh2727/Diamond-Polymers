import { useState, useEffect, useRef } from "react";
import './adderss.css';
import { BackButton, SearchBox, handleKeyNavigation } from "../../../allCompones/BackButton";
import EmailView from './email';
import WhatsAppView from './WhatsApp';
import SMSView from './sms';

const addresses = [
  {
    name: "Gopal",
    phone: "1234567890",
    whatsapp: "1234567890",
    email: "gopal@flsa.com",
    City :"newyork",

  },
  {
    name: "Ravi",
    phone: "9876543210",
    whatsapp: "9876543210",
    email: "ravi@flsa.com",
    adderssPrint: "22-B, MG Road, Delhi",
  },
   {
    name: "Gopal",
    phone: "1234567890",
    whatsapp: "1234567890",
    email: "gopal@flsa.com",
    adderssPrint: "1234, 5th Street, New York",
  },
  {
    name: "Ravi",
    phone: "9876543210",
    whatsapp: "9876543210",
    email: "ravi@flsa.com",
    adderssPrint: "22-B, MG Road, Delhi",
  },
   {
    name: "Gopal",
    phone: "1234567890",
    whatsapp: "1234567890",
    email: "gopal@flsa.com",
    adderssPrint: "1234, 5th Street, New York",
  },
  {
    name: "Ravi",
    phone: "9876543210",
    whatsapp: "9876543210",
    email: "ravi@flsa.com",
    adderssPrint: "22-B, MG Road, Delhi",
  },
   {
    name: "Gopal",
    phone: "1234567890",
    whatsapp: "1234567890",
    email: "gopal@flsa.com",
    adderssPrint: "1234, 5th Street, New York",
  },
  {
    name: "Ravi",
    phone: "9876543210",
    whatsapp: "9876543210",
    email: "ravi@flsa.com",
    adderssPrint: "22-B, MG Road, Delhi",
  },
   {
    name: "Gopal",
    phone: "1234567890",
    whatsapp: "1234567890",
    email: "gopal@flsa.com",
    adderssPrint: "1234, 5th Street, New York",
  },
  {
    name: "Ravi",
    phone: "9876543210",
    whatsapp: "9876543210",
    email: "ravi@flsa.com",
    adderssPrint: "22-B, MG Road, Delhi",
  },
   {
    name: "Gopal",
    phone: "1234567890",
    whatsapp: "1234567890",
    email: "gopal@flsa.com",
    adderssPrint: "1234, 5th Street, New York",
  },
  {
    name: "Ravi",
    phone: "9876543210",
    whatsapp: "9876543210",
    email: "ravi@flsa.com",
    adderssPrint: "22-B, MG Road, Delhi",
  },
   {
    name: "Gopal",
    phone: "1234567890",
    whatsapp: "1234567890",
    email: "gopal@flsa.com",
    adderssPrint: "1234, 5th Street, New York",
  },
  {
    name: "Ravi",
    phone: "9876543210",
    whatsapp: "9876543210",
    email: "ravi@flsa.com",
    adderssPrint: "22-B, MG Road, Delhi",
  },
   {
    name: "Gopal",
    phone: "1234567890",
    whatsapp: "1234567890",
    email: "gopal@flsa.com",
    adderssPrint: "1234, 5th Street, New York",
  },
  {
    name: "Ravi",
    phone: "9876543210",
    whatsapp: "9876543210",
    email: "ravi@flsa.com",
    adderssPrint: "22-B, MG Road, Delhi",
  }, {
    name: "Gopal",
    phone: "1234567890",
    whatsapp: "1234567890",
    email: "gopal@flsa.com",
    adderssPrint: "1234, 5th Street, New York",
  },
  {
    name: "Ravi",
    phone: "9876543210",
    whatsapp: "9876543210",
    email: "ravi@flsa.com",
    adderssPrint: "22-B, MG Road, Delhi",
  },
   {
    name: "Gopal",
    phone: "1234567890",
    whatsapp: "1234567890",
    email: "gopal@flsa.com",
    adderssPrint: "1234, 5th Street, New York",
  },
  {
    name: "Ravi",
    phone: "9876543210",
    whatsapp: "9876543210",
    email: "ravi@flsa.com",
    adderssPrint: "22-B, MG Road, Delhi",
  },
   {
    name: "Gopal",
    phone: "1234567890",
    whatsapp: "1234567890",
    email: "gopal@flsa.com",
    adderssPrint: "1234, 5th Street, New York",
  },
  {
    name: "Ravi",
    phone: "9876543210",
    whatsapp: "9876543210",
    email: "ravi@flsa.com",
    adderssPrint: "22-B, MG Road, Delhi",
  },
   {
    name: "Gopal",
    phone: "1234567890",
    whatsapp: "1234567890",
    email: "gopal@flsa.com",
    adderssPrint: "1234, 5th Street, New York",
  },
  {
    name: "Ravi",
    phone: "9876543210",
    whatsapp: "9876543210",
    email: "ravi@flsa.com",
    adderssPrint: "22-B, MG Road, Delhi",
  },
   {
    name: "Gopal",
    phone: "1234567890",
    whatsapp: "1234567890",
    email: "gopal@flsa.com",
    adderssPrint: "1234, 5th Street, New York",
  },
  {
    name: "Ravi",
    phone: "9876543210",
    whatsapp: "9876543210",
    email: "ravi@flsa.com",
    adderssPrint: "22-B, MG Road, Delhi",
  },
 {
    name: "Gopal",
    phone: "1234567890",
    whatsapp: "1234567890",
    email: "gopal@flsa.com",
    adderssPrint: "1234, 5th Street, New York",
  },
  {
    name: "Ravi",
    phone: "9876543210",
    whatsapp: "9876543210",
    email: "ravi@flsa.com",
    adderssPrint: "22-B, MG Road, Delhi",
  },
   {
    name: "Gopal",
    phone: "1234567890",
    whatsapp: "1234567890",
    email: "gopal@flsa.com",
    adderssPrint: "1234, 5th Street, New York",
  },
  {
    name: "Ravi",
    phone: "9876543210",
    whatsapp: "9876543210",
    email: "ravi@flsa.com",
    adderssPrint: "22-B, MG Road, Delhi",
  },
   {
    name: "Gopal",
    phone: "1234567890",
    whatsapp: "1234567890",
    email: "gopal@flsa.com",
    adderssPrint: "1234, 5th Street, New York",
  },
  {
    name: "Ravi",
    phone: "9876543210",
    whatsapp: "9876543210",
    email: "ravi@flsa.com",
    adderssPrint: "22-B, MG Road, Delhi",
  },
   {
    name: "Gopal",
    phone: "1234567890",
    whatsapp: "1234567890",
    email: "gopal@flsa.com",
    adderssPrint: "1234, 5th Street, New York",
  },
  {
    name: "Ravi",
    phone: "9876543210",
    whatsapp: "9876543210",
    email: "ravi@flsa.com",
    adderssPrint: "22-B, MG Road, Delhi",
  },
   {
    name: "Gopal",
    phone: "1234567890",
    whatsapp: "1234567890",
    email: "gopal@flsa.com",
    adderssPrint: "1234, 5th Street, New York",
  },
  {
    name: "Ravi",
    phone: "9876543210",
    whatsapp: "9876543210",
    email: "ravi@flsa.com",
    adderssPrint: "22-B, MG Road, Delhi",
  },
   {
    name: "Gopal",
    phone: "1234567890",
    whatsapp: "1234567890",
    email: "gopal@flsa.com",
    adderssPrint: "1234, 5th Street, New York",
  },
  {
    name: "Ravi",
    phone: "9876543210",
    whatsapp: "9876543210",
    email: "ravi@flsa.com",
    adderssPrint: "22-B, MG Road, Delhi",
  },
   {
    name: "Gopal",
    phone: "1234567890",
    whatsapp: "1234567890",
    email: "gopal@flsa.com",
    adderssPrint: "1234, 5th Street, New York",
  },
  {
    name: "Ravi",
    phone: "9876543210",
    whatsapp: "9876543210",
    email: "ravi@flsa.com",
    adderssPrint: "22-B, MG Road, Delhi",
  },
   {
    name: "Gopal",
    phone: "1234567890",
    whatsapp: "1234567890",
    email: "gopal@flsa.com",
    adderssPrint: "1234, 5th Street, New York",
  },
  {
    name: "Ravi",
    phone: "9876543210",
    whatsapp: "9876543210",
    email: "ravi@flsa.com",
    adderssPrint: "22-B, MG Road, Delhi",
  },
];
interface Address {
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  City?: string;
  adderssPrint?: string;
}

export default function AddressList() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedAddresses, setSelectedAddresses] = useState<Address[]>([]);
  const [currentView, setCurrentView] = useState<'list' | 'email' | 'whatsapp' | 'sms'>('list');
  const [message, setMessage] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  // Keyboard handling (keep existing implementation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        const address = addresses[selectedIndex];
        toggleSelection(address);
      }

      handleKeyNavigation(
        e,
        addresses,
        selectedIndex,
        setSelectedIndex,
        setExpandedIndex
      );

      if (selectedAddresses.length > 0) {
        if (e.key === 'F3') setCurrentView('email');
        if (e.key === 'F4') setCurrentView('whatsapp');
        if (e.key === 'F5') setCurrentView('sms');
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, selectedAddresses]);

  const toggleSelection = (address: Address) => {
    setSelectedAddresses(prev => 
      prev.some(a => a.phone === address.phone) 
        ? prev.filter(a => a.phone !== address.phone)
        : [...prev, address]
    );
  };

const [subject, setSubject] = useState('');
const [attachments, setAttachments] = useState<File[]>([]);

const handleSend = () => {
  // Add your email sending logic here
  console.log("Sending email to:", selectedAddresses);
};
  useEffect(() => {
    const selectedElement = listRef.current?.querySelector(
      `[data-index="${selectedIndex}"]`
    );
    selectedElement?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedIndex]);

  const renderListView = () => (
    <div className="address-items-container" ref={listRef}>
      {addresses.map((address, index) => (
        <div
          key={index}
          data-index={index}
          className={`address-item 
            ${index === selectedIndex ? 'keyboard-selected' : ''}
            ${selectedAddresses.some(a => a.phone === address.phone) ? 'space-selected' : ''}`}
          onClick={() => {
            setSelectedIndex(index);
            setExpandedIndex(expandedIndex === index ? null : index);
          }}
        >
          <div className="address-main-info">
            <div className="address-name">{address.name}</div>
            <div className="address-phone">{address.phone}</div>
            {address.adderssPrint && (
              <div className="address-address">{address.adderssPrint}</div>
            )}
          </div>
          
         {expandedIndex === index && (
  <div className="address-details">
    {/* Email Details */}
    {address.email && (
      <div className="address-detail-item email">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
        <div className="detail-content">
          <span className="detail-label">Email:</span>
          <span className="detail-value">{address.email}</span>
        </div>
      </div>
    )}

    {/* WhatsApp Details */}
    {address.whatsapp && (
      <div className="address-detail-item whatsapp">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.077,4.928C17.191,3.041,14.683,2.001,12.011,2c-5.506,0-9.987,4.479-9.989,9.985 c-0.001,1.76,0.459,3.478,1.333,4.992L2,22l5.233-1.237c1.459,0.806,3.115,1.229,4.777,1.229h0.004 c5.505,0,9.986-4.48,9.989-9.985C22.001,9.325,20.963,6.816,19.077,4.928z M16.898,15.554c-0.208,0.583-1.227,1.117-1.685,1.178 c-0.458,0.062-0.887,0.207-3.995-0.824c-3.537-1.176-5.79-4.088-5.961-4.287c-0.171-0.199-1.458-1.576-1.458-3.006 c0-1.43,0.724-2.152,0.968-2.45c0.244-0.298,0.65-0.422,1.035-0.422c0.208,0,0.396,0.015,0.566,0.031 c0.443,0.045,0.66,0.132,0.849,0.865c0.222,0.865,0.771,3.009,0.836,3.225c0.066,0.216,0.132,0.486,0.017,0.759 c-0.115,0.272-0.173,0.433-0.346,0.651c-0.173,0.218-0.4,0.486-0.571,0.654c-0.173,0.169-0.359,0.353-0.158,0.676 c0.201,0.323,0.901,1.402,1.938,2.274c1.353,1.137,2.511,1.479,2.911,1.644c0.4,0.165,0.641,0.139,0.866-0.083 c0.226-0.221,0.969-0.938,1.226-1.265c0.257-0.326,0.514-0.272,0.874-0.165c0.359,0.107,2.28,1.098,2.675,1.293 c0.394,0.195,0.668,0.288,0.765,0.446c0.097,0.158,0.097,0.902-0.208,1.5L16.898,15.554z" />
        </svg>
        <div className="detail-content">
          <span className="detail-label">WhatsApp:</span>
          <span className="detail-value">{address.whatsapp}</span>
        </div>
      </div>
    )}

    {/* City Details */}
    {address.City && (
      <div className="address-detail-item location">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
        <div className="detail-content">
          <span className="detail-label">City:</span>
          <span className="detail-value">{address.City}</span>
        </div>
      </div>
    )}

    {/* Full Address Details */}
    {address.adderssPrint && (
      <div className="address-detail-item address">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
        <div className="detail-content">
          <span className="detail-label">Full Address:</span>
          <span className="detail-value">{address.adderssPrint}</span>
        </div>
      </div>
    )}
  </div>
)}
        </div>
      ))}
    </div>
  );

  return (
    <div className="container">
      <div className="item">
        <BackButton />
        <SearchBox />
      </div>

      <div className="item">
        <button 
          onClick={() => setCurrentView('email')}
          disabled={selectedAddresses.length === 0}
          className={currentView === 'email' ? 'active' : ''}
        >
          Email (F3)
        </button>
        <button 
          onClick={() => setCurrentView('whatsapp')}
          disabled={selectedAddresses.length === 0}
          className={currentView === 'whatsapp' ? 'active' : ''}
        >
          WhatsApp (F4)
        </button>
        <button 
          onClick={() => setCurrentView('sms')}
          disabled={selectedAddresses.length === 0}
          className={currentView === 'sms' ? 'active' : ''}
        >
          SMS (F5)
        </button>
      </div>

      <div className="item">
        {currentView === 'list' ? renderListView() : (
          currentView === 'email' ? (
        <EmailView
  selectedAddresses={selectedAddresses}
  message={message}
  subject={subject}
  attachments={attachments}
  onMessageChange={setMessage}
  onSubjectChange={setSubject}
  onAttachmentsChange={setAttachments}
  onSend={handleSend}
  onBack={() => setCurrentView('list')}
/>
          ) : currentView === 'whatsapp' ? (
            <WhatsAppView
              selectedAddresses={selectedAddresses}
              message={message}
              onMessageChange={setMessage}
              onBack={() => setCurrentView('list')}
            />
          ) : (
            <SMSView
              selectedAddresses={selectedAddresses}
              message={message}
              onMessageChange={setMessage}
              onBack={() => setCurrentView('list')}
            />
          )
        )}
      </div>
    </div>
  );
}