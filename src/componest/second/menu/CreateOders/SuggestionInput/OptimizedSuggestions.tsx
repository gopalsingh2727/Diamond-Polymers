import React, { useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/rootReducer";

interface Props {
  searchTerm: string;
  onSelect: (data: any) => void;
  suggestionType: 'customer' | 'productType' | 'productName' | 'materialType' | 'materialName' | 'productSpec' | 'step';
  filterBy?: string;
  showSuggestions?: boolean;
  selectedIndex?: number;
  onSuggestionsChange?: (suggestions: any[]) => void;
}


const OptimizedSuggestions: React.FC<Props> = ({
  searchTerm,
  onSelect,
  suggestionType,
  filterBy = '',
  showSuggestions = false,
  selectedIndex = -1,
  onSuggestionsChange
}) => {
  const orderFormData = useSelector((state: RootState) => state.orderFormData);
  const data = orderFormData?.data;

  // Warn about incomplete customer data
  useEffect(() => {
    if (data?.customers && Array.isArray(data.customers) && data.customers.length > 0 && suggestionType === 'customer') {
      const fields = Object.keys(data.customers[0]);
      if (fields.length <= 3) {

      }
    }
  }, [data, suggestionType]);

  // Helper function to get customer name
  const getCustomerName = (customer: any): string => {
    const possibleNames = [
    customer.accountName,
    customer.name,
    customer.customerName,
    customer.firstName && customer.lastName ?
    `${customer.firstName} ${customer.lastName}`.trim() :
    null,
    customer.firstName,
    customer.companyName,
    customer.company,
    customer.email ?
    customer.email.split('@')[0].replace(/[._-]/g, ' ') :
    null,
    customer._id ?
    `Customer-${customer._id.slice(-6)}` :
    'Unknown'];


    return possibleNames.find((name) => name && name.trim()) || 'Unknown Customer';
  };

  const filtered = useMemo(() => {
    if (!data) return [];

    // If empty search (not even *), return nothing
    if (!searchTerm && searchTerm !== '*') return [];

    const search = searchTerm.toLowerCase().trim();
    const showAll = search === '*';

    switch (suggestionType) {
      case 'customer':
        const allCustomers = data.customers || [];

        // ⭐ Show ALL customers when typing *
        if (showAll) {
          return allCustomers.slice(0, 50); // Show up to 50
        }

        // Regular filtered search
        return allCustomers.
        filter((customer: any) => {
          const customerName = getCustomerName(customer).toLowerCase();
          const companyName = (customer.companyName || customer.company || '').toLowerCase();
          const phone = (
          customer.phoneNumber ||
          customer.phone1 ||
          customer.phone ||
          customer.telephone ||
          customer.mobile ||
          '').
          toLowerCase();
          const email = (customer.email || '').toLowerCase();

          return (
            customerName.includes(search) ||
            companyName.includes(search) ||
            phone.includes(search) ||
            email.includes(search));

        }).
        slice(0, 5);

      case 'productType':
        if (showAll) {
          return (data.productTypes || []).slice(0, 50);
        }
        return (data.productTypes || []).
        filter((type: any) =>
        (type.productTypeName || "").toLowerCase().includes(search)
        ).
        slice(0, 5);

      case 'productName':
        let products = data.products || [];
        if (filterBy) {
          products = products.filter((p: any) =>
          p.productType?._id === filterBy || p.productType === filterBy
          );
        }
        if (showAll) {
          return products.slice(0, 50);
        }
        return products.
        filter((product: any) =>
        (product.productName || "").toLowerCase().includes(search)
        ).
        slice(0, 5);

      case 'productSpec':
        let specs = data.productSpecs || [];
        if (filterBy) {
          specs = specs.filter((s: any) =>
          s.productTypeId?._id === filterBy || s.productTypeId === filterBy
          );
        }
        if (showAll) {
          return specs.slice(0, 50);
        }
        return specs.
        filter((spec: any) =>
        (spec.specName || "").toLowerCase().includes(search)
        ).
        slice(0, 5);

      case 'materialType':
        if (showAll) {
          return (data.materialTypes || []).slice(0, 50);
        }
        return (data.materialTypes || []).
        filter((type: any) =>
        (type.materialTypeName || "").toLowerCase().includes(search)
        ).
        slice(0, 5);

      case 'materialName':
        let materials = data.materials || [];
        if (filterBy) {
          materials = materials.filter((m: any) =>
          m.materialType?._id === filterBy || m.materialType === filterBy
          );
        }
        if (showAll) {
          return materials.slice(0, 50);
        }
        return materials.
        filter((material: any) =>
        (material.materialName || "").toLowerCase().includes(search)
        ).
        slice(0, 5);

      default:
        return [];
    }
  }, [searchTerm, data, suggestionType, filterBy]);

  // Notify parent when suggestions change
  useEffect(() => {
    if (onSuggestionsChange) {
      onSuggestionsChange(filtered);
    }
  }, [filtered, onSuggestionsChange]);

  if (!showSuggestions || filtered.length === 0) {
    return null;
  }

  const getIcon = () => {
    switch (suggestionType) {
      case 'customer':return '👤';
      case 'productType':return '📦';
      case 'productName':return '📄';
      case 'productSpec':return '📋';
      case 'materialType':return '🔷';
      case 'materialName':return '🔹';
      default:return '•';
    }
  };

  const showingAll = searchTerm.trim() === '*';

  return (
    <>
      {/* Show warning if backend data is incomplete */}
      {suggestionType === 'customer' && filtered.length > 0 && Object.keys(filtered[0]).length <= 3 &&
      <div style={{
        position: 'absolute',
        top: '-70px',
        left: 0,
        right: 0,
        background: '#ff5252',
        color: 'white',
        border: '2px solid #d32f2f',
        borderRadius: '4px',
        padding: '8px',
        fontSize: '11px',
        zIndex: 999
      }}>
          <strong>⚠️ API ERROR:</strong> Customer data incomplete! Only: {Object.keys(filtered[0]).join(', ')}
          <br />
          <small>Backend must return: accountName, phone, address, companyName, etc.</small>
        </div>
      }

      {/* Show hint about * feature */}
      {!showingAll && filtered.length >= 5 &&
      <div style={{
        position: 'absolute',
        top: '-30px',
        left: 0,
        right: 0,
        background: '#e3f2fd',
        border: '1px solid #2196f3',
        borderRadius: '4px',
        padding: '4px 8px',
        fontSize: '10px',
        color: '#1976d2',
        zIndex: 999,
        textAlign: 'center'
      }}>
          💡 Tip: Type <strong>*</strong> to see all items (up to 50)
        </div>
      }

      {/* Show "Showing All" indicator */}
      {showingAll &&
      <div style={{
        position: 'absolute',
        top: '-30px',
        left: 0,
        right: 0,
        background: '#4caf50',
        color: 'white',
        border: '1px solid #2e7d32',
        borderRadius: '4px',
        padding: '4px 8px',
        fontSize: '10px',
        fontWeight: 'bold',
        zIndex: 999,
        textAlign: 'center'
      }}>
          ⭐ Showing ALL {filtered.length} items
        </div>
      }
      
      <ul className="suggestion-list" style={{
        position: 'absolute',
        background: 'white',
        border: '1px solid #ccc',
        borderRadius: '4px',
        maxHeight: showingAll ? '400px' : '200px', // Taller when showing all
        overflowY: 'auto',
        zIndex: 1000,
        width: '100%',
        marginTop: '2px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        {filtered.map((item: any, idx: number) => {
          let displayText = '';
          let subText = '';

          switch (suggestionType) {
            case 'customer':
              displayText = getCustomerName(item);

              const phone =
              item.phoneNumber ||
              item.phone1 ||
              item.phone ||
              item.telephone ||
              item.mobile ||
              '';

              const email = item.email || '';
              const company = item.companyName || item.company || '';

              const subParts = [];
              if (company && company !== displayText) {
                subParts.push(company);
              }
              if (phone) {
                subParts.push(phone);
              }
              if (email && !displayText.toLowerCase().includes(email.split('@')[0].toLowerCase())) {
                subParts.push(email);
              }
              subText = subParts.join(' • ');
              break;

            case 'productType':
              displayText = item.productTypeName;
              subText = item.description || '';
              break;

            case 'productName':
              displayText = item.productName;
              subText = item.productType?.productTypeName;
              break;

            case 'productSpec':
              displayText = item.specName;
              subText = item.description || '';
              break;

            case 'materialType':
              displayText = item.materialTypeName;
              subText = item.description || '';
              break;

            case 'materialName':
              displayText = item.materialName;
              subText = item.materialType?.materialTypeName;
              break;
          }

          const isSelected = idx === selectedIndex;
          return (
            <li
              key={item._id || idx}
              className={`suggestionItem ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelect(item)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                borderBottom: idx < filtered.length - 1 ? '1px solid #eee' : 'none',
                backgroundColor: isSelected ? '#FF6B35' : 'white',
                color: isSelected ? 'white' : 'inherit'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.backgroundColor = '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.backgroundColor = 'white';
              }}>

              <div>
                <span style={{ marginRight: '8px' }}>{getIcon()}</span>
                <strong>{displayText}</strong>
              </div>
              {subText &&
              <div style={{
                fontSize: '11px',
                color: isSelected ? 'rgba(255,255,255,0.8)' : '#666',
                marginLeft: '24px'
              }}>
                  {subText}
                </div>
              }
            </li>);

        })}
      </ul>
    </>);

};

export default OptimizedSuggestions;