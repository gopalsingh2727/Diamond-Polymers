import { useEffect } from "react";

interface Order {
  id: string;
  name: string;
  phone: string;
  date: string;
  status: string;
}

interface PrintProps {
  orders: Order[];
  fromDate?: string;
  toDate?: string;
  companyName?: string;
  branchName?: string;
}

export default function Print({ 
  orders, 
  fromDate, 
  toDate, 
  companyName = "Your Company Name", 
  branchName = "Main Branch" 
}: PrintProps) {
  
  useEffect(() => {
    // Auto-trigger print when component mounts
    const timer = setTimeout(() => {
      window.print();
    }, 500); // Small delay to ensure component is fully rendered

    return () => clearTimeout(timer);
  }, []);

  const currentDate = new Date().toLocaleDateString();
  const periodText = fromDate && toDate 
    ? `Period: ${new Date(fromDate).toLocaleDateString()} - ${new Date(toDate).toLocaleDateString()}`
    : fromDate 
      ? `From: ${new Date(fromDate).toLocaleDateString()}`
      : toDate 
        ? `To: ${new Date(toDate).toLocaleDateString()}`
        : 'All Records';

  return (
    <>
     <style>{`
  @media print {
    body {
      margin: 0;
      padding: 20px;
      font-family: Arial, sans-serif;
    }

    .no-print {
      display: none !important;
    }
  }

  @media screen {
    .print-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      font-family: Arial, sans-serif;
    }

    .no-print {
      margin-bottom: 20px;
    }
  }

  .print-header {
    text-align: center;
    margin-bottom: 30px;
    border-bottom: 2px solid #333;
    padding-bottom: 20px;
  }

  .company-name {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 5px;
  }

  .branch-name {
    font-size: 18px;
    color: #666;
    margin-bottom: 10px;
  }

  .period-info {
    font-size: 14px;
    margin-bottom: 5px;
  }

  .print-date {
    font-size: 12px;
    color: #888;
  }

  .orders-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }

  .orders-table th,
  .orders-table td {
    border: 1px solid #333;
    padding: 8px;
    text-align: left;
    font-size: 12px;
  }

  .orders-table th {
    background-color: #f0f0f0;
    font-weight: bold;
  }

  .total-records {
    margin-top: 20px;
    font-weight: bold;
    text-align: right;
  }

  .print-button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 10px;
  }

  .print-button:hover {
    background-color: #0056b3;
  }

  .back-button {
    background-color: #6c757d;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
  }

  .back-button:hover {
    background-color: #545b62;
  }
`}</style>

      <div className="print-container">
        <div className="no-print">
          <button 
            className="print-button" 
            onClick={() => window.print()}
          >
            Print Report
          </button>
          <button 
            className="back-button" 
            onClick={() => window.history.back()}
          >
            Back
          </button>
        </div>

        <div className="print-header">
          <div className="company-name">{companyName}</div>
          <div className="branch-name">{branchName}</div>
          <div className="period-info">{periodText}</div>
          <div className="print-date">Generated on: {currentDate}</div>
        </div>
        
        <table className="orders-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Order ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={`${order.id}-${index}`}>
                <td>{order.date}</td>
                <td>{order.id}</td>
                <td>{order.name}</td>
                <td>{order.phone}</td>
                <td>{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="total-records">
          Total Records: {orders.length}
        </div>
      </div>
    </>
  );
}