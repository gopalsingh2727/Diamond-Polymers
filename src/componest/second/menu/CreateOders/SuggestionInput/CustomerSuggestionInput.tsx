import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAccounts } from "../../../../redux/create/createNewAccount/NewAccountActions";
import { RootState } from "../../../../redux/rootReducer";

interface Props {
  customerName: string;
  onSelect: (account: any) => void;
}

const CustomerSuggestions: React.FC<Props> = ({ customerName, onSelect }) => {
  const dispatch = useDispatch();
  
  // Fixed: Added proper fallback and error handling
  const accountsState = useSelector((state: RootState) => state.getAccounts);
  const accounts = accountsState?.accounts || [];
  const isLoading = accountsState?.loading || false;
  const error = accountsState?.error;
  
  const [filtered, setFiltered] = useState<any[]>([]);

  useEffect(() => {
    // Only dispatch if accounts are not already loaded
    if (accounts.length === 0 && !isLoading) {
      dispatch(getAccounts() as any);
    }
  }, [dispatch, accounts.length, isLoading]);

  useEffect(() => {
    if (customerName && customerName.trim().length > 0) {
      
   
      
      const results = accounts.filter((acc: any) => {
        // More flexible filtering - check multiple possible name fields
        const name = acc?.name || acc?.customerName || acc?.accountName || '';
        const company = acc?.companyName || acc?.company || '';
        const searchTerm = customerName.toLowerCase();
        
        const nameMatch = name.toLowerCase().includes(searchTerm);
        const companyMatch = company.toLowerCase().includes(searchTerm);
        
      
        
        return nameMatch || companyMatch;
      });
      
      console.log('Filtered results:', results);
      setFiltered(results.slice(0, 5));
    } else {
      setFiltered([]);
    }
  }, [customerName, accounts]);

  // Debug logging (remove in production)
  useEffect(() => {
    console.log('CustomerSuggestions Debug:', {
      customerName,
      accountsLength: accounts.length,
      filteredLength: filtered.length,
      isLoading,
      error
    });
  }, [customerName, accounts, filtered, isLoading, error]);

  if (isLoading) {
    return <div className="suggestion-loading">Loading suggestions...</div>;
  }

  if (error) {
    return <div className="suggestion-error">Error loading suggestions</div>;
  }

  if (filtered.length === 0) return null;

  return (
    <ul className="suggestion-list">
      {filtered.map((acc, idx) => (
        <li
          key={acc.id || idx} 
          className="suggestionItem"
          onClick={() => onSelect(acc)}
        >
          🙍 {acc.name} ({acc.companyName || "No Company"})
        </li>
      ))}
    </ul>
  );
};

export default CustomerSuggestions;