# Booking Conference Room System

A full-stack web application for managing and scheduling conference room bookings with real-time updates, user authentication, and administrative controls.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Getting Started](#getting-started)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Database & Services](#database--services)
- [Authentication](#authentication)
- [Real-time Features](#real-time-features)
- [API Documentation](#api-documentation)
- [Configuration](#configuration)
- [Deployment](#deployment)

## 🎯 Overview

The Booking Conference Room System is built using **Clean Architecture (Hexagonal)** principles with clear separation of concerns:

```
Domain (Entities) → Usecase (Business Logic) → Repository (Data Access) → Delivery (HTTP/WebSocket)
```

This application enables organizations to:

- Manage conference room availability and bookings
- Support real-time check-in/check-out functionality
- Integrate with Google Calendar for holiday management
- Provide admin dashboards for analytics and user management
- Enable seamless authentication via Supabase

## 🛠 Tech Stack

### Backend

- **Language**: Go 1.25.4
- **Framework**: Fiber v2 (lightweight web framework)
- **ORM**: GORM with PostgreSQL driver
- **Real-time**: WebSocket via Fiber
- **Task Queue**: Asynq for scheduled tasks
- **Cache/Pub-Sub**: Redis
- **External APIs**: Google Calendar API, Supabase

### Frontend

- **Framework**: Next.js 16 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Authentication**: Supabase Auth
- **HTTP Client**: Axios with interceptors
- **Real-time**: react-use-websocket

### Database & Infrastructure

- **Primary Database**: PostgreSQL (via Supabase)
- **Cache/Queue**: Redis
- **Authentication**: Supabase Auth with JWT
- **Containerization**: Docker & Docker Compose

## 📁 Project Structure

```
BookingConferenceRoom/
├── back-end/                          # Go backend
│   ├── api/
│   │   └── main.go                   # Entry point
│   ├── internal/
│   │   ├── controller/               # Route definitions
│   │   │   ├── handlerRoute.go
│   │   │   └── websocketRoute.go
│   │   ├── delivery/                 # HTTP & WebSocket handlers
│   │   │   ├── http/handler.go
│   │   │   └── websocket/
│   │   │       ├── handler.go
│   │   │       └── hub.go
│   │   ├── domain/                   # Business entities & interfaces
│   │   │   ├── entity.go
│   │   │   ├── usecase.go
│   │   │   ├── query.go
│   │   │   ├── response.go
│   │   │   └── repository/
│   │   ├── gateway/                  # External APIs
│   │   │   └── calendar_gateway.go   # Google Calendar integration
│   │   ├── repository/               # Data access layer
│   │   │   ├── postgres/
│   │   │   └── redis/
│   │   ├── usecase/                  # Business logic
│   │   │   └── service.go
│   │   ├── worker/                   # Asynq task handlers
│   │   │   ├── processor.go
│   │   │   └── task_booking.go
│   │   ├── customErrors/             # Custom error types
│   │   └── utils/
│   │       ├── middleware/           # Auth, CORS, logging
│   │       └── helper/               # Utility functions
│   ├── dockerfile
│   ├── go.mod
│   └── go.sum
├── front-end/                         # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css           # Global styles
│   │   │   ├── layout.tsx            # Root layout
│   │   │   ├── (route)/              # Authenticated routes group
│   │   │   │   ├── calendar/         # Calendar booking interface
│   │   │   │   ├── dashboard/        # Analytics dashboard
│   │   │   │   ├── history/          # User booking history
│   │   │   │   ├── rooms/            # Available rooms listing
│   │   │   │   ├── schedule/         # Room schedule view
│   │   │   │   ├── check-in/         # Passcode check-in
│   │   │   │   ├── room-management/  # Admin: manage rooms
│   │   │   │   ├── user-management/  # Admin: manage users
│   │   │   │   └── system-config/    # Admin: system settings
│   │   │   └── auth/                 # Authentication pages
│   │   │       ├── sign-in/
│   │   │       ├── sign-up/
│   │   │       ├── callback/
│   │   │       └── forgot-password/
│   │   ├── components/               # Reusable React components
│   │   │   ├── auth/
│   │   │   ├── layout/
│   │   │   ├── route/
│   │   │   └── ui/
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── auth/
│   │   │   ├── data/
│   │   │   └── ui/
│   │   ├── lib/                      # Utility functions
│   │   │   ├── auth.ts               # Supabase auth actions
│   │   │   ├── axiosInstance.ts      # HTTP client with interceptors
│   │   │   ├── validation.ts         # Form validation
│   │   │   └── time.ts               # Time utilities
│   │   ├── service/                  # API clients
│   │   │   └── booking.service.ts
│   │   ├── stores/                   # Zustand state stores
│   │   │   ├── auth.store.ts
│   │   │   ├── room.store.ts
│   │   │   └── theme.store.ts
│   │   └── utils/
│   │       ├── interface/            # TypeScript interfaces
│   │       └── supabase/             # Supabase client config
│   ├── public/                       # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   └── README.md
├── docker-compose.yml
└── README.md                         # This file
```

## ✨ Features

### Core Booking Features

- **Create Bookings**: Reserve conference rooms with custom time slots
- **Modify Bookings**: Update or reschedule bookings before check-in
- **Cancel Bookings**: Cancel bookings with proper status updates
- **Check-in**: Passcode-based room entry verification
- **Check-out**: Automatic or manual checkout with status tracking
- **Booking History**: View all past and upcoming bookings

### Real-time Capabilities

- **WebSocket Updates**: Live booking status changes across all connected clients
- **Redis Pub/Sub**: Multi-instance server synchronization
- **Hub System**: Efficient topic-based message broadcasting
- **Instant Notifications**: Real-time notifications on booking events

### Administrative Features

- **User Management**: View, activate/deactivate user accounts
- **Room Management**: Create, edit, delete conference rooms
- **System Configuration**: Set booking hours, max duration, advance booking days
- **Analytics Dashboard**: View booking statistics and room utilization metrics
- **Holiday Management**: Auto-sync with Google Calendar for public holidays

### Authentication & Security

- **Email/Password Auth**: Secure user registration and login
- **OAuth Integration**: Google OAuth support via Supabase
- **JWT Tokens**: Stateless authentication with token-based access
- **Role-based Access Control**: Admin and user role separation
- **Password Recovery**: Secure password reset flow

## 🚀 Getting Started

### Prerequisites

- **Go 1.25.4** or higher
- **Node.js 18** or higher
- **PostgreSQL** (via Supabase)
- **Redis**
- **Docker & Docker Compose** (optional)

### Clone the Repository

```bash
git clone <repository-url>
cd BookingConferenceRoom
```

## 🔧 Backend Setup

### 1. Navigate to Backend Directory

```bash
cd back-end
```

### 2. Set Environment Variables

Create a `.env` file in the `back-end` directory:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Redis
REDIS_ADDR=your_redis_address
REDIS_PASSWORD=your_redis_password
REDIS_DB=0

# Server
PORT=8080
ENV=development

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key
SUPABASE_JWT_SECRET=your_jwt_secret

# Google Calendar
GOOGLE_CALENDAR_API_KEY=your_api_key

# JWT
JWT_SECRET=your_jwt_secret
```

### 3. Install Dependencies

```bash
go mod download
```

### 4. Run Database Migrations

```bash
# If using migration files (adjust as needed)
```

### 5. Start the Server

```bash
# Using air for hot reload (development)
air

# Or direct go run
go run ./api/main.go
```

The backend will start on `http://your-website-domain:8080`

## 🎨 Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd front-end
```

### 2. Set Environment Variables

Create a `.env.local` file in the `front-end` directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Backend API
NEXT_PUBLIC_API_URL=http://your-website-domain:8080

# WebSocket
NEXT_PUBLIC_WS_URL=ws://your-website-domain:8080
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

The frontend will start on `http://your-website-domain:3000`

## 🗄️ Database & Services

### PostgreSQL (Supabase)

**Key Tables:**

- **bookings**: Stores all booking records with status and timing
- **rooms**: Conference room definitions with capacity and location
- **users**: User profiles synced from Supabase Auth
- **config**: System-wide configuration (booking hours, limits, etc.)
- **holidays**: Public holidays from Google Calendar

**Features:**

- GORM ORM for Go with automatic migrations
- Soft deletes for audit trails
- Foreign key relationships with cascading
- Connection pooling via PgBouncer

### Redis

**Functions:**

1. **Caching**: Booking lists, room availability, user data
2. **Real-time Pub/Sub**: Broadcasting booking events across instances
3. **Task Queue (Asynq)**: Scheduled booking start/end tasks
4. **Session Storage**: Optional session cache

**Key Pattern:**

```
booking:room:{roomNumber}:{date}
booking:user:{userId}:{date}
room:availability:{roomId}
```

### Google Calendar Integration

- **Holiday Sync**: Automatically fetches Thai public holidays
- **Calendar ID**: `en.th#holiday@group.v.calendar.google.com`
- **Update Frequency**: On backend startup and periodically
- **Usage**: Mark unavailable days in booking calendar

## 🔐 Authentication

### Supabase Auth Flow

```
User → Sign Up/Sign In → Supabase Auth → JWT Token → Store in localStorage
```

### JWT Token Structure

```json
{
  "sub": "user-id-uuid",
  "email": "user@example.com",
  "app_metadata": {
    "role": "admin|user"
  },
  "iat": 1234567890,
  "exp": 1234571490
}
```

### Authorization

**Backend Middleware:**

- Validates JWT signature and expiration
- Extracts user ID and role from claims
- Enforces role-based access control

**Frontend Interceptor:**

- Automatically includes Authorization header in all requests
- Format: `Authorization: Bearer <token>`
- Token refresh handled by Supabase SDK

### Protected Routes

| Route               | Permission          | Description               |
| ------------------- | ------------------- | ------------------------- |
| `/api/v1/booking/*` | Authenticated Users | Booking CRUD operations   |
| `/api/v1/admin/*`   | Admin Role          | Administrative operations |
| `/ws/bookings/*`    | Authenticated Users | WebSocket connections     |

## ⚡ Real-time Features

### WebSocket Architecture

**Hub System** (`internal/delivery/websocket/hub.go`)

```
Client 1 ─┐
Client 2 ─┤─→ Hub ─→ Topic 1: bookings_realtime
Client 3 ─┘      └─→ Topic 2: room:uuid:1234
```

**Features:**

- Topic-based message routing
- Automatic client registration/unregistration
- Memory-efficient topic cleanup
- Broadcast to multiple subscribers

### Real-time Events

**Subscribed Topics:**

- `bookings_realtime`: All booking changes
- `room:{roomId}`: Room-specific updates

**Event Types:**

```json
{
  "type": "booking_created|booking_updated|booking_deleted|check_in|check_out",
  "booking_id": "uuid",
  "room_id": "uuid",
  "user_id": "uuid",
  "timestamp": "2026-04-22T10:30:00Z"
}
```

### Frontend Integration

```typescript
const { sendJsonMessage, lastJsonMessage } = useWebSocket(
  `ws://your-website-domain:8080/ws/bookings/${roomId}`,
  { reconnect: true },
);

// Listen for updates
useEffect(() => {
  if (lastJsonMessage) {
    // Handle event
  }
}, [lastJsonMessage]);
```

## 📡 API Documentation

### Booking Endpoints

| Method | Endpoint                                                         | Description       | Auth  |
| ------ | ---------------------------------------------------------------- | ----------------- | ----- |
| POST   | `/api/v1/booking/room/:roomNumber`                               | Create booking    | User  |
| PUT    | `/api/v1/booking/:bookingID/room/:roomNumber`                    | Update booking    | User  |
| DELETE | `/api/v1/booking/:bookingID`                                     | Cancel booking    | User  |
| PATCH  | `/api/v1/booking/:bookingID/checkout`                            | Check out         | User  |
| POST   | `/booking/room/:roomID/checkin`                                  | Check in          | User  |
| GET    | `/api/v1/booking/me/date/:date`                                  | Get user bookings | User  |
| GET    | `/api/v1/booking/analytic/startDate/:startDate/endDate/:endDate` | Booking analytics | Admin |

### Request/Response Examples

**Create Booking**

```
POST /api/v1/booking/room/101
Authorization: Bearer <token>
Content-Type: application/json

{
  "start_time": "2026-04-22T14:00:00Z",
  "end_time": "2026-04-22T15:00:00Z",
  "title": "Team Meeting"
}

Response:
{
  "id": "uuid",
  "room_id": "uuid",
  "status": "confirm",
  "passcode": "1234567890",
  "created_at": "2026-04-22T10:30:00Z"
}
```

**Check In**

```
POST /booking/room/{roomId}/checkin
Authorization: Bearer <token>
Content-Type: application/json

{
  "passcode": "1234567890"
}

Response:
{
  "status": "success",
  "checked_in_at": "2026-04-22T14:00:30Z"
}
```

## ⚙️ Configuration

### System Configuration

Administrators can set the following via `/api/v1/admin/config`:

| Setting                  | Description                            | Default |
| ------------------------ | -------------------------------------- | ------- |
| `start_time`             | Earliest booking time (HH:MM format)   | "08:00" |
| `end_time`               | Latest booking end time (HH:MM format) | "20:00" |
| `max_advance_days`       | How many days ahead users can book     | 30      |
| `max_booking_mins`       | Maximum booking duration in minutes    | 120     |
| `no_show_threshold_mins` | Grace period before no-show marking    | 15      |

### Backend Configuration

Environment-based configuration:

- `ENV`: `development` or `production`
- `PORT`: Server port (default: 8080)
- `DEBUG`: Enable debug logging

### Middleware Configuration

**CORS**: Configured in middleware for frontend origin
**Logging**: Structured JSON logging for all requests
**Rate Limiting**: Optional rate limiting on critical endpoints

## 🐳 Deployment

### Local Development with Docker

```bash
# Start Redis container
docker-compose up -d

# Backend: Run with hot reload (from back-end directory)
cd back-end
air

# Frontend: Run development server (from front-end directory)
cd front-end
npm run dev
```

### Production Deployment

**Backend:**

```bash
# Build Docker image
docker build -t booking-conference-room-api:latest ./back-end

# Run container
docker run -p 8080:8080 \
  -e DATABASE_URL=<your_db_url> \
  -e REDIS_ADDR=<your_redis_addr> \
  booking-conference-room-api:latest
```

**Frontend:**

```bash
# Build Next.js application
npm run build

# Start production server
npm start
```

**Recommended Platforms:**

- **Backend**: Koyeb, Railway, Render, Fly.io
- **Frontend**: Vercel, Netlify, Railway
- **Database**: Supabase (PostgreSQL hosted)
- **Cache**: Redis Cloud, Upstash

### Environment Variables Checklist

**Backend Production:**

- [ ] `DATABASE_URL` pointing to production database
- [ ] `REDIS_ADDR` pointing to production Redis
- [ ] `SUPABASE_URL` and `SUPABASE_KEY`
- [ ] `GOOGLE_CALENDAR_API_KEY`
- [ ] `JWT_SECRET` (strong secret)
- [ ] `ENV=production`

**Frontend Production:**

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `NEXT_PUBLIC_API_URL` pointing to production API
- [ ] `NEXT_PUBLIC_WS_URL` for WebSocket connection

## 🔄 Task Queue & Background Jobs

### Asynq Task Processing

**Scheduled Tasks:**

1. **BookingExpiredTask**: Marks booking as "complete" or "no_show" at end time
2. **BookingStartTask**: Executes at booking start time

**Task Retry:**

- Automatic exponential backoff
- Failed tasks are retried per Asynq configuration

**Running Worker:**

```bash
# In back-end directory
go run ./cmd/worker/main.go
```

## 📊 Analytics & Reporting

### Dashboard Metrics

**Available Analytics:**

- Total bookings (date range)
- Room utilization rates
- Peak booking hours
- User booking frequency
- No-show statistics
- Average booking duration

**Endpoint:**

```
GET /api/v1/booking/analytic/startDate/{date}/endDate/{date}
Authorization: Bearer <admin_token>
```

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error:**

```
Error: failed to connect to PostgreSQL
→ Check DATABASE_URL format and credentials
→ Ensure PostgreSQL is accessible from your network
```

**Redis Connection Error:**

```
Error: failed to connect to Redis
→ Verify REDIS_ADDR is correct (host:port)
→ Check Redis is running and accessible
```

**JWT Validation Failed:**

```
Error: invalid or expired token
→ Ensure token is not expired
→ Check JWT_SECRET matches Supabase configuration
→ Verify Authorization header format: "Bearer <token>"
```

**WebSocket Connection Issues:**

```
Error: WebSocket connection failed
→ Check NEXT_PUBLIC_WS_URL in frontend .env
→ Verify backend WebSocket routes are registered
→ Check CORS and firewall settings
```

## 📚 Additional Resources

- [Go Fiber Documentation](https://docs.gofiber.io/)
- [Next.js Documentation](https://nextjs.org/docs)
- [GORM Documentation](https://gorm.io/)
- [Supabase Documentation](https://supabase.com/docs)
- [Redis Documentation](https://redis.io/documentation)
- [Asynq Documentation](https://github.com/hibiken/asynq/wiki)

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For issues, questions, or suggestions, please open an issue on the repository.

---

**Last Updated**: April 22, 2026  
**Version**: 1.0.0
