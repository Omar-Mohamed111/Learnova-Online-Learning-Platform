import { ArrowLeft, ArrowUpRight, GraduationCap, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { api, API } from "../lib/api";

const schema = z.object({
  email: z.email("Enter a valid email").trim(),
});

type Form = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const submit = async (values: Form) => {
    try {
      const { data } = await api.post(API.auth.forgotPassword, {
        email: values.email,
      });

      toast.success(data.message || "Reset OTP sent successfully!");

      navigate("/reset-password", {
        state: { email: values.email },
      });
    } catch (error) {
      const message = (
        error as {
          response?: { data?: { message?: string } };
        }
      ).response?.data?.message;

      toast.error(message || "Failed to send reset OTP");
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
          <span className="eyebrow">A FRESH START</span>
          <h1>
            Your learning
            <br />
            <span className="gradient-text">journey continues.</span>
          </h1>
          <p>Let's get you back into your Learnova account.</p>
        </div>

        <div className="auth-side-foot">Every step forward counts. ✳</div>
      </div>

      <div className="auth-main">
        <Link to="/login" className="back-link">
          <ArrowLeft size={16} /> Back to login
        </Link>

        <div className="auth-card">
          <span className="eyebrow">ACCOUNT RECOVERY</span>
          <h2>Forgot your password?</h2>
          <p className="auth-subtitle">
            Enter your email and we'll send you a verification code to reset
            your password.
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

            <button
              className="btn btn-primary btn-lg full-width"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send reset code"}
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
