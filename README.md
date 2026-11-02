# 🎬 StudioSpace — Creative Space Booking Platform

StudioSpace is a modern peer-to-peer marketplace where creators, photographers, filmmakers, podcasters, and musicians can discover and book professional creative spaces.

From photography studios and film stages to podcast rooms and music recording suites, StudioSpace makes finding and reserving the perfect creative workspace simple and convenient.

## 🌐 Live Website

**Live Site:** [Add Your Deployed Website URL Here]

**Frontend Repository:** [Add Your GitHub Repository URL]

**Backend Repository:** [Add Your Backend Repository URL if available]

---

## ✨ Key Features

- **Authentication System:** Secure user authentication with Better Auth, including Email/Password and Google Social Login.
- **Dynamic Navbar:** Responsive sticky navigation with user profile, dropdown menu, dashboard, and logout functionality.
- **Explore Studios:** Browse creative spaces with category filtering, studio information, and pricing.
- **Studio Details:** View studio galleries, descriptions, amenities, host information, and customer reviews.
- **Booking System:** Reserve creative spaces through an interactive multi-step booking process.
- **My Bookings:** View personal reservations, booking details, and booking status.
- **Cancel Booking:** Cancel eligible pending reservations with confirmation and toast notifications.
- **User Dashboard:** View booking history, reservation statistics, and account information.
- **Responsive Design:** Optimized layouts for desktop, tablet, and mobile devices.
- **Modern UI:** Premium interface with smooth animations, interactive cards, and loading skeletons.
- **Toast Notifications:** User-friendly success and error notifications using Sonner.

## 🛠️ Technology Stack

### Frontend
- Next.js 16 (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React
- Sonner
- Better Auth Client

### Backend & Database
- Next.js API Routes
- MongoDB Atlas
- MongoDB Native Driver
- Better Auth MongoDB Adapter

### Authentication
- Better Auth
- Google OAuth
- Email & Password Authentication
- HTTPOnly Session Cookies

### Tools & Services
- Git & GitHub
- Vercel
- Google Cloud Console
- MongoDB Atlas

## 📂 Project Structure

```text
studiospace/
├── public/
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── bookings/
│   │   │   └── studios/
│   │   │
│   │   ├── login/
│   │   ├── register/
│   │   ├── dashboard/
│   │   │   └── listings/
│   │   ├── bookings/
│   │   ├── studios/
│   │   │   └── [id]/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── layout/
│   │   ├── studios/
│   │   ├── bookings/
│   │   └── ui/
│   │
│   └── lib/
│       ├── auth.ts
│       ├── auth-client.ts
│       └── mongo.ts
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

*Note: This structure represents the main application areas. Your actual project may contain additional files and components.*

## ⚙️ Installation & Setup

Follow these steps to run StudioSpace locally.

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Navigate to the Project Folder

```bash
cd studiospace
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env.local` file in the project root.

Add your own credentials:

```env
# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Better Auth
BETTER_AUTH_SECRET=YOUR_SECRET_KEY
BETTER_AUTH_URL=http://localhost:3000

# MongoDB
MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING
DB_NAME=studiospace

# Google OAuth
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
```

**Important:** Use the exact environment variable names configured in your source code. Never commit `.env.local` or expose database credentials or OAuth secrets on GitHub.

### 5. Run the Development Server

```bash
npm run dev
```

Open your browser:

```text
http://localhost:3000
```

### 6. Build for Production

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

## 🗺️ Main Application Routes

| Route | Description | Access |
|---|---|---|
| `/` | Home Page | Public |
| `/login` | User Login | Public |
| `/register` | User Registration | Public |
| `/studios` | Explore Studios | Public |
| `/studios/[id]` | Studio Details | Public |
| `/studios/new` | Add New Studio | Protected |
| `/dashboard` | User Dashboard | Protected |
| `/dashboard/listings` | My Studio Listings | Protected |
| `/bookings` | My Bookings | Protected |

## 🗄️ Database

StudioSpace uses MongoDB Atlas to store application data.

Main collections include:

- `studios` — Studio information and listing details.
- `bookings` — Reservation information and booking status.
- Better Auth collections — User accounts and authentication sessions.

## 🔐 Authentication & Security

- Better Auth manages user authentication.
- Google OAuth enables social login.
- Email and password authentication is supported.
- HTTPOnly session cookies help protect authentication sessions.
- Server-side session verification protects private application routes and API operations.
- Booking operations verify the authenticated user's ownership.

## 🧪 Examiner Test Credentials

**User Account 1**

- Email: [Add Examiner Test Email]
- Password: [Add Examiner Test Password]

**Note:** Create a dedicated test account and provide working credentials to the examiner. Never use your personal account credentials.

## 🚀 Future Improvements

- Complete Studio Listing CRUD operations.
- Host-side booking status management.
- JWT authentication with HTTPOnly cookies for protected mutations.
- MongoDB-based double-booking prevention.
- Complete Light/Dark theme customization.
- PDF booking invoice generation.
- Saved Studios Wishlist.

## 📌 Assignment Information

**Project Name:** StudioSpace

**Assignment:** B14-A8-Cat_Harry

**Project Type:** Creative Studio Booking Marketplace

**Primary Goal:** Connect creative professionals with suitable studio spaces through an easy-to-use booking platform.

## 👨‍💻 Developer

**Developer:** Bayezid Hosen

**GitHub:** [Bayezidhosen](https://github.com/Bayezidhosen)

---

⭐ If you like this project, consider giving it a star on GitHub!