import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

const TourGuide = ({ steps, isOpen, onComplete, theme = 'dark' }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [targetRect, setTargetRect] = useState(null);

    useEffect(() => {
        if (!isOpen) return;

        const updatePosition = () => {
            const step = steps[currentStep];
            const element = document.getElementById(step.targetId);

            if (element) {
                const rect = element.getBoundingClientRect();
                setTargetRect(rect);
                // Position to the right of the element, centered vertically
                setPosition({
                    top: rect.top + rect.height / 2,
                    left: rect.right + 10
                });
            }
        };

        updatePosition();
        window.addEventListener('resize', updatePosition);
        return () => window.removeEventListener('resize', updatePosition);
    }, [currentStep, isOpen, steps]);

    if (!isOpen) return null;

    const step = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;
    const isDark = theme === 'dark';

    const handleNext = () => {
        if (isLastStep) {
            onComplete();
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none">
            {/* Spotlight Effect (Optional - just darkening background for now) */}
            <div className="absolute inset-0 bg-black/50 transition-opacity duration-300 pointer-events-auto" />

            {/* Highlight Target */}
            {targetRect && (
                <div
                    className="absolute transition-all duration-300 ease-in-out border-2 border-blue-500 rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.5)] pointer-events-none"
                    style={{
                        top: targetRect.top - 4,
                        left: targetRect.left - 4,
                        width: targetRect.width + 8,
                        height: targetRect.height + 8,
                    }}
                />
            )}

            {/* Tooltip */}
            <div
                className={`absolute pointer-events-auto transition-all duration-300 ease-out flex flex-col max-w-xs w-full ${isDark ? 'bg-[#1e1e1e] text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'} border rounded-xl shadow-2xl p-5`}
                style={{
                    top: position.top,
                    left: position.left,
                    transform: 'translateY(-50%)'
                }}
            >
                {/* Arrow pointing left */}
                <div
                    className={`absolute top-1/2 -left-2 w-4 h-4 transform -translate-y-1/2 rotate-45 border-l border-b ${isDark ? 'bg-[#1e1e1e] border-gray-700' : 'bg-white border-gray-200'}`}
                />

                <div className="flex justify-between items-start mb-3 relative z-10">
                    <h3 className="font-bold text-lg">{step.title}</h3>
                    <button onClick={onComplete} className={`p-1 rounded-full hover:bg-gray-700/50 transition-colors ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <X size={16} />
                    </button>
                </div>

                <p className={`text-sm mb-6 leading-relaxed relative z-10 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {step.description}
                </p>

                <div className="flex justify-between items-center relative z-10">
                    <div className="flex gap-1">
                        {steps.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-2 h-2 rounded-full transition-colors ${idx === currentStep ? 'bg-blue-500' : isDark ? 'bg-gray-700' : 'bg-gray-300'}`}
                            />
                        ))}
                    </div>

                    <div className="flex gap-2">
                        {currentStep > 0 && (
                            <button
                                onClick={handleBack}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                            >
                                Back
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold shadow-lg transition-all hover:scale-105 flex items-center gap-1"
                        >
                            {isLastStep ? 'Got it!' : 'Next'}
                            {!isLastStep && <ChevronRight size={14} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TourGuide;
