# Зв'язок — Google Auth + Vercel API + Supabase: інструкція впровадження

Ця інструкція адаптована під **реальний код** цього репозиторію (React + Vite + TS + Tailwind v4 + i18next), а не під абстрактний приклад.

## Головні відмінності від загального ТЗ (прочитай першим)

Твоя гра зберігає прогрес **окремо для кожного типу гри** як масив **індексів** карток
(`Record<gameType, number[]>`, ключ localStorage `zvyazok_progress`, див. [utils.ts](src/utils.ts)).
Картки мовно-незалежні (індекс N — та сама картка у будь-якій локалі). Тому:

| Поле в ТЗ | Як реалізуємо тут |
|---|---|
| `used_cards: string[]` | `used_cards: jsonb` = весь мапінг `{ warmth: [0,3], touch: [1] }` (та сама форма, що вже в localStorage) |
| `current_block` | останній обраний `gameType` (`warmth`/`relationship`/`touch`/`parenthood`/`spark`) |
| `last_card_id` | індекс останньої відкритої картки (як рядок) |
| `game_status` | `not_started` \| `in_progress` \| `finished` |

Це зберігає чинну механіку гри без переписування `loadSeenCards`/`saveSeenCards`.

---

## Короткий план

1. **Supabase**: таблиця `public.users` (SQL нижче).
2. **Backend** (`/api` в цьому ж репо, деплой на Vercel): `POST /api/me`, `POST /api/save-progress`, спільні утиліти CORS / Google / Supabase.
3. **Frontend**: Google Identity через `@react-oauth/google`, `AuthContext`, кнопка входу, екран «доступ не відкрито», відновлення прогресу з сервера, дзеркалення прогресу на сервер.
4. **Env**: окремо для backend (Vercel) і frontend (Vite).
5. **Деплой**: Supabase → Vercel backend → frontend hosting.
6. **Чеклист** перевірки.

Безпека (незмінні правила):
- Frontend надсилає **тільки Google ID Token**. Email/sub backend дістає сам з verified token.
- `SUPABASE_SERVICE_ROLE_KEY` — тільки в Vercel env, ніколи у frontend bundle.
- `is_paid` змінюється тільки вручну в Supabase (поки що). Frontend не може його міняти.

---

## 1. Supabase — SQL

У Supabase → SQL Editor виконай:

```sql
create extension if not exists "pgcrypto";

create table public.users (
  id uuid primary key default gen_random_uuid(),

  google_sub text unique not null,
  email      text not null,
  name       text,

  is_paid     boolean not null default false,
  game_status text    not null default 'not_started',

  used_cards    jsonb not null default '{}'::jsonb,  -- { "warmth": [0,3], "touch": [1] }
  current_block text,                                -- останній gameType
  last_card_id  text,                                -- індекс останньої картки (рядком)

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  last_login_at timestamptz
);

-- Доступ тільки через service role (backend). RLS вмикаємо і НЕ додаємо політик,
-- тож anon/authenticated ключі нічого не бачать. Service role обходить RLS.
alter table public.users enable row level security;
```

> Примітка: `used_cards` за замовчуванням `'{}'` (об'єкт-мапа), а не `'[]'`, бо прогрес у нас по-типовий.

---

## 2. Backend для Vercel

### 2.1 Розташування

Створи теку `api/` у **корені цього репо**. Vercel автоматично перетворює кожен файл у `api/*.ts` на serverless function. Файли, що починаються з `_`, не стають ендпойнтами — туди кладемо утиліти.

```
api/
  me.ts
  save-progress.ts
  _utils/
    cors.ts
    google.ts
    supabase.ts
    types.ts
```

### 2.2 Пакети

```bash
npm install google-auth-library @supabase/supabase-js
npm install -D @vercel/node
```

### 2.3 `api/_utils/cors.ts`

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Дозволяємо запити тільки з нашого frontend-домену (FRONTEND_ORIGIN).
 * Повертає true, якщо це OPTIONS preflight і відповідь уже надіслано —
 * у такому разі handler має просто завершитись.
 */
export function applyCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = process.env.FRONTEND_ORIGIN ?? '';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}
```

### 2.4 `api/_utils/google.ts`

```ts
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export interface GoogleUser {
  sub: string;
  email: string;
  name?: string;
}

