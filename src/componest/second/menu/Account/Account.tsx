import { BackButton } from "../../../allCompones/BackButton";
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './Account.css'

// Define the Account interface
interface AccountData {
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
}

const Account = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [accountsData, setAccountsData] = useState<AccountData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Sample data based on your MongoDB structure
  const sampleAccountsData: AccountData[] = [
    {
      _id: "68354103cd8de19209e82101",
      companyName: "ABC Enterprises",
      firstName: "John",
      lastName: "Doe",
      phone1: "9876543210",
      phone2: "9123456789",
      whatsapp: "9876543210",
      telephone: "02212345678",
      address1: "123 Main Street",
      address2: "Apt 4B, Near Central Mall",
      state: "Maharashtra",
      pinCode: "400001",
      email: "john.doe@example.com",
      branchId: "68353aea762eeac21a090c6c"
    },
    {
      _id: "68354103cd8de19209e82102",
      companyName: "Tech Solutions Ltd",
      firstName: "Jane",
      lastName: "Smith",
      phone1: "9876543211",
      phone2: "9123456790",
      whatsapp: "9876543211",
      telephone: "02212345679",
      address1: "456 Tech Park",
      address2: "Floor 5, Building A",
      state: "Karnataka",
      pinCode: "560001",
      email: "jane.smith@techsolutions.com",
      branchId: "68353aea762eeac21a090c6d"
    },
    {
      _id: "68354103cd8de19209e82103",
      companyName: "Digital Marketing Co",
      firstName: "Mike",
      lastName: "Johnson",
      phone1: "9876543212",
      phone2: "9123456791",
      whatsapp: "9876543212",
      telephone: "02212345680",
      address1: "789 Business Center",
      address2: "Suite 301",
      state: "Delhi",
      pinCode: "110001",
      email: "mike.johnson@digitalmarketing.com",
      branchId: "68353aea762eeac21a090c6e"
    },
    {
      _id: "68354103cd8de19209e82104",
      companyName: "Creative Design Studio",
      firstName: "Sarah",
      lastName: "Wilson",
      phone1: "9876543213",
      phone2: "9123456792",
      whatsapp: "9876543213",
      telephone: "02212345681",
      address1: "321 Design Plaza",
      address2: "Creative Block, 2nd Floor",
      state: "Tamil Nadu",
      pinCode: "600001",
      email: "sarah.wilson@creativedesign.com",
      branchId: "68353aea762eeac21a090c6f"
    },
    {
      _id: "68354103cd8de19209e82105",
      companyName: "Consulting Services Pvt Ltd",
      firstName: "David",
      lastName: "Brown",
      phone1: "9876543214",
      phone2: "9123456793",
      whatsapp: "9876543214",
      telephone: "02212345682",
      address1: "654 Corporate Avenue",
      address2: "Wing B, 8th Floor",
      state: "Gujarat",
      pinCode: "380001",
      email: "david.brown@consulting.com",
      branchId: "68353aea762eeac21a090c70"
    }
  ];

  // Simulate API call - replace with your actual API call
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        // Replace this with your actual API call
        // const response = await fetch('/api/accounts');
        // const data = await response.json();
        
        // Using sample data for now
        setTimeout(() => {
          setAccountsData(sampleAccountsData);
          setLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error('Error fetching accounts:', error);
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  // Filter results based on search query
  const displayedAccounts = useMemo(() => {
    if (!searchQuery.trim()) return accountsData;
    
    const query = searchQuery.toLowerCase();
    return accountsData.filter(account =>
      account.companyName?.toLowerCase().includes(query) ||
      account.firstName?.toLowerCase().includes(query) ||
      account.lastName?.toLowerCase().includes(query) ||
      `${account.firstName} ${account.lastName}`.toLowerCase().includes(query) ||
      account.email?.toLowerCase().includes(query) ||
      account.phone1?.includes(searchQuery) ||
      account.phone2?.includes(searchQuery) ||
      account.whatsapp?.includes(searchQuery) ||
      account.telephone?.includes(searchQuery) ||
      account.state?.toLowerCase().includes(query) ||
      account.pinCode?.includes(searchQuery) ||
      account.address1?.toLowerCase().includes(query) ||
      account.address2?.toLowerCase().includes(query)
    );
  }, [searchQuery, accountsData]);

  // Scroll to selected item
  useEffect(() => {
    if (selectedIndex >= 0) {
      const selectedElement = document.getElementById(`account-${selectedIndex}`);
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (displayedAccounts.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => prev < displayedAccounts.length - 1 ? prev + 1 : 0);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : displayedAccounts.length - 1);
        break;
      case 'Enter':
        if (selectedIndex >= 0) {
          e.preventDefault();
          handleAccountSelect(displayedAccounts[selectedIndex]);
        }
        break;
      case 'Escape':
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle account selection
  const handleAccountSelect = (account: AccountData) => {
    console.log("Selected account:", account);
    // Navigate to AccountInfo with account data
    navigate('/account-info', { 
      state: { 
        accountData: account 
      } 
    });
  };

  const getFullName = (account: AccountData) => {
    return `${account.firstName || ''} ${account.lastName || ''}`.trim();
  };

  const getFullAddress = (account: AccountData) => {
    const parts = [
      account.address1,
      account.address2,
      account.state,
      account.pinCode
    ].filter(Boolean);
    return parts.join(', ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <BackButton />
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading accounts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <BackButton />
      
      {/* Search Section */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Search Accounts</h1>
          <p className="text-gray-600">Find companies and contacts</p>
        </div>
        
        <div className="relative mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by company, name, email, phone..."
            className="w-full px-4 py-3 pl-12 pr-12 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Clear Button */}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Results Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Results Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
            <h2 className="text-lg font-semibold text-gray-800">
              {searchQuery ? 'Search Results' : 'All Accounts'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {displayedAccounts.length} {displayedAccounts.length === 1 ? 'account' : 'accounts'} 
              {searchQuery && ` found for "${searchQuery}"`}
              {displayedAccounts.length > 0 && (
                <span className="ml-2 text-blue-600">
                  Use ↑↓ keys to navigate, Enter to select
                </span>
              )}
            </p>
          </div>
          
          {/* Scrollable Results Container */}
          <div className="max-h-96 overflow-y-auto">
            {displayedAccounts.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {displayedAccounts.map((account, index) => (
                  <div
                    key={account._id}
                    id={`account-${index}`}
                    className={`px-6 py-4 hover:bg-blue-50 cursor-pointer transition-colors duration-150 ${
                      selectedIndex === index ? 'bg-blue-100 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={() => handleAccountSelect(account)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-baseline">
                          <h3 className="text-lg font-semibold text-gray-800 mr-3">
                            {account.companyName}
                          </h3>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                            {account.state}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-1 font-medium">{getFullName(account)}</p>
                        <div className="mt-2 text-sm text-gray-500 space-y-1">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {account.email}
                          </div>
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className="mr-4">{account.phone1}</span>
                            {account.phone2 && (
                              <span className="text-gray-400">| {account.phone2}</span>
                            )}
                          </div>
                          {account.whatsapp && (
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z"/>
                              </svg>
                              WhatsApp: {account.whatsapp}
                            </div>
                          )}
                          {account.telephone && (
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 3l-6 6m0 0V4m0 5h5M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                              </svg>
                              Tel: {account.telephone}
                            </div>
                          )}
                          <div className="flex items-start">
                            <svg className="w-4 h-4 mr-2 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{getFullAddress(account)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No results found</h3>
                <p className="text-gray-500">
                  No accounts match your search term "{searchQuery}"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;