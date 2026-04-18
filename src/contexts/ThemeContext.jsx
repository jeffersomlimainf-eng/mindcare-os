import { createContext, useContext, useState, useEffect } from 'react';

import { logger } from '../utils/logger';
const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('Meu Sistema PSI_darkmode');
        return saved ? JSON.parse(saved) : false;
    });

    useEffect(() => {
        localStorage.setItem('Meu Sistema PSI_darkmode', JSON.stringify(darkMode));
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    // Aplicar no carregamento inicial
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleDarkMode = () => setDarkMode(prev => !prev);

    return (
        <ThemeContext.Provider value={{ darkMode, setDarkMode, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};



