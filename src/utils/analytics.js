import ReactGA from "react-ga4";

const GA_MEASUREMENT_ID = "G-PRPGGDR7NJ";

export const initGA = () => {
  ReactGA.initialize(GA_MEASUREMENT_ID);
};

export const sendPageView = (path) => {
  ReactGA.send({ hitType: "pageview", page: path });
};

export const sendEvent = (category, action, label) => {
  ReactGA.event({
    category: category,
    action: action,
    label: label,
  });
};