/** Перевіряє Google ID Token і повертає верифіковані дані. Кидає помилку, якщо токен невалідний. */
export async function verifyGoogleToken(idToken: string): Promise<GoogleUser> {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) {
    throw new Error('Invalid Google token payload');
  }

  return { sub: payload.sub, email: payload.email, name: payload.name };
}
```

### 2.5 `api/_utils/supabase.ts`

```ts
import { createClient } from '@supabase/supabase-js';

// Service role — повний доступ, обходить RLS. Тільки на backend!
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
```

### 2.6 `api/_utils/types.ts`

```ts
export interface UserRow {
  id: string;
  google_sub: string;
  email: string;
  name: string | null;
  is_paid: boolean;
  game_status: string;
  used_cards: Record<string, number[]>;
  current_block: string | null;
  last_card_id: string | null;
}

/** Форма, яку віддаємо на frontend. */
export interface UserState {
  email: string;
  name?: string;
  isPaid: boolean;
  gameStatus: string;
  usedCards: Record<string, number[]>;
  currentBlock: string | null;
  lastCardId: string | null;
}

export function toUserState(row: UserRow): UserState {
  return {
    email: row.email,
    name: row.name ?? undefined,
    isPaid: row.is_paid,
    gameStatus: row.game_status,
    usedCards: row.used_cards ?? {},
    currentBlock: row.current_block,
    lastCardId: row.last_card_id,
  };
}
```

### 2.7 `api/me.ts`

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCors } from './_utils/cors';
import { verifyGoogleToken } from './_utils/google';
import { supabase } from './_utils/supabase';
import { toUserState, type UserRow } from './_utils/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const idToken = req.body?.idToken as string | undefined;
  if (!idToken) return res.status(400).json({ error: 'Missing idToken' });

  let google;
  try {
    google = await verifyGoogleToken(idToken);
  } catch {
    return res.status(401).json({ error: 'Invalid Google token' });
  }

  try {
    const { data: existing, error: selErr } = await supabase
      .from('users')
      .select('*')
      .eq('google_sub', google.sub)
      .maybeSingle<UserRow>();
    if (selErr) throw selErr;

    if (existing) {
      const { data: updated, error: updErr } = await supabase
        .from('users')
        .update({
          email: google.email,
          name: google.name ?? null,
          last_login_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('google_sub', google.sub)
        .select('*')
        .single<UserRow>();
      if (updErr) throw updErr;
      return res.status(200).json({ user: toUserState(updated) });
    }

    const { data: created, error: insErr } = await supabase
      .from('users')
      .insert({
        google_sub: google.sub,
        email: google.email,
        name: google.name ?? null,
        is_paid: false,
        game_status: 'not_started',
        used_cards: {},
        last_login_at: new Date().toISOString(),
      })
      .select('*')
      .single<UserRow>();
    if (insErr) throw insErr;

    return res.status(200).json({ user: toUserState(created) });
  } catch (e) {
    console.error('me error', e);
    return res.status(500).json({ error: 'Database error' });
  }
}
```

