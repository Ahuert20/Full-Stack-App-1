# Travlr Getaways - Travel Booking Application

A full-stack travel booking web application built with the MEAN stack (MongoDB, Express, Angular, Node.js).

## Project Overview

Travlr Getaways allows users to browse travel packages, view destination details, and book trips. The application features a customer-facing website and an admin panel for managing trips.

## Architecture

### Frontend
- **Customer Website**: Static HTML pages with Handlebars templates
- **Admin Panel**: Angular SPA (runs on port 4200)

### Backend
- **API Server**: Express.js RESTful API
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication with Passport.js

### Enhanced MVC Architecture (Module 3 Enhancement)

The backend follows a proper MVC (Model-View-Controller) pattern with an additional Services layer:
Routes → Controllers → Services → Models

- **Routes** (`app_api/routes/`): Define API endpoints and apply validation
- **Controllers** (`app_api/controllers/`): Handle HTTP requests/responses
- **Services** (`app_api/services/`): Contain business logic
- **Models** (`app_api/models/`): Define database schemas
- **Middleware** (`app_api/middleware/`): Input validation and sanitization

## Security Features

### NoSQL Injection Prevention
- **express-mongo-sanitize**: Automatically strips `$` and `.` from user input
- **express-validator**: Validates and sanitizes all input data
- **Safe Query Construction**: Never passes `req.body` directly to database queries

### Authentication
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: PBKDF2 with salt for secure password storage
- **Protected Routes**: Middleware enforces authentication on sensitive endpoints

### Input Validation
All API endpoints validate:
- Data types (string, number, date, ObjectId)
- Length constraints (min/max characters)
- Format requirements (email, URL, date format)
- Business rules (future dates, positive prices, etc.)

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login and receive JWT token

### Trips
- `GET /api/trips` - List all trips (with optional filters)
- `GET /api/trips/:tripCode` - Get trip by code
- `POST /api/trips` - Create new trip (requires auth)
- `PUT /api/trips/:tripCode` - Update trip (requires auth)
- `DELETE /api/trips/:tripCode` - Delete trip (requires auth)

### Bookings
- `POST /api/trips/:tripId/book` - Book a trip (requires auth)
- `GET /api/my-trips` - Get user's booked trips (requires auth)

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)

### Setup Steps

1. **Clone the repository**
```bash
   git clone <repository-url>
   cd travlr
```

2. **Install dependencies**
```bash
   npm install
```

3. **Configure environment variables**
   
   Create a `.env` file in the project root:
DB_HOST=127.0.0.1
JWT_SECRET=your_secret_key_here

4. **Seed the database** (optional)
```bash
   node app_api/models/seed.js
```

5. **Start the server**
```bash
   npm start
```

6. **Access the application**
   - Customer Website: http://localhost:3000
   - Admin Panel: http://localhost:4200 (if Angular app is running)
   - API: http://localhost:3000/api

## Project Structure
travlr/
├── app_api/                 # Backend API
│   ├── config/             # Configuration files
│   ├── controllers/        # HTTP request handlers
│   ├── middleware/         # Validation middleware
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API route definitions
│   └── services/           # Business logic layer
├── app_server/             # Server-side rendering
│   ├── controllers/        # Page controllers
│   ├── routes/             # Page routes
│   └── views/              # Handlebars templates
├── public/                 # Static HTML files and assets
│   ├── css/               # Stylesheets
│   ├── images/            # Images
│   └── *.html             # Static pages
├── .env                    # Environment variables
├── app.js                  # Express app configuration
├── package.json            # Dependencies
└── README.md              # This file

## Module 3 Enhancements

This project has been enhanced as part of CS 499 Module 3 to demonstrate software design and engineering skills:

### 1. Services Layer Implementation
- Separated business logic from HTTP handling
- Created dedicated service files for trips, bookings, and authentication
- Improved code maintainability and testability

### 2. Input Validation
- Added express-validator middleware
- Comprehensive validation rules for all endpoints
- Prevents invalid data from reaching the database

### 3. Security Improvements
- Implemented express-mongo-sanitize to prevent NoSQL injection
- Enhanced password validation (minimum 6 characters)
- Email format validation
- Safe query construction practices

### 4. Documentation
- Added JSDoc comments to all functions
- Documented parameters, return values, and error conditions
- Created comprehensive README with architecture diagrams
- API endpoint documentation

### 5. Code Quality
- Consistent error handling across all endpoints
- Proper HTTP status codes
- Descriptive error messages
- Clean code organization

## Development

### Running in Development Mode
```bash
npm start
```

### Testing API Endpoints

Using curl or Postman:

```bash
# Register a new user
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get all trips
curl http://localhost:3000/api/trips

# Get trips filtered by location
curl "http://localhost:3000/api/trips?location=Bali"
```

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Authentication**: Passport.js, JWT
- **Validation**: express-validator
- **Security**: express-mongo-sanitize
- **Frontend**: HTML, CSS, Handlebars
- **Admin Panel**: Angular

## License

This project is for educational purposes as part of the CS 499 Computer Science Capstone course.

## Author

Austin Huertas

## Course Outcomes Addressed

- **CO2**: Professional communication through comprehensive documentation
- **CO4**: Industry-standard tools and MVC architecture
- **CO5**: Security mindset with validation and injection prevention
