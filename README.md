# AutoHaus - Car Dealership Inventory System

AutoHaus is a full-stack MERN application for managing a dealership inventory and completing vehicle purchases. It provides a customer-facing inventory experience alongside an admin workspace for inventory operations, invoice management, and sales analytics.

The project is built around a realistic Indian vehicle catalogue and uses INR throughout the application.

![AutoHaus login screen](docs/screenshots/login.png)

## Highlights

- Browse, search, filter, and paginate a catalogue of Indian-market vehicles.
- Purchase vehicles with server-side stock validation.
- Automatically generate a unique invoice for every successful purchase.
- View and download professional PDF invoices.
- Admin dashboard with inventory, sales, customer, and vehicle insights.
- Role-based access for customers and administrators.
- Responsive React interface built with the existing AutoHaus Tailwind design system.
- Backend test coverage for authentication, inventory operations, checkout, invoices, PDF output, and authorization.

## Demo access

Use the following account to review the administrator workflow in the demo environment:

| **Role**  | **Email**              | **Password** |
| --------- | ---------------------- | ------------ |
| **Admin** | `admin@dealership.com` | `Admin@123`  |


You can also create a customer account using the **Register** page to test the purchase and invoice journey from a customer perspective.

> The credentials above are for demonstration only. Change them before using the project in a public or production environment.

## Running locally for review

The repository does not include `node_modules` or a real `.env` file. This is intentional: dependencies are installed locally and database credentials must remain private.

To run a downloaded copy, install dependencies in both applications, create `.env` files from the supplied examples, and provide a MongoDB connection string that you control:

```powershell
cd backend
Copy-Item .env.example .env
npm install
npm run dev
```

In a second terminal:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Before starting the backend, update `backend/.env` with either a local MongoDB address or a MongoDB Atlas `MONGO_URI`. The project intentionally does not contain a personal Atlas connection string, password, or JWT secret. Once both services are running, open `http://localhost:5173` and use the demo account above.

## What can be tested

### Customer flow

1. Register or sign in.
2. Browse the available inventory and use the search filters.
3. Open a vehicle and confirm a purchase.
4. Review the order in **Purchases**.
5. Open **Invoices** to view the generated invoice or download its PDF.

### Admin flow

1. Sign in using the demo admin account.
2. Add, edit, delete, or restock inventory from the dashboard.
3. Review inventory and sales metrics in **Dashboard**.
4. Use **Invoices** to search, filter, sort, view, download, or archive invoice records.

## Technology stack

| **Category**                  | **Technology / Tools**                 |
| ----------------------------- | -------------------------------------- |
| **Frontend**                  | React 18, Vite, React Router, Axios    |
| **Styling**                   | Tailwind CSS                           |
| **Backend**                   | Node.js, Express.js                    |
| **Database**                  | MongoDB, Mongoose                      |
| **Authentication & Security** | JWT (JSON Web Token), bcryptjs         |
| **PDF Generation**            | PDFKit                                 |
| **Data Visualization**        | Recharts                               |
| **Testing**                   | Jest, Supertest, mongodb-memory-server |


## Architecture

The application is separated into independently runnable frontend and backend applications.

```text
frontend (React)  --->  REST API (Express)  --->  MongoDB
                         |
                         +-- JWT authentication and role checks
                         +-- inventory, purchase, invoice, and analytics services
```

The backend follows a modular MVC-style structure:

```text
backend/src/
├── config/        Database connection
├── controllers/   Request handling and API responses
├── middleware/    Authentication, authorization, and error handling
├── models/        Mongoose schemas
├── routes/        API route definitions
├── services/      Checkout and invoice business logic
├── utils/         Shared helpers, pagination, and PDF generation
└── scripts/       Development inventory utilities
```

## Development approach

The project was developed iteratively with a test-first mindset: define the expected behaviour, implement the smallest reliable solution, and verify it through unit or integration tests. This approach was especially useful for authentication, stock reduction, invoice generation, and authorization rules, where incorrect behaviour would directly affect data integrity.

## My AI Usage

### Tools used

- **OpenAI Codex** - used for implementation assistance, repository maintenance, test execution, documentation updates, and debugging.
- **Gemini / Google Antigravity** - used for project planning, environment setup, and iterative development support.
- **Claude** - used for backend scaffolding, test boilerplate, UI component drafting, and development documentation.

### How AI was used

AI tools were used as pair-programming assistants rather than as a substitute for project ownership. I used them to speed up repetitive setup, draft test cases, explore component structure, generate initial code suggestions, and diagnose errors. I then reviewed and adapted the output to match the project requirements, including role-based security, inventory validation, invoice behaviour, and the AutoHaus UI design.

