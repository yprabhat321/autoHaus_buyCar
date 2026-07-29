# AutoHaus - Car Dealership Inventory & Sales Management System

AutoHaus is a full-stack car dealership inventory management and purchase system. Built with Node.js, Express, MongoDB Atlas, and React (Vite + Tailwind CSS), the project was developed following Test-Driven Development (TDD) practices.

---

## 🔑 Demo Admin Credentials

Use the following account to review the administrator workflow in the demo environment:

| **Role**  | **Email**              | **Password** |
| --------- | ---------------------- | ------------ |
| **Admin** | `admin@dealership.com` | `Admin@123`  |

---

## 📸 Application Screenshots & Admin Workflow Showcase

### 1. Admin Inventory Overview & Revenue Intelligence
![Admin Inventory Overview](docs/screenshots/admin-inventory-overview.png)

### 2. Admin Sales & Stock Analytics Charts
![Admin Analytics Charts](docs/screenshots/admin-analytics-charts.png)

### 3. Recent Activity & Order Audit Log
![Admin Activity Log](docs/screenshots/admin-activity-log.png)

### 4. Dealership Sales Transactions Log
![Admin All Purchases](docs/screenshots/admin-all-purchases.png)

### 5. Invoice Management & PDF Download Portal
![Admin Invoice Management](docs/screenshots/admin-invoice-management.png)

---

## 🚀 Key Features

### 🛒 Customer Portal
- **Vehicle Catalog**: Search and filter vehicles by category, brand, price range, and availability.
- **Vehicle Details**: View comprehensive vehicle specifications and real-time stock levels.
- **Purchase Workflow**: One-click checkout with automatic stock updates and PDF invoice generation.
- **Purchase History**: Review past orders and download official purchase receipts.

### 🛡️ Admin Portal
- **Inventory Management**: Add new vehicles, update vehicle details, restock existing inventory, or soft-delete entries.
- **Sales & Stock Analytics**: Monitor total inventory value, revenue summaries, and low-stock alerts.
- **Audit Logs**: Track dealership operational activities and customer purchases.

---

## 🧪 Test-Driven Development (TDD) Suite

The backend business logic was developed using the TDD cycle (**Red-Green-Refactor**).

### Running Tests
To run the automated backend test suite:
```bash
cd backend
npm test
```

### Test Results
- **Unit Tests**: `auth.controller.test.js`, `vehicle.controller.test.js` (Pass)
- **Integration Tests**: `auth.integration.test.js`, `vehicles.integration.test.js` (Pass)
- **Status**: 4 Test Suites Passed, 35 Tests Passed (100% Coverage on core business logic).

---

## 💻 Local Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas or local MongoDB instance

### 1. Clone Repository
```bash
git clone https://github.com/yprabhat321/autoHaus_buyCar.git
cd autoHaus_buyCar
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Configure `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://prabhat:Yprabhat321@cluster0.ykagong.mongodb.net/?appName=Cluster0
JWT_SECRET=supersecretjwtkey_buycar_2024
JWT_EXPIRES_IN=7d
NODE_ENV=development
```
Run backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
Configure `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```
Run frontend server:
```bash
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🤖 My AI Usage

### 1. Tools Utilized
- **Google Antigravity AI**: Used for project structure planning, environment setup, and pair programming during debugging sessions.
- **Claude (Claude 3.7 Sonnet)**: Assisted in writing complex Express middleware, PDF receipt generation logic, and modular React components.
- **OpenAI Codex**: Used for generating TDD test cases, Jest assertion boilerplates, and code completion suggestions.

### 2. How AI Was Applied
- **Architecture & Setup**: I planned the project architecture and used AI to quickly generate starter configurations for Express, Mongoose, Vite, and Tailwind CSS.
- **TDD Test Creation**: I specified test criteria for authentication and stock depletion rules, then used AI tools to draft the corresponding failing Jest tests before writing implementation code.
- **Feature Implementation**: I directed the implementation of services like `purchaseService.js` and `createInvoicePdf.js`, refining AI-suggested code to meet strict validation and transaction rules.
- **UI Components**: Used AI to build responsive Tailwind layouts for vehicle cards, search filter bars, and admin analytics dashboards based on my design specifications.

### 3. Reflection
Integrating AI tools into my workflow acted as an efficient pair programmer. It allowed me to move faster through boilerplate setup and UI formatting while maintaining full control over the code quality, system architecture, and TDD discipline.
