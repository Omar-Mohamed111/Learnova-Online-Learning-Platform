import {
  ArrowLeft,
  ArrowUpRight,
  GraduationCap,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { api, API } from "../lib/api";

const schema = z
  .object({
    email: z.email("Enter a valid email").trim(),
    otp: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit OTP"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type Form = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const initialEmail = location.state?.email || "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: initialEmail,
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const submit = async (values: Form) => {
    try {
      const { data } = await api.post(API.auth.resetPassword, {
        email: values.email,
        otp: values.otp,
        newPassword: values.newPassword,
      });

      toast.success(data.message || "Password reset successfully!");

      navigate("/login", { replace: true });
    } catch (error) {
      const message = (
        error as {
          response?: { data?: { message?: string } };
        }
      ).response?.data?.message;

      toast.error(message || "Failed to reset password");
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
          <span className="eyebrow">SECURE YOUR ACCOUNT</span>
          <h1>
            A new key to
            <br />
            <span className="gradient-text">new possibilities.</span>
          </h1>
          <p>Choose a new password and get back to learning.</p>
        </div>

        <div className="auth-side-foot">Your next chapter starts here. ✳</div>
      </div>

      <div className="auth-main">
        <Link to="/forgot-password" className="back-link">
          <ArrowLeft size={16} /> Back
        </Link>

        <div className="auth-card">
          <span className="eyebrow">RESET PASSWORD</span>
          <h2>Create a new password</h2>
          <p className="auth-subtitle">
            Enter the verification code sent to your email and choose a new
            password.
          </p>

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
                <small className="field-error">{errors.email.message}</small>
              )}
            </label>

            <label className="field-label">
              Verification code
              <div className="input-wrap">
                <ShieldCheck size={17} />
                <input
                  type="text"
                  placeholder="Enter your OTP"
                  autoComplete="one-time-code"
                  {...register("otp")}
                />
              </div>
              {errors.otp && (
                <small className="field-error">{errors.otp.message}</small>
              )}
            </label>

            <label className="field-label">
              New password
              <div className="input-wrap">
                <LockKeyhole size={17} />
                <input
                  type="password"
                  placeholder="At least 8 characters"
                  {...register("newPassword")}
                />
              </div>
              {errors.newPassword && (
                <small className="field-error">
                  {errors.newPassword.message}
                </small>
              )}
            </label>

            <label className="field-label">
              Confirm new password
              <div className="input-wrap">
                <LockKeyhole size={17} />
                <input
                  type="password"
                  placeholder="Enter your password again"
                  {...register("confirmPassword")}
                />
              </div>
              {errors.confirmPassword && (
                <small className="field-error">
                  {errors.confirmPassword.message}
                </small>
              )}
            </label>

            <button
              className="btn btn-primary btn-lg full-width"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Resetting..." : "Reset password"}
              <ArrowUpRight size={17} />
            </button>
          </form>

          <p className="auth-switch">
            Remember your password? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
