# Postal Business Manager 📬

[![Live Demo](https://img.shields.io/badge/Live%20Demo-https%3A%2F%2Fpostal--business--manager.vercel.app%2F-blue?style=for-the-badge&logo=vercel)](https://postal-business-manager.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![GSAP](https://img.shields.io/badge/GSAP-Animation_Engine-green?style=for-the-badge&logo=greensock)](https://gsap.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-UI_Motion-purple?style=for-the-badge&logo=framer)](https://motion.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-13AA52?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)

> **Live Deployment:** [https://postal-business-manager.vercel.app/](https://postal-business-manager.vercel.app/)

**Postal Business Manager** is a state-of-the-art operational platform engineered to streamline postal business workflows, track official contributions, oversee **PLI (Postal Life Insurance)** and **RPLI (Rural Postal Life Insurance)** policy performance, and deliver high-impact analytical reports.

Enhanced with a modern developer portfolio motion suite combining **Next.js**, **GSAP**, and **Framer Motion**, the platform offers a fluid, interactive, and high-precision user experience.

---

## 🌟 Key Features

### ✨ 1. Portfolio Motion & Interactive Design Suite
- **SplitText 3D Hero Reveal**: 3D perspective word and character reveal sequence powered by GSAP.
- **Custom Cursor & Spotlight**: Spring-physics trailing cursor with hover element scaling and an ambient background spotlight glow.
- **Scroll Progress Indicator**: Top horizontal gradient progress bar tracking scroll depth across pages.
- **3D Card Hover Tilt**: Dynamic perspective card container calculating `rotateX`, `rotateY`, and mouse glare spotlight reflections on hover.
- **Magnetic Action Buttons**: Physics-based magnetic attraction pulling CTA buttons towards mouse coordinates.
- **Infinite Skills & Tech Marquee**: Seamless horizontal infinite loop showcasing stack technologies and postal modules.
- **Scroll-Triggered Number Counters**: Animated numerical stat counters using exponential easing algorithms.
- **Interactive Workflow Timeline**: Scroll-triggered operational timeline with SVG path drawing and step animations.

### 🛡️ 2. PLI & RPLI Insurance Particulars
- **Policy Tracking**: Track Date, Official Name, Office of Indexing, Insurance Type (`PLI` / `RPLI`), Sum Assured, and Initial Premium.
- **KPI Summary Cards**: Top-right icon aligned cards displaying Total Sum Assured, Total Initial Premium, PLI Count, and RPLI Count formatted cleanly as whole numbers (`₹5,00,000`).
- **Distribution Analytics**: Interactive PLI vs RPLI distribution progress bar and top indexing offices ranking.
- **Insurance Champions Leaderboard**: Highlights top-performing postal officials based on policy volume and total sum assured.

### 👥 3. Postal Officials Directory
- **Streamlined Official Records**: Manage official names, designations, office assignments, contact numbers, and status (`ACTIVE` / `INACTIVE`).
- **Flexible Sorting & Search**: Multi-column sorting, real-time instant search, and customizable page-size selectors (**10**, **20**, **30**, **50**, **100** rows per page).

### 📈 4. Account Contributions Tracking
- **Business Monitoring**: Record daily account opening contributions across savings and deposit account types.
- **Date Range Filters**: Filter records by custom date ranges (`Start Date` to `End Date`) or quick preset filters (`Last 30 Days`, `Last 90 Days`, `All Time`).

### 📊 5. Reports & CSV Exporting
- **Visual Analytics**: Interactive trend graphs for monthly business growth, top performing offices, and account type breakdowns.
- **One-Click Exports**: Download raw or aggregated reports instantly as `.csv` files for offline processing and departmental auditing.

### 🔒 6. Role-Based Access Control (RBAC) & User Management
- **Admin Role**: Full system access to Create, Edit, and Delete records, with administrative access to the **User Access Control** panel (`/dashboard/users`) to manage user roles.
- **Viewer Role**: Read-only access for viewing dashboards, tables, metrics, and exporting reports without mutating data.

---

## 🚀 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router & Turbopack) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) & React 19 |
| **Database** | [MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) & Glassmorphism |
| **Animations** | [GSAP 3](https://gsap.com/), `@gsap/react`, & [Framer Motion](https://motion.dev/) |
| **State & Fetching** | [TanStack React Query v5](https://tanstack.com/query) & [Zustand](https://zustand-demo.pmnd.rs/) |
| **Icons & Notifications** | [Lucide React](https://lucide.dev/) & [Sonner](https://sonner.emilkowal.si/) |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 🛠️ Environment Variables

Create a `.env.local` file in the root directory and add the following variables:

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/postal-business-manager?retryWrites=true&w=majority

# JWT Secret for Session Authentication
JWT_SECRET=your_jwt_secret_key_here

# Public App URL
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

## 🔍 SEO & Public Information Pages

The application implements SEO optimizations and complete public informational pages:
- **Privacy Policy (`/privacy`)**: Data collection, security protocols, JWT encryption, and departmental governance policies.
- **Terms of Service (`/terms`)**: Service terms, Role-Based Access Control rules, and record accuracy requirements.
- **Contact (`/contact`)**: Interactive support messaging form with toast feedback, Central Headquarters location, phone helpline, and operational hours.
- **JSON-LD Structured Data**: Embedded `SoftwareApplication`, `Organization`, and `WebSite` with `SearchAction` schema.
- **Open Graph & Twitter Cards**: High-res metadata cards and canonical URLs.
- **Robots & Dynamic Meta**: Clean semantic HTML hierarchy and accessibility optimization.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
