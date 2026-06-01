/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WAYFORPAY_PAYMENT_URL: string;
  readonly VITE_PAYMENT_PRICE_LABEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
