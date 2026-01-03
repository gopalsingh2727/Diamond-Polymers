import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store";
import { getAccounts } from "../../../redux/create/createNewAccount/NewAccountActions";

import './adderss.css';
import { BackButton, SearchBox } from "../../../allCompones/BackButton";
import EmailView from './email';
import WhatsAppView from './WhatsApp';
import SMSView from './sms';

interface Address {
  _id: string;
  companyName: string;
  firstName: string;
  lastName: string;
  phone1: string;
  phone2: string;
  whatsapp: string;
  telephone: string;
  address1: string;
  address2: string;
  state: string;
  pinCode: string;
  email: string;
  branchId: string;
  // Optional UI fields:
  City?: string;
  adderssPrint?: string;
}

export default function AddressList() {
  const dispatch = useDispatch<AppDispatch>();

  // ✅ Get addresses from Redux
  const addresses = useSelector((state: RootState) => state.getAccounts.accounts);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedAddresses, setSelectedAddresses] = useState<Address[]>([]);
  const [currentView, setCurrentView] = useState<'list' | 'email' | 'whatsapp' | 'sms'>('list');
  const [message, setMessage] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  const [subject, setSubject] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  // ✅ Fetch accounts once
  useEffect(() => {
    dispatch(getAccounts());
  }, [dispatch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        const address = addresses?.[selectedIndex];
        if (address) toggleSelection(address);
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
  }, [selectedIndex, selectedAddresses, addresses]);

  useEffect(() => {
    const selectedElement = listRef.current?.querySelector(
      `[data-index="${selectedIndex}"]`
    );
    selectedElement?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedIndex]);

  const toggleSelection = (address: Address) => {
    setSelectedAddresses((prev) =>
    prev.some((a) => a._id === address._id) ?
    prev.filter((a) => a._id !== address._id) :
    [...prev, address]
    );
  };

  const handleSend = () => {

  };

  const renderListView = () =>
  <div className="address-items-container" ref={listRef}>
      {addresses.map((address, index) =>
    <div
      key={address._id}
      data-index={index}
      className={`address-item 
            ${index === selectedIndex ? 'keyboard-selected' : ''}
            ${selectedAddresses.some((a) => a._id === address._id) ? 'space-selected' : ''}`}
      onClick={() => {
        setSelectedIndex(index);
        setExpandedIndex(expandedIndex === index ? null : index);
      }}>

          <div className="address-main-info">
            <div className="address-name">{address.firstName} {address.lastName}</div>
            <div className="address-phone">{address.phone1}</div>
            {address.address1 &&
        <div className="address-address">{address.address1}</div>
        }
          </div>

          {expandedIndex === index &&
      <div className="address-details">
              {address.email &&
        <div className="address-detail-item email">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{address.email}</span>
                </div>
        }
              {address.whatsapp &&
        <div className="address-detail-item whatsapp">
                  <span className="detail-label">WhatsApp:</span>
                  <span className="detail-value">{address.whatsapp}</span>
                </div>
        }
              {address.state &&
        <div className="address-detail-item location">
                  <span className="detail-label">State:</span>
                  <span className="detail-value">{address.state}</span>
                </div>
        }
              {address.address2 &&
        <div className="address-detail-item address">
                  <span className="detail-label">Full Address:</span>
                  <span className="detail-value">{address.address1} {address.address2}</span>
                </div>
        }
            </div>
      }
        </div>
    )}
    </div>;


  return (
    <div className="container">
      <div className="item">
        <BackButton />
        <SearchBox />
      </div>

      <div className="item">
        <button onClick={() => setCurrentView('email')} disabled={selectedAddresses.length === 0} className={currentView === 'email' ? 'active' : ''}>
          Email (F3)
        </button>
        <button onClick={() => setCurrentView('whatsapp')} disabled={selectedAddresses.length === 0} className={currentView === 'whatsapp' ? 'active' : ''}>
          WhatsApp (F4)
        </button>
        <button onClick={() => setCurrentView('sms')} disabled={selectedAddresses.length === 0} className={currentView === 'sms' ? 'active' : ''}>
          SMS (F5)
        </button>
      </div>

      <div className="item">
        {currentView === 'list' ? renderListView() :
        currentView === 'email' ?
        <EmailView
          selectedAddresses={selectedAddresses}
          message={message}
          subject={subject}
          attachments={attachments}
          onMessageChange={setMessage}
          onSubjectChange={setSubject}
          onAttachmentsChange={setAttachments}
          onSend={handleSend}
          onBack={() => setCurrentView('list')} /> :

        currentView === 'whatsapp' ?
        <WhatsAppView
          selectedAddresses={selectedAddresses}
          message={message}
          onMessageChange={setMessage}
          onBack={() => setCurrentView('list')} /> :


        <SMSView
          selectedAddresses={selectedAddresses}
          message={message}
          onMessageChange={setMessage}
          onBack={() => setCurrentView('list')} />


        }
      </div>
    </div>);

}