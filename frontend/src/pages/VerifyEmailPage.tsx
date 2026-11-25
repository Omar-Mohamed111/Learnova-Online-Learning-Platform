import {
  ArrowLeft,
  ArrowUpRight,
  GraduationCap,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { api, API } from "../lib/api";

export function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !otp.trim()) {
      toast.error("Please enter your email and verification code.");
      return;
    }

    try {
      setIsSubmitting(true);

      await api.post(API.auth.verifyEmail, {
        email: email.trim(),
        otp: otp.trim(),
      });

      toast.success("Email verified successfully!");

      navigate("/login", { replace: true });
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Email verification failed",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-side">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <GraduationCap />
          </span>
          <span>
            learnova<span className="brand-dot">.</span>
          </span>
        </Link>

        <div className="auth-side-copy">
          <span className="eyebrow">ONE LAST STEP</span>

          <h1>
            Make it
            <br />
            <span className="gradient-text">official.</span>
          </h1>

          <p>
            A little verification goes a long way. Confirm your email and start
            learning.
          </p>
        </div>

        <div className="auth-side-foot">Your next chapter starts here. ✳</div>
      </div>

      <div className="auth-main">
        <Link to="/register" className="back-link">
          <ArrowLeft size={16} />
          Back to registration
        </Link>

        <div className="auth-card">
          <div className="brand-mark">
            <ShieldCheck size={25} />
          </div>

          <span className="eyebrow">EMAIL VERIFICATION</span>

          <h2>Check your inbox</h2>

          <p className="auth-subtitle">
            We sent a verification code to your email. Enter it below to
            activate your account.
          </p>

          <form onSubmit={submit} className="form-stack">
            <label className="field-label">
              Email address
              <div className="input-wrap">
                <Mail size={17} />

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </label>

            <label className="field-label">
              Verification code
              <div className="input-wrap">
                <ShieldCheck size={17} />

                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Enter your OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
            </label>

            <button
              type="submit"
              className="btn btn-primary btn-lg full-width"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Verifying..." : "Verify email"}
              <ArrowUpRight size={17} />
            </button>
          </form>

          <p className="auth-switch">
            Already verified? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
