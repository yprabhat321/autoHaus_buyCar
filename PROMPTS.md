# PROMPTS.md — AI Tooling Chat History

This file documents the prompts used with Claude (Anthropic) while building the Car Dealership
Inventory System, as required by the kata's AI Usage Policy.

---

## Session 1 — Project kickoff

**Prompt (user):**

> [Uploaded `AI_Kata_Car_Dealership_Inventory_System_V2.docx` and three reference screenshots of the
> Range Rover and Tata Motors websites.]
>
> i got an assesment to solve this using ai Read the uploaded assignment carefully and implement the
> entire project exactly according to the requirements.
>
> Use the following stack:
> Backend: Node.js, Express.js, MongoDB, Mongoose, JWT Authentication, bcrypt, Jest, Supertest
> Frontend: React (Vite), Tailwind CSS, React Router, Axios
>
> Requirements: Implement every backend API. Implement authentication. Implement authorization
> (Admin/User). Implement vehicle CRUD. Implement inventory purchase. Implement inventory restock.
> Implement search. Build a responsive React frontend. Use clean architecture. Follow SOLID principles.
> Write meaningful backend tests. Use modular folder structure. Generate a professional README. Generate
> PROMPTS.md. Explain the project structure. Explain important design decisions. Make the project
> production-quality but easy to understand.
>
> Do not overengineer the solution. Write code as if it were being reviewed by senior software engineers.
> The code should be readable, modular, maintainable, and interview-friendly.
>
> i have given you some screen short for designing the website. use this type of style and front to make
> it professional. and accroding to assignment required follow all these things

**What Claude did:**

1. Noticed the assignment content that had been auto-extracted into the conversation was actually
   unrelated website HTML (a mismatched extraction), and re-read the uploaded `.docx` directly with
   `pandoc` to get the real requirements before writing any code.
2. Confirmed the sandbox had no local MongoDB and that `mongodb-memory-server` couldn't download its
   binary here (network egress is allow-listed to package registries only) — decided on a two-tier test
   strategy: fast unit tests (mocked Mongoose models, runnable anywhere) plus integration tests
   (Supertest + `mongodb-memory-server`, runnable wherever there's normal internet access).
3. Scaffolded the backend: config, models (`User`, `Vehicle`), middleware (`auth`, `admin`,
   `errorHandler`), controllers (`authController`, `vehicleController`), routes, `app.js`/`server.js`
   split for testability, `ApiError` + `generateToken` utilities.
4. Wrote 20 unit tests and 23 integration tests covering registration/login, vehicle CRUD, search
   filters, purchase (including "can't go negative," "can't exceed stock") and restock (admin-only), and
   RBAC (non-admins forbidden from delete/restock).
5. Installed dependencies and ran the unit suite — all 20 passed on the first run after one fix (see
   below).

## Session 2 — Continuing the build

**Prompt (user):** `Continue`

**What Claude did:**

1. Picked back up mid-build: discovered the frontend `AuthContext`, `Navbar`, `Footer`,
   `ProtectedRoute`, and `VehicleCard` had already been created in the prior turn and reviewed them for
   quality before continuing (rather than re-writing from scratch).
2. Built the remaining frontend pieces: `SearchFilterBar`, `VehicleFormModal` (shared add/edit form),
   `RestockModal`, the `Login`/`Register`/`Dashboard` pages, and `App.jsx` routing.
3. Ran `npm install` and `npm run build` for the frontend to confirm it compiles cleanly with no errors.
4. Used a headless Chromium instance (Playwright, already available in the sandbox) to actually launch
   the built app and screenshot the Login, Register, and (auth-mocked) Dashboard pages, saving them into
   `docs/screenshots/` for the README rather than describing the UI without evidence it renders.
5. Wrote `README.md` (setup instructions, API reference, architecture rationale, real captured test
   output, screenshots, and this AI usage section) and this `PROMPTS.md`.
6. Initialized git and created a commit history that narrates the build in Red → Green → Refactor
   stages, with `Co-authored-by: Claude <noreply@anthropic.com>` trailers on every commit, per the
   assignment's AI co-authorship policy.

---

## Notable debugging exchange

**Issue Claude ran into:** `jest.mock('../../src/models/Vehicle')` (automock) threw
`TypeError: Cannot read properties of undefined (reading 'Symbol(mongoose#Document#scope)')` when the
unit test file required the real Mongoose model to auto-mock it — Mongoose's schema/virtual machinery
isn't automock-safe.

**Fix:** Replaced the automock with an explicit manual factory (`jest.mock('../../src/models/Vehicle',
() => ({ create: jest.fn(), find: jest.fn(), ... }))`) exposing only the static methods the controllers
actually call. Applied the same fix to the `User` model mock. Re-ran the suite — all 20 tests passed.

---

## Reflection

Working with an AI pair inside an actual execution environment (rather than a plain chat window) changed
the shape of these prompts: instead of asking narrow "write me a function" questions, the useful unit was
"build this feature and prove it works" — Claude could install packages, run the test suite, catch its
own mistakes (like the automock failure above), and iterate without me manually copy-pasting errors back
in. My prompting stayed high-level (the original spec, then "Continue"); the value was in Claude
self-correcting against real tool output — actual Jest failures, actual `vite build` output, actual
screenshots — instead of producing code that merely looked plausible.
