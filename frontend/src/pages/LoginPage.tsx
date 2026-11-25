import { useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  GraduationCap,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";

import { useAuth } from "../features/auth/AuthProvider";
import { api, API } from "../lib/api";

const schema = z.object({
  email: z.email("Enter a valid email").trim(),
  password: z.string().min(1, "Password is required"),
});

type Form = z.infer<typeof schema>;

export function LoginPage() {
  const { login, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [twoFactorEmail, setTwoFactorEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const getErrorMessage = (err: unknown) => {
    if (axios.isAxiosError<{ message?: string }>(err)) {
      return err.response?.data?.message || "Something went wrong.";
    }

    return err instanceof Error ? err.message : "Something went wrong.";
  };

  // Normal Login
  const submit = async (values: Form) => {
    try {
      const result = await login(values.email, values.password);

      if (result.requiresTwoFactor) {
        setTwoFactorEmail(result.email || values.email);
        setRequiresTwoFactor(true);
        toast.info("A verification code was sent to your email.");
        return;
      }

      await refreshUser();
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  // Google Login
  const handleGoogleSuccess = async (credential: string) => {
    try {
      const { data } = await api.post(API.auth.google, { credential });

      if (data.requiresTwoFactor) {
        setTwoFactorEmail(data.email);
        setRequiresTwoFactor(true);
        toast.info("A verification code was sent to your email.");
        return;
      }

      await refreshUser();

      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  // Verify 2FA OTP
  const handleVerifyTwoFactor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setVerifying(true);

    try {
      await api.post(API.auth.verifyLogin2FA, {
        email: twoFactorEmail,
        otp,
      });

      await refreshUser();

      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setVerifying(false);
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
          <span className="eyebrow">A LITTLE PROGRESS, EVERY DAY</span>
          <h1>
            Come back to
            <br />
            <span className="gradient-text">your potential.</span>
          </h1>
          <p>Your next breakthrough might be one lesson away.</p>
        </div>

        <div className="auth-side-foot">Make room for what's next. ✳</div>
      </div>

      <div className="auth-main">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} /> Back home
        </Link>

        <div className="auth-card">
          {!requiresTwoFactor ? (
            <>
              <span className="eyebrow">WELCOME BACK</span>
              <h2>Log in to Learnova</h2>
              <p className="auth-subtitle">Pick up right where you left off.</p>

              <form onSubmit={handleSubmit(submit)} className="form-stack">
                <label className="field-label">
                  Email address
                  <div className="input-wrap">
                    <Mail size={17} />

                    <input
                      type="email"
                      placeholder="you@example.com"
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <small className="field-error">
                      {errors.email.message}
                    </small>
                  )}
                </label>

                <label className="field-label">
                  Password
                  <div className="input-wrap">
                    <LockKeyhole size={17} />

                    <input
                      type="password"
                      placeholder="Your password"
                      {...register("password")}
                    />
                  </div>
                  {errors.password && (
                    <small className="field-error">
                      {errors.password.message}
                    </small>
                  )}
                </label>

                <div className="forgot-password-link">
                  <Link to="/forgot-password">Forgot password?</Link>
                </div>

                <button
                  className="btn btn-primary btn-lg full-width"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Logging in..." : "Log in"}
                  <ArrowUpRight size={17} />
                </button>
              </form>

              <div className="auth-divider">
                <span>OR CONTINUE WITH</span>
              </div>

              <div className="google-login-wrapper">
                <GoogleLogin
                  onSuccess={(response) => {
                    if (!response.credential) {
                      toast.error("Google credential was not received.");
                      return;
                    }

                    void handleGoogleSuccess(response.credential);
                  }}
                  onError={() => toast.error("Google login failed.")}
                  theme="outline"
                  size="large"
                  width="100%"
                  text="continue_with"
                />
              </div>

              <p className="auth-switch">
                New to Learnova? <Link to="/register">Create an account</Link>
              </p>
            </>
          ) : (
            <>
              <div className="profile-icon">
                <ShieldCheck size={25} />
              </div>

              <span className="eyebrow">TWO-STEP VERIFICATION</span>

              <h2>Verify it's you</h2>

              <p className="auth-subtitle">
                Enter the 6-digit verification code sent to:
                <strong> {twoFactorEmail}</strong>
              </p>

              <form onSubmit={handleVerifyTwoFactor} className="form-stack">
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
                  className="btn btn-primary btn-lg full-width"
                  disabled={verifying || otp.length !== 6}
                >
                  {verifying ? "Verifying..." : "Verify & Log in"}
                  <ArrowUpRight size={17} />
                </button>

                <button
                  type="button"
                  className="btn btn-outline full-width"
                  onClick={() => {
                    setRequiresTwoFactor(false);
                    setTwoFactorEmail("");
                    setOtp("");
                  }}
                >
                  Back to Login
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
