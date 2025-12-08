import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createManager, sendManagerEmailOTP, verifyManagerEmailOTP } from "../../../../redux/Manger/MangerActions";
import type { AppDispatch } from "../../../../../store";
import { ActionButton } from '../../../../../components/shared/ActionButton';
import { ToastContainer } from '../../../../../components/shared/Toast';
import { useCRUD } from '../../../../../hooks/useCRUD';

interface Branch {
  _id: string;
  name: string;
  code?: string;
}

interface RootState {
  auth: {
    userData: {
      branches?: Branch[];
    } | null;
  };
  managerCreate?: {
    loading?: boolean;
    error?: string;
  };
}

type Step = 'email' | 'otp' | 'details';

const CreateManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // CRUD System Integration
  const { saveState, handleSave, toast } = useCRUD();

  // Get branches from logged-in user's userData
  const userData = useSelector((state: RootState) => state.auth.userData);
  const availableBranches = userData?.branches || [];

  // Select manager creation state
  const {
    loading: managerLoading,
    error: managerError,
  } = useSelector((state: RootState) => state.managerCreate || {});

  // Multi-step state
  const [step, setStep] = useState<Step>('email');
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otp, setOtp] = useState('');

  // Form data state with all fields
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    fullName: "",
    branchId: "",
  });

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Step 1: Send OTP
  const handleSendOTP = async () => {
    if (!formData.email.trim()) {
      toast.addToast('error', 'Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.addToast('error', 'Please enter a valid email address');
      return;
    }

    setOtpSending(true);
    try {
      await dispatch(sendManagerEmailOTP(formData.email));
      toast.addToast('success', 'OTP sent to email! Please check your inbox.');
      setStep('otp');
    } catch (error: any) {
      toast.addToast('error', error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setOtpSending(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      toast.addToast('error', 'Please enter the OTP');
      return;
    }

    if (otp.length !== 6) {
      toast.addToast('error', 'OTP must be 6 digits');
      return;
    }

    setOtpVerifying(true);
    try {
      await dispatch(verifyManagerEmailOTP(formData.email, otp));
      toast.addToast('success', 'Email verified successfully!');
      setEmailVerified(true);
      setStep('details');
    } catch (error: any) {
      toast.addToast('error', error.response?.data?.message || 'Invalid OTP');
    } finally {
      setOtpVerifying(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setOtpSending(true);
    try {
      await dispatch(sendManagerEmailOTP(formData.email));
      toast.addToast('success', 'OTP resent! Please check your inbox.');
      setOtp('');
    } catch (error: any) {
      toast.addToast('error', error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setOtpSending(false);
    }
  };

  // Go back to email step
  const handleBackToEmail = () => {
    setStep('email');
    setEmailVerified(false);
    setOtp('');
  };

  // Step 3: Form submission handler
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!emailVerified) {
      toast.addToast('error', 'Please verify your email first');
      return;
    }

    const { username, password, branchId } = formData;

    // Validation
    if (!username.trim()) {
      toast.addToast('error', 'Username is required');
      return;
    }
    if (!password.trim()) {
      toast.addToast('error', 'Password is required');
      return;
    }
    if (password.length < 8) {
      toast.addToast('error', 'Password must be at least 8 characters');
      return;
    }
    if (!branchId) {
      toast.addToast('error', 'Please select a branch');
      return;
    }

    // Find branch name for success message
    const selectedBranch = availableBranches.find((b: Branch) => b._id === branchId);
    const branchName = selectedBranch?.name || "Unknown Branch";

    handleSave(
      () => dispatch(createManager(formData)),
      {
        successMessage: `Manager created successfully for ${branchName}! Login credentials sent to email.`,
        onSuccess: () => {
          // Reset all state
          setFormData({
            username: '',
            email: '',
            password: '',
            phone: '',
            fullName: '',
            branchId: ''
          });
          setStep('email');
          setEmailVerified(false);
          setOtp('');
        }
      }
    );
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow-md rounded">
      <h2 className="text-xl font-bold mb-4">Create Manager</h2>

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

      {/* Status Messages */}
      {managerError && (
        <p className="text-red-500 text-sm mb-2">{managerError}</p>
      )}

      {/* Step 1: Email Input */}
      {step === 'email' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input
              type="email"
              name="email"
              placeholder="Enter manager email"
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
            className="w-full bg-[#FF6B35] text-white px-4 py-2 rounded hover:bg-[#E55A2B] transition-colors disabled:opacity-50"
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
            className="w-full bg-[#FF6B35] text-white px-4 py-2 rounded hover:bg-[#E55A2B] transition-colors disabled:opacity-50"
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

      {/* Step 3: Manager Details Form */}
      {step === 'details' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-green-50 p-3 rounded mb-4">
            <p className="text-sm text-green-700">
              ✓ Email verified: <strong>{formData.email}</strong>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              name="fullName"
              type="text"
              placeholder="Enter full name"
              value={formData.fullName}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
            <input
              name="username"
              type="text"
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
              className="border p-2 w-full rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              name="phone"
              type="tel"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input
              name="password"
              type="password"
              placeholder="Password (min 8 chars)"
              value={formData.password}
              onChange={handleChange}
              className="border p-2 w-full rounded"
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Branch *</label>
            {availableBranches.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No branches available. Create a branch first.</p>
            ) : (
              <select
                name="branchId"
                value={formData.branchId}
                onChange={handleChange}
                className="border p-2 w-full rounded"
                required
              >
                <option value="">Select Branch</option>
                {availableBranches.map((branch: Branch) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.name} {branch.code ? `(${branch.code})` : ''}
                  </option>
                ))}
              </select>
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
              className="flex-1 bg-[#FF6B35] text-white py-2 rounded hover:bg-[#E55A2B] transition"
            >
              Create Manager
            </ActionButton>
          </div>
        </form>
      )}

      {/* Toast notifications */}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

export default CreateManager;
