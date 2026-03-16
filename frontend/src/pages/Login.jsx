import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, AlertCircle, Loader, ArrowRight } from "lucide-react";

export default function Login() {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const location     = useLocation();
  const from         = location.state?.from?.pathname || "/";

  const [form,     setForm]     = useState({ email: "", password: "" });
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focused,  setFocused]  = useState("");

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

  const inputCls = (field) =>
    `w-full bg-slate-900/60 border ${
      errors[field]     ? "border-red-500/50"
      : focused===field ? "border-emerald-500/70"
      :                   "border-white/10"
    } px-4 py-3 text-sm font-mono text-white placeholder-white/20
    focus:outline-none transition-all duration-200`;

  return (
    <div className="min-h-screen flex font-mono overflow-hidden">
      <style>{`
        @keyframes pulse-ring {
          0%   { transform: translate(-50%,-50%) scale(.8); opacity:.5; }
          100% { transform: translate(-50%,-50%) scale(2.4); opacity:0; }
        }
        @keyframes float-up {
          0%   { transform:translateY(100vh); opacity:0; }
          5%   { opacity:.12; }
          95%  { opacity:.12; }
          100% { transform:translateY(-10vh); opacity:0; }
        }
        @keyframes fade-up {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        .anim-1{ animation:fade-up .5s ease .05s both; }
        .anim-2{ animation:fade-up .5s ease .15s both; }
        .anim-4{ animation:fade-up .5s ease .35s both; }
      `}</style>

      {/* ── LEFT BRAND PANEL ── */}
      <div className="hidden lg:flex lg:w-[56%] relative flex-col justify-between p-12 overflow-hidden"
        style={{background:"linear-gradient(150deg,#061209 0%,#0d2416 50%,#0a1c10 100%)"}}>

        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{backgroundImage:"linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)",backgroundSize:"40px 40px"}} />

        {/* Glow blobs */}
        <div className="absolute rounded-full blur-3xl pointer-events-none"
          style={{width:320,height:320,top:"25%",left:"55%",background:"#059669",opacity:.07,transform:"translate(-50%,-50%)"}} />
        <div className="absolute rounded-full blur-3xl pointer-events-none"
          style={{width:200,height:200,top:"72%",left:"25%",background:"#0ea5e9",opacity:.05,transform:"translate(-50%,-50%)"}} />

        {/* Floating particles */}
        {[...Array(7)].map((_,i)=>(
          <div key={i} className="absolute w-1 h-1 rounded-full bg-emerald-400/40"
            style={{left:`${8+i*13}%`,bottom:"-5%",animation:`float-up ${7+i}s linear ${i*1.1}s infinite`}} />
        ))}

        {/* Pulse rings */}
        {[0,1.4,2.8].map((d,i)=>(
          <div key={i} className="absolute border border-emerald-400/10 rounded-full"
            style={{width:240,height:240,top:"48%",left:"44%",transform:"translate(-50%,-50%)",
              animation:`pulse-ring 4s ease-out ${d}s infinite`}} />
        ))}

        {/* Logo */}
        <div className="relative z-10 anim-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500 flex items-center justify-center">
              <span className="text-white font-black text-base">F</span>
            </div>
            <div>
              <p className="text-white font-black text-base tracking-widest uppercase leading-none">Fathom</p>
            </div>
          </div>
        </div>

        {/* Headline */}
        <div className="relative z-10 anim-2">
          <p className="text-emerald-400/50 font-black uppercase tracking-widest mb-3" style={{fontSize:"9px"}}>
            Aquaculture Intelligence Platform
          </p>
          <h2 className="text-[2.6rem] font-black text-white leading-[1.1] tracking-tight mb-4">
            Monitor.<br />Analyse.<br /><span className="text-emerald-400">Maximise.</span>
          </h2>
          <p className="text-white/25 text-xs font-medium leading-relaxed max-w-xs">
            Real-time biosecurity, adaptive feeding protocols, and financial forecasting — built for serious aquaculture operators.
          </p>
        </div>

        {/* Spacer */}
        <div />
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 relative"
        style={{background:"#0c1410"}}>

        {/* Subtle grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{backgroundImage:"linear-gradient(#10b981 1px,transparent 1px),linear-gradient(90deg,#10b981 1px,transparent 1px)",backgroundSize:"30px 30px"}} />

        <div className="relative z-10 w-full max-w-sm anim-4">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-600 mb-3">
              <span className="text-white font-black text-xl">F</span>
            </div>
            <p className="text-white font-black text-sm uppercase tracking-widest">Fathom</p>
            <p className="text-white/30 font-bold uppercase tracking-widest mt-1" style={{fontSize:"9px"}}>
              Aquaculture Intelligence Platform
            </p>
          </div>

          {/* Header */}
          <div className="mb-8">
            <p className="text-emerald-400/50 font-black uppercase tracking-widest mb-2" style={{fontSize:"9px"}}>
              — Operator Login —
            </p>
            <h1 className="text-2xl font-black text-white tracking-tight">Welcome back</h1>
            <p className="text-white/25 text-xs font-medium mt-1">Sign in to access your farm dashboard</p>
          </div>

          {/* API error */}
          {apiError && (
            <div className="mb-5 flex items-start gap-2.5 bg-red-500/8 border border-red-500/25 px-4 py-3">
              <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-xs font-bold text-red-400">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Email */}
            <div>
              <label className="block font-black uppercase tracking-widest text-white/40 mb-2" style={{fontSize:"10px"}}>
                Email Address
              </label>
              <input
                name="email" type="email" autoComplete="email"
                value={form.email} onChange={handleChange}
                onFocus={()=>setFocused("email")} onBlur={()=>setFocused("")}
                placeholder="operator@farm.com"
                className={inputCls("email")}
              />
              {errors.email && (
                <p className="mt-1.5 font-bold text-red-400 uppercase flex items-center gap-1" style={{fontSize:"10px"}}>
                  <AlertCircle size={9}/> {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block font-black uppercase tracking-widest text-white/40 mb-2" style={{fontSize:"10px"}}>
                Password
              </label>
              <div className="relative">
                <input
                  name="password" type={showPass?"text":"password"}
                  autoComplete="current-password"
                  value={form.password} onChange={handleChange}
                  onFocus={()=>setFocused("password")} onBlur={()=>setFocused("")}
                  placeholder="••••••••"
                  className={inputCls("password")}
                />
                <button type="button" onClick={()=>setShowPass(p=>!p)} tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
                  {showPass ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 font-bold text-red-400 uppercase flex items-center gap-1" style={{fontSize:"10px"}}>
                  <AlertCircle size={9}/> {errors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white
                font-black uppercase tracking-widest py-3.5
                transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2 group"
              style={{fontSize:"11px",boxShadow:"0 4px 24px rgba(16,185,129,.25)"}}>
              {loading ? (
                <><Loader size={13} className="animate-spin"/> Authenticating…</>
              ) : (
                <>Access System <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform"/></>
              )}
            </button>
          </form>

          <div className="mt-7 pt-6 border-t border-white/5 text-center">
            <p className="font-bold text-white/20 uppercase tracking-widest" style={{fontSize:"10px"}}>
              New operator?{" "}
              <Link to="/register" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                Request Access
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}