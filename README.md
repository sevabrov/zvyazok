# Truth or Dare — React + TypeScript + Vite + Tailwind v4

Мини-игра “Правда или Действие” для двоих.

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS v4
- lucide-react

## Запуск

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Где менять карты

Файл:

```txt
src/cards.ts
```

Массивы:

```ts
truthCards
dareCards
```

## Tailwind v4

Проект использует официальный Vite-плагин Tailwind:

```ts
// vite.config.ts
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

И один импорт в CSS:

```css
@import "tailwindcss";
```
