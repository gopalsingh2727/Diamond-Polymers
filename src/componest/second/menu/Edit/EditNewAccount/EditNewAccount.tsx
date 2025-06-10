import React, { useState } from "react";
import CreateNewAccount from "../../create/createNewAccount/createNewAccount";

const dummyAccounts = [
  {
    id: 1,
    company: "ABC Enterprises",
    first_name: "Raj",
    last_name: "Kumar",
    email: "raj@example.com",
    phone1: "9876543210",
    state: "Tamil Nadu",
    pincode: "600001",
  },
  {
    id: 2,
    company: "XYZ Pvt Ltd",
    first_name: "Priya",
    last_name: "Sharma",
    email: "priya@example.com",
    phone1: "9123456789",
    state: "Delhi",
    pincode: "110001",
  },
  // Add more dummy accounts
];

const EditNewAccount = () => {
  const [selectedAccount, setSelectedAccount] = useState<any | null>(null);
  const [focusedRow, setFocusedRow] = useState<number>(-1);

const handleKeyDown = (e: React.KeyboardEvent, account: any) => {
  if (e.key === "Enter") {
    setSelectedAccount(account);
  } else if (e.key === "ArrowDown") {
    setFocusedRow((prev) => Math.min(prev + 1, dummyAccounts.length - 1));
  } else if (e.key === "ArrowUp") {
    setFocusedRow((prev) => Math.max(prev - 1, 0));
  }
};

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Accounts</h2>
      <table className="table-auto w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2">Company</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Phone</th>
            <th className="px-4 py-2">State</th>
            <th className="px-4 py-2">Pin</th>
          </tr>
        </thead>
        <tbody>
          {dummyAccounts.map((account, index) => (
            <tr
              key={account.id}
              tabIndex={0}
              className={`cursor-pointer ${
                index === focusedRow ? "bg-blue-100" : ""
              }`}
              onKeyDown={(e) => handleKeyDown(e, account)}
              onClick={() => setSelectedAccount(account)}
              onFocus={() => setFocusedRow(index)}
            >
              <td className="px-4 py-2">{account.company}</td>
              <td className="px-4 py-2">{account.first_name} {account.last_name}</td>
              <td className="px-4 py-2">{account.email}</td>
              <td className="px-4 py-2">{account.phone1}</td>
              <td className="px-4 py-2">{account.state}</td>
              <td className="px-4 py-2">{account.pincode}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedAccount && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-h-[90vh] overflow-auto w-full max-w-xl">
            <h3 className="text-lg font-bold mb-2">Edit Account</h3>
              <button
              onClick={() => setSelectedAccount(null)}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
            >
              Close
            </button>
            <CreateNewAccount initialData={selectedAccount} />
          
          </div>
        </div>
      )}
    </div>
  );
};

export default EditNewAccount;