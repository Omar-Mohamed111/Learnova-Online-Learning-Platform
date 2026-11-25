import {
  ArrowLeft,
  ArrowUpRight,
  GraduationCap,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "../features/auth/AuthProvider";
import { getApiError } from "../lib/api";

const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.email("Enter a valid email").trim(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type Form = z.infer<typeof schema>;

export function RegisterPage() {
  const { register: signUp } = useAuth();
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
      await signUp(values.name, values.email, values.password);

      toast.success("Account created! Check your email for the OTP.");

      navigate("/verify-email", {
        state: { email: values.email },
      });
    } catch (e) {
      toast.error(getApiError(e, "Registration failed"));
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
          <span className="eyebrow">START SOMETHING GOOD</span>
          <h1>
            Curiosity looks
            <br />
            <span className="gradient-text">good on you.</span>
          </h1>
          <p>
            Create your space. Find your people. Build a skill that opens doors.
          </p>
        </div>

        <div className="auth-side-foot">Your next chapter starts here. ✳</div>
      </div>

      <div className="auth-main">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} /> Back home
        </Link>

        <div className="auth-card">
          <span className="eyebrow">JOIN THE COMMUNITY</span>
          <h2>Create your account</h2>
          <p className="auth-subtitle">A few details and you're on your way.</p>

          <form onSubmit={handleSubmit(submit)} className="form-stack">
            <label className="field-label">
              Full name
              <div className="input-wrap">
                <UserRound size={17} />
                <input placeholder="Your name" {...register("name")} />
              </div>
              {errors.name && (
                <small className="field-error">{errors.name.message}</small>
              )}
            </label>

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
              Password
              <div className="input-wrap">
                <LockKeyhole size={17} />
                <input
                  type="password"
                  placeholder="At least 8 characters"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <small className="field-error">{errors.password.message}</small>
              )}
            </label>

            <button
              className="btn btn-primary btn-lg full-width"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Create account"}
              <ArrowUpRight size={17} />
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
