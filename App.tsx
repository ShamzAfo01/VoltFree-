
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { calculateBestDivider } from './services/voltageDividerService';
import { getCircuitExplanation } from './services/geminiService';
import { CalculationResult, AiExplanation } from './types';
import CircuitDiagram from './components/CircuitDiagram';
import Logo from './components/Logo';

type Step = 'welcome' | 'vin' | 'vout' | 'result' | 'explanation';

const STEPS: Step[] = ['vin', 'vout', 'result', 'explanation'];

/**
 * A sleek odometer-style number animator
 */
const Digit = ({ value }: { value: string }) => {
  const number = parseInt(value, 10);
  const y = useSpring(number * -10, { stiffness: 100, damping: 20 });

  useEffect(() => {
    y.set(number * -10);
  }, [number, y]);

  return (
    <span className="odometer-digit relative w-[0.6em]">
      <motion.span
        style={{ y: y.get() + '%' }}
        className="flex flex-col absolute top-0 left-0"
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span key={n} className="h-full flex items-center justify-center">{n}</span>
        ))}
      </motion.span>
      <span className="opacity-0">0</span>
    </span>
  );
};

const Odometer = ({ value }: { value: string }) => {
  return (
    <span className="inline-flex overflow-hidden">
      {value.split('').map((char, i) => (
        isNaN(parseInt(char, 10)) ? (
          <span key={i} className="px-[1px]">{char}</span>
        ) : (
          <Digit key={i} value={char} />
        )
      ))}
    </span>
  );
};

/**
 * Milestone Progress Indicator
 */
