# Ghana Auto Dealership Platform

A complete, full-stack car sales dealership, inventory management, test-drive booking, and WhatsApp conversion platform built for automotive dealerships operating in Ghana.

## Architecture & Technology Stack

- **Frontend**: React 19, TypeScript, React Router, Tailwind CSS (`Outfit`, `Plus Jakarta Sans`, `JetBrains Mono`)
- **Backend**: Node.js + Express (`server.ts`)
- **Database**: Cloud SQL for PostgreSQL managed via **Drizzle ORM** (`src/db/schema.ts`, `src/db/index.ts`)
- **Authentication**: Firebase Authentication (Google Sign-In on client + `firebase-admin` token verification on backend)
- **SEO**: Dynamic page titles/descriptions, OpenGraph & Twitter cards, Schema.org `AutoDealer` & `Car` JSON-LD structured data, `/sitemap.xml`, and `/robots.txt`

## Key Features

1. **Homepage (`/`)**:
   - Storefront hero with quick search bar (Keyword, Make, Body Type, Max Price in GH₵)
   - Featured Vehicles and Recently Added Vehicles toggle
   - Body Type category filter (`SUV`, `Sedan`, `Pickup`, `Hatchback`, `Luxury`, `Coupe`, `Van`)
   - 4-Step Buying & Inspection Process in Ghana
   - Conditional Partner Financing & Verified Customer Testimonials (displayed only when genuinely enabled/supplied by the dealership)
2. **Browse Inventory (`/inventory`)**:
   - Database-driven search and combined filters (Make, Model, Min/Max Price in GH₵, Body Type, Min/Max Year, Condition, Transmission, Fuel Type, Drivetrain, Max Mileage, Import Status, Availability)
   - Sorting (Newest, Price Low-to-High, Price High-to-Low, Year, Mileage), Grid/List views, Pagination, and Shareable Search URLs
3. **Individual Vehicle Details (`/vehicles/:slug`)**:
   - Multi-photo gallery with thumbnails and full-size Lightbox viewer
   - Asking price in GH₵ (with discount display), customs/import status, and availability badge
   - Prefilled WhatsApp inquiry button containing the vehicle's make, model, year, GH₵ price, and URL
   - On-page **Purchase / Pro-Forma / Trade-In Inquiry** form and **Test-Drive Appointment** form (with past-date validation)
   - Similar vehicles dynamically queried from PostgreSQL
4. **Services (`/services`), About Us (`/about`), FAQs (`/faq`), Contact (`/contact`), Privacy (`/privacy`), and Terms (`/terms`)**
5. **Protected Admin Dashboard (`/admin`)**:
   - Enforces Firebase Google Authentication and backend `Bearer` token validation (`src/middleware/auth.ts`)
   - Live database statistics & audit log
   - 1-click **Remove All Sample Vehicles** prior to launch (or restore sample vehicles for testing)
   - Full Vehicle & Multi-Photo Gallery CRUD (device image upload, URL/preset addition, image reordering, draft/publish states, sold visibility policy)
   - Customer Inquiries & Test-Drive Requests CRM with status updates, private staff notes, direct WhatsApp/phone/email reply links, and **CSV Export**
   - Full Content Management System (CMS) for Business Information placeholders (`[DEALERSHIP NAME]`, `[CITY, GHANA]`, `[PHONE NUMBER]`, `[WHATSAPP NUMBER]`, etc.), Services, FAQs, Testimonials, and SEO settings

## Setup & Deployment Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Push PostgreSQL Schema**:
   Ensure `SQL_HOST`, `SQL_DB_NAME`, `SQL_ADMIN_USER`, and `SQL_ADMIN_PASSWORD` are set, then apply `src/db/schema.ts` via Drizzle Kit.
3. **Development Server**:
   ```bash
   npm run dev
   ```
   Starts the full-stack Express + Vite server on port `3000`.
4. **Production Build & Start**:
   ```bash
   npm run build
   npm run start
   ```

## External Services & Optional Configuration

- **Google Cloud SQL (PostgreSQL)** & **Firebase Authentication**: Provisioned and configured via `firebase-applet-config.json` and `SQL_*` runtime environment variables.
- **Transactional Email Notifications (Optional)**: Set `EMAIL_NOTIFICATIONS_ENABLED="true"`, `RESEND_API_KEY`, and `DEALERSHIP_NOTIFICATION_EMAIL` in `.env` to send email alerts on every new inquiry or test-drive booking.
- **Google Maps Embed (Optional)**: Paste your verified Google Maps iframe `src` URL in **Admin Dashboard → Business Info, CMS & SEO** to display an interactive map on `/contact`.
- **Database Backups & Recovery**: Point-in-time recovery and automated daily snapshots are managed at the Cloud SQL instance level. Administrators can also export inquiry records to CSV directly from `/admin`.
