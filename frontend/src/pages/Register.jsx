import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, AlertCircle, Loader, ArrowRight, CheckCircle, Check } from "lucide-react";

// ── Password strength ──────────────────────────────────────────────────────
function StrengthBar({ password }) {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8)          score++;
  if (/[A-Z]/.test(password))        score++;
  if (/[0-9]/.test(password))        score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const colors = ["","bg-red-500","bg-amber-400","bg-blue-500","bg-emerald-500"];
  const labels = ["","Weak","Fair","Good","Strong"];
  const texts  = ["","text-red-400","text-amber-400","text-blue-400","text-emerald-400"];
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1,2,3,4].map(i=>(
          <div key={i} className={`h-0.5 flex-1 transition-all duration-300 ${i<=score?colors[score]:"bg-white/10"}`}/>
        ))}
      </div>
      <p className={`font-black uppercase tracking-widest ${texts[score]}`} style={{fontSize:"9px"}}>{labels[score]}</p>
    </div>
  );
}

// ── Checklist requirement ──────────────────────────────────────────────────
function Req({ met, label }) {
  return (
    <div className={`flex items-center gap-2 transition-colors ${met?"text-emerald-400":"text-white/20"}`}>
      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${met?"border-emerald-400 bg-emerald-400":"border-white/15"}`}>
        {met && <Check size={8} className="text-white"/>}
      </div>
      <span className="font-bold uppercase tracking-widest" style={{fontSize:"9px"}}>{label}</span>
    </div>
  );
}

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form,     setForm]     = useState({ name:"", email:"", password:"", confirm:"" });
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focused,  setFocused]  = useState("");

  const validate = () => {
    const e = {};
    if (!form.name.trim())                     e.name     = "Full name is required.";
    if (!form.email)                           e.email    = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email    = "Enter a valid email.";
    if (!form.password)                        e.password = "Password is required.";
    else if (form.password.length < 8)         e.password = "Minimum 8 characters.";
    if (!form.confirm)                         e.confirm  = "Please confirm your password.";
    else if (form.password !== form.confirm)   e.confirm  = "Passwords do not match.";
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

  const inputCls = (field) =>
    `w-full bg-slate-900/60 border ${
      errors[field]     ? "border-red-500/50"
      : focused===field ? "border-emerald-500/70"
      :                   "border-white/10"
    } px-4 py-3 text-sm font-mono text-white placeholder-white/20
    focus:outline-none transition-all duration-200`;

  const pwReqs = [
    { met: form.password.length >= 8,           label: "At least 8 characters" },
    { met: /[A-Z]/.test(form.password),         label: "One uppercase letter"  },
    { met: /[0-9]/.test(form.password),         label: "One number"            },
    { met: /[^A-Za-z0-9]/.test(form.password),  label: "One special character" },
  ];

  return (
    <div className="min-h-screen flex font-mono overflow-hidden">
      <style>{`
        @keyframes float-up {
          0%   { transform:translateY(100vh); opacity:0; }
          5%   { opacity:.1; }
          95%  { opacity:.1; }
          100% { transform:translateY(-10vh); opacity:0; }
        }
        @keyframes fade-up {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .anim-1{ animation:fade-up .5s ease .05s both; }
        .anim-2{ animation:fade-up .5s ease .15s both; }
        .anim-4{ animation:fade-up .5s ease .35s both; }
      `}</style>

      {/* ── LEFT BRAND PANEL ── */}
      <div className="hidden lg:flex lg:w-[44%] relative flex-col justify-between p-12 overflow-hidden"
        style={{background:"linear-gradient(150deg,#061209 0%,#0d2416 50%,#0a1c10 100%)"}}>

        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{backgroundImage:"linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)",backgroundSize:"40px 40px"}}/>

        {/* Glow */}
        <div className="absolute rounded-full blur-3xl pointer-events-none"
          style={{width:300,height:300,top:"35%",left:"55%",background:"#059669",opacity:.08,transform:"translate(-50%,-50%)"}}/>

        {/* Particles */}
        {[...Array(6)].map((_,i)=>(
          <div key={i} className="absolute w-1 h-1 rounded-full bg-emerald-400/30"
            style={{left:`${10+i*15}%`,bottom:"-5%",animation:`float-up ${6+i}s linear ${i*.9}s infinite`}}/>
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

        {/* Content */}
        <div className="relative z-10 anim-2">
          <p className="text-emerald-400/50 font-black uppercase tracking-widest mb-3" style={{fontSize:"9px"}}>
            Join the Platform
          </p>
          <h2 className="text-4xl font-black text-white leading-tight tracking-tight mb-5">
            Start your<br />smart farm<br /><span className="text-emerald-400">journey.</span>
          </h2>
          <p className="text-white/25 text-xs font-medium leading-relaxed mb-8">
            Set up your first pond in minutes. Connect sensors, configure your species profile, and get real-time intelligence from day one.
          </p>

          {/* Steps */}
          <div className="space-y-4">
            {[
              { step:"01", label:"Create your account",       sub:"Takes less than a minute"            },
              { step:"02", label:"Configure your first pond", sub:"Species, stocking, water quality"    },
              { step:"03", label:"Go live with telemetry",    sub:"Real-time health & feeding advisors" },
            ].map(({ step, label, sub }) => (
              <div key={step} className="flex items-start gap-4">
                <div className="w-8 h-8 bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <span className="text-emerald-400 font-black" style={{fontSize:"10px"}}>{step}</span>
                </div>
                <div>
                  <p className="text-white/70 font-black uppercase tracking-wide text-xs leading-none mb-0.5">{label}</p>
                  <p className="text-white/25 font-bold" style={{fontSize:"10px"}}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spacer */}
        <div />
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="flex-1 flex items-center justify-center px-8 py-10 relative overflow-y-auto"
        style={{background:"#0c1410"}}>

        {/* Subtle grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{backgroundImage:"linear-gradient(#10b981 1px,transparent 1px),linear-gradient(90deg,#10b981 1px,transparent 1px)",backgroundSize:"30px 30px"}}/>

        <div className="relative z-10 w-full max-w-sm anim-4">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-600 mb-3">
              <span className="text-white font-black text-xl">F</span>
            </div>
            <p className="text-white font-black text-sm uppercase tracking-widest">Fathom</p>
            <p className="text-white/30 font-bold uppercase tracking-widest mt-1" style={{fontSize:"9px"}}>
              Operator Registration
            </p>
          </div>

          {/* Header */}
          <div className="mb-7">
            <p className="text-emerald-400/50 font-black uppercase tracking-widest mb-2" style={{fontSize:"9px"}}>
              — Create Account —
            </p>
            <h1 className="text-2xl font-black text-white tracking-tight">Register as Operator</h1>
            <p className="text-white/25 text-xs font-medium mt-1">Set up your Fathom access credentials</p>
          </div>

          {/* API error */}
          {apiError && (
            <div className="mb-5 flex items-start gap-2.5 bg-red-500/8 border border-red-500/25 px-4 py-3">
              <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0"/>
              <p className="text-xs font-bold text-red-400">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="block font-black uppercase tracking-widest text-white/40 mb-2" style={{fontSize:"10px"}}>
                Full Name
              </label>
              <input
                name="name" type="text" autoComplete="name"
                value={form.name} onChange={handleChange}
                onFocus={()=>setFocused("name")} onBlur={()=>setFocused("")}
                placeholder="Jane Smith"
                className={inputCls("name")}
              />
              {errors.name && (
                <p className="mt-1.5 font-bold text-red-400 uppercase flex items-center gap-1" style={{fontSize:"10px"}}>
                  <AlertCircle size={9}/> {errors.name}
                </p>
              )}
            </div>

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
                  autoComplete="new-password"
                  value={form.password} onChange={handleChange}
                  onFocus={()=>setFocused("password")} onBlur={()=>setFocused("")}
                  placeholder="Min. 8 characters"
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
              <StrengthBar password={form.password}/>

              {/* Password requirements */}
              {form.password.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-1.5">
                  {pwReqs.map((r,i) => <Req key={i} met={r.met} label={r.label}/>)}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block font-black uppercase tracking-widest text-white/40 mb-2" style={{fontSize:"10px"}}>
                Confirm Password
              </label>
              <div className="relative">
                <input
                  name="confirm" type="password" autoComplete="new-password"
                  value={form.confirm} onChange={handleChange}
                  onFocus={()=>setFocused("confirm")} onBlur={()=>setFocused("")}
                  placeholder="••••••••"
                  className={inputCls("confirm")}
                />
                {form.confirm && form.password === form.confirm && (
                  <CheckCircle size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400"/>
                )}
              </div>
              {errors.confirm && (
                <p className="mt-1.5 font-bold text-red-400 uppercase flex items-center gap-1" style={{fontSize:"10px"}}>
                  <AlertCircle size={9}/> {errors.confirm}
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
                <><Loader size={13} className="animate-spin"/> Creating account…</>
              ) : (
                <>Register Operator <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform"/></>
              )}
            </button>
          </form>

          <div className="mt-7 pt-6 border-t border-white/5 text-center">
            <p className="font-bold text-white/20 uppercase tracking-widest" style={{fontSize:"10px"}}>
              Already registered?{" "}
              <Link to="/login" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                Login Here
              </Link>
            </p>
          </div>


        </div>
      </div>
    </div>
  );
}