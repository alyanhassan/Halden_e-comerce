# Halden — Everyday Basics

Halden is a minimal, typography-led menswear e-commerce application. It focuses on enduring essentials: heavyweight French terry hoodies, oxford & poplin shirts, canvas duck pants, and tailored wool trousers. Built with uncompromised design tokens, calm typography, and smooth micro-interactions.

## Tech Stack & Architecture

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 with custom design tokens (`#FEFAE0` Cornsilk, `#FAEDCD` Papaya Whip, `#E9EDC9` Beige, `#CCD5AE` Dry Sage, `#111111` Brand Black)
- **Typography**: Abril Fatface (Display), Archivo Black (CTA / Buttons), Arvo (Slogans), Actor (Body)
- **Motion & Interactions**: Framer Motion / Motion for React + GSAP ScrollTrigger
- **Client Persistence**: LocalStorage service layer for catalog items, stock variants, customer sessions, shopping cart, promo vouchers, and reviews

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to view the store.

3. **Production build**:
   ```bash
   npm run build
   ```

## Store Administration

Halden includes a full in-browser store administration console located at `/admin`.

- **Admin Login URL**: `/admin`
- **Email**: `admin@halden.com`
- **Password**: `Halden@2026`

### Admin Capabilities:
- **Product Management**: Add new garments, edit descriptions, adjust prices, edit image URLs, update sizing & colorways.
- **Inventory Matrix**: Real-time stock counts by size and color variant with out-of-stock indicators.
- **Order Dispatch**: Review customer orders, update order status (`Placed` → `Processing` → `Shipped` → `Out for delivery` → `Delivered`), and synchronize status history with customer order tracking (`/track`).
- **Customer Reviews**: Moderate pending customer reviews, approve or reject submissions, and toggle featured reviews shown in the homepage testimonials marquee.
- **Demo Reset**: Click "Reset Demo Data" to restore original catalog items, variant stock counts, and reviews at any time.

## Deployment to Vercel

The repository includes `vercel.json` with client-side routing rewrites:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

To deploy:
1. Push this repository to GitHub or GitLab.
2. Import the project into Vercel.
3. Framework Preset: **Vite**.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Click **Deploy**. Inner routes (`/shop`, `/collections/*`, `/product/*`, `/admin`, `/checkout`, etc.) will hydrate properly on direct visits and browser refreshes.

## Photography

All product and editorial imagery use fixed free stock photography from Pexels, sized cleanly through CDN parameters. Attribution is provided in the footer small print linking to [Pexels](https://www.pexels.com).
