import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createAdmin, sendAdminEmailOTP, verifyAdminEmailOTP } from '../../../../redux/Admin/AdminActions';
import { ActionButton } from '../../../../../components/shared/ActionButton';
import { ToastContainer } from '../../../../../components/shared/Toast';
import { useCRUD } from '../../../../../hooks/useCRUD';
import { AppDispatch } from "../../../../../store";

interface Branch {
  _id: string;
  name: string;
  code?: string;
}

interface RootState {
  auth: {
    userData: {
      branches?: Branch[];
      product27InfinityId?: string;
    } | null;
  };
  adminCreate?: {
    loading?: boolean;
  };
}

type Step = 'email' | 'otp' | 'details';

const CreateAdmin = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.adminCreate || {});
  const userData = useSelector((state: RootState) => state.auth.userData);

  // Get branches from logged-in user
  const availableBranches = userData?.branches || [];
  const product27InfinityId = userData?.product27InfinityId || '';

  // CRUD System Integration
  const { saveState, handleSave, toast } = useCRUD();

  // Multi-step state
  const [step, setStep] = useState<Step>('email');
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otp, setOtp] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
  });

  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);

  // Generate random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleBranchToggle = (branchId: string) => {
    setSelectedBranches(prev =>
      prev.includes(branchId)
        ? prev.filter(id => id !== branchId)
        : [...prev, branchId]
    );
  };

  const handleSelectAllBranches = () => {
    if (selectedBranches.length === availableBranches.length) {
      setSelectedBranches([]);
    } else {
      setSelectedBranches(availableBranches.map(b => b._id));
    }
  };

  // Step 1: Send OTP
  const handleSendOTP = async () => {
    if (!formData.email.trim()) {
      toast.error('Validation Error', 'Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Validation Error', 'Please enter a valid email address');
      return;
    }

    setOtpSending(true);
    try {
      await dispatch(sendAdminEmailOTP(formData.email));
      toast.success('Success', 'OTP sent to email! Please check your inbox.');
      setStep('otp');
    } catch (error: any) {
      toast.error('Error', error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setOtpSending(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      toast.error('Error', 'Please enter the OTP');
      return;
    }

    if (otp.length !== 6) {
      toast.error('Error', 'OTP must be 6 digits');
      return;
    }

    setOtpVerifying(true);
    try {
      await dispatch(verifyAdminEmailOTP(formData.email, otp));
      toast.success('Success', 'Email verified successfully!');
      setEmailVerified(true);
      setStep('details');
      // Auto-generate password when moving to details step
      if (!formData.password) {
        setFormData(prev => ({ ...prev, password: generatePassword() }));
      }
    } catch (error: any) {
      toast.error('Error', error.response?.data?.message || 'Invalid OTP');
    } finally {
      setOtpVerifying(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setOtpSending(true);
    try {
      await dispatch(sendAdminEmailOTP(formData.email));
      toast.success('Success', 'OTP resent! Please check your inbox.');
      setOtp('');
    } catch (error: any) {
      toast.error('Error', error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setOtpSending(false);
    }
  };

  // Step 3: Create Admin
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!emailVerified) {
      toast.error('Error', 'Please verify your email first');
      return;
    }

    if (selectedBranches.length === 0) {
      toast.error('Error', 'Please select at least one branch');
      return;
    }

    if (!product27InfinityId) {
      toast.error('Error', 'Missing product27InfinityId. Please re-login.');
      return;
    }

    handleSave(
      () => dispatch(createAdmin({
        ...formData,
        branchIds: selectedBranches,
        product27InfinityId,
      })),
      {
        successMessage: 'Admin created successfully! Login credentials sent to email.',
        onSuccess: () => {
          // Reset all state
          setFormData({
            username: '',
            email: '',
            password: '',
            phone: '',
          });
          setSelectedBranches([]);
          setStep('email');
          setEmailVerified(false);
          setOtp('');
        }
      }
    );
  };

  // Go back to email step
  const handleBackToEmail = () => {
    setStep('email');
    setEmailVerified(false);
    setOtp('');
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Create Admin</h2>

      {/* Step Indicator */}
      <div className="flex items-center mb-6">
        <div className={`flex items-center ${step === 'email' ? 'text-[#FF6B35]' : emailVerified ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'email' ? 'border-[#FF6B35] bg-[#FF6B35] text-white' : emailVerified ? 'border-green-600 bg-green-600 text-white' : 'border-gray-300'}`}>
            {emailVerified ? '✓' : '1'}
          </div>
          <span className="ml-2 text-sm font-medium">Email</span>
        </div>
        <div className={`flex-1 h-1 mx-2 ${step !== 'email' ? 'bg-[#FF6B35]' : 'bg-gray-300'}`} />
        <div className={`flex items-center ${step === 'otp' ? 'text-[#FF6B35]' : emailVerified ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'otp' ? 'border-[#FF6B35] bg-[#FF6B35] text-white' : emailVerified ? 'border-green-600 bg-green-600 text-white' : 'border-gray-300'}`}>
            {emailVerified ? '✓' : '2'}
          </div>
          <span className="ml-2 text-sm font-medium">Verify</span>
        </div>
        <div className={`flex-1 h-1 mx-2 ${step === 'details' ? 'bg-[#FF6B35]' : 'bg-gray-300'}`} />
        <div className={`flex items-center ${step === 'details' ? 'text-[#FF6B35]' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'details' ? 'border-[#FF6B35] bg-[#FF6B35] text-white' : 'border-gray-300'}`}>
            3
          </div>
          <span className="ml-2 text-sm font-medium">Details</span>
        </div>
      </div>

      {/* Step 1: Email Input */}
      {step === 'email' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input
              type="email"
              name="email"
              placeholder="Enter admin email"
              className="w-full p-2 border rounded"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <p className="text-xs text-gray-500 mt-1">We'll send a verification OTP to this email</p>
          </div>

          <button
            type="button"
            onClick={handleSendOTP}
            disabled={otpSending}
            className="w-full bg-[#FF6B35] text-white px-4 py-2 rounded hover:bg-[#e55a2a] transition-colors disabled:opacity-50"
          >
            {otpSending ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </div>
      )}

      {/* Step 2: OTP Verification */}
      {step === 'otp' && (
        <div className="space-y-4">
          <div className="bg-blue-50 p-3 rounded mb-4">
            <p className="text-sm text-blue-700">
              OTP sent to <strong>{formData.email}</strong>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP *</label>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              className="w-full p-2 border rounded text-center text-2xl tracking-widest"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
            />
          </div>

          <button
            type="button"
            onClick={handleVerifyOTP}
            disabled={otpVerifying}
            className="w-full bg-[#FF6B35] text-white px-4 py-2 rounded hover:bg-[#e55a2a] transition-colors disabled:opacity-50"
          >
            {otpVerifying ? 'Verifying...' : 'Verify OTP'}
          </button>

          <div className="flex justify-between items-center text-sm">
            <button
              type="button"
              onClick={handleBackToEmail}
              className="text-gray-600 hover:underline"
            >
              ← Change Email
            </button>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={otpSending}
              className="text-[#FF6B35] hover:underline disabled:opacity-50"
            >
              {otpSending ? 'Sending...' : 'Resend OTP'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Admin Details Form */}
      {step === 'details' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-green-50 p-3 rounded mb-4">
            <p className="text-sm text-green-700">
              ✓ Email verified: <strong>{formData.email}</strong>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
            <input
              type="text"
              name="username"
              placeholder="Username"
              className="w-full p-2 border rounded"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              className="w-full p-2 border rounded"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <div className="flex gap-2">
              <input
                type="text"
                name="password"
                placeholder="Password (min 8 chars)"
                className="flex-1 p-2 border rounded"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, password: generatePassword() })}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                title="Generate random password"
              >
                🔄
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Password will be sent to the admin's email</p>
          </div>

          {/* Branch Selection */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Assign Branches * ({selectedBranches.length} selected)
              </label>
              {availableBranches.length > 1 && (
                <button
                  type="button"
                  onClick={handleSelectAllBranches}
                  className="text-sm text-[#FF6B35] hover:underline"
                >
                  {selectedBranches.length === availableBranches.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>

            {availableBranches.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No branches available. Create a branch first.</p>
            ) : (
              <div className="border rounded p-3 max-h-48 overflow-y-auto space-y-2">
                {availableBranches.map((branch: Branch) => (
                  <label
                    key={branch._id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBranches.includes(branch._id)}
                      onChange={() => handleBranchToggle(branch._id)}
                      className="w-4 h-4 text-[#FF6B35] rounded border-gray-300 focus:ring-[#FF6B35]"
                    />
                    <span className="text-sm">
                      {branch.name}
                      {branch.code && <span className="text-gray-500 ml-1">({branch.code})</span>}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleBackToEmail}
              className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 transition-colors"
            >
              ← Back
            </button>
            <ActionButton
              type="save"
              state={saveState}
              onClick={handleSubmit}
              className="flex-1 bg-[#FF6B35] text-white px-4 py-2 rounded hover:bg-[#e55a2a] transition-colors"
            >
              Create Admin
            </ActionButton>
          </div>
        </form>
      )}

      {/* Toast notifications */}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

export default CreateAdmin;