### 2.8 `api/save-progress.ts`

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCors } from './_utils/cors';
import { verifyGoogleToken } from './_utils/google';
import { supabase } from './_utils/supabase';
import type { UserRow } from './_utils/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { idToken, usedCards, currentBlock, lastCardId, gameStatus } = req.body ?? {};
  if (!idToken) return res.status(400).json({ error: 'Missing idToken' });

  let google;
  try {
    google = await verifyGoogleToken(idToken);
  } catch {
    return res.status(401).json({ error: 'Invalid Google token' });
  }

  try {
    const { data: user, error: selErr } = await supabase
      .from('users')
      .select('is_paid')
      .eq('google_sub', google.sub)
      .maybeSingle<Pick<UserRow, 'is_paid'>>();
    if (selErr) throw selErr;

    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.is_paid) return res.status(403).json({ error: 'Not paid' });

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (usedCards !== undefined) patch.used_cards = usedCards;
    if (currentBlock !== undefined) patch.current_block = currentBlock;
    if (lastCardId !== undefined) patch.last_card_id = lastCardId;
    if (gameStatus !== undefined) patch.game_status = gameStatus;

    const { error: updErr } = await supabase
      .from('users')
      .update(patch)
      .eq('google_sub', google.sub);
    if (updErr) throw updErr;

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('save-progress error', e);
    return res.status(500).json({ error: 'Database error' });
  }
}
```

> `is_paid` ніколи не береться з тіла запиту — лише читається з БД для перевірки доступу.

---

## 3. Environment variables

### Backend (Vercel → Project Settings → Environment Variables)

```
GOOGLE_CLIENT_ID=<твій OAuth Client ID>.apps.googleusercontent.com
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role key з Supabase → Settings → API>
FRONTEND_ORIGIN=https://<твій frontend домен>
```

### Frontend (`.env.local`, **не комітити** — `.env*` уже в [.gitignore](.gitignore))

```
VITE_API_URL=https://<твій-vercel-api>.vercel.app
VITE_GOOGLE_CLIENT_ID=<той самий Client ID>.apps.googleusercontent.com
```

Додай `.env.example` (його комітити можна — є виняток у .gitignore):

```
VITE_API_URL=
VITE_GOOGLE_CLIENT_ID=
```

Розшир типи Vite — заміни вміст [src/vite-env.d.ts](src/vite-env.d.ts):

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

---

## 4. Frontend — Google Auth

### 4.1 Пакет

```bash
npm install @react-oauth/google
```

(Найпростіший варіант під React+Vite; обгортає офіційний Google Identity Services.)

### 4.2 Типи — `src/auth/types.ts`

```ts
export interface UserState {
  email: string;
  name?: string;
  isPaid: boolean;
  gameStatus: string;
  usedCards: Record<string, number[]>;
  currentBlock: string | null;
  lastCardId: string | null;
}
```

### 4.3 API-функції — `src/auth/authApi.ts`

```ts
import type { UserState } from './types';

const API = import.meta.env.VITE_API_URL;

export async function fetchMe(idToken: string): Promise<UserState> {
  const res = await fetch(`${API}/api/me`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `me failed: ${res.status}`);
  }
  const data = (await res.json()) as { user: UserState };
  return data.user;
}
```

### 4.4 Прогрес — `src/game/gameApi.ts`

```ts
const API = import.meta.env.VITE_API_URL;

export interface SaveProgressInput {
  idToken: string;
  usedCards: Record<string, number[]>;
  currentBlock?: string;
  lastCardId?: string;
  gameStatus?: string;
}

