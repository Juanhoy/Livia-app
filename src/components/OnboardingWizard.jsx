import React, { useState } from 'react';
import { ArrowRight, Check, Sparkles, Loader } from 'lucide-react';

const OnboardingWizard = ({ onComplete, theme, t, logo }) => {
    const [step, setStep] = useState(0);
    const [inputs, setInputs] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);

    const pillars = [
        { key: 'health', name: 'Health', color: 'text-green-400', bg: 'bg-green-400/10' },
        { key: 'family', name: 'Family', color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { key: 'freedom', name: 'Freedom', color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
        { key: 'community', name: 'Community', color: 'text-purple-400', bg: 'bg-purple-400/10' },
        { key: 'management', name: 'Management', color: 'text-orange-400', bg: 'bg-orange-400/10' },
        { key: 'learning', name: 'Learning', color: 'text-brown-400', bg: 'bg-amber-700/10' },
        { key: 'creation', name: 'Creation', color: 'text-pink-400', bg: 'bg-pink-400/10' },
        { key: 'fun', name: 'Fun', color: 'text-yellow-400', bg: 'bg-yellow-400/10' }
    ];

    const handleNext = async () => {
        if (step < pillars.length) {
            setStep(step + 1);
        } else {
            setIsProcessing(true);
            await onComplete(inputs);
            setIsProcessing(false);
        }
    };

    const handleInput = (e) => {
        const currentPillar = pillars[step - 1];
        setInputs({ ...inputs, [currentPillar.key]: e.target.value });
    };

    const colors = theme === 'dark' ? {
        bg: 'bg-[#121212]',
        cardBg: 'bg-[#1e1e1e]',
        text: 'text-white',
        textSecondary: 'text-gray-400',
        border: 'border-gray-800',
        inputBg: 'bg-[#2a2a2a]'
    } : {
        bg: 'bg-gray-50',
        cardBg: 'bg-white',
        text: 'text-gray-900',
        textSecondary: 'text-gray-500',
        border: 'border-gray-200',
        inputBg: 'bg-gray-50'
    };

    if (isProcessing) {
        return (
            <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${colors.bg} ${colors.text}`}>
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse"></div>
                    <Sparkles size={64} className="text-blue-400 animate-spin-slow relative z-10" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Fine-tuning your experience...</h2>
                <p className={`${colors.textSecondary} max-w-md text-center`}>
                    Our AI is analyzing your goals to create personalized challenges and routines for you.
                </p>
            </div>
        );
    }

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${colors.bg} p-4`}>
            <div className={`w-full max-w-2xl ${colors.cardBg} rounded-2xl border ${colors.border} shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}>

                {/* Progress Bar */}
                <div className="h-1 bg-gray-800 w-full">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${(step / (pillars.length + 1)) * 100}%` }}
                    ></div>
                </div>

                <div className="p-8 flex-1 overflow-y-auto flex flex-col items-center text-center">

                    {step === 0 ? (
                        // Welcome Step
                        <div className="flex flex-col items-center justify-center h-full py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="w-24 h-24 mb-8 relative">
                                <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20"></div>
                                <img src={logo} alt="Livia" className="w-full h-full object-contain relative z-10" />
                            </div>
                            <h1 className={`text-4xl font-bold mb-6 ${colors.text}`}>Welcome to Livia</h1>
                            <p className={`text-lg ${colors.textSecondary} max-w-lg leading-relaxed mb-8`}>
                                This app has a series of tools for you to improve your life quality, experiences, and connections with focus and purpose.
                                <br /><br />
                                Let's fine tune your experience.
                            </p>
                            <button
                                onClick={handleNext}
                                className="group bg-white text-black px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-200 transition-all flex items-center gap-2"
                            >
                                Let's Start <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    ) : (
                        // Pillar Steps
                        <div className="w-full flex flex-col h-full animate-in fade-in slide-in-from-right-8 duration-500 key={step}">
                            <div className="flex-1 flex flex-col items-center justify-center">
                                <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6 ${pillars[step - 1].bg} ${pillars[step - 1].color}`}>
                                    {step} / {pillars.length}
                                </div>

                                <h2 className={`text-3xl font-bold mb-2 ${colors.text}`}>Let's talk about your <span className={pillars[step - 1].color}>{pillars[step - 1].name}</span></h2>
                                <p className={`${colors.textSecondary} mb-8`}>Are there any challenges or goals you have for your {pillars[step - 1].name}?</p>

                                <textarea
                                    className={`w-full max-w-lg h-40 ${colors.inputBg} border ${colors.border} rounded-xl p-4 ${colors.text} focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none text-lg placeholder:text-gray-600`}
                                    placeholder={`e.g. I want to improve my...`}
                                    value={inputs[pillars[step - 1].key] || ''}
                                    onChange={handleInput}
                                    autoFocus
                                />
                            </div>

                            <div className="mt-8 flex justify-between items-center w-full max-w-lg mx-auto">
                                <button
                                    onClick={() => setStep(step - 1)}
                                    className={`${colors.textSecondary} hover:${colors.text} transition-colors`}
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-colors flex items-center gap-2"
                                >
                                    {step === pillars.length ? 'Finish' : 'Next'} <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OnboardingWizard;
