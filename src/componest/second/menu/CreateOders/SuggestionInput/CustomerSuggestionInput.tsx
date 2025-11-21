import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/rootReducer";


interface Props {
  customerName: string;
  onSelect: (account: any) => void;
}

const CustomerSuggestions: React.FC<Props> = ({ customerName, onSelect }) => {
  // 🚀 OPTIMIZED: Get customers from cached form data (no extra API call)
  const { data: formData, loading: isLoading, error } = useSelector(
    (state: RootState) => state.orderFormData || {}
  );
  const accounts = formData?.customers || [];

  const [filtered, setFiltered] = useState<any[]>([]);

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


  if (isLoading) {
    return <div className="suggestion-loading">Loading suggestions...</div>;
  }

  if (error) {
    return <div className="suggestion-error">Error loading suggestions</div>;
  }

  if (filtered.length === 0) return null;

  return (
    <ul className="suggestion-list" >
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