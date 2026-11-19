# Zeller CRM — Custom E-Commerce Sales, Inventory & Dispatch Platform

Full-stack internal CRM built with **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS 4**, and **Supabase (Auth + PostgreSQL)** for direct-to-consumer e-commerce operations (*Caminos 1524*).

---

## Core Modules

| Route / Component | Capabilities Implemented |
| :--- | :--- |
| **`/` (`app/page.tsx`)** | Role-aware dashboard (`admin` vs. `vendedor` via `profiles.role`), total sales revenue, total stock units, admin inventory valuation, customer count, and tiered commission brackets based on pairs sold. |
| **`/ventas` (`app/ventas/page.tsx`)** | Fast order entry filtering live in-stock SKUs (`stock > 0`) and customer records. |
| **`/inventario` (`app/inventario/page.tsx`)** | Live catalog search (`model`, `sku`, `color`, `size`), direct sale drawer with real-time Supabase `products.stock` decrement, and stock guardrails. |
| **`/logistica` (`app/logistica/page.tsx`)** | Real-time fulfillment dispatch board joining `sales`, `products`, and `customers` (`PENDIENTE` → `LISTO PARA DESPACHO`). |
| **`/clientes` (`app/clientes/page.tsx`)** | Customer registry and search connected to outbound sales follow-up. |
| **`components/CierreDia.tsx`** | End-of-day shift closeout modal summarizing pairs sold, commission earned, and print-ready PDF receipt export. |

---

## Tech Stack

- **Frontend:** Next.js `16.1.6` (App Router), React `19.2.3`, TypeScript, Lucide React, Tailwind CSS v4
- **Backend / Database:** Supabase Auth & PostgreSQL (`@supabase/supabase-js`)
- **Upstream Ecosystem:** Pairs directly with the FastAPI + Gemini 2.5 + Chatwoot omnichannel sales agent documented in [`jarexlp/pm-operations-portfolio`](https://github.com/jarexlp/pm-operations-portfolio).

---

## Local Setup

```bash
npm install
# Create .env.local with:
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
npm run dev
```
