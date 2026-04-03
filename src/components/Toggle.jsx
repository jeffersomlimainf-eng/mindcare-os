import React from 'react';

const Toggle = ({ value, onChange, disabled = false }) => {
    return (
        <button
            type="button"
            onClick={() => !disabled && onChange && onChange(!value)}
            disabled={disabled}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                value ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    value ? 'translate-x-5' : 'translate-x-0'
                }`}
            />
        </button>
    );
};

export default Toggle;
