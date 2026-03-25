import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { initGA, sendPageView } from "../utils/analytics";

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    initGA();
  }, []);

  useEffect(() => {
    sendPageView(location.pathname + location.search);
  }, [location]);

  return null;
};

export default AnalyticsTracker;
