import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { LegalPage } from './components';
import { PaymentProvider } from './payment/PaymentContext';
import './i18n';
import './styles.css';

// Lightweight path-based routing. The legal links open in a new tab (a full
// page load), so we only need to pick the right top-level view at mount time —
// no client-side router is required. Vite's SPA fallback serves index.html for
// these paths in dev and preview.
const path = window.location.pathname.replace(/\/+$/, '') || '/';

function Root() {
  switch (path) {
    case '/privacy-policy':
      return <LegalPage docKey='privacy' />;
    case '/oferta':
      return <LegalPage docKey='oferta' />;
    default:
      return (
        <PaymentProvider>
          <App />
        </PaymentProvider>
      );
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