const MilestoneTracker = ({ currentStep }: { currentStep: Step }) => {
  const getIndex = (s: Step) => STEPS.indexOf(s);
  const activeIdx = getIndex(currentStep);

  if (currentStep === 'welcome') return null;

  return (
    <div className="fixed top-8 left-0 right-0 px-8 z-50 flex items-center justify-between">
      {STEPS.map((s, i) => (
        <React.Fragment key={s}>
          <div className="flex flex-col items-center gap-2">
            <motion.div
              animate={{
                scale: i <= activeIdx ? 1 : 0.8,
                backgroundColor: i <= activeIdx ? '#0038df' : '#f0f0f0'
              }}
              className="w-2.5 h-2.5 rounded-full"
            />
          </div>
          {i < STEPS.length - 1 && (
            <div className="flex-1 h-[2px] bg-slate-50 mx-2 overflow-hidden rounded-full">
              <motion.div
                initial={false}
                animate={{ width: i < activeIdx ? '100%' : '0%' }}
                className="h-full bg-[#0038df] opacity-20"
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const SleekScroller = ({
  value,
  onChange,
  min = 0,
  max = 24
}: {
  value: string,
  onChange: (v: string) => void,
  min?: number,
  max?: number
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const val = parseFloat(value) || 0;
  const percentage = Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100));

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // allow typing anything, validate/clamp on blur if needed, or just pass sticky value
    onChange(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    // Optional: clamp value on blur
    let num = parseFloat(value);
    if (isNaN(num)) num = min;
    if (num < min) num = min;
    if (num > max) num = max;
    onChange(num.toString());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  return (
    <div className="relative pt-20 pb-12 w-full group">
      {/* Tooltip with Odometer or Input */}
      <motion.div
        animate={{ left: `${percentage}%` }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="absolute top-0 -translate-x-1/2 bg-[#0038df] text-white px-4 py-2 rounded-[8px] font-black text-xl smooth-shadow flex items-center gap-1 after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-transparent after:border-t-[#0038df] cursor-text"
        onClick={() => setIsEditing(true)}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            type="number"
            value={value}
            onChange={handleManualInput}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-[80px] bg-transparent text-white outline-none text-center no-spinner placeholder-white/50"
            style={{ fontWeight: 900 }}
          />
        ) : (
          <Odometer value={val.toFixed(1)} />
        )}
        <span className="text-xs opacity-50 font-bold ml-1">V</span>
      </motion.div>

      <input
        type="range"
        min={min}
        max={max}
        step="0.1"
        value={val}
        onChange={(e) => onChange(e.target.value)}
        className="relative z-10 w-full"
      />

      <div className="flex justify-between mt-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">
        <span>{min}V</span>
        <span>{max}V</span>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [step, setStep] = useState<Step>('welcome');
  const [vin, setVin] = useState<string>("12.0");
  const [targetVout, setTargetVout] = useState<string>("3.3");
  const [aiExp, setAiExp] = useState<AiExplanation>({ explanation: "", loading: false });

  const result = useMemo(() => {
    const vInNum = parseFloat(vin);
    const targetVOutNum = parseFloat(targetVout);
    if (isNaN(vInNum) || isNaN(targetVOutNum)) return null;
    return calculateBestDivider(vInNum, targetVOutNum);
  }, [vin, targetVout]);

  const handleAskAi = async () => {
    if (!result?.bestPair) return;
    setStep('explanation');
    setAiExp({ explanation: "", loading: true });
    const explanation = await getCircuitExplanation(
      parseFloat(vin),
      parseFloat(targetVout),
      result.bestPair.r1Formatted,
      result.bestPair.r2Formatted,
      result.bestPair.actualVOut
    );
    setAiExp({ explanation, loading: false });
  };

  const variants = {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 }
  };

  const transition = { duration: 0.5, ease: [0.16, 1, 0.3, 1] };

  return (
    <div className="flex flex-col min-h-screen bg-white max-w-md mx-auto overflow-hidden relative selection:bg-blue-100">

      <MilestoneTracker currentStep={step} />

      <AnimatePresence mode="wait">
        {step === 'welcome' && (
          <motion.div
            key="welcome"
            initial="initial" animate="animate" exit="exit" variants={variants} transition={transition}
            className="flex-1 flex flex-col justify-center items-center px-10 text-center"
          >
            <div className="mb-10 w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-[#0038df] smooth-shadow">
              <Logo className="w-10 h-10" />
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-[#474747] mb-6">Free.</h1>
            <p className="text-[#474747] text-lg font-bold opacity-50 mb-2 px-4 leading-relaxed">
              Design clean circuits with real-world resistors.
            </p>
            <p className="text-[#474747] text-sm font-medium opacity-40 mb-12 px-8 leading-relaxed max-w-[260px] mx-auto">
              Enter your source and target voltages to find the perfect resistor pair for your project.
            </p>
            <button
              onClick={() => setStep('vin')}
              className="primary-btn w-full py-5 font-black text-lg smooth-shadow"
            >
              Get Started
            </button>
          </motion.div>
        )}

        {step === 'vin' && (
          <motion.div
            key="vin"
            initial="initial" animate="animate" exit="exit" variants={variants} transition={transition}
            className="flex-1 flex flex-col pt-32 px-10"
          >
            <h2 className="text-4xl font-black text-[#474747] mb-4 tracking-tighter leading-none">Source.</h2>
            <p className="text-sm font-semibold text-slate-400 mb-12">Scroll to select your Source Voltage.</p>

            <SleekScroller value={vin} onChange={setVin} max={48} />

            <div className="mt-auto pb-12 flex gap-4">
              <button
                onClick={() => setStep('welcome')}
                className="w-16 h-16 rounded-[8px] border-2 border-slate-100 flex items-center justify-center text-slate-300"
              >
                <i className="fas fa-arrow-left"></i>
              </button>
              <button
                onClick={() => setStep('vout')}
                className="primary-btn flex-1 py-5 font-black text-lg smooth-shadow"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}

        {step === 'vout' && (
          <motion.div
            key="vout"
            initial="initial" animate="animate" exit="exit" variants={variants} transition={transition}
            className="flex-1 flex flex-col pt-32 px-10"
          >
            <h2 className="text-4xl font-black text-[#474747] mb-4 tracking-tighter leading-none">Output.</h2>
            <p className="text-sm font-semibold text-slate-400 mb-12">Scroll to select your Target Voltage.</p>

            <SleekScroller value={targetVout} onChange={setTargetVout} max={parseFloat(vin)} />

            <div className="mt-auto pb-12 flex gap-4">
              <button
                onClick={() => setStep('vin')}
                className="w-16 h-16 rounded-[8px] border-2 border-slate-100 flex items-center justify-center text-slate-300"
              >
                <i className="fas fa-arrow-left"></i>
              </button>
              <button
                onClick={() => setStep('result')}
                className="primary-btn flex-1 py-5 font-black text-lg smooth-shadow"
              >
                Calculate
              </button>
            </div>
          </motion.div>
        )}

        {step === 'result' && result && (
          <motion.div
            key="result"
            initial="initial" animate="animate" exit="exit" variants={variants} transition={transition}
            className="flex-1 flex flex-col pt-24 px-8 overflow-y-auto pb-24"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-[#474747] tracking-tight">Success.</h2>
              <button onClick={() => setStep('welcome')} className="text-sm font-black text-[#0038df] uppercase tracking-widest">Restart</button>
            </div>

            {result.error ? (
              <div className="bg-red-50 p-6 rounded-[8px] text-red-600 font-bold border border-red-100">
                {result.error}
              </div>
            ) : result.bestPair && (
              <div className="space-y-6">
                <div className="card p-8 text-center relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#0038df] opacity-20"></div>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1">Calculated Output</span>
                  <div className="text-5xl font-black text-[#0038df] mb-2">
                    {result.bestPair.actualVOut.toFixed(2)}<span className="text-2xl opacity-40">V</span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                    Error: {result.bestPair.deviation.toFixed(2)}%
                  </p>
                </div>

                <div className="bg-green-100 text-green-700 p-4 rounded-xl flex items-center justify-center gap-3 border border-green-200 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center">
                    <i className="fas fa-check text-sm"></i>
                  </div>
                  <span className="text-lg font-black tracking-tight">Safe to build</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="card p-5">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-2">Resistor R1</span>
                    <span className="text-2xl font-black text-[#474747]">{result.bestPair.r1Formatted}</span>
                  </div>
                  <div className="card p-5">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-2">Resistor R2</span>
                    <span className="text-2xl font-black text-[#474747]">{result.bestPair.r2Formatted}</span>
                  </div>
                </div>

                <div className="card overflow-hidden bg-white">
                  <CircuitDiagram
                    vin={vin}
                    vout={result.bestPair.actualVOut.toFixed(2)}
                    r1={result.bestPair.r1Formatted}
                    r2={result.bestPair.r2Formatted}
                  />
                </div>

                <button
                  onClick={handleAskAi}
                  className="w-full py-5 border-2 border-slate-50 text-[#474747] rounded-[8px] font-black text-sm flex items-center justify-center gap-2 hover:bg-[#0038df] hover:text-white hover:border-[#0038df] transition-all"
                >
                  <i className="fas fa-sparkles text-[#0038df] group-hover:text-white"></i> Explain Physics
                </button>
              </div>
            )}
          </motion.div>
        )}

        {step === 'explanation' && (
          <motion.div
            key="explanation"
            initial="initial" animate="animate" exit="exit" variants={variants} transition={transition}
            className="flex-1 flex flex-col pt-24 px-8 overflow-y-auto pb-24"
          >
            <div className="flex items-center gap-4 mb-10">
              <button onClick={() => setStep('result')} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-[#0038df]">
                <i className="fas fa-arrow-left"></i>
              </button>
              <h2 className="text-3xl font-black text-[#474747] tracking-tighter">Insight.</h2>
            </div>

            {aiExp.loading ? (
              <div className="space-y-8 py-4">
                <div className="h-6 bg-slate-50 rounded-[4px] w-2/3 animate-pulse"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-slate-50 rounded-[4px] w-full animate-pulse"></div>
                  <div className="h-4 bg-slate-50 rounded-[4px] w-full animate-pulse"></div>
                  <div className="h-4 bg-slate-50 rounded-[4px] w-5/6 animate-pulse"></div>
                  <div className="h-4 bg-slate-50 rounded-[4px] w-4/6 animate-pulse"></div>
                </div>
              </div>
            ) : (
              <div className="prose prose-slate max-w-none text-[#474747] font-medium leading-loose text-sm">
                <div dangerouslySetInnerHTML={{ __html: aiExp.explanation.replace(/\n/g, '<br/>') }} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
