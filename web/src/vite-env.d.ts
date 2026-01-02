/* eslint-disable spaced-comment */
/// <reference types="vite/client" />
/* eslint-enable spaced-comment */

// Google Analytics gtag function
interface Window {
  gtag?: (
    command: 'config' | 'event' | 'js',
    targetId: string,
    config?: Record<string, unknown>,
  ) => void;
  dataLayer?: unknown[];
}
