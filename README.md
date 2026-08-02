# Postal Business Manager 📬

[![Live Demo](https://img.shields.io/badge/Live%20Demo-https%3A%2F%2Fpostal--business--manager.vercel.app%2F-blue?style=for-the-badge&logo=vercel)](https://postal-business-manager.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)

> **Live Deployment:** [https://postal-business-manager.vercel.app/](https://postal-business-manager.vercel.app/)

**Postal Business Manager** is a modern, mobile-first web application engineered to streamline postal operations, track postal officials, monitor business contributions, analyze **PLI (Postal Life Insurance)** and **RPLI (Rural Postal Life Insurance)** policy metrics, and provide real-time analytical reports with role-based access control.

---

## 🌟 Key Features

### 🛡️ 1. PLI & RPLI Insurance Particulars
- **Policy Tracking**: Track Date, Official Name, Office of Indexing, Insurance Type (`PLI` / `RPLI`), Sum Assured, and Initial Premium.
- **KPI Metrics**: Real-time summary cards for Total Sum Assured, Total Initial Premium, PLI Count, and RPLI Count.
- **Distribution Analytics**: Interactive PLI vs RPLI distribution progress bar and top indexing offices ranking.
- **Insurance Champions Leaderboard**: Highlights top performing postal officials based on policy volume and total sum assured.

### 👥 2. Postal Officials Directory
- **Official Records**: Manage official names, designations, office assignments, contact numbers, and status (`ACTIVE` / `INACTIVE`).
- **Flexible Sorting & Search**: Multi-column sorting, real-time instant search, and customizable page-size selectors (**10**, **20**, **30**, **50**, **100** rows per page).

### 📈 3. Account Contributions Tracking
- **Business Monitoring**: Record daily account opening contributions across various savings and deposit account types.
- **Date Range Filters**: Filter records by custom date ranges (`Start Date` to `End Date`) or quick preset filters (`Last 30 Days`, `Last 90 Days`, `All Time`).

### 📊 4. Reports & CSV Exporting
- **Visual Analytics**: Interactive trend graphs for monthly business growth, top performing offices, and account type breakdowns.
- **One-Click Exports**: Download raw or aggregated reports instantly as `.csv` files for offline processing and government auditing.

### 🔒 5. Role-Based Access Control (RBAC) & User Management
- **Admin Role**: Full system access to Create, Edit, Delete records, and access the **User Access Control** window (`/dashboard/users`) to promote or demote user accounts.
- **Viewer Role**: Strict read-only access for viewing dashboards, tables, metrics, and exporting reports without modifying or deleting data.
- **Admin Role Switcher**: Safety-protected admin panel allowing Administrators to upgrade `Viewer` accounts to `Admin` or demote `Admin` accounts to `Viewer`.

### 🎨 6. Premium UI & Mobile-First Responsive Design
- **Typography System**: Integrated **Plus Jakarta Sans** (headings & UI copy) and **JetBrains Mono** (currency `₹`, counts, and financial metrics).
- **Custom Postal Branding**: Vector `PostalLogo` emblem with Electric Blue, Amber, and Emerald gradient glows.
- **Glassmorphic Aesthetics**: Modern dark glass cards, ambient floating background gradients, custom webkit scrollbars, and pointer hover cursors.
- **Mobile Responsive Navigation**: Drawer sidebar with backdrop blur overlay, touch targets (`min-h-11`), and active route indicators.

---

## 🚀 Tech Stack

| Domain | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router & Turbopack) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) & React 19 |
| **Database** | [MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) & Glassmorphism |
| **Animations** | [GSAP 3](https://gsap.com/) & `@gsap/react` |
| **State & Data Fetching** | [TanStack React Query v5](https://tanstack.com/query) & [Zustand](https://zustand-demo.pmnd.rs/) |
| **Icons & Toast Notifications** | [Lucide React](https://lucide.dev/) & [Sonner](https://sonner.emilkowal.si/) |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 🛠️ Environment Variables

Create a `.env.local` file in the root directory and add the following variables:

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/postal-business-manager?retryWrites=true&w=majority

# JWT Secret for Session Authentication
JWT_SECRET=your_jwt_secret_key_here

# App URL
NEXT_PUBLIC_APP_URL=https://postal-business-manager.vercel.app
```

---

## ⚙️ Local Development Setup

Follow these steps to run the project locally on your machine:

### 1. Clone the Repository
```bash
git clone https://github.com/prasenjitpriyan/postal-business-manager.git
cd postal-business-manager
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 📡 API Architecture & Endpoints

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user account | Public |
| `POST` | `/api/auth/login` | Authenticate user & issue session token | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Authenticated |
| `GET` | `/api/dashboard/stats` | Fetch overall dashboard stats & leaderboard | Authenticated |
| `GET` | `/api/officials` | Fetch paginated list of postal officials | Authenticated |
| `POST` | `/api/officials` | Create a new postal official | Admin |
| `PUT` | `/api/officials/[id]` | Update an existing postal official | Admin |
| `DELETE` | `/api/officials/[id]` | Delete a postal official | Admin |
| `GET` | `/api/contributions` | Fetch account contributions list | Authenticated |
| `POST` | `/api/contributions` | Create an account contribution record | Admin |
| `GET` | `/api/insurance` | Fetch PLI / RPLI insurance contributions | Authenticated |
| `POST` | `/api/insurance` | Create a new PLI / RPLI contribution | Admin |
| `PUT` | `/api/insurance/[id]` | Update PLI / RPLI record | Admin |
| `DELETE` | `/api/insurance/[id]` | Delete PLI / RPLI record | Admin |
| `GET` | `/api/reports/summary` | Fetch analytical report summaries | Authenticated |
| `GET` | `/api/users` | List all registered users | Admin |
| `PATCH` | `/api/users/[id]/role` | Upgrade/Demote user role (`Admin` / `Viewer`) | Admin |

---

## 🔍 SEO & Search Engine Optimization

The project includes built-in SEO enhancements for Google ranking and search indexing:
- **JSON-LD Structured Data**: Embedded `SoftwareApplication`, `Organization`, and `WebSite` with `SearchAction` schema.
- **Open Graph & Twitter Cards**: High-res 1200x630 metadata images, `summary_large_image` Twitter cards, and canonical links.
- **Sitemap & Robots**: Automated `sitemap.xml` listing primary pages and `robots.txt` regulating search crawlers.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