The work followed a Red-Green-Refactor approach for backend features: define expected behaviour, implement the smallest reliable change, run the relevant tests, and refine the code after verification. The final backend test suite covers authentication, inventory management, purchases, invoices, PDF downloads, stock safety, and authorization.

### Reflection

AI made the development workflow faster, especially for boilerplate and test setup, while still requiring careful review of business rules and real test output. The most valuable use was iterative problem solving: turning requirements into testable behaviours, validating generated code against a running application, and refining the result until the customer and admin journeys worked together.

The detailed prompt record and development notes are available in [PROMPTS.md](PROMPTS.md).

## Key implementation details

### Inventory safety

Stock is checked and decremented on the server. A purchase is rejected with a clear response when stock is unavailable, so the vehicle quantity cannot become negative.

### Invoices

Each completed purchase creates a MongoDB `Invoice` record with a number in this format:

```text
INV-YYYYMMDD-0001
```

The invoice stores the customer, vehicle, quantity, price, total amount, payment status, invoice status, and historical snapshots needed to preserve the receipt. The purchase service uses a MongoDB transaction when supported and has a compensating fallback for standalone development databases.

### Access control

- Public registration creates **customer** accounts only.
- Customers can access only their own purchases and invoices.
- Inventory management, sales analytics, and invoice archiving are restricted to **admins**.
- All protected routes require a valid JWT.

## Local setup

### Prerequisites

- Node.js 18 or newer
- MongoDB locally, or a MongoDB Atlas connection string

### 1. Clone and configure the backend

```bash
cd backend
npm install
```

Create `backend/.env` from `backend/.env.example` and configure it:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/car_dealership
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

Start the API:

```bash
npm run dev
```

The backend runs at `http://localhost:5000`.

### 2. Configure and start the frontend

```bash
cd ../frontend
npm install
```

Create `frontend/.env` from `frontend/.env.example`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the React application:

```bash
npm run dev
```

Open `http://localhost:5173` in the browser.

## Inventory utilities

Run these commands from `backend/` when needed:

| Command | Purpose |
|---|---|
| `npm run seed` | Replaces database data with the project demo dataset and demo accounts. |
| `npm run populate:inventory` | Adds missing vehicles from the Indian-market catalogue without deleting existing data. |
| `npm run sync:inventory-images` | Applies the standard local vehicle images. |
| `npm run assign:unique-images` | Generates and assigns unique local image assets for the inventory catalogue. |

> `npm run seed` is intentionally destructive. Do not run it against a database whose existing data you want to keep.

## API overview

All routes except registration and login require `Authorization: Bearer <token>`.

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Create a customer account | Public |
| POST | `/api/auth/login` | Sign in and receive a JWT | Public |
| GET | `/api/vehicles` | Browse paginated inventory | Authenticated |
| GET | `/api/vehicles/search` | Search and filter inventory | Authenticated |
| POST | `/api/vehicles/:id/purchase` | Purchase a vehicle and generate an invoice | Authenticated |
| GET | `/api/purchases` | View purchase history | Authenticated |
| GET | `/api/invoices` | View the signed-in customer's invoices | Authenticated |
| GET | `/api/invoices/:id/download` | Download an invoice PDF | Owner or Admin |
| POST | `/api/vehicles` | Add a vehicle | Admin |
| PUT | `/api/vehicles/:id` | Update a vehicle | Admin |
| DELETE | `/api/vehicles/:id` | Delete a vehicle | Admin |
| POST | `/api/vehicles/:id/restock` | Restock a vehicle | Admin |
| GET | `/api/admin/invoices` | Search and manage all invoices | Admin |
| DELETE | `/api/admin/invoices/:id` | Soft-archive an invoice | Admin |
| GET | `/api/analytics/inventory` | Inventory and sales analytics | Admin |

## Testing

The backend test suite includes both focused unit tests and end-to-end integration tests against an in-memory MongoDB instance.

```bash
cd backend
npm run test:unit
npm run test:integration
npm test
```

The tests cover:

- Registration and login
- JWT and role-based access control
- Vehicle CRUD, searching, and restocking
- Stock validation and out-of-stock scenarios
- Purchase creation and inventory reduction
- Invoice numbering, ownership checks, PDF downloads, and soft deletion

Build the frontend for production with:

```bash
cd frontend
npm run build
```

## Deployment notes

For deployment, set the backend environment variables on the hosting platform and set `VITE_API_BASE_URL` to the deployed API URL before building the frontend. Use a managed MongoDB database such as MongoDB Atlas, keep `JWT_SECRET` private, and replace the demo admin password.

## Screenshots

| Login | Dashboard |
|---|---|
| ![Login](docs/screenshots/login.png) | ![Dashboard](docs/screenshots/dashboard.png) |

---

Built as a full-stack inventory management project with a focus on clear workflows, secure access control, and a practical dealership experience.
