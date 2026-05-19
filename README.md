# Mossi Shop

Aplicacion de inventario y pagos para Mossi Shop.

## Desarrollo

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

El sitio de produccion se genera en `dist`.

## Vercel

El proyecto incluye `vercel.json` con:

- build command: `npm run build`
- output directory: `dist`
- SPA rewrite: `/(.*)` hacia `/index.html`

## Supabase

Configura estas variables en Vercel:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Ejecuta `supabase/schema.sql` en Supabase para crear la tabla de sincronizacion.
