# FleetLink Vehicle Management System

FleetLink is a full-stack application for managing and booking vehicles based on availability and capacity requirements. The system includes user interfaces for searching, booking, and managing vehicles.

## Project Structure

```
fleetlink/
├── backend/                 # Node.js + Express backend
│   ├── package.json         # Backend dependencies
│   ├── src/
│   │   ├── server.js        # Express server setup
│   │   ├── controllers/     # Business logic
│   │   │   ├── bookingsController.js  # Booking creation, listing, deletion
│   │   │   └── vehiclesController.js  # Vehicle creation and availability
│   │   ├── models/          # Mongoose schemas
│   │   │   ├── Booking.js   # Booking data model
│   │   │   └── Vehicle.js   # Vehicle data model
│   │   ├── routes/          # API route definitions
│   │   │   ├── bookings.js  # Booking endpoints
│   │   │   ├── index.js     # Main router
│   │   │   └── vehicles.js  # Vehicle endpoints
│   │   ├── tests/           # Jest test suites
│   │   │   └── availability.test.js  # Test vehicle availability
│   │   └── utils/           # Utility functions
│   │       └── Duration.js  # Ride duration calculation
│   └── Dockerfile           # Backend container definition
│
├── frontend/                # React + Vite frontend
│   ├── package.json         # Frontend dependencies
│   ├── index.html           # HTML entry point
│   ├── vite.config.js       # Vite configuration
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── main.jsx         # Application entry point
│   │   ├── App.jsx          # Main application component
│   │   ├── components/      # Reusable React components
│   │   │   ├── VehicleCard.jsx  # Vehicle display component
│   │   │   ├── Spinner.jsx  # Loading indicator
│   │   │   └── components.css   # Component styles
│   │   ├── pages/           # Page components
│   │   │   ├── AddVehicle.jsx   # Vehicle creation form
│   │   │   ├── SearchBook.jsx   # Vehicle search and booking
│   │   │   ├── Bookings.jsx     # Booking management
│   │   │   └── pages.css        # Page styles
│   │   ├── services/        # API clients
│   │   │   └── api.js       # Axios setup and endpoint wrappers
│   │   └── assets/          # Images and icons
│   └── Dockerfile           # Frontend container definition
│
└── docker-compose.yml       # Multi-container orchestration
```

## Implemented Features

### Backend APIs

- `POST /api/vehicles` - Create a new vehicle
- `GET /api/vehicles/available` - Find available vehicles based on criteria
- `POST /api/bookings` - Create a new booking
- `GET /api/bookings` - List all bookings
- `DELETE /api/bookings/:id` - Cancel a booking

### Frontend Pages

- **Add Vehicle**: Form to add new vehicles to the fleet
- **Search & Book**: Search for available vehicles and book them
- **Bookings**: View and cancel existing bookings

## Key Algorithms

### Ride Duration Calculation
The system calculates ride duration using the formula:
```javascript
estimatedRideDurationHours = Math.abs(parseInt(toPincode) - parseInt(fromPincode)) % 24
```

This takes the absolute difference between the pincodes, applies modulo 24 to keep the duration within a day, and returns the result as hours.

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (for local development)

### Running with Docker

The entire application stack can be started with a single command:

```bash
# Build and start all services
docker compose up -d --build

# To view logs
docker compose logs -f

# To stop all services
docker compose down
```

This will start:
1. MongoDB database
2. Backend API server (available at http://localhost:5000/api)
3. Frontend web application (available at http://localhost:3000)

### Local Development

#### Backend

```bash
cd backend
npm install
npm run dev  # Starts with nodemon for auto-reload
```

#### Frontend

```bash
cd frontend
npm install
npm run dev  # Starts Vite dev server
```

## Testing

The project includes automated tests for the backend:

```bash
cd backend
npm test
```

## Architecture

- **Frontend**: React 18 with Vite for fast bundling
- **Backend**: Node.js with Express and Mongoose
- **Database**: MongoDB
- **Containerization**: Docker with multi-stage builds
- **API**: RESTful JSON API with CORS support
