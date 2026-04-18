import { useState } from 'react';

import { logger } from '../utils/logger';
const useDismissible = (bannerKey) => {
    const storageKey = `psi_dismissed_${bannerKey}`;
    const [isDismissed, setIsDismissed] = useState(() => !!localStorage.getItem(storageKey));

    const dismiss = () => {
        localStorage.setItem(storageKey, '1');
        setIsDismissed(true);
    };

    return [isDismissed, dismiss];
};

export default useDismissible;

