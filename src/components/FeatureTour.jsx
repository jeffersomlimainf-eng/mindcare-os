import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

const FeatureTour = ({ isOpen, steps, onComplete, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState(null);

    const updateTargetRect = useCallback(() => {
        if (!isOpen || !steps || !steps[currentStep]) return;
        
        const element = document.getElementById(steps[currentStep].targetId);
        if (element) {
            const rect = element.getBoundingClientRect();
            setTargetRect({
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height
            });
            // Scroll suave para o elemento se não estiver visível
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            setTargetRect(null);
        }
    }, [currentStep, isOpen, steps]);

    useEffect(() => {
        updateTargetRect();
        window.addEventListener('resize', updateTargetRect);
        window.addEventListener('scroll', updateTargetRect);
        return () => {
            window.removeEventListener('resize', updateTargetRect);
            window.removeEventListener('scroll', updateTargetRect);
        };
    }, [updateTargetRect]);

    if (!isOpen || !steps || steps.length === 0) return null;

    const step = steps[currentStep];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[99999] pointer-events-none">
            <AnimatePresence>
                {/* Overlay with Cutout */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] pointer-events-auto"
                    style={{
                        clipPath: targetRect ? `polygon(
                            0% 0%, 
                            0% 100%, 
                            ${targetRect.left}px 100%, 
                            ${targetRect.left}px ${targetRect.top}px, 
                            ${targetRect.left + targetRect.width}px ${targetRect.top}px, 
                            ${targetRect.left + targetRect.width}px ${targetRect.top + targetRect.height}px, 
                            ${targetRect.left}px ${targetRect.top + targetRect.height}px, 
                            ${targetRect.left}px 100%, 
                            100% 100%, 
                            100% 0%
                        )` : 'none'
                    }}
                    onClick={onClose}
                />

                {/* Spotlight Border */}
                {targetRect && (
                    <motion.div 
                        initial={false}
                        animate={{ 
                            top: targetRect.top - 4,
                            left: targetRect.left - 4,
                            width: targetRect.width + 8,
                            height: targetRect.height + 8,
                            opacity: 1
                        }}
                        className="absolute border-2 border-primary rounded-2xl shadow-[0_0_0_9999px_rgba(15,23,42,0.6)] pointer-events-none"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                )}

                {/* Tooltip Card */}
                {targetRect && (
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ 
                            opacity: 1, 
                            scale: 1, 
                            y: 0,
                            // Manter o card visível dentro da tela
                            top: targetRect.top + targetRect.height + 20 > window.innerHeight - 250 
                                ? targetRect.top - 240 
                                : targetRect.top + targetRect.height + 20,
                            left: Math.min(Math.max(20, targetRect.left + (targetRect.width / 2) - 160), window.innerWidth - 340)
                        }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed w-[320px] bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-6 pointer-events-auto border border-slate-100 dark:border-slate-700 z-[100000]"
                    >
                        {/* Progress Header */}
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 px-3 py-1 rounded-full">
                                Passo {currentStep + 1} de {steps.length}
                            </span>
                            <button 
                                onClick={onClose}
                                className="size-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 transition-all"
                            >
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>

                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 leading-tight">
                            {step.title}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">
                            {step.text}
                        </p>

                        <div className="flex items-center justify-between gap-4 mt-auto">
                            <button 
                                onClick={handleBack}
                                disabled={currentStep === 0}
                                className={`text-[10px] font-black uppercase tracking-widest ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-slate-900 group flex items-center gap-1 transition-all'}`}
                            >
                                <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">west</span>
                                Voltar
                            </button>
                            
                            <button 
                                onClick={handleNext}
                                className="px-6 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-[0.15em] rounded-xl hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95 flex items-center gap-2 group"
                            >
                                {currentStep === steps.length - 1 ? 'Concluir Aula' : 'Próximo'}
                                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                                    {currentStep === steps.length - 1 ? 'check' : 'east'}
                                </span>
                            </button>
                        </div>
                        
                        {/* Triângulo Indicador */}
                        <div 
                            className={`absolute w-4 h-4 bg-white dark:bg-slate-800 border-l border-t border-slate-100 dark:border-slate-700 transform rotate-45 ${
                                targetRect.top + targetRect.height + 20 > window.innerHeight - 250 
                                    ? 'bottom-[-9px] left-1/2 -translate-x-1/2 border-l-0 border-t-0 border-r border-b' 
                                    : 'top-[-9px] left-1/2 -translate-x-1/2'
                            }`}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>,
        document.body
    );
};

export default FeatureTour;
