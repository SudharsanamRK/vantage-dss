// frontend/src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, AlertCircle, Loader } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || "/";

  const [form,     setForm]     = useState({ email: "", password: "" });
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email)                           e.email    = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email    = "Enter a valid email.";
    if (!form.password)                        e.password = "Password is required.";
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
      await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-slate-50 font-mono"
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
            Aquaculture Intelligence Platform
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 shadow-sm p-8">

          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">
            — Operator Login —
          </p>

          {apiError && (
            <div className="mb-5 flex items-start gap-2 bg-red-50 border border-red-200 px-3 py-2.5">
              <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-[11px] font-bold text-red-600">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="operator@farm.com"
                className={`w-full bg-slate-50 border ${errors.email ? "border-red-400" : "border-slate-300"}
                  px-3 py-2.5 text-xs font-mono text-slate-900 placeholder-slate-400
                  focus:outline-none focus:border-green-600 focus:bg-white transition-colors`}
              />
              {errors.email && (
                <p className="mt-1 text-[10px] font-bold text-red-500 uppercase">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full bg-slate-50 border ${errors.password ? "border-red-400" : "border-slate-300"}
                    px-3 py-2.5 pr-10 text-xs font-mono text-slate-900 placeholder-slate-400
                    focus:outline-none focus:border-green-600 focus:bg-white transition-colors`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-[10px] font-bold text-red-500 uppercase">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-green-700 hover:bg-green-800 text-white
                text-[11px] font-black uppercase tracking-widest py-3
                transition-colors disabled:opacity-60 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader size={13} className="animate-spin" /> Authenticating…</>
              ) : "Access System"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              New operator?{" "}
              <Link to="/register" className="text-green-700 hover:text-green-800 underline transition-colors">
                Request Access
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-6">
          Fathom · Vantage DSS · v1.0
        </p>
      </div>
    </div>
  );
}