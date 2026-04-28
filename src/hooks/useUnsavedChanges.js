import { useState, useEffect, useCallback } from 'react';

export function useUnsavedChanges() {
    const [isDirty, setIsDirty] = useState(false);

    const markDirty = useCallback(() => setIsDirty(true), []);
    const markClean = useCallback(() => setIsDirty(false), []);

    useEffect(() => {
        if (!isDirty) return;
        const handler = (e) => {
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [isDirty]);

    return { isDirty, markDirty, markClean };
}
