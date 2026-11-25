import { useState } from "react";
import axios from "axios";
import {
  UserRound,
  Mail,
  ShieldCheck,
  Shield,
  LockKeyhole,
  CheckCircle2,
} from "lucide-react";

import { useAuth } from "../features/auth/AuthProvider";
import { api, API } from "../lib/api";

export function ProfilePage() {
  const { user, refreshUser } = useAuth();

  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"idle" | "verify">("idle");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getErrorMessage = (err: unknown) => {
    if (axios.isAxiosError(err)) {
      console.error("2FA Error:", {
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url,
      });

      const data = err.response?.data;

      return (
        data?.message ||
        data?.error ||
        `Request failed (${err.response?.status || "No response"})`
      );
    }

    console.error("2FA Error:", err);

    return err instanceof Error ? err.message : "Something went wrong.";
  };

  // Request 2FA Activation OTP
  const handleEnable2FA = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await api.post(API.auth.enable2FA);

      setStep("verify");
      setMessage("Verification code sent to your email.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and Activate 2FA
  const handleVerifyOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await api.post(API.auth.verifyEnable2FA, { otp });

      await refreshUser();

      setOtp("");
      setStep("idle");
      setMessage("Two-factor authentication enabled successfully.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <section className="page-section">
      <div className="container profile-page">
        <div className="page-intro">
          <span className="eyebrow">ACCOUNT SETTINGS</span>
          <h1>
            Your <span className="gradient-text">Profile</span>
          </h1>
          <p>Manage your personal information and account security.</p>
        </div>

        <div className="profile-grid">
          {/* Personal Information */}
          <div className="profile-card">
            <div className="profile-card-heading">
              <div className="profile-icon">
                <UserRound size={21} />
              </div>

              <div>
                <h2>Personal Information</h2>
                <p>Your account details</p>
              </div>
            </div>

            <div className="profile-user">
              <div className="profile-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>

              <div>
                <h3>{user.name}</h3>
                <span>{user.role || "student"}</span>
              </div>
            </div>

            <div className="profile-info">
              <div className="profile-info-icon">
                <UserRound size={17} />
              </div>

              <div>
                <small>Full Name</small>
                <strong>{user.name}</strong>
              </div>
            </div>

            <div className="profile-info">
              <div className="profile-info-icon">
                <Mail size={17} />
              </div>

              <div>
                <small>Email Address</small>
                <strong>{user.email}</strong>
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div className="profile-card">
            <div className="profile-card-heading">
              <div className="profile-icon">
                <LockKeyhole size={21} />
              </div>

              <div>
                <h2>Account Security</h2>
                <p>Protect your account with an extra layer of security</p>
              </div>
            </div>

            <div className="security-status">
              <div className="security-status-icon">
                {user.isTwoFactorEnabled ? (
                  <ShieldCheck size={25} />
                ) : (
                  <Shield size={25} />
                )}
              </div>

              <div className="security-status-text">
                <strong>Two-Factor Authentication</strong>

                <span>
                  {user.isTwoFactorEnabled
                    ? "Your account is protected with 2FA."
                    : "Add an extra layer of protection to your account."}
                </span>
              </div>

              <span
                className={`security-badge ${
                  user.isTwoFactorEnabled ? "security-enabled" : ""
                }`}
              >
                {user.isTwoFactorEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>

            {message && (
              <div className="profile-message success-message">
                <CheckCircle2 size={17} />
                {message}
              </div>
            )}

            {error && (
              <div className="profile-message error-message">{error}</div>
            )}

            {!user.isTwoFactorEnabled && step === "idle" && (
              <button
                className="btn btn-primary full-width"
                onClick={handleEnable2FA}
                disabled={loading}
              >
                {loading ? "Sending..." : "Enable Two-Factor Authentication"}
              </button>
            )}

            {!user.isTwoFactorEnabled && step === "verify" && (
              <form
                className="form-stack profile-otp-form"
                onSubmit={handleVerifyOTP}
              >
                <label className="field-label">
                  Verification Code
                  <div className="input-wrap">
                    <LockKeyhole size={17} />

                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Enter your 6-digit OTP"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, ""))
                      }
                      required
                    />
                  </div>
                </label>

                <button
                  className="btn btn-primary full-width"
                  type="submit"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? "Verifying..." : "Verify & Enable 2FA"}
                </button>

                <button
                  className="btn btn-outline full-width"
                  type="button"
                  onClick={() => {
                    setStep("idle");
                    setOtp("");
                    setMessage("");
                    setError("");
                  }}
                >
                  Cancel
                </button>
              </form>
            )}

            {user.isTwoFactorEnabled && (
              <p className="security-enabled-note">
                Your account requires an email verification code whenever you
                sign in.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
