import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import { loadKlaviyo } from '@/lib/klaviyo';
import { loadAdTags } from '@/lib/adTags';
import '@/styles/index.css';

/**
 * After a new deploy, a tab opened on the old one still asks for the old
 * hashed page chunks, which no longer exist. Reload once to pick up the new
 * build instead of showing an error; the session flag stops a reload loop if
 * the chunk is genuinely broken.
 */
const RELOAD_FLAG = 'skenvision.chunkReload';
window.addEventListener('vite:preloadError', (event) => {
  try {
    if (sessionStorage.getItem(RELOAD_FLAG)) return;
    sessionStorage.setItem(RELOAD_FLAG, '1');
  } catch {
    return;
  }
  event.preventDefault();
  window.location.reload();
});
window.addEventListener('load', () => {
  window.setTimeout(() => {
    try {
      sessionStorage.removeItem(RELOAD_FLAG);
    } catch {
      /* storage unavailable: nothing to clear */
    }
  }, 10000);
});

// Klaviyo onsite tracking; does nothing unless VITE_KLAVIYO_PUBLIC_KEY is set.
loadKlaviyo();
// Meta, TikTok and Google tags; each loads only when its ID is set, and none
// for shoppers who opted out or whose browser sends Global Privacy Control.
loadAdTags();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
