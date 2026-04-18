import ReactGA from "react-ga4";
import { logger } from './logger';

const GA_MEASUREMENT_ID = "G-PRPGGDR7NJ";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export const initGA = () => {
  ReactGA.initialize(GA_MEASUREMENT_ID);
};

// Função auxiliar para chamar a CAPI via Supabase Edge Function
const callCapi = async (eventName, eventId, url, customData = {}) => {
  try {
    fetch(`${SUPABASE_URL}/functions/v1/facebook-capi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: eventName,
        event_id: eventId,
        event_source_url: url,
        custom_data: customData
      })
    });
  } catch (e) {
    logger.error("CAPI Error:", e);
  }
};

export const sendPageView = (path) => {
  const eventId = `pv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const fullUrl = window.location.href;

  // Google Analytics
  ReactGA.send({ hitType: "pageview", page: path });

  // Facebook Pixel (Browser)
  if (window.fbq) {
    window.fbq('track', 'PageView', {}, { eventID: eventId });
  }

  // Facebook CAPI (Server)
  callCapi('PageView', eventId, fullUrl);
};

export const sendEvent = (category, action, label, value) => {
  const eventId = `ev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  
  // Google Analytics
  ReactGA.event({
    category: category,
    action: action,
    label: label,
    value: value
  });

  // Facebook Pixel (Browser)
  if (window.fbq) {
    window.fbq('trackCustom', action, { category, label, value }, { eventID: eventId });
  }

  // Facebook CAPI (Server)
  callCapi(action, eventId, window.location.href, { category, label, value });
};


