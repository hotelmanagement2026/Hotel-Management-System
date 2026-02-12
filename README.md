# Lumière Luxury Hotels 🏨✨

Lumière Luxury Hotels is a premium hotel booking platform designed to offer a seamless and elegant experience for users looking to book luxury accommodations. The platform features a sophisticated user interface, robust booking management, and a comprehensive admin dashboard for efficient hotel administration.

## 🚀 Key Features

### 🌟 Client Features
- **User Authentication**: Secure sign-up and login using JWT and HttpOnly cookies.
- **Room Browsing**: detailed view of available luxury rooms with high-quality images and descriptions.
- **Booking System**: Easy-to-use booking interface with date selection and instant confirmation.
- **User Dashboard**: personalized dashboard for users to view their booking history and profile.
- **Payment Integration**: Seamless payments powered by **Razorpay**.

### 🛠 Admin Dashboard
- **Dashboard Overview**: Visual analytics of bookings, revenue, and user growth.
- **Room Management**: Add, edit, and remove rooms with ease.
- **Booking Management**: View and manage all user bookings.
- **User Management**: Oversee registered users and their activities.
- **Email Notifications**: Automated email confirmations for bookings and account updates.

## 💻 Technology Stack

### Frontend (Client)
- **Vite + React** ⚛️
- **Tailwind CSS** 🎨
- **Framer Motion** (Animations) 🎬
- **Recharts** (Data Visualization) 📊
- **React Icons** 🖼️
- **Axios** (API Requests) 🌐

### Backend (Server)
- **Node.js + Express** 🟢
- **MongoDB + Mongoose** 🍃
- **JWT (JsonWebToken)** 🔐
- **Nodemailer** (Email Service) 📧
- **Razorpay** (Payment Gateway) 💳
- **Node-Cron** (Scheduled Tasks) ⏱️

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (Local or Atlas)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/lumiere-luxury-hotels.git
cd lumiere-luxury-hotels
```

### 2. Backend Setup
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory and add your configurations:
```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

# Payment Gateway
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Start the backend server:
```bash
npm run server
```

### 3. Frontend Setup
Open a new terminal, navigate to the client directory, and install dependencies:
```bash
cd client
npm install
```

Create a `.env.local` file in the `client` directory:
```env
VITE_API_URL=http://localhost:4000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

Start the frontend development server:
```bash
npm run dev
```

## 🌐 API Overview

The backend exposes RESTful API endpoints for:
- **Auth**: `/api/auth` (Login, Register, Logout)
- **Users**: `/api/users` (Profile, Management)
- **Rooms**: `/api/rooms` (CRUD operations)
- **Bookings**: `/api/bookings` (Create, View, Cancel)
- **Payments**: `/api/payment` (Process payments)

## 🤝 Contributing
Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes.

---
Developed with ❤️ by the Lumière Team.
