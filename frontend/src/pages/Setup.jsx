import React, { useState } from 'react';
import { usePond } from '../context/PondContext'; 
import { 
  Target, ShieldAlert, Cpu, Layers, Construction
} from 'lucide-react';

export default function FarmSetup() {
  const [activeStep, setActiveStep] = useState(1);
  const { farmConfig, setConfig, brain } = usePond();

  const steps = [
    { id: 1, label: 'SITE_WIZARD', desc: 'Geometry & Biological Load' },
    { id: 2, label: 'SENSOR_MAPPING', desc: 'IoT Spatial Deployment' },
    { id: 3, label: 'THRESHOLD_CONFIG', desc: 'Risk & Alert Parameters' },
  ];

  // FIXED: Added optional chaining to prevent crash if brain is null
  const healthScore = brain?.healthScore ?? 0;
  const configIntegrity = healthScore > 80 ? 'A+' : healthScore > 50 ? 'B' : 'CRITICAL';

  const updateConfig = (key, value, isThreshold = false) => {
    if (isThreshold) {
      setConfig(prev => ({
        ...prev,
        thresholds: { ...prev.thresholds, [key]: parseFloat(value) }
      }));
    } else {
      setConfig(prev => ({
        ...prev,
        [key]: key === 'species' ? value : parseFloat(value)
      }));
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] text-[#212529] font-sans">
      <div className="flex-1 p-6 lg:p-10 space-y-6">
        
        <div className="flex justify-between items-end border-b border-slate-200 pb-6">
          <div>
            <nav className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">
              Infrastructure / Digital Twin / Build_Mode
            </nav>
            <h1 className="text-3xl font-light text-slate-800 tracking-tight">
              Architect: <span className="font-semibold italic">Vantage_Twin_v1</span>
            </h1>
          </div>
          <button className="bg-slate-900 text-white px-6 py-2 rounded text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg">
              Deploy to Live Pond
          </button>
        </div>

        <div className="flex gap-1 border-b border-slate-200">
          {steps.map((step) => (
            <button 
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest border-t border-x transition-all rounded-t-sm ${
                activeStep === step.id 
                  ? 'bg-white border-slate-200 text-blue-600 border-t-2 border-t-blue-600' 
                  : 'bg-slate-50 border-transparent text-slate-400'
              }`}
            >
              Step 0{step.id}: {step.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            
            {activeStep === 1 && (
              <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-8">
                <h3 className="text-xs font-black uppercase mb-6 flex items-center gap-2"><Target size={16}/> Biological Parameters</h3>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <WizardInput label="Pond Size (m²)" value={farmConfig?.size ?? 0} unit="SQM" 
                      onChange={(v) => updateConfig('size', v)} />
                    <WizardInput label="Stocking Density" value={farmConfig?.density ?? 0} unit="PL/m²" 
                      onChange={(v) => updateConfig('density', v)} />
                    <div>
                      <label className="text-[9px] font-black uppercase text-slate-400">Species</label>
                      <select 
                        value={farmConfig?.species ?? "Vannamei"}
                        onChange={(e) => updateConfig('species', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 p-3 text-xs font-bold rounded mt-1"
                      >
                        <option value="Vannamei">Litopenaeus Vannamei (Whiteleg)</option>
                        <option value="Monodon">Penaeus Monodon (Black Tiger)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="bg-slate-900 rounded-xl p-6 text-white flex flex-col justify-center">
                    <p className="text-[10px] font-black text-blue-400 uppercase mb-4">Core Engine Output</p>
                    <div className="space-y-4">
                      <div>
                        <p className="text-2xl font-black italic text-emerald-400">₹{brain?.projectedRevenue ?? 0}</p>
                        <p className="text-[9px] uppercase text-slate-500 font-bold">Projected Revenue</p>
                      </div>
                      <div>
                        <p className="text-2xl font-black italic text-blue-400">{brain?.survivalProb ?? 0}%</p>
                        <p className="text-[9px] uppercase text-slate-500 font-bold">Estimated Survival Rate</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-8">
                 <h3 className="text-xs font-black uppercase mb-6 flex items-center gap-2"><Cpu size={16}/> Spatial I/O Mapping</h3>
                 <div className="aspect-video bg-slate-100 rounded-lg border-2 border-dashed border-slate-200 relative overflow-hidden group">
                    <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-100 transition-opacity">
                      <p className="text-[10px] font-black uppercase text-slate-400">Click Map to Assign Node</p>
                    </div>
                    <div className="absolute top-1/4 left-1/4 h-8 w-8 bg-blue-500 rounded-full animate-pulse border-4 border-white shadow-lg cursor-pointer flex items-center justify-center text-white text-[8px] font-bold">DO_1</div>
                    <div className="absolute bottom-1/3 right-1/4 h-8 w-8 bg-emerald-500 rounded-full border-4 border-white shadow-lg cursor-pointer flex items-center justify-center text-white text-[8px] font-bold">PH_1</div>
                    <svg className="w-full h-full text-slate-200" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    </svg>
                 </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-8">
                <h3 className="text-xs font-black uppercase mb-6 flex items-center gap-2"><ShieldAlert size={16}/> Safety Thresholds</h3>
                <div className="space-y-6">
                  <ThresholdSlider 
                    label="Critical Oxygen (DO)" 
                    value={farmConfig?.thresholds?.doCrit ?? 0} 
                    min={2} max={6} unit="mg/L" 
                    onChange={(v) => updateConfig('doCrit', v, true)} 
                  />
                  <ThresholdSlider 
                    label="Max Thermal Limit" 
                    value={farmConfig?.thresholds?.tempMax ?? 0} 
                    min={25} max={35} unit="°C" 
                    onChange={(v) => updateConfig('tempMax', v, true)} 
                  />
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className={`p-6 rounded-sm shadow-md transition-colors ${(brain?.healthScore ?? 100) < 50 ? 'bg-red-900' : 'bg-[#2c3e50]'} text-white`}>
              <h3 className="font-black tracking-widest uppercase text-[10px] text-emerald-400 mb-4">Digital Twin Score</h3>
              <p className="text-5xl font-black italic tracking-tighter mb-2">{configIntegrity}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase leading-tight">
                {(brain?.alerts?.length ?? 0) > 0 
                  ? `WARNING: ${brain.alerts[0]} detected.` 
                  : "Configuration matches industrial standards."}
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm">
               <h3 className="text-xs font-black uppercase mb-4 text-slate-700">Infrastructure Validation</h3>
               <ul className="space-y-3">
                 <ValidationItem label="Feed Efficiency" status={brain?.feedEfficiency ?? "---"} />
                 <ValidationItem label="Pond Status" status={brain?.status ?? "---"} color={(brain?.healthScore ?? 100) < 50 ? "text-red-500" : "text-emerald-500"} />
                 <ValidationItem label="Sensor Redundancy" status="FAIL" color="text-red-500" />
               </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WizardInput({ label, value, unit, onChange }) {
  return (
    <div>
      <label className="text-[9px] font-black uppercase text-slate-400">{label}</label>
      <div className="flex mt-1">
        <input 
          type="number" value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-slate-50 border border-slate-200 p-3 text-xs font-black rounded-l outline-none focus:border-blue-500" 
        />
        <span className="bg-slate-200 px-4 flex items-center text-[9px] font-black rounded-r">{unit}</span>
      </div>
    </div>
  );
}

function ThresholdSlider({ label, value, min, max, unit, onChange }) {
  return (
    <div className="p-4 bg-slate-50 rounded border border-slate-100">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-black uppercase text-slate-500">{label}</span>
        <span className="text-xs font-black text-blue-600">{value} {unit}</span>
      </div>
      <input 
        type="range" min={min} max={max} step="0.1" value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full accent-slate-900" 
      />
    </div>
  );
}

function ValidationItem({ label, status, color = "text-emerald-500" }) {
  return (
    <li className="flex justify-between items-center border-b border-slate-50 pb-2">
      <span className="text-[10px] font-black uppercase text-slate-400 italic">{label}</span>
      <span className={`text-[10px] font-black uppercase ${color}`}>{status}</span>
    </li>
  );
}