# ZVYAZOK — React + TypeScript + Vite + Tailwind v4

A mini "Truth or Dare" game for two players.

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS v4
- i18next / react-i18next (localization)
- lucide-react

## Getting started

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Where to edit the cards

File:

```txt
src/cards.ts
```

Arrays:

```ts
truthCards
dareCards
```

## Localization

The app uses `i18next` with `react-i18next`. Translations live in:

```txt
locales/
```

## Tailwind v4

The project uses the official Tailwind Vite plugin:

```ts
// vite.config.ts
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

And a single import in CSS:

```css
@import "tailwindcss";
```
