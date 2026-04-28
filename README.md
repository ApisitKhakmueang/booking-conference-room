# Booking Conference Room System

A full-stack web application for managing and scheduling conference room bookings with real-time updates, user authentication, and administrative controls.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
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
- [Background Jobs & Task Queue](#background-jobs--task-queue)
- [Analytics & Reporting](#analytics--reporting)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Additional Resources](#additional-resources)

## 🎯 Overview

The Booking Conference Room System is built using **Clean Architecture (Hexagonal)** principles with clear separation of concerns and domain-driven design:

```
┌─────────────────────────────────────────────────┐
│          Delivery Layer (HTTP/WebSocket)        │
│  (Handlers: booking_handler, room_handler, etc) │
├─────────────────────────────────────────────────┤
│           Usecase Layer (Business Logic)        │
│   (Services: booking_usecase, room_usecase)     │
├─────────────────────────────────────────────────┤
│          Repository Layer (Data Access)         │
│    (PostgreSQL/Redis: CRUD operations)          │
├─────────────────────────────────────────────────┤
│       Domain Layer (Entities & Interfaces)      │
│ (Business rules, response models, query models) │
└─────────────────────────────────────────────────┘
```

### Architecture Benefits

- **Separation of Concerns**: Each layer has a specific responsibility
- **Testability**: Business logic is independent of infrastructure
- **Scalability**: Easy to add features without affecting existing code
- **Maintainability**: Clear dependency flow and boundaries
- **Reusability**: Domain entities and interfaces are decoupled from HTTP

This application enables organizations to:

- Manage conference room availability and bookings with real-time synchronization
- Support passcode-based check-in/check-out functionality
- Integrate with Google Calendar for automatic holiday management
- Provide admin dashboards for analytics, room management, and user management
- Enable seamless authentication via Supabase with JWT tokens
- Schedule background tasks for automatic booking expiration and no-show marking

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
- **Cache/Queue**: Redis (with Asynq for task scheduling)
- **Authentication**: Supabase Auth with JWT tokens
- **Containerization**: Docker & Docker Compose

## 📁 Project Structure

```
BookingConferenceRoom/
├── back-end/                              # Go backend (Clean Architecture)
│   ├── api/
│   │   └── main.go                       # Application entry point
│   ├── internal/
│   │   ├── controller/                   # Route definitions & middleware setup
│   │   │   ├── handler_route.go          # HTTP routes (Booking, Room, Config, User)
│   │   │   └── websocket_route.go        # WebSocket endpoints
│   │   │
│   │   ├── delivery/                     # HTTP & WebSocket handlers (Presentation Layer)
│   │   │   ├── http/
│   │   │   │   ├── booking_handler.go    # Booking endpoint handlers
│   │   │   │   ├── room_handler.go       # Room endpoint handlers
│   │   │   │   ├── user_handler.go       # User management handlers
│   │   │   │   └── config_handler.go     # System config handlers
│   │   │   └── websocket/
│   │   │       ├── handler.go            # WebSocket connection handler
│   │   │       └── hub.go                # Message hub for real-time updates
│   │   │
│   │   ├── domain/                       # Core business entities & interfaces (Domain Layer)
│   │   │   ├── booking.go                # Booking entity
│   │   │   ├── room.go                   # Room entity
│   │   │   ├── user.go                   # User entity
│   │   │   ├── config.go                 # Config entity
│   │   │   ├── entity.go                 # Entity base/common types
│   │   │   ├── response.go               # Response DTOs
│   │   │   ├── query.go                  # Query models & filters
│   │   │   ├── all_usecase.go            # Usecase interfaces contracts
│   │   │   ├── redis.go                  # Redis-related types
│   │   │   └── worker.go                 # Worker/task types
│   │   │
│   │   ├── repository/                   # Data access layer
│   │   │   ├── postgres/                 # PostgreSQL CRUD operations
│   │   │   │   ├── booking_db.go
│   │   │   │   ├── room_db.go
│   │   │   │   ├── user_db.go
│   │   │   │   ├── config_db.go
│   │   │   │   └── worker_db.go
│   │   │   │
│   │   │   ├── redis/                    # Redis caching & pub/sub
│   │   │   │   ├── base_redis.go
│   │   │   │   ├── booking_cache.go
│   │   │   │   ├── room_cache.go
│   │   │   │   ├── config_cache.go
│   │   │   │   ├── worker_cache.go
│   │   │   │   └── publisher.go          # Real-time event publishing
│   │   │   │
│   │   │   └── gateway/                  # External service integration
│   │   │       └── calendar_gateway.go   # Google Calendar API
│   │   │
│   │   ├── usecase/                      # Business logic (Service Layer)
│   │   │   ├── base_usecase.go           # Base service structure
│   │   │   ├── booking_usecase.go        # Booking business logic
│   │   │   ├── room_usecase.go           # Room management logic
│   │   │   ├── user_usecase.go           # User management logic
│   │   │   ├── config_usecase.go         # Configuration logic
│   │   │   └── worker_usecase.go         # Worker task logic
│   │   │
│   │   ├── worker/                       # Background job processing (Asynq)
│   │   │   ├── initial.go                # Worker initialization
│   │   │   ├── processor.go              # Task processor setup
│   │   │   └── task_booking.go           # Booking-related tasks
│   │   │
│   │   ├── custom_errors/                # Custom error types
│   │   │   └── error.go                  # Error definitions
│   │   │
│   │   └── utils/                        # Utility functions
│   │       ├── initial.go                # App initialization
│   │       ├── middleware/
│   │       │   └── middleware.go         # Auth, JWT validation, CORS
│   │       ├── goroutine.go              # Goroutine utilities
│   │       └── helper/
│   │           ├── booking.go            # Booking validation, passcode
│   │           └── time.go               # Time & date utilities
│   │
│   ├── dockerfile                        # Docker containerization
│   ├── go.mod                            # Go module dependencies
│   ├── go.sum                            # Dependency checksums
│   └── tmp/                              # Temporary files (air, etc)
│
├── front-end/                             # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx                # Root layout
│   │   │   ├── globals.css               # Global styles
│   │   │   ├── (route)/                  # Protected routes group
│   │   │   │   ├── calendar/             # Booking calendar
│   │   │   │   ├── dashboard/            # Analytics dashboard
│   │   │   │   ├── rooms/                # Available rooms listing
│   │   │   │   ├── history/              # User booking history
│   │   │   │   ├── schedule/             # Room schedule view
│   │   │   │   ├── check-in/             # Passcode check-in
│   │   │   │   ├── room-management/      # Admin: manage rooms
│   │   │   │   ├── user-management/      # Admin: manage users
│   │   │   │   └── system-config/        # Admin: system settings
│   │   │   └── auth/                     # Authentication pages
│   │   │       ├── sign-in/
│   │   │       ├── sign-up/
│   │   │       ├── callback/
│   │   │       └── forgot-password/
│   │   ├── components/                   # React components
│   │   │   ├── auth/
│   │   │   ├── layout/
│   │   │   ├── route/
│   │   │   ├── ui/
│   │   │   └── user/
│   │   ├── hooks/                        # Custom React hooks
│   │   ├── lib/                          # Utility functions
│   │   ├── service/                      # API clients
│   │   ├── stores/                       # Zustand state stores
│   │   └── utils/
│   ├── public/                           # Static assets
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml                    # Redis service setup
└── README.md
```

## ✨ Features

### Core Booking Management

- **Create Bookings**: Reserve conference rooms with date/time slots and titles
- **Update Bookings**: Modify existing bookings (start/end time, title)
- **Cancel Bookings**: Soft-delete bookings with status tracking
- **Check-in**: Passcode-based room entry verification
- **Check-out**: Mark bookings as complete
- **Booking History**: Paginated view of all past and upcoming bookings
- **Analytics**: Booking statistics, room utilization, peak hours, no-show rates

### Real-time Capabilities

- **WebSocket Hub System**: Topic-based message routing for efficient broadcasting
- **Redis Pub/Sub**: Multi-instance server synchronization for distributed deployments
- **Live Status Updates**: Real-time notifications on booking events (create, update, delete, check-in, check-out)
- **Automatic Client Sync**: All connected clients receive instant updates

### Administrative Features

- **User Management**:
  - View all users with pagination
  - Activate/deactivate user accounts
  - Track user statistics (total bookings, no-shows, etc.)
- **Room Management**:
  - Create, edit, delete conference rooms
  - Set room capacity and location
  - Enable/disable rooms with status flags
- **System Configuration**:
  - Set booking hours (start/end time)
  - Configure maximum advance booking days
  - Set maximum booking duration
  - Set no-show threshold grace period
- **Analytics Dashboard**:
  - Booking statistics (date range filters)
  - Room utilization metrics
  - Popular rooms ranking
  - Attendance health (no-show patterns)
- **Holiday Management**:
  - Auto-sync with Google Calendar
  - Display public holidays in booking calendar
  - Block bookings on holidays

### Authentication & Security

- **Email/Password Authentication**: Secure user registration and login via Supabase
- **OAuth Integration**: Google OAuth support via Supabase
- **JWT Token-based**: Stateless authentication with token validation
- **Role-based Access Control**: Separate admin and user roles with permission enforcement
- **Password Recovery**: Secure password reset flow
- **Account Suspension**: Admin ability to suspend/activate user accounts
- **Secure Passcodes**: 10-digit alphanumeric passcodes for room check-in

### Background Processing

- **Automatic Task Scheduling**: Asynq-based task queue using Redis
- **Booking Expiration**: Automatic marking of expired bookings as complete/no-show
- **Retry Logic**: Exponential backoff for failed tasks
- **Distributed Processing**: Support for multiple worker instances

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

### Prerequisites

Before starting the backend setup, ensure you have:

- **Go 1.25.4** or higher installed ([Download](https://golang.org/dl))
- **PostgreSQL** database access (via Supabase recommended)
- **Redis** server running (local or remote)
- **Supabase account** with a project created
- **Google Calendar API key** (optional, for holiday management)

### 1. Navigate to Backend Directory

```bash
cd back-end
```

### 2. Set Environment Variables

Create a `.env` file in the `back-end` directory with the following configuration:

#### Required Environment Variables

```env
# ==================== DATABASE ====================
# PostgreSQL connection string from Supabase
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# ==================== REDIS ====================
# Redis server address (host:port)
REDIS_ADDR=localhost:6379
REDIS_PASSWORD=                    # Leave empty if no password
REDIS_DB=0                         # Redis database number (0-15)

# ==================== SERVER ====================
# Server port (default: 8080)
PORT=8080
# Environment: development or production
ENV=development
# Frontend URL for CORS (must match exact origin)
FRONTEND_URL=http://localhost:3000

# ==================== SUPABASE ====================
# Supabase project URL (from project settings)
SUPABASE_URL=https://your-project.supabase.co
# Supabase anonymous/public API key
SUPABASE_KEY=your_anon_key
# Supabase JWT secret (from project settings > API)
SUPABASE_JWT_SECRET=your_jwt_secret_from_supabase

# ==================== GOOGLE CALENDAR (OPTIONAL) ====================
# Google Calendar API key (get from Google Cloud Console)
GOOGLE_CALENDAR_API_KEY=your_google_calendar_api_key
# Calendar ID for holidays (Thailand: en.th#holiday@group.v.calendar.google.com)
GOOGLE_CALENDAR_ID=en.th#holiday@group.v.calendar.google.com

# ==================== OPTIONAL SETTINGS ====================
# Enable debug mode (true/false)
DEBUG=false
# Logging level (debug, info, warn, error)
LOG_LEVEL=info
```

#### Getting Required Values

**Supabase Credentials:**

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click Settings → API
4. Copy `Project URL` → `SUPABASE_URL`
5. Copy `anon public` key → `SUPABASE_KEY`
6. Copy `JWT secret` → `SUPABASE_JWT_SECRET`

**Google Calendar API Key:**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google Calendar API
4. Create API key (Credentials → Create Credentials → API Key)
5. Use the API key → `GOOGLE_CALENDAR_API_KEY`

### 3. Install Go Dependencies

```bash
# Download all dependencies
go mod download

# Verify and clean up go.mod/go.sum
go mod tidy
```

**Expected output:** No errors or warnings

### 4. Database Migrations

The application automatically creates all necessary database tables on startup using GORM's auto-migration feature.

**To verify database schema manually:**

```bash
# Connect to PostgreSQL
psql "$DATABASE_URL"

# Check for tables
\dt

# List booking table structure
\d booking

# Exit psql
\q
```

**To reset database (⚠️ WARNING: Deletes all data):**

```bash
# Connect to database and drop all tables
psql "$DATABASE_URL" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Restart backend - migrations will recreate tables
```

### 5. Start the Backend Server

#### Development with Hot Reload (Recommended)

Using `air` for automatic code reload on changes:

```bash
# Install air if not already installed
go install github.com/cosmtrek/air@latest

# Run with hot reload from back-end directory
air
```

**Expected output:**

```
...
building...
/booking-api
time="2026-04-22T10:30:00Z" level=info msg="Start server on :8080"
```

The backend will be available at `http://localhost:8080`

**Troubleshooting air:**

```bash
# If air command not found, add Go bin to PATH
# On Linux/Mac:
export PATH="$HOME/go/bin:$PATH"

# On Windows:
# Add %USERPROFILE%\go\bin to system PATH

# Or run directly:
$HOME/go/bin/air
```

#### Production Build

```bash
# Build executable
go build -o booking-api ./api

# Run the binary
./booking-api

# Or with output redirection
./booking-api > logs/server.log 2>&1 &
```

#### Docker Build (Optional)

```bash
# Build Docker image
docker build -t booking-api:latest .

# Run container
docker run -d \
  --name booking-api \
  -p 8080:8080 \
  -e DATABASE_URL="postgresql://..." \
  -e REDIS_ADDR="redis-container:6379" \
  -e SUPABASE_URL="https://..." \
  -e SUPABASE_KEY="..." \
  -e SUPABASE_JWT_SECRET="..." \
  booking-api:latest
```

### 6. Start Background Worker (Optional but Recommended)

The worker processes scheduled tasks like booking expiration and no-show marking. Run in a separate terminal:

```bash
# From back-end directory
cd back-end

# Run the worker
go run ./cmd/worker/main.go
```

**Expected output:**

```
time="2026-04-22T10:30:05Z" level=info msg="Starting Asynq worker..."
```

**Worker Configuration** (edit `internal/worker/initial.go`):

- `NumWorkers`: Number of concurrent task processors (default: 10)
- `StrictPriority`: Process by priority (default: false)
- `LogLevel`: Logging verbosity (default: info)

**To monitor worker tasks:**

```bash
# Connect to Redis
redis-cli

# Monitor in real-time
MONITOR

# Check pending tasks
KEYS "asynq:*"

# View task count
LLEN asynq:queues:default

# Exit Redis CLI
EXIT
```

### 7. Verify Backend is Running

```bash
# Test API endpoint
curl http://localhost:8080/api/v1/config

# Expected response:
# {"id":1,"start_time":"08:00","end_time":"20:00","max_advance_days":30,...}
```

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

#### Database Schema

**Config Table** - System-wide settings

```sql
Table: config
├── id (BIGSERIAL PRIMARY KEY)
├── start_time (VARCHAR)
├── end_time (VARCHAR)
├── max_advance_days (INT, DEFAULT: 30)
├── max_booking_mins (INT, DEFAULT: 120)
├── no_show_threshold_mins (INT, DEFAULT: 15)
└── updated_at (TIMESTAMP)
```

**Holiday Table** - Public holidays from Google Calendar

```sql
Table: holiday
├── id (BIGSERIAL PRIMARY KEY)
├── date (DATE, UNIQUE)
├── name (TEXT)
├── is_day_off (BOOLEAN, DEFAULT: true)
├── source (TEXT)
└── updated_at (TIMESTAMP)
```

**Room Table** - Conference rooms

```sql
Table: room
├── id (UUID PRIMARY KEY, DEFAULT: gen_random_uuid())
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
├── deleted_at (TIMESTAMP, nullable - soft delete)
├── name (VARCHAR)
├── room_number (INT NOT NULL)
├── location (VARCHAR)
├── capacity (INT)
└── status (VARCHAR, CHECK: 'available' or 'maintenance', DEFAULT: 'available')

Indexes: room_number (UNIQUE), deleted_at
```

**User Table** - User profiles (synced from Supabase Auth)

```sql
Table: "user"
├── id (UUID PRIMARY KEY)
├── email (VARCHAR)
├── full_name (VARCHAR)
├── avatar_url (VARCHAR)
├── role (VARCHAR, DEFAULT: 'user')
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
├── deleted_at (TIMESTAMP, nullable - soft delete)
└── status (VARCHAR, CHECK: 'active' or 'inactive', DEFAULT: 'active')

Indexes: email (UNIQUE), role, status, deleted_at
```

**Booking Table** - Room reservations

```sql
Table: booking
├── id (UUID PRIMARY KEY, DEFAULT: gen_random_uuid())
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
├── room_id (UUID NOT NULL, FK → room.id)
├── user_id (UUID NOT NULL, FK → user.id)
├── start_time (TIMESTAMP NOT NULL)
├── end_time (TIMESTAMP NOT NULL)
├── title (VARCHAR, DEFAULT: 'no_title')
├── passcode (VARCHAR(10))
├── status (VARCHAR, CHECK: 'confirm', 'cancelled', 'complete', 'no_show', DEFAULT: 'confirm')
├── checked_in_at (TIMESTAMP, nullable)
└── deleted_at (TIMESTAMP, nullable - soft delete)

Indexes:
  - (room_id, deleted_at)
  - (user_id, deleted_at)
  - (start_time, end_time)
  - deleted_at
```

#### Key Features

- **GORM ORM**: Automatic migrations on application startup
- **Soft Deletes**: Records are marked deleted, not removed
- **Connection Pooling**: Via PgBouncer for high-concurrency scenarios
- **Foreign Keys**: Cascading relationships for data integrity
- **Indexes**: Optimized query performance

### Redis

#### Functions

1. **Caching**
   - Booking lists for specific dates
   - Room availability data
   - User profile cache
   - Configuration cache

2. **Real-time Pub/Sub**
   - Broadcasting booking events
   - Room status updates
   - User notifications
   - Multi-instance synchronization

3. **Task Queue (Asynq)**
   - Scheduled booking expiration tasks
   - Automatic no-show marking
   - Retry mechanisms with exponential backoff

4. **Session Storage**
   - WebSocket connection management
   - User session state (optional)

#### Cache Patterns

```
# Booking cache
booking:room:{roomID}:{date}     → List of bookings
booking:user:{userID}:{date}     → User's bookings

# Room cache
room:availability:{roomID}       → Room availability status
room:list                        → All rooms data

# Configuration cache
config:system                    → System settings

# Task queue
asynq:tasks:{taskID}             → Task details
asynq:queues                     → Queue metadata
```

#### Redis Commands for Monitoring

```bash
# Connect to Redis
redis-cli

# Monitor real-time events
MONITOR

# List all keys
KEYS *

# Check queue length
LLEN asynq:queues:default

# View specific task
HGETALL asynq:tasks:{taskID}

# Clear cache (use with caution)
FLUSHDB

# Check memory usage
INFO memory
```

### Google Calendar Integration

#### Setup

1. Create a Google Cloud project
2. Enable Google Calendar API
3. Generate API key (no OAuth required for read-only access)
4. Store as `GOOGLE_CALENDAR_API_KEY`

#### Features

- **Holiday Synchronization**: Automatic daily fetch from Thailand public holidays
- **Calendar ID**: `en.th#holiday@group.v.calendar.google.com` (Thailand holidays)
- **Update Trigger**: On backend startup and periodically

#### Usage

```go
// In calendar_gateway.go
func (g *GoogleCalendarGateway) FetchHolidays(ctx context.Context, year int) ([]domain.Holiday, error) {
    // Fetches all holidays for the year
    // Stores in database with is_day_off = true
}
```

#### Holiday Data Structure

```json
{
  "date": "2026-04-13",
  "name": "Songkran Festival",
  "is_day_off": true,
  "source": "google_calendar"
}
```

### Database Optimization Best Practices

1. **Connection Pooling**
   - Use PgBouncer for connection management
   - Typical pool size: 20-40 connections

2. **Query Optimization**
   - Use indexed columns in WHERE clauses
   - Avoid N+1 queries with eager loading
   - Use pagination for large result sets

3. **Backup Strategy**
   - Supabase: Automatic daily backups
   - Point-in-time recovery available
   - Manual exports for sensitive data

4. **Redis Memory Management**
   - Set maxmemory policy: `allkeys-lru`
   - Monitor memory usage: `INFO memory`
   - Clear expired cache regularly

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
    "role": "admin|user",
    "status": "active|inactive"
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

### Complete API Routes

#### Booking Endpoints

| Method | Endpoint                                                         | Description                       | Auth  | Required Fields                      |
| ------ | ---------------------------------------------------------------- | --------------------------------- | ----- | ------------------------------------ |
| POST   | `/api/v1/booking/room/:roomNumber`                               | Create booking                    | User  | start_time, end_time, [title]        |
| PUT    | `/api/v1/booking/:bookingID/room/:roomNumber`                    | Update booking                    | User  | [start_time], [end_time], [title]    |
| DELETE | `/api/v1/booking/:bookingID`                                     | Cancel booking                    | User  | —                                    |
| PATCH  | `/api/v1/booking/:bookingID/checkout`                            | Complete booking                  | User  | —                                    |
| GET    | `/api/v1/booking/me/date/:date`                                  | Get user's bookings for date      | User  | date (YYYY-MM-DD)                    |
| GET    | `/api/v1/booking/me/history/date/:date`                          | Get user's booking history        | User  | date (YYYY-MM-DD), [limit], [offset] |
| GET    | `/api/v1/booking/date/:date`                                     | Get all bookings for date         | Admin | date (YYYY-MM-DD)                    |
| GET    | `/api/v1/booking/up-next/:date`                                  | Get upcoming bookings & analytics | Admin | date (YYYY-MM-DD)                    |
| GET    | `/api/v1/booking/analytic/startDate/:startDate/endDate/:endDate` | Get booking analytics             | Admin | startDate, endDate (YYYY-MM-DD)      |

#### Room Endpoints

| Method | Endpoint                       | Description            | Auth  | Required Fields              |
| ------ | ------------------------------ | ---------------------- | ----- | ---------------------------- |
| GET    | `/api/v1/rooms/details`        | Get all rooms          | User  | —                            |
| GET    | `/api/v1/room/:roomID`         | Get room details       | User  | roomID (UUID)                |
| POST   | `/api/v1/room`                 | Create room            | Admin | name, room_number, capacity  |
| PUT    | `/api/v1/room/:roomID`         | Update room            | Admin | [name], [capacity], [status] |
| DELETE | `/api/v1/room/:roomID`         | Delete room            | Admin | —                            |
| POST   | `/api/v1/room/:roomID/checkin` | Check in with passcode | User  | passcode                     |

#### User Management Endpoints

| Method | Endpoint                         | Description                     | Auth  | Parameters                               |
| ------ | -------------------------------- | ------------------------------- | ----- | ---------------------------------------- |
| GET    | `/api/v1/users`                  | Get all users (paginated)       | Admin | [limit=10], [offset=0], [search]         |
| GET    | `/api/v1/users/:userID/overview` | Get user statistics             | Admin | userID (UUID)                            |
| GET    | `/api/v1/users/:userID/bookings` | Get user's bookings (paginated) | Admin | userID (UUID), [limit=10], [offset=0]    |
| PUT    | `/api/v1/users/:userID`          | Update user status              | Admin | userID (UUID), status (active\|inactive) |

#### Configuration Endpoints

| Method | Endpoint         | Description                 | Auth  | Required Fields                                                                            |
| ------ | ---------------- | --------------------------- | ----- | ------------------------------------------------------------------------------------------ |
| GET    | `/api/v1/config` | Get system configuration    | User  | —                                                                                          |
| PUT    | `/api/v1/config` | Update system configuration | Admin | [start_time], [end_time], [max_advance_days], [max_booking_mins], [no_show_threshold_mins] |

#### Holiday Endpoints

| Method | Endpoint                                                 | Description                | Auth | Parameters                      |
| ------ | -------------------------------------------------------- | -------------------------- | ---- | ------------------------------- |
| GET    | `/api/v1/holidays/startDate/:startDate/endDate/:endDate` | Get holidays in date range | User | startDate, endDate (YYYY-MM-DD) |

#### WebSocket Endpoints

| Endpoint              | Description                     | Auth | Message Type                                                           |
| --------------------- | ------------------------------- | ---- | ---------------------------------------------------------------------- |
| `WS /ws/room/:roomID` | Room-specific real-time updates | User | booking_created, booking_updated, booking_deleted, check_in, check_out |
| `WS /ws/status`       | User booking status updates     | User | status_change                                                          |
| `WS /ws/:room`        | General room updates            | User | availability_change, room_status                                       |

**Legend:** `[]` = optional field, `\|` = choice, `(YYYY-MM-DD)` = date format

### Request/Response Examples

#### Create Booking

```http
POST /api/v1/booking/room/101
Authorization: Bearer <token>
Content-Type: application/json

{
  "start_time": "2026-04-22T14:00:00Z",
  "end_time": "2026-04-22T15:00:00Z",
  "title": "Team Meeting"
}

Response (201):
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "room_id": "550e8400-e29b-41d4-a716-446655440001",
  "user_id": "550e8400-e29b-41d4-a716-446655440002",
  "title": "Team Meeting",
  "start_time": "2026-04-22T14:00:00Z",
  "end_time": "2026-04-22T15:00:00Z",
  "status": "confirm",
  "passcode": "1234567890",
  "created_at": "2026-04-22T10:30:00Z"
}
```

#### Update Booking

```http
PUT /api/v1/booking/550e8400-e29b-41d4-a716-446655440000/room/101
Authorization: Bearer <token>
Content-Type: application/json

{
  "start_time": "2026-04-22T15:00:00Z",
  "end_time": "2026-04-22T16:00:00Z",
  "title": "Team Standup"
}

Response (200):
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "confirm",
  "updated_at": "2026-04-22T10:35:00Z"
}
```

#### Check In

```http
POST /api/v1/room/550e8400-e29b-41d4-a716-446655440001/checkin
Authorization: Bearer <token>
Content-Type: application/json

{
  "passcode": "1234567890"
}

Response (200):
{
  "status": "success",
  "message": "Check-in successful",
  "checked_in_at": "2026-04-22T14:00:30Z"
}
```

#### Get Bookings for Date

```http
GET /api/v1/booking/date/2026-04-22
Authorization: Bearer <token>

Response (200):
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "room_id": "550e8400-e29b-41d4-a716-446655440001",
      "user_id": "550e8400-e29b-41d4-a716-446655440002",
      "title": "Team Meeting",
      "start_time": "2026-04-22T14:00:00Z",
      "end_time": "2026-04-22T15:00:00Z",
      "status": "confirm"
    }
  ],
  "total": 1
}
```

#### Get System Configuration

```http
GET /api/v1/config
Authorization: Bearer <token>

Response (200):
{
  "id": 1,
  "start_time": "08:00",
  "end_time": "20:00",
  "max_advance_days": 30,
  "max_booking_mins": 120,
  "no_show_threshold_mins": 15,
  "updated_at": "2026-04-22T10:00:00Z"
}
```

#### WebSocket Message Format

```json
{
  "type": "booking_created",
  "data": {
    "booking_id": "550e8400-e29b-41d4-a716-446655440000",
    "room_id": "550e8400-e29b-41d4-a716-446655440001",
    "user_id": "550e8400-e29b-41d4-a716-446655440002",
    "action": "created",
    "timestamp": "2026-04-22T14:00:00Z"
  }
}
```

### Error Responses

All endpoints return appropriate HTTP status codes:

- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Insufficient permissions or suspended account
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Example error response:

```json
{
  "status": "error",
  "message": "Booking not found",
  "code": "NOT_FOUND"
}
```

## ⚙️ Configuration

### System Configuration (Admin-Configurable)

Administrators can update the following system settings via `PUT /api/v1/config`:

| Setting                  | Description                                     | Default |
| ------------------------ | ----------------------------------------------- | ------- |
| `start_time`             | Earliest booking time (HH:MM format, 24-hour)   | "08:00" |
| `end_time`               | Latest booking end time (HH:MM format, 24-hour) | "20:00" |
| `max_advance_days`       | How many days ahead users can book              | 30      |
| `max_booking_mins`       | Maximum booking duration in minutes             | 120     |
| `no_show_threshold_mins` | Grace period in minutes before marking no-show  | 15      |

**Example Configuration Update:**

```json
{
  "start_time": "09:00",
  "end_time": "18:00",
  "max_advance_days": 60,
  "max_booking_mins": 180,
  "no_show_threshold_mins": 10
}
```

### Backend Environment Configuration

#### Core Settings

- `ENV`: `development` or `production`
- `PORT`: Server port (default: 8080)
- `FRONTEND_URL`: CORS origin (e.g., http://localhost:3000)
- `DEBUG`: Enable debug mode (true/false)
- `LOG_LEVEL`: Logging level (debug, info, warn, error)

#### Database & Cache

- `DATABASE_URL`: PostgreSQL connection string (Supabase)
- `REDIS_ADDR`: Redis host:port
- `REDIS_PASSWORD`: Redis authentication password
- `REDIS_DB`: Redis database number (default: 0)

#### Authentication

- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_KEY`: Supabase anonymous API key
- `SUPABASE_JWT_SECRET`: JWT secret from Supabase (for token validation)

#### External Services

- `GOOGLE_CALENDAR_API_KEY`: Google Calendar API key
- `GOOGLE_CALENDAR_ID`: Google Calendar ID for holidays (typically: en.th#holiday@group.v.calendar.google.com)

### Middleware Configuration

#### CORS (Cross-Origin Resource Sharing)

Configured in `internal/utils/initial.go` to allow requests from `FRONTEND_URL`:

```go
// Allows requests from http://localhost:3000
app.Use(cors.New(cors.Config{
    AllowOrigins: os.Getenv("FRONTEND_URL"),
    AllowMethods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
    AllowHeaders: "Origin,Content-Type,Accept,Authorization",
}))
```

#### Authentication Middleware

Located in `internal/utils/middleware/middleware.go`:

- Validates JWT tokens from Supabase
- Extracts user ID and role from token claims
- Enforces role-based access control
- Checks user account status (active/inactive)
- Returns 403 for suspended accounts

#### WebSocket Middleware

- Validates JWT token during WebSocket upgrade
- Reuses HTTP authentication context
- Supports topic-based subscription filtering

## 🐳 Deployment

### Local Development Setup

#### Using Docker Compose

Start all services locally:

```bash
# Start Redis (required for backend)
docker-compose up -d redis-service

# Backend: Run with hot reload (from back-end directory)
cd back-end
air

# In another terminal - Frontend (from front-end directory)
cd front-end
npm run dev
```

**What starts:**

- Redis on `localhost:6379`
- Backend on `http://localhost:8080`
- Frontend on `http://localhost:3000`

### Production Deployment

#### Backend Deployment

**Docker Build:**

```bash
# Build Docker image
docker build -t booking-conference-room-api:latest ./back-end

# Run container
docker run -d \
  -p 8080:8080 \
  -e DATABASE_URL=<your_db_url> \
  -e REDIS_ADDR=<your_redis_host:port> \
  -e SUPABASE_URL=<your_supabase_url> \
  -e SUPABASE_KEY=<your_supabase_key> \
  -e SUPABASE_JWT_SECRET=<your_jwt_secret> \
  -e GOOGLE_CALENDAR_API_KEY=<your_api_key> \
  -e PORT=8080 \
  -e ENV=production \
  booking-conference-room-api:latest
```

**Docker Compose for Production:**

```yaml
version: "3.8"

services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes

  backend:
    build: ./back-end
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: ${DATABASE_URL}
      REDIS_ADDR: redis:6379
      SUPABASE_URL: ${SUPABASE_URL}
      SUPABASE_KEY: ${SUPABASE_KEY}
      SUPABASE_JWT_SECRET: ${SUPABASE_JWT_SECRET}
      GOOGLE_CALENDAR_API_KEY: ${GOOGLE_CALENDAR_API_KEY}
      PORT: 8080
      ENV: production
    depends_on:
      - redis
    restart: unless-stopped

volumes:
  redis-data:
```

#### Frontend Deployment

**Build for Production:**

```bash
cd front-end

# Build the application
npm run build

# Start production server
npm start
```

**Deploy to Vercel (Recommended):**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
vercel --prod
```

Configure environment variables in Vercel dashboard:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL` (production backend URL)
- `NEXT_PUBLIC_WS_URL` (production WebSocket URL)

#### Recommended Hosting Platforms

**Backend:**

- **Koyeb** - Easy deployment, built-in Redis support
- **Railway** - Simple GitHub integration
- **Render** - Free tier available
- **Fly.io** - Global deployment
- **DigitalOcean App Platform** - Scalable, affordable

**Frontend:**

- **Vercel** - Next.js optimized, free tier
- **Netlify** - Simple GitHub deployment
- **Railway** - All-in-one solution
- **Cloudflare Pages** - Fast CDN

**Database:**

- **Supabase** - PostgreSQL managed service
- **Neon** - Serverless PostgreSQL
- **AWS RDS** - Managed database

**Cache/Queue:**

- **Redis Cloud** - Managed Redis
- **Upstash** - Serverless Redis
- **AWS ElastiCache** - Managed Redis
- **Docker container** on your server

### Environment Variables Checklist

#### Backend Production Checklist

- [ ] `DATABASE_URL` - Production PostgreSQL connection string
- [ ] `REDIS_ADDR` - Production Redis address (host:port)
- [ ] `REDIS_PASSWORD` - Redis password (if required)
- [ ] `SUPABASE_URL` - Supabase project URL
- [ ] `SUPABASE_KEY` - Supabase anonymous API key
- [ ] `SUPABASE_JWT_SECRET` - JWT secret from Supabase settings
- [ ] `GOOGLE_CALENDAR_API_KEY` - Valid Google API key
- [ ] `PORT` - Server port (typically 8080 or 3000)
- [ ] `ENV` - Set to `production`
- [ ] `FRONTEND_URL` - Frontend domain for CORS (e.g., https://example.com)

#### Frontend Production Checklist

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase public key
- [ ] `NEXT_PUBLIC_API_URL` - Production backend API URL (e.g., https://api.example.com)
- [ ] `NEXT_PUBLIC_WS_URL` - Production WebSocket URL (e.g., wss://api.example.com)
- [ ] `NEXT_PUBLIC_SITE_URL` - Frontend URL for OAuth callbacks (e.g., https://example.com)

### SSL/TLS Configuration

**For HTTPS (Recommended for Production):**

- **Cloudflare**: Add CNAME record and enable SSL/TLS
- **Let's Encrypt**: Use with Nginx/Apache reverse proxy
- **AWS Certificate Manager**: If using AWS services

### Monitoring & Logging

#### Backend Monitoring

- Log output in Docker: `docker logs <container-id>`
- Monitor Redis: `redis-cli MONITOR`
- Check Asynq tasks: `redis-cli KEYS "asynq:*"`

#### Database Backups

For Supabase:

- Automatic daily backups included
- Accessible from Supabase dashboard
- Point-in-time recovery available on Pro plan

### Scaling Considerations

1. **Horizontal Scaling**:
   - Deploy multiple backend instances behind a load balancer
   - Redis handles pub/sub across instances
   - Database connection pooling with PgBouncer

2. **Database Optimization**:
   - Indexes on frequently queried columns
   - Connection pooling (PgBouncer)
   - Read replicas for analytics queries

3. **Caching Strategy**:
   - Redis cache for room availability
   - Cache configuration settings
   - Session storage in Redis

## 🔄 Background Jobs & Task Queue

### Asynq Integration

The project uses **Asynq** for reliable, distributed task queue processing with Redis as the backend.

#### Architecture

```
usecase → Asynq Client → Redis Queue
                           ↓
                      Worker Process
                           ↓
                      Task Handler → Database
```

#### Task Types

1. **BookingExpiredTask**
   - Triggered at booking end time
   - Marks booking as `complete` or `no_show`
   - Determines no-show based on `no_show_threshold_mins`
2. **BookingStartTask**
   - Triggered at booking start time
   - Validates room is available
   - Sends notifications

#### Task Scheduling

Scheduled in `booking_usecase.go`:

```go
// Example: Schedule expiration task
err := bookingUsecase.ScheduleBookingExpirationTask(
    ctx,
    bookingID,
    endTime,
)
```

#### Task Processing

**File**: `internal/worker/processor.go`

- Initializes task processor with Redis configuration
- Registers task handlers for each task type
- Implements retry logic with exponential backoff
- Default retry attempts: 5 with max interval of 24 hours

**File**: `internal/worker/task_booking.go`

```go
// Handler signature
func (bp *BookingProcessor) HandleBookingExpiredTask(
    ctx context.Context,
    task *asynq.Task,
) error {
    // Process task
    return nil
}
```

#### Running the Worker

In a separate terminal:

```bash
cd back-end
go run ./cmd/worker/main.go
```

Or in Docker:

```bash
docker-compose up -d
# Worker runs as part of the backend service
```

#### Monitoring Tasks

Check pending/failed tasks in Redis:

```bash
# List all pending tasks
redis-cli KEYS "asynq:*"

# View task details
redis-cli HGETALL "asynq:tasks:{taskID}"
```

#### Configuration

**File**: `internal/worker/initial.go`

```go
// Default configuration
NumWorkers:   10           // Number of concurrent task processors
StrictPriority: false      // Process tasks in FIFO order
LogLevel:     asynq.InfoLevel
```

Adjustable via environment variables or code modification.

## 🔧 Troubleshooting

### Common Issues & Solutions

#### Backend Connection Issues

**Error: `failed to connect to PostgreSQL`**

```
Symptom: Backend starts but fails immediately with connection error

Solution:
1. Verify DATABASE_URL format (must include ?sslmode=require for Supabase):
   postgresql://user:password@host:port/database?sslmode=require

2. Check database server is running:
   # For Supabase - verify in Supabase dashboard
   # For local PostgreSQL - check: systemctl status postgresql (Linux)
   #                            or brew services (macOS)

3. Verify credentials are correct:
   psql "postgresql://user:password@host:port/database?sslmode=require"

4. Check firewall allows database port (usually 5432):
   # Test connectivity: telnet host 5432

5. Verify user has permission to access database:
   psql -U postgres -d postgres -c "\\l"  # List databases
```

**Error: `failed to connect to Redis`**

```
Symptom: Backend and worker fail to connect to Redis

Solution:
1. Verify Redis is running:
   redis-cli PING          # Should return PONG
   # Or: systemctl status redis-server (Linux)

2. Check REDIS_ADDR format is correct:
   - Format: host:port
   - Examples: localhost:6379, redis.example.com:6379
   - Not: redis://localhost:6379 (that's a URL format)

3. If Redis requires password, verify REDIS_PASSWORD:
   redis-cli -a "your-password" PING

4. Test connectivity:
   # Install redis-cli if needed: apt-get install redis-tools
   redis-cli -h your-host -p 6379 PING

5. Check firewall allows Redis port (usually 6379):
   telnet your-host 6379

6. If using Redis Cloud or hosted Redis:
   - Use full connection string format
   - Example: redis-cloud-url.redislabs.com:xxxxx
```

**Error: `dial tcp: lookup localhost: no such host`**

```
Symptom: Inside Docker container can't reach host services

Solution:
1. Use Docker host IP instead of localhost:
   - On Docker Desktop: host.docker.internal
   - On Linux: Use container's gateway IP

2. Example .env for Docker:
   DATABASE_URL=postgresql://user:password@host.docker.internal:5432/db
   REDIS_ADDR=host.docker.internal:6379

3. Or use Docker networking:
   docker-compose up  # Manages networking automatically
```

#### Authentication Issues

**Error: `invalid or expired token` / `401 Unauthorized`**

```
Symptom: Valid token rejected by backend

Solution:
1. Verify SUPABASE_JWT_SECRET matches Supabase settings:
   - Go to Supabase Dashboard → Settings → API
   - Copy exact JWT secret value
   - Ensure no extra spaces or quotes

2. Check token format in Authorization header:
   - Correct: Authorization: Bearer eyJhbGc...
   - Incorrect: Authorization: eyJhbGc...  (missing "Bearer ")

3. Validate token structure:
   - Paste token in https://jwt.io
   - Verify payload has: sub (user ID), email, role
   - Check exp (expiration time) hasn't passed

4. Regenerate token if old:
   - Logout and login again in frontend
   - Clear browser localStorage of old tokens

5. Check token claims are set correctly in Supabase:
   - Supabase Dashboard → Auth → Users → User Details
   - Verify user has role claim set
```

**Error: `403 Forbidden - User account suspended`**

```
Symptom: Authenticated user gets forbidden on all requests

Solution:
1. Check user status in database:
   psql "$DATABASE_URL" -c "SELECT id, email, status FROM \"user\" WHERE email='user@example.com';"

2. User status should be 'active'. If 'inactive':
   - Admin reactivates via API: PUT /api/v1/users/:userID with status=active
   - Or update directly: UPDATE "user" SET status='active' WHERE id='...';

3. Verify user has correct role:
   - Check JWT token claims include role: admin or user
   - Verify Supabase user has metadata set

4. Check if user was soft-deleted:
   psql "$DATABASE_URL" -c "SELECT id, deleted_at FROM \"user\" WHERE id='...';"
   # deleted_at should be NULL
```

**Error: `token claims invalid` or `token signature invalid`**

```
Symptom: Token decoding fails even with valid token

Solution:
1. Ensure SUPABASE_JWT_SECRET exactly matches:
   - Go to Supabase Console
   - Settings → API → JWT Secret
   - Copy EXACT value (case-sensitive)
   - In backend .env: SUPABASE_JWT_SECRET="exact-copied-value"

2. Don't include quotes in .env:
   Correct:   SUPABASE_JWT_SECRET=abcd1234efgh5678
   Wrong:     SUPABASE_JWT_SECRET="abcd1234efgh5678"

3. Verify JWT algorithm matches:
   - Supabase uses HS256 by default
   - Check token header: { "alg": "HS256", "typ": "JWT" }
```

#### WebSocket Issues

**Error: `WebSocket connection failed` / `connection refused`**

```
Symptom: Frontend can't establish WebSocket connection

Solution:
1. Verify backend WebSocket server is running:
   - Check backend started without errors
   - Verify PORT is set (default: 8080)

2. Check NEXT_PUBLIC_WS_URL in frontend .env:
   - Format: ws://host:port (note: ws not http)
   - Correct: ws://localhost:8080
   - Wrong: http://localhost:8080, wss://localhost:8080

3. Verify WebSocket route is registered:
   - Backend: internal/controller/websocket_route.go
   - Check routes like: GET /ws/room/:roomID

4. Check CORS allows WebSocket:
   - Backend FRONTEND_URL must match exactly
   - Example: FRONTEND_URL=http://localhost:3000

5. Ensure firewall/network allows port:
   # Test with wscat (npm install -g wscat):
   wscat -c ws://localhost:8080/ws/room/test-room-id

6. Check browser console for errors:
   - Open DevTools → Console
   - Look for WebSocket connection errors
```

**Error: `WebSocket upgrade rejected` / `401`**

```
Symptom: WebSocket connection rejected with auth error

Solution:
1. Verify JWT token is included in WebSocket handshake:
   - Frontend must send token in Authorization header during upgrade
   - react-use-websocket: connectionStatus should be 'CONNECTED'

2. Check token is valid before connecting:
   - Verify token in localStorage: localStorage.getItem('auth-storage')
   - Token should not be expired

3. Verify WebSocket middleware validates token:
   - Backend middleware must extract token from header
   - Check token presence and validity

4. Test WebSocket with proper token:
   wscat -c ws://localhost:8080/ws/room/123 --header "Authorization: Bearer <token>"
```

#### Database Schema Issues

**Error: `relation "booking" does not exist` / `column "start_time" does not exist`**

```
Symptom: Database tables are missing or incomplete

Solution:
1. Restart backend to trigger GORM auto-migration:
   - Stop current backend process
   - Verify DATABASE_URL is correct
   - Run backend again: go run ./api/main.go
   - Check logs for migration messages

2. Manually verify tables were created:
   psql "$DATABASE_URL" -c "\\dt"           # List all tables
   psql "$DATABASE_URL" -c "\\d booking"    # Describe booking table

3. If tables don't exist, manually create them:
   # Option 1: Delete and recreate database (if development):
   # In Supabase: Project → Database → Delete → Recreate

   # Option 2: Run GORM migrations explicitly
   # Add this to code temporarily to force migration

4. Check database encoding:
   psql "$DATABASE_URL" -c "\\l"            # Check "Encoding" column
   # Should be UTF8

5. Verify user has permission to create tables:
   psql "$DATABASE_URL" -c "\\du"           # List users and permissions
```

**Error: `connection pool exhausted` / `too many connections`**

```
Symptom: Requests fail with connection pool error after many concurrent requests

Solution:
1. Check current connections:
   psql "$DATABASE_URL" -c "SELECT count(*) FROM pg_stat_activity;"

2. Increase connection pool in code:
   # In internal/utils/initial.go, adjust:
   db.DB().SetConnPool(sqlDB)
   sqlDB.SetMaxOpenConns(25)  # Increase from default 10

3. Or set in connection string:
   DATABASE_URL=postgresql://user:pass@host/db?maxOpenConns=25

4. Monitor long-running queries:
   psql "$DATABASE_URL" -c "SELECT pid, now() - pg_stat_activity.query_start AS duration, query FROM pg_stat_activity WHERE state != 'idle';"

5. Kill stuck connections if needed:
   psql "$DATABASE_URL" -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid <> pg_backend_pid();"
```

#### Task Queue Issues

**Error: `Asynq: connection refused` / `failed to enqueue task`**

```
Symptom: Task scheduling fails, no background processing

Solution:
1. Ensure Redis is running and accessible:
   redis-cli PING                # Should return PONG
   redis-cli INFO replication    # Check server status

2. Verify REDIS_ADDR is correct in both backend and worker:
   # Backend .env
   REDIS_ADDR=localhost:6379

   # Worker must use same Redis server

3. Check Redis has space available:
   redis-cli INFO memory
   # Check 'used_memory' vs 'maxmemory'

4. View error logs:
   # Backend logs should show task enqueue errors
   # Worker logs should show connection attempts
```

**Error: `Pending Tasks Not Processing` / Tasks stuck in Redis**

```
Symptom: Tasks created but never processed by worker

Solution:
1. Ensure worker process is running:
   # Check if worker process is active
   ps aux | grep "go run"

   # If not, start worker in separate terminal:
   cd back-end && go run ./cmd/worker/main.go

2. Verify Redis connection in worker:
   # Worker logs should show:
   # "Starting Asynq worker..." or similar

3. Check for task errors:
   # Connect to Redis and inspect tasks
   redis-cli
   > KEYS "asynq:*"
   > HGETALL "asynq:tasks:{taskID}"
   > LRANGE "asynq:queues:default" 0 -1

4. Check task payload format:
   # Payload must be valid JSON
   # Verify BookingStatusPayload is correctly serialized

5. Inspect worker logs:
   # Check for panic or error messages
   # Check retry count: (retried X times)

6. Reset queue if needed (WARNING: Deletes pending tasks):
   redis-cli DEL "asynq:queues:default"
   redis-cli FLUSHDB  # Nuclear option - clears all Redis data
```

**Error: `worker panic: unmarshaling payload failed`**

```
Symptom: Worker crashes when processing task

Solution:
1. Check task payload structure matches handler:
   # In task_booking.go, verify BookingStatusPayload format
   # Ensure payload JSON has correct field names (case-sensitive)

2. Verify task is enqueued with correct type:
   # Check asynq.NewTask("task_type", payload)
   # Task type must exactly match registered handler

3. Inspect actual task data in Redis:
   redis-cli
   > HGETALL "asynq:tasks:{taskID}"
   > Check 'Payload' field

4. Re-enqueue task with correct format:
   # Create booking again, which will create new task
   # Or manually delete stuck task and reprocess
```

### Debug Mode

Enable detailed logging for troubleshooting:

```bash
# Backend with debug logging
export DEBUG=true
export LOG_LEVEL=debug
export PORT=8080

# Run with verbose output
go run ./api/main.go

# Output should show:
# time="..." level=debug msg="database connected"
# time="..." level=debug msg="redis connected"
# time="..." level=info msg="Start server on :8080"
```

Monitor logs in real-time:

```bash
# Docker container logs
docker logs -f <container-id> --tail 50

# Local file logging (if configured)
tail -f logs/app.log

# Real-time filter for errors only
tail -f logs/app.log | grep -i error
```

### Performance Troubleshooting

**High Memory Usage by Backend**

```bash
# Monitor backend memory in real-time
docker stats <container-id>

# Check for memory leaks:
# - Look for continuously increasing memory
# - Restart worker if memory grows unbounded

# Check database connection pool size:
psql "$DATABASE_URL" -c "SELECT count(*) as active_connections FROM pg_stat_activity WHERE state = 'active';"

# Optimize connection pool:
# Reduce SetMaxOpenConns if too many idle connections
```

**Slow API Responses / High Query Latency**

```bash
# Enable query logging in PostgreSQL:
# In Supabase Dashboard: Project → Logs → Database Logs

# Check slow queries:
psql "$DATABASE_URL" -c "SELECT query, calls, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# Analyze query plan:
psql "$DATABASE_URL" -c "EXPLAIN ANALYZE SELECT * FROM booking WHERE room_id = '...' AND start_time > NOW();"

# Add missing indexes:
psql "$DATABASE_URL" -c "CREATE INDEX idx_booking_room_date ON booking(room_id, start_time) WHERE deleted_at IS NULL;"

# Monitor Redis latency:
redis-cli --latency
```

**High CPU Usage**

```bash
# Identify hot spots:
# Monitor goroutines: Add /debug/pprof endpoint to backend
# Use pprof to analyze CPU profile:
go tool pprof http://localhost:6060/debug/pprof/profile

# Check for infinite loops or busy-waiting in:
# - WebSocket handlers
# - Background job processing
# - Database query loops
```

### Health Checks

**Backend Health:**

```bash
# Simple connectivity check
curl http://localhost:8080/api/v1/config
# Should return: {"id":1,"start_time":"08:00",...}

# Check specific features
curl -H "Authorization: Bearer <token>" http://localhost:8080/api/v1/booking/me/date/2026-04-22
# Should return valid response

# Test WebSocket (requires wscat)
wscat -c ws://localhost:8080/ws/room/test123
# Should connect successfully
```

**Database Health:**

```bash
# Test PostgreSQL connection
psql "$DATABASE_URL" -c "SELECT 1;"
# Should return: 1

# Check database size
psql "$DATABASE_URL" -c "SELECT pg_size_pretty(pg_database_size(current_database()));"

# Verify all tables exist
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';"
# Should return: 5 (config, holiday, room, user, booking)
```

**Redis Health:**

```bash
# Basic connectivity
redis-cli PING  # Should return: PONG

# Check memory usage
redis-cli INFO memory

# Check connected clients
redis-cli INFO clients

# Test pub/sub (in one terminal)
redis-cli
> SUBSCRIBE test_channel

# In another terminal, publish
redis-cli
> PUBLISH test_channel "hello"
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