export async function saveProgress(input: SaveProgressInput): Promise<void> {
  const res = await fetch(`${API}/api/save-progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `save-progress failed: ${res.status}`);
  }
}
```

### 4.5 Контекст авторизації — `src/auth/AuthContext.tsx`

Цей контекст стає єдиним джерелом правди для `paid` (замінює localStorage-флаг). Він тримає `idToken`, дані користувача та статуси.

```tsx
import {
  createContext, useCallback, useContext, useState, type ReactNode,
} from 'react';
import { fetchMe } from './authApi';
import type { UserState } from './types';

export type AuthStatus = 'idle' | 'loading' | 'authed' | 'error';

interface AuthContextValue {
  status: AuthStatus;
  user: UserState | null;
  idToken: string | null;
  error: string | null;
  paid: boolean;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
  setUser: (u: UserState) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<AuthStatus>('idle');
  const [user, setUser] = useState<UserState | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loginWithGoogle = useCallback(async (token: string) => {
    setStatus('loading');
    setError(null);
    try {
      const u = await fetchMe(token);
      setIdToken(token);
      setUser(u);
      setStatus('authed');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Auth failed');
      setStatus('error');
    }
  }, []);

  const logout = useCallback(() => {
    setIdToken(null);
    setUser(null);
    setStatus('idle');
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        status, user, idToken, error,
        paid: user?.isPaid ?? false,
        loginWithGoogle, logout, setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
```

> Зауваж: Google ID Token живе ~1 годину. Для MVP цього достатньо. Якщо потрібна тривала сесія між перезавантаженнями — пізніше додай збереження refresh-флоу або власний сесійний токен. Поки що при перезавантаженні користувач входить знову (кнопка Google).

### 4.6 Кнопка входу — `src/auth/GoogleLoginButton.tsx`

```tsx
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from './AuthContext';

export const GoogleLoginButton = () => {
  const { loginWithGoogle } = useAuth();
  return (
    <GoogleLogin
      onSuccess={(cred) => {
        if (cred.credential) loginWithGoogle(cred.credential);
      }}
      onError={() => console.error('Google login failed')}
    />
  );
};
```

`cred.credential` — це і є Google **ID Token** (JWT), який ми шлемо на backend.

### 4.7 Підключення провайдерів — `src/main.tsx`

Обгорни гру у `GoogleOAuthProvider` + `AuthProvider`. Решту routing-логіки лиши як є.

```tsx
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './auth/AuthContext';
// ...решта імпортів без змін

// у default-гілці switch:
return (
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <AuthProvider>
      <PaymentProvider>
        <App />
      </PaymentProvider>
    </AuthProvider>
  </GoogleOAuthProvider>
);
```

---

## 5. Інтеграція в наявну гру

### 5.1 Гейт доступу

Зараз `paid` бере [PaymentContext.tsx](src/payment/PaymentContext.tsx) з localStorage. Тепер джерело правди — сервер. Два варіанти:

- **Простий (рекомендований для MVP):** у [App.tsx](src/App.tsx) заміни `const { paid } = usePayment()` на `const { status, paid, user } = useAuth()` і додай гілки рендеру (нижче). WayForPay/`startPayment` лишаються для майбутньої автоматизації, але доступ вирішує серверний `isPaid`.
- Якщо хочеш зберегти `usePayment()` API — зроби, щоб `PaymentProvider` читав `paid` з `useAuth()` замість localStorage.

Гілки головного екрана (псевдо-розмітка для [App.tsx](src/App.tsx)):

```tsx
const { status, paid, error } = useAuth();

if (status === 'idle')    return <ЕкранЗКнопкою />;          // <GoogleLoginButton />
if (status === 'loading') return <Loader />;                 // t('ui.auth.loading')
if (status === 'error')   return <AuthError message={error} />;
if (status === 'authed' && !paid) return <NotPaidScreen />;  // текст нижче
// status === 'authed' && paid → звичайна гра
```

Екран «не оплачено» (додай ключі в [ru.json](src/locales/ru.json)/[uk.json](src/locales/uk.json)):

> **Доступ до гри ще не відкрито.**
> Якщо ви вже оплатили гру, спробуйте увійти через той самий Google-акаунт.

### 5.2 Відновлення прогресу при вході

Після `status === 'authed' && paid` — залий серверний прогрес у наявний механізм
([utils.ts](src/utils.ts) `saveSeenCards`), щоб гра «побачила» його як звичайний localStorage:

```tsx
import { useEffect } from 'react';
import { saveSeenCards } from './utils';

useEffect(() => {
  if (status !== 'authed' || !user) return;
  Object.entries(user.usedCards).forEach(([type, seen]) => {
    saveSeenCards(type, seen);  // тепер selectGameType підхопить це через loadSeenCards
  });
}, [status, user]);
```

Так нічого в механіці карток ([App.tsx](src/App.tsx) `selectGameType`/`revealCard`) міняти не треба — вона вже читає прогрес через `loadSeenCards`.

### 5.3 Збереження прогресу (оптимально, не щокартки)

У [App.tsx](src/App.tsx), у `revealCard`, прогрес уже пишеться в localStorage. Додай батч-синк на сервер. Тримай лічильник у `useRef` і шли раз на N карток / при зміні блоку / при завершенні.

```tsx
import { useRef } from 'react';
import { saveProgress } from './game/gameApi';
import { loadSeenCards } from './utils';

const { idToken } = useAuth();
const sinceSyncRef = useRef(0);
const SYNC_EVERY = 4; // 3–5 карток

// helper збирає весь мапінг прогресу так само, як зберігає localStorage
function collectUsedCards(): Record<string, number[]> {
  return GAME_TYPES.reduce((acc, type) => {
    acc[type] = loadSeenCards(type);
    return acc;
  }, {} as Record<string, number[]>);
}

function syncProgress(gameType: string, lastIndex: number, finished: boolean) {
  if (!idToken) return;
  saveProgress({
    idToken,
    usedCards: collectUsedCards(),
    currentBlock: gameType,
    lastCardId: String(lastIndex),
    gameStatus: finished ? 'finished' : 'in_progress',
  }).catch((e) => console.error('progress sync failed', e)); // тихо, не ламаємо гру
}
```

Виклики в наявних колбеках:
- у `revealCard` після `saveSeenCards(...)`: `sinceSyncRef.current++; if (sinceSyncRef.current >= SYNC_EVERY) { sinceSyncRef.current = 0; syncProgress(gameType, nextIndex, false); }`
- при завершенні (`remaining.length === 0` → `setIsFinished(true)`): `syncProgress(gameType, last, true)`
- у `selectGameType`/`backToGameType` (зміна блоку): `if (sinceSyncRef.current > 0) { sinceSyncRef.current = 0; syncProgress(prevType, last, false); }`

Помилки синку **не повинні ламати гру** — завжди `.catch` і лог.

### 5.4 Стани, які бачить користувач

- `loading` — спінер під час `/api/me`.
- `auth error` — «Не вдалося увійти, спробуйте ще раз».
- `access denied / not paid` — екран із 5.1.
- `game available` — звичайна гра + відновлений прогрес.
- backend недоступний → `fetch` кине помилку → status `error`.

---

## 6. Структура файлів (підсумок)

```
api/
  me.ts
  save-progress.ts
  _utils/{cors,google,supabase,types}.ts
src/
  auth/{AuthContext.tsx,GoogleLoginButton.tsx,authApi.ts,types.ts}
  game/gameApi.ts
  (зміни в) main.tsx, App.tsx, vite-env.d.ts, locales/*.json
.env.example
```

---

## 7. Деплой

### 7.1 Google Cloud (OAuth Client ID)
1. console.cloud.google.com → APIs & Services → Credentials → **Create OAuth client ID** → *Web application*.
2. **Authorized JavaScript origins**: `http://localhost:5173` (dev) і твій frontend-домен.
3. Скопіюй **Client ID** → у `GOOGLE_CLIENT_ID` (Vercel) і `VITE_GOOGLE_CLIENT_ID` (frontend).

### 7.2 Supabase
1. Створи проєкт → SQL Editor → виконай SQL з розділу 1.
2. Settings → API: скопіюй **Project URL** (`SUPABASE_URL`) і **service_role** key (`SUPABASE_SERVICE_ROLE_KEY`).

### 7.3 Vercel backend
1. Import цього репо у Vercel.
2. Project Settings → Environment Variables: додай `GOOGLE_CLIENT_ID`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `FRONTEND_ORIGIN`.
3. Deploy. Перевір: `POST https://<api>.vercel.app/api/me` з валідним токеном повертає `{ user }`.
   - Якщо деплоїш цей же репо і як статику на Vercel — `/api/*` й dist уживаються в одному проєкті. Якщо frontend хостиш окремо — backend-проєкту достатньо теки `api/` (статику Vercel згенерує, але вона не використовується).

### 7.4 Frontend hosting (як і раніше — статичний `dist`)
1. `.env.local` з `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`.
2. `npm run build` → залий `dist/` на свій хостинг.
3. Переконайся, що домен фронту = `FRONTEND_ORIGIN` у Vercel (інакше CORS заблокує).

---

## 8. Чеклист після деплою

- [ ] Кнопка «Увійти через Google» працює, з'являється акаунт-пікер.
- [ ] Після входу frontend отримує `credential` (ID Token) і шле на `/api/me`.
- [ ] Перший вхід створює рядок у `public.users` з `is_paid = false`.
- [ ] При `is_paid = false` гра не відкривається — показано екран «доступ не відкрито».
- [ ] Ставимо `is_paid = true` вручну в Supabase → повторний вхід → гра відкрита.
- [ ] Прохід карток оновлює `used_cards` / `current_block` / `last_card_id` у Supabase.
- [ ] Вхід з іншого браузера/пристрою тим самим акаунтом → прогрес відновлено.
- [ ] У `dist/` немає `SUPABASE_SERVICE_ROLE_KEY` (перевір: `grep -r service_role dist/` → порожньо).
- [ ] CORS: запити з чужого домену блокуються; з `FRONTEND_ORIGIN` — проходять; `OPTIONS` повертає 204.
- [ ] Помилки (немає idToken → 400, невалідний токен → 401, не знайдено → 404, не оплачено → 403) повертають правильні коди.
- [ ] Make.com / Notion не використовуються. Stripe/WayForPay-вебхук — на майбутнє, зараз не потрібен.
```
