# CampusShare - Campus Marketplace & Group Orders

CampusShare is a full-stack MERN application that helps students split delivery costs on food/grocery apps and buy/sell items within their campus community.

## Features

- **Group Orders**: Create and browse active delivery orders from platforms like Zomato, Swiggy, Blinkit, BigBasket, etc.
- **Marketplace**: List and browse items for sale within the campus community
- **User Authentication**: Secure JWT-based authentication with httpOnly cookies
- **Real-time Countdowns**: Live countdown timers for order expiry
- **Image Upload**: Upload images for marketplace listings via Cloudinary
- **Auto-expiry**: Orders and listings automatically expire and are cleaned up

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- React Router v6 for navigation
- Axios for API requests
- React Query for data fetching

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Cloudinary for image storage
- Express Rate Limiting for security
- reCAPTCHA v3 integration

## Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (for image uploads)

### 1. Setup Backend

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env with your credentials:
# - MONGODB_URI: Your MongoDB connection string
# - JWT_SECRET: A strong random secret key
# - CLOUDINARY_*: Your Cloudinary credentials
# - RECAPTCHA_SECRET_KEY: (optional) reCAPTCHA v3 secret

# Install dependencies
npm install

# Start the server
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Setup Frontend

```bash
cd frontend

# Copy environment file
cp .env.example .env

# The default VITE_API_URL should work for local development
# Edit if your backend runs on a different port

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:8080`

### 4. Test the Application

1. Open `http://localhost:8080` in your browser
2. Click "Login / Sign Up"
3. Sign Up and then Login
4. Explore Group Orders and Marketplace features

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Group Orders
- `GET /api/group-orders` - Get all active orders (public)
- `GET /api/group-orders/my` - Get user's orders (protected)
- `POST /api/group-orders` - Create order (protected)
- `DELETE /api/group-orders/:id` - Delete order (protected)

### Marketplace
- `GET /api/marketplace` - Get all active listings (public)
- `GET /api/marketplace/my` - Get user's listings (protected)
- `POST /api/marketplace` - Create listing with images (protected)
- `DELETE /api/marketplace/:id` - Delete listing (protected)

### Users
- `GET /api/users/me` - Get profile (protected)
- `PUT /api/users/me` - Update profile (protected)

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RECAPTCHA_SECRET_KEY=your_recaptcha_secret (optional)
FRONTEND_URL=http://localhost:8080
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

## Security Features

- JWT tokens stored in httpOnly cookies
- CSRF protection via origin checking
- Rate limiting on authentication endpoints
- Password hashing with bcrypt
- Input validation and sanitization
- reCAPTCHA v3 integration (optional)

## License

MIT License
