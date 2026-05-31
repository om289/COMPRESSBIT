/**
 * Privacy-focused local analytics event logger.
 * In development, it logs events to the console.
 * Can be easily integrated with platforms like Plausible, Umami, or Google Analytics by replacing the implementation.
 */

export const trackEvent = (eventName, params = {}) => {
  // Check if we are in development mode or if custom logs are enabled
  const isDev = process.env.NODE_ENV === 'development' || import.meta.env?.DEV;

  const eventPayload = {
    event: eventName,
    timestamp: new Date().toISOString(),
    properties: {
      ...params,
      url: window.location.pathname,
      referrer: document.referrer || 'direct',
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
      user_agent: navigator.userAgent
    }
  };

  if (isDev) {
    console.log(`[Analytics Event Logged]:`, eventPayload);
  }

  // Example integration placeholder (e.g., Plausible, Umami, or custom self-hosted telemetry):
  /*
  if (window.plausible) {
    window.plausible(eventName, { props: params });
  } else if (window.umami) {
    window.umami.track(eventName, params);
  }
  */
};

export const trackPageView = (path) => {
  const isDev = process.env.NODE_ENV === 'development' || import.meta.env?.DEV;
  
  if (isDev) {
    console.log(`[Analytics PageView Logged]: ${path || window.location.pathname}`);
  }

  /*
  if (window.plausible) {
    window.plausible('pageview', { u: path || window.location.pathname });
  }
  */
};

export default {
  trackEvent,
  trackPageView
};
