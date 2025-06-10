import { useState, useEffect, useRef } from "react";

import { BackButton } from "../../../allCompones/BackButton";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./Dispatch.css";

const ORDERS = [
  {
    id: "ORD001",
    name: "John Doe",
    phone: "123-456-7890",
    date: "2024-01-15",
    status: "Pending",
    AllStatus: {
      "Pending": { color: "orange", icon: "⏳", description: "Order received" },
      "Processing": { color: "blue", icon: "🔄", description: "Being prepared" }
    }
  },
  {
    id: "ORD002",
    name: "Jane Smith",
    phone: "098-765-4321",
    date: "2024-01-14",
    status: "Completed",
    AllStatus: {
      "Completed": { color: "green", icon: "✅", description: "Order delivered" }
    }
  }
];



export default function Dispatch() {
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(0);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [orders, setOrders] = useState(ORDERS);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showPeriodModal, setShowPeriodModal] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const ordersRef = useRef<(HTMLDivElement | null)[]>([]);
  const scrollWrapperRef = useRef<HTMLDivElement | null>(null);

  const companyName = "ABC Company";
  const branchName = "Main Branch";

  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.date);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    if (from && orderDate < from) return false;
    if (to && orderDate > to) return false;
    return true;
  });


  const handlePrint = () => {
    const currentDate = new Date().toLocaleDateString();
    const periodText =
      fromDate && toDate
        ? `Period: ${new Date(fromDate).toLocaleDateString()} - ${new Date(toDate).toLocaleDateString()}`
        : fromDate
        ? `From: ${new Date(fromDate).toLocaleDateString()}`
        : toDate
        ? `To: ${new Date(toDate).toLocaleDateString()}`
        : "All Records";

    const tableRows = filteredOrders
      .map(
        order => `
        <tr>
          <td>${order.date}</td>
          <td>${order.id}</td>
          <td>${order.name}</td>
          <td>${order.phone}</td>
          <td>${order.status}</td>
        </tr>`
      )
      .join("");

    // Create print content
    const printContent = `
      <html>
        <head>
          <title>Orders</title>
          <style>
            body { font-family: Arial; margin: 40px; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { margin: 0; }
            .header .meta { font-size: 14px; color: #555; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #000; padding: 8px; font-size: 12px; text-align: left; }
            th { background: #eee; }
            .total { margin-top: 10px; font-weight: bold; text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${companyName}</h1>
            <div class="meta">${branchName}</div>
            <div class="meta">${periodText}</div>
            <div class="meta">Printed: ${currentDate}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Order ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
          <div class="total">Total Records: ${filteredOrders.length}</div>
        </body>
      </html>
    `;

    // Method 1: Direct print without pop-up
    // const printFrame = document.createElement('iframe');
    // printFrame.style.display = 'none';
    // document.body.appendChild(printFrame);
    
    // const printDocument = printFrame.contentWindow.document;
    // printDocument.open();
    // printDocument.write(printContent);
    // printDocument.close();
    

    // printFrame.onload = () => {
    //   printFrame.contentWindow.print();
    //   // Clean up
    //   setTimeout(() => {
    //     document.body.removeChild(printFrame);
    //   }, 1000);
    // };


   const printFrame = document.createElement("iframe");
printFrame.style.display = "none";
document.body.appendChild(printFrame);

printFrame.onload = () => {
  const printWindow = printFrame.contentWindow;
  if (printWindow && printWindow.document) {
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();

    printWindow.focus(); // Optional: ensure the window is focused
    printWindow.print();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(printFrame);
    }, 1000);
  } else {
    console.error("Failed to access iframe content window.");
  }
};








  };


  const handleDelete = () => {
    const orderToDelete = filteredOrders[selectedOrderIndex];
    setOrders(prev => prev.filter(order => order.id !== orderToDelete.id));
    setSelectedOrderIndex(0);
    setExpandedOrder(null);
  };

  const handleExportExcel = () => {
    const exportData = filteredOrders.map(o => ({
      ID: o.id,
      Name: o.name,
      Phone: o.phone,
      Date: o.date,
      Status: o.status,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "Orders.xlsx");
  };

  const handleKeyNavigation = (e: React.KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedOrderIndex(prev => (prev + 1) % filteredOrders.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedOrderIndex(prev => (prev - 1 + filteredOrders.length) % filteredOrders.length);
        break;
      case "Enter":
        if (e.shiftKey) {
          setExpandedOrder(prev => (prev === selectedOrderIndex ? null : selectedOrderIndex));
        }
        break;
    }
  };

  useEffect(() => {
    if (scrollWrapperRef.current) {
      scrollWrapperRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const selectedOrder = ordersRef.current[selectedOrderIndex];
    if (selectedOrder) {
      selectedOrder.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedOrderIndex]);

  return (
    <div className="container">
      <div className="item">
        <BackButton />
        <div>
          <label>From:
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
          </label>
          <label>To:
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
          </label>
        </div>
      </div>

      <div className="item item-2">
        <div className="ButtonInDispatchDiv">
          <button className="ButtonINDispatch bottom-borders-menu" onClick={() => setShowPeriodModal(true)}>Change Period</button>
          <button className="ButtonINDispatch" onClick={handlePrint}>Print</button>
          <button className="ButtonINDispatch bottom-borders-menu" onClick={handleExportExcel}>Export to Excel</button>
          <button className="ButtonINDispatch" onClick={() => alert("Remove Line clicked!")}>Remove Line</button>
          <button className="ButtonINDispatch" onClick={handleDelete}>Cancel</button>
        </div>
      </div>

      <div className="item item-3" ref={contentRef}>
        <div className="DispatchTabale">
          <div className="ordersHeaderDispatch">
            <span>Date</span><span>Order ID</span><span>Name</span><span>Phone</span><span>Status</span>
          </div>

          <div
            className="orders-scroll-wrapper"
            ref={scrollWrapperRef}
            tabIndex={0}
            onKeyDown={handleKeyNavigation}
          >
            {filteredOrders.map((order, index) => (
              <div key={`${order.id}-${index}`}>
                <div
                  ref={el => ordersRef.current[index] = el}
                  className={`orderItem ${selectedOrderIndex === index ? "selected" : ""}`}
                  onClick={() => setSelectedOrderIndex(index)}
                >
                  <span>{order.date}</span>
                  <span>{order.id}</span>
                  <span>{order.name}</span>
                  <span>{order.phone}</span>
                  <span>{order.status}</span>
                </div>

                {expandedOrder === index && (
                  <div className="status-list">
                    {Object.entries(order.AllStatus).map(([status, { color, icon, description }]) => (
                      <div key={status} className="status-item" style={{ backgroundColor: color, color: "white" }}>
                        <span>{icon}</span> <strong>{status}:</strong> <span>{description}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showPeriodModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h2 className="text-lg font-semibold mb-4">Change Date Period</h2>
            <label className="block mb-2">
              From:
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="border w-full" />
            </label>
            <label className="block mb-4">
              To:
              <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="border w-full" />
            </label>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowPeriodModal(false)} className="bg-gray-400 text-white px-3 py-1 rounded">Cancel</button>
              <button onClick={() => setShowPeriodModal(false)} className="bg-blue-600 text-white px-3 py-1 rounded">Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}