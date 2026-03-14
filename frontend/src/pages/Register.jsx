// frontend/src/pages/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, AlertCircle, Loader, CheckCircle } from "lucide-react";

// ─── Password strength indicator ─────────────────────────────────────────────
function StrengthBar({ password }) {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8)          score++;
  if (/[A-Z]/.test(password))        score++;
  if (/[0-9]/.test(password))        score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const colors = ["", "bg-red-400", "bg-yellow-400", "bg-blue-500", "bg-green-600"];
  const labels = ["", "WEAK", "FAIR", "GOOD", "STRONG"];
  const text   = ["", "text-red-500", "text-yellow-500", "text-blue-500", "text-green-600"];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-1 flex-1 transition-all duration-200 ${i <= score ? colors[score] : "bg-slate-200"}`} />
        ))}
      </div>
      <p className={`text-[9px] font-black uppercase tracking-widest ${text[score]}`}>{labels[score]}</p>
    </div>
  );
}

// ─── Reusable field — defined OUTSIDE Register so it never re-mounts ─────────
function Field({ name, label, placeholder, autoComplete, type = "text", value, onChange, error }) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
        {label}
      </label>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-slate-50 border ${error ? "border-red-400" : "border-slate-300"}
          px-3 py-2.5 text-xs font-mono text-slate-900 placeholder-slate-400
          focus:outline-none focus:border-green-600 focus:bg-white transition-colors`}
      />
      {error && (
        <p className="mt-1 text-[10px] font-bold text-red-500 uppercase">{error}</p>
      )}
    </div>
  );
}

// ─── Register page ────────────────────────────────────────────────────────────
export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form,     setForm]     = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim())                         e.name     = "Full name is required.";
    if (!form.email)                               e.email    = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email))     e.email    = "Enter a valid email.";
    if (!form.password)                            e.password = "Password is required.";
    else if (form.password.length < 8)             e.password = "Minimum 8 characters.";
    if (!form.confirm)                             e.confirm  = "Please confirm your password.";
    else if (form.password !== form.confirm)       e.confirm  = "Passwords do not match.";
    return e;
  };

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setErrors(p => ({ ...p, [e.target.name]: "" }));
    setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      navigate("/", { replace: true });
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-slate-50 font-mono py-10"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)",
        backgroundSize: "30px 30px",
      }}
    >
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-700 mb-4">
            <span className="text-white font-black text-xl tracking-tight">V</span>
          </div>
          <h1 className="text-sm font-black uppercase tracking-widest text-slate-900">VANTAGE DSS</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
            Operator Registration
          </p>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm p-8">

          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">
            — Create Account —
          </p>

          {apiError && (
            <div className="mb-5 flex items-start gap-2 bg-red-50 border border-red-200 px-3 py-2.5">
              <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-[11px] font-bold text-red-600">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Full Name */}
            <Field
              name="name"
              label="Full Name"
              placeholder="Jane Smith"
              autoComplete="name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
            />

            {/* Email */}
            <Field
              name="email"
              label="Email Address"
              placeholder="operator@farm.com"
              autoComplete="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
            />

            {/* Password with strength meter */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  className={`w-full bg-slate-50 border ${errors.password ? "border-red-400" : "border-slate-300"}
                    px-3 py-2.5 pr-10 text-xs font-mono text-slate-900 placeholder-slate-400
                    focus:outline-none focus:border-green-600 focus:bg-white transition-colors`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-[10px] font-bold text-red-500 uppercase">{errors.password}</p>
              )}
              <StrengthBar password={form.password} />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  name="confirm"
                  type="password"
                  autoComplete="new-password"
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full bg-slate-50 border ${errors.confirm ? "border-red-400" : "border-slate-300"}
                    px-3 py-2.5 pr-10 text-xs font-mono text-slate-900 placeholder-slate-400
                    focus:outline-none focus:border-green-600 focus:bg-white transition-colors`}
                />
                {form.confirm && form.password === form.confirm && (
                  <CheckCircle size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600" />
                )}
              </div>
              {errors.confirm && (
                <p className="mt-1 text-[10px] font-bold text-red-500 uppercase">{errors.confirm}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-green-700 hover:bg-green-800 text-white
                text-[11px] font-black uppercase tracking-widest py-3
                transition-colors disabled:opacity-60 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader size={13} className="animate-spin" /> Creating account…</>
              ) : "Register Operator"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Already registered?{" "}
              <Link to="/login" className="text-green-700 hover:text-green-800 underline transition-colors">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}