import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '../auth/AuthContext';

const WAYFORPAY_PAYMENT_URL = 'https://secure.wayforpay.com/button/be2fa005cdbd1';

const PAID_KEY = 'zvyazok_paid';
const SUCCESS_FLAG = 'payment';
// How long the success screen stays before auto-returning to the game.
const REDIRECT_DELAY_MS = 2500;

interface PaymentContextValue {
  /** True once payment has been recorded in localStorage. */
  paid: boolean;
  /** True while the post-payment success screen is shown. */
  showSuccess: boolean;
  /** Redirect the browser to the WayForPay payment page. */
  startPayment: () => void;
}

const PaymentContext = createContext<PaymentContextValue | null>(null);

export const PaymentProvider = ({ children }: { children: ReactNode }) => {
  const { refreshUser } = useAuth();
  const [paid, setPaid] = useState(
    () => localStorage.getItem(PAID_KEY) === 'true',
  );
  const [showSuccess, setShowSuccess] = useState(false);

  // On load, detect the WayForPay return (?payment=success). We treat landing
  // on this URL as proof of payment, store the flag, and show the success
  // screen. The flag is stripped so a refresh or shared link doesn't re-trigger.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get(SUCCESS_FLAG) !== 'success') return;

    localStorage.setItem(PAID_KEY, 'true');
    setPaid(true);
    setShowSuccess(true);

    // Pull the server-confirmed payment state so the game (gated on the backend
    // `isPaid`) unlocks once the success screen auto-dismisses.
    void refreshUser();

    params.delete(SUCCESS_FLAG);
    const clean =
      window.location.pathname +
      (params.toString() ? `?${params}` : '') +
      window.location.hash;
    window.history.replaceState({}, '', clean);
  }, [refreshUser]);

  // Auto-return to the game after the success screen has been shown. Keyed on
  // `showSuccess` (not the URL) so it survives StrictMode's double-mount: the
  // remount strips the URL flag but this still re-arms from state.
  useEffect(() => {
    if (!showSuccess) return;
    const timer = setTimeout(() => setShowSuccess(false), REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [showSuccess]);

  const startPayment = useCallback(() => {
    const url = new URL(WAYFORPAY_PAYMENT_URL);
    // After payment WayForPay sends the user back here with the success flag.
    const returnUrl = `${window.location.origin}${window.location.pathname}?${SUCCESS_FLAG}=success`;
    url.searchParams.set('returnUrl', returnUrl);
    window.location.href = url.toString();
  }, []);

  const value: PaymentContextValue = { paid, showSuccess, startPayment };

  return (
    <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>
  );
};

export const usePayment = (): PaymentContextValue => {
  const ctx = useContext(PaymentContext);
  if (!ctx) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return ctx;
};
