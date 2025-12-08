import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { InfinitySpinner } from "../../components/InfinitySpinner";

type StepType = "email" | "otp" | "newPassword";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState<StepType>("email");
  const [userType, setUserType] = useState<string>("");

  const baseUrl = import.meta.env.VITE_API_27INFINITY_IN || "http://localhost:4000";
  const apiKey = import.meta.env.VITE_API_KEY;

  // Try to find user across all user types
  const tryRequestOTP = async (endpoint: string): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const response = await axios.post(
        `${baseUrl}/${endpoint}/request-password-reset`,
        { email: email.toLowerCase().trim() },
        {
          headers: {
            "x-api-key": apiKey,
            "Content-Type": "application/json",
          },
        }
      );
      return { success: true, data: response.data };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data?.message || "Failed"
      };
    }
  };

  // Step 1: Send OTP
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Try unified endpoint first, then fallback to individual endpoints
    const endpoints = [
      { type: "auth", prefix: "auth" },
      { type: "master_admin", prefix: "master-admin" },
      { type: "admin", prefix: "admin" },
      { type: "manager", prefix: "manager" },
    ];

    let found = false;

    for (const { type, prefix } of endpoints) {
      const result = await tryRequestOTP(prefix);

      if (result.success) {
        if (result.data?.email || result.data?.userType) {
          setUserType(result.data.userType || type);
          setSuccess(result.data.message || "OTP sent to your email!");
          setStep("otp");
          found = true;
          break;
        }
        if (prefix === "auth") {
          setSuccess(result.data.message || "OTP sent to your email!");
          setStep("otp");
          found = true;
          break;
        }
      }
    }

    if (!found) {
      setSuccess("If the email exists, a password reset OTP has been sent.");
      setStep("otp");
    }

    setLoading(false);
  };

  // Try to verify OTP across endpoints
  const tryVerifyOTP = async (endpoint: string): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const response = await axios.post(
        `${baseUrl}/${endpoint}/verify-otp`,
        {
          email: email.toLowerCase().trim(),
          token: otp,
        },
        {
          headers: {
            "x-api-key": apiKey,
            "Content-Type": "application/json",
          },
        }
      );
      return { success: true, data: response.data };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data?.message || "Failed"
      };
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      setLoading(false);
      return;
    }

    // Try unified endpoint first, then fallback to individual endpoints
    const endpoints = ["auth", "master-admin", "admin", "manager"];
    let verified = false;

    for (const prefix of endpoints) {
      const result = await tryVerifyOTP(prefix);

      if (result.success && result.data?.verified) {
        setUserType(result.data.userType || userType);
        setSuccess("OTP verified! Please set your new password.");
        setStep("newPassword");
        verified = true;
        break;
      } else if (result.error?.includes("Invalid OTP")) {
        setError("Invalid OTP. Please check and try again.");
        setLoading(false);
        return;
      } else if (result.error?.includes("expired")) {
        setError("OTP has expired. Please request a new one.");
        setStep("email");
        setOtp("");
        setLoading(false);
        return;
      }
    }

    if (!verified) {
      setError("Failed to verify OTP. Please try again.");
    }

    setLoading(false);
  };

  const tryResetPassword = async (endpoint: string): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      console.log(`Calling: ${baseUrl}/${endpoint}/reset-password`);
      console.log(`Email: ${email.toLowerCase().trim()}, OTP: ${otp}`);

      const response = await axios.post(
        `${baseUrl}/${endpoint}/reset-password`,
        {
          email: email.toLowerCase().trim(),
          token: otp,
          newPassword,
        },
        {
          headers: {
            "x-api-key": apiKey,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(`${endpoint} success:`, response.data);
      return { success: true, data: response.data };
    } catch (err: any) {
      console.error(`${endpoint} error:`, err.response?.status, err.response?.data);
      return {
        success: false,
        error: err.response?.data?.message || `Failed (${err.response?.status || 'network error'})`
      };
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    // Try all endpoints to find the user
    const endpoints = [
      { prefix: "auth" },
      { prefix: "master-admin" },
      { prefix: "admin" },
      { prefix: "manager" },
    ];

    let resetSuccess = false;
    let lastError = "";

    for (const { prefix } of endpoints) {
      console.log(`Trying reset password with endpoint: ${prefix}`);
      const result = await tryResetPassword(prefix);

      if (result.success) {
        setSuccess(result.data.message || "Password reset successfully!");
        resetSuccess = true;

        setTimeout(() => {
          navigate("/login");
        }, 2000);
        break;
      } else {
        console.log(`${prefix} failed:`, result.error);
        lastError = result.error || "Failed to reset password";

        // If OTP is invalid or expired, show error and go back to OTP step
        if (result.error?.includes("Invalid OTP")) {
          setError("Invalid OTP. Please check and try again.");
          setStep("otp");
          setOtp("");
          setLoading(false);
          return;
        }
        if (result.error?.includes("expired")) {
          setError("OTP has expired. Please request a new one.");
          setStep("email");
          setOtp("");
          setLoading(false);
          return;
        }
      }
    }

    if (!resetSuccess) {
      setError(lastError || "Failed to reset password. Please try again.");
    }

    setLoading(false);
  };

  const getStepTitle = () => {
    switch (step) {
      case "email":
        return "Enter your email to receive a reset OTP";
      case "otp":
        return "Enter the 6-digit OTP sent to your email";
      case "newPassword":
        return "Set your new password";
      default:
        return "";
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Reset Password
        </h2>
        <p className="text-center text-gray-500 mb-6">{getStepTitle()}</p>

        {/* Step Indicator */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === "email" ? "bg-[#FF6B35] text-white" : "bg-green-500 text-white"
            }`}>
              {step === "email" ? "1" : "✓"}
            </div>
            <div className={`w-12 h-1 ${step !== "email" ? "bg-green-500" : "bg-gray-200"}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === "otp" ? "bg-[#FF6B35] text-white" : step === "newPassword" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
            }`}>
              {step === "newPassword" ? "✓" : "2"}
            </div>
            <div className={`w-12 h-1 ${step === "newPassword" ? "bg-green-500" : "bg-gray-200"}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === "newPassword" ? "bg-[#FF6B35] text-white" : "bg-gray-200 text-gray-500"
            }`}>
              3
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
            {success}
          </div>
        )}

        {/* Step 1: Email */}
        {step === "email" && (
          <form onSubmit={handleRequestOTP}>
            <div className="mb-5">
              <label htmlFor="email" className="block text-gray-700 mb-2 font-medium">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-3 px-4 bg-[#FF6B35] text-white rounded-lg font-medium hover:bg-[#e55a2b] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <InfinitySpinner size="sm" />
                  Sending OTP...
                </span>
              ) : (
                "Send OTP"
              )}
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOTP}>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                OTP sent to: <span className="font-medium">{email}</span>
              </p>
            </div>

            <div className="mb-5">
              <label htmlFor="otp" className="block text-gray-700 mb-2 font-medium">
                Enter OTP
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3 px-4 bg-[#FF6B35] text-white rounded-lg font-medium hover:bg-[#e55a2b] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <InfinitySpinner size="sm" />
                  Verifying...
                </span>
              ) : (
                "Verify OTP"
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("email");
                setOtp("");
                setError("");
                setSuccess("");
              }}
              className="w-full mt-3 py-2 text-[#FF6B35] font-medium hover:underline"
            >
              Back / Resend OTP
            </button>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === "newPassword" && (
          <form onSubmit={handleResetPassword}>
            <div className="mb-5">
              <label htmlFor="newPassword" className="block text-gray-700 mb-2 font-medium">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                placeholder="Min 8 characters"
                minLength={8}
                required
              />
            </div>

            <div className="mb-5">
              <label htmlFor="confirmPassword" className="block text-gray-700 mb-2 font-medium">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                placeholder="Re-enter password"
                minLength={8}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full py-3 px-4 bg-[#FF6B35] text-white rounded-lg font-medium hover:bg-[#e55a2b] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <InfinitySpinner size="sm" />
                  Resetting Password...
                </span>
              ) : (
                "Reset Password"
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("otp");
                setNewPassword("");
                setConfirmPassword("");
                setError("");
                setSuccess("");
              }}
              className="w-full mt-3 py-2 text-[#FF6B35] font-medium hover:underline"
            >
              Back to OTP
            </button>
          </form>
        )}

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/login")}
            className="text-gray-600 hover:text-[#FF6B35] transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
