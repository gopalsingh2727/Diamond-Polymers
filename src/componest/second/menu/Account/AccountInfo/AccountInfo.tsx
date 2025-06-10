// AccountInfo.tsx


import { useLocation, Navigate } from "react-router-dom";

const AccountInfo = () => {
  const location = useLocation();
  const { accountData } = location.state || {};

  if (!accountData) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">{accountData.companyName || `${accountData.firstName} ${accountData.lastName}`}</h1>
      <p className="text-gray-700">
        {accountData.address1}, {accountData.city}, {accountData.state} - {accountData.pinCode}
      </p>
      <p className="text-gray-700 mt-2">Phone: {accountData.phone1}</p>
      <p className="text-gray-700">Email: {accountData.email}</p>
    </div>
  );
};

export default AccountInfo;