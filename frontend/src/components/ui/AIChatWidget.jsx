import React, { useState, useRef, useEffect } from "react";
import { X, Send, Loader, Bot, User, Minimize2, Maximize2, AlertCircle } from "lucide-react";
import { usePond } from "../../context/PondContext";

const BASE     = "http://localhost:5000/api";
const getToken = () => localStorage.getItem("fathom_token");

const SUGGESTED = [
  "Why is my FCR high?",
  "Should I harvest this week?",
  "How can I improve DO levels?",
  "What's my profit forecast?",
  "Is my pond health optimal?",
];

function buildSystemPrompt(brain, sensorData, farmConfig, doc) {
  const b  = brain      || {};
  const sd = sensorData || {};
  const fc = farmConfig || {};
  return `You are Vantage AI, an expert aquaculture advisor embedded inside Fathom — a smart farm management platform. You help shrimp and fish farm operators make better decisions using real-time pond data.

CURRENT POND DATA:
- Species: ${fc.species || "Vannamei"} | Culture: ${fc.cultureType || "Semi-intensive"} | Water: ${fc.waterType || "—"}
- Days of Culture (DOC): ${doc || 0} / ${fc.targetHarvestDays || 120} days
- Health Score: ${b.healthScore ?? "—"}/100 | Status: ${b.status || "—"} | Risk Level: ${b.riskLevel || "—"}
- Dissolved Oxygen: ${sd.do ?? "—"} mg/L | Temperature: ${sd.temp ?? "—"}°C | pH: ${sd.ph ?? "—"} | Ammonia: ${sd.ammonia ?? "—"} ppm
- Biomass Est.: ${b.currentBiomassKg ?? "—"} kg | Avg Weight: ${b.currentAvgWeight ?? "—"}g
- Fish Count: ${fc.fishCount ?? "—"} | Survival: ${b.survivalProb ?? "—"}%
- Feed Efficiency: ${b.feedEfficiency ?? "—"} | FCR Target: ${fc.fcrTarget ?? 1.5} | Feeding Advice: ${b.feedingAdvice ?? "—"}
- Active Alerts: ${b.alerts?.length ? b.alerts.join("; ") : "None"}
- Gross Revenue: Rs.${b.grossRevenue ?? "—"}L | Cost: Rs.${b.totalCost ?? "—"}L | Net Profit: Rs.${b.netProfit ?? "—"}L | ROI: ${b.roi ?? "—"}

GUIDELINES:
- Respond in 2-4 clear sentences. Be direct and actionable.
- Always end with one concrete recommendation.
- If sensor data is missing or dash, acknowledge it briefly.
- Use plain English. Currency in Indian Rupees.`;
}

export default function AIChatWidget() {
  const { brain, sensorData, farmConfig, doc, activePond } = usePond();

  const [open,     setOpen]     = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hello! I'm Vantage AI. Ask me anything about your pond — health, feeding, harvest timing, or financials." },
  ]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    setApiError("");

    const updated = [...messages, { role: "user", text: msg }];
    setMessages(updated);
    setLoading(true);

    try {
      const res = await fetch(`${BASE}/ai/chat`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          systemPrompt: buildSystemPrompt(brain, sensorData, farmConfig, doc),
          messages: updated.map(m => ({ role: m.role, content: m.text })),
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setApiError(data.message || "AI unavailable.");
        setMessages(p => p.slice(0, -1));
        return;
      }

      setMessages(p => [...p, { role: "assistant", text: data.reply }]);
    } catch {
      setApiError("Cannot reach server. Make sure your backend is running on port 5000.");
      setMessages(p => p.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  if (!activePond) return null;

  const H = expanded ? "h-[520px]" : "h-[400px]";
  const W = expanded ? "w-[420px]"  : "w-[340px]";

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)} title="Ask Vantage AI"
          className="fixed bottom-24 right-6 z-50 w-14 h-14 bg-slate-900 hover:bg-slate-800
            text-white shadow-2xl flex items-center justify-center
            transition-all duration-200 hover:scale-110 active:scale-95">
          <Bot size={22} />
        </button>
      )}

      {open && (
        <div className={`fixed bottom-6 right-6 z-50 ${W} ${H}
          flex flex-col bg-white border border-slate-200 shadow-2xl font-sans overflow-hidden
          transition-all duration-200`}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 bg-emerald-500 flex items-center justify-center">
                <Bot size={13} className="text-white" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-white">Vantage AI</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-[8px] font-bold text-slate-400 uppercase">{activePond.label} · Live data</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setExpanded(e => !e)}
                className="p-1.5 text-slate-400 hover:text-white transition-colors">
                {expanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
              </button>
              <button onClick={() => setOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white transition-colors">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="w-6 h-6 bg-slate-900 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={11} className="text-emerald-400" />
                  </div>
                )}
                <div className={`max-w-[80%] px-3 py-2.5 text-xs font-medium leading-relaxed
                  ${m.role === "user"
                    ? "bg-green-700 text-white"
                    : "bg-white border border-slate-200 text-slate-700 shadow-sm"}`}>
                  {m.text}
                </div>
                {m.role === "user" && (
                  <div className="w-6 h-6 bg-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                    <User size={11} className="text-slate-500" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 bg-slate-900 flex items-center justify-center shrink-0">
                  <Bot size={11} className="text-emerald-400" />
                </div>
                <div className="bg-white border border-slate-200 px-3 py-2.5 shadow-sm">
                  <div className="flex gap-1 items-center">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Error banner */}
          {apiError && (
            <div className="px-4 py-2.5 bg-red-50 border-t border-red-200 flex items-start gap-2 shrink-0">
              <AlertCircle size={12} className="text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-black text-red-600">{apiError}</p>
                {apiError.includes("ANTHROPIC_API_KEY") && (
                  <p className="text-[9px] text-red-400 mt-0.5">
                    Add ANTHROPIC_API_KEY=sk-ant-... to your backend .env file
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Suggested prompts */}
          {messages.length === 1 && !loading && (
            <div className="px-3 py-2 border-t border-slate-100 flex flex-wrap gap-1.5 bg-white shrink-0">
              {SUGGESTED.map(s => (
                <button key={s} onClick={() => sendMessage(s)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-green-50 hover:text-green-700
                    border border-slate-200 hover:border-green-200 text-[9px] font-bold
                    text-slate-500 uppercase tracking-wide transition-all">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-3 border-t border-slate-200 bg-white shrink-0">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
              placeholder="Ask about your pond…"
              disabled={loading}
              className="flex-1 bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-mono
                text-slate-900 focus:outline-none focus:border-green-600 focus:bg-white
                transition-colors disabled:opacity-50"
            />
            <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
              className="w-8 h-8 bg-green-700 hover:bg-green-600 disabled:opacity-40
                flex items-center justify-center text-white transition-colors shrink-0">
              {loading ? <Loader size={13} className="animate-spin" /> : <Send size={13} />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}