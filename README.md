# Political Arena — Full-Stack Application

This project is composed of two separate GitHub repositories:

- **Frontend**: React application for the user interface.  
  https://github.com/your-org/political-arena-frontend
- **Backend**: Express/Node.js API with PostgreSQL, background game services, and scheduled tasks.  
  https://github.com/your-org/political-arena-backend

---

## Table of Contents

1. [Backend](#backend)  
   1.1 [Prerequisites](#prerequisites)  
   1.2 [Installation & Running](#installation--running)  
   1.3 [File Structure](#file-structure)  
2. [Frontend](#frontend)  
   2.1 [Prerequisites](#prerequisites-1)  
   2.2 [Installation & Running](#installation--running-1)  
   2.3 [File Structure](#file-structure-1)  
3. [Contributing](#contributing)  
4. [License](#license)

---

## Backend

### Prerequisites

- **Node.js** v16+  
- **PostgreSQL** instance  
- **Cloudinary** account (for image uploads)  
  ```

### Installation & Running

```bash
# clone & install
git clone https://github.com/9na8t3b5ca8e/political-arena-backend.git
cd political-arena-backend
npm install

# copy and configure env
cp .env.example .env
# edit .env with your credentials

# in development
npm run dev   # uses nodemon

# or to start normally
npm start
```

### File Structure

```
political-arena-backend/
├── config/
│   ├── db.js            # PostgreSQL pool setup
│   ├── cloudinary.js    # Cloudinary SDK configuration
│   └── constants.js     # Game constants (timing, polling firms, etc.)
├── controllers/         # HTTP request handlers
│   ├── authController.js
│   ├── profileController.js
│   ├── electionController.js
│   ├── gameController.js
│   └── actionController.js
├── routes/              # Express route definitions
│   ├── authRoutes.js
│   ├── profileRoutes.js
│   ├── electionRoutes.js
│   ├── gameRoutes.js
│   └── actionRoutes.js
├── db/
│   └── init.js          # Create tables & seed initial data
├── services/            # Core business logic & background tasks
│   ├── electionService.js
│   ├── electionCycleManager.js
│   ├── gameClockService.js
│   └── taskScheduler.js
├── middleware/          # Express middleware (auth, validation, uploads)
│   ├── auth.js
│   ├── validation.js
│   └── uploads.js
├── .gitignore
├── package.json
├── pso-seed.js          # PSO-specific seed script
├── election-cycles.js   # Election cycle definitions
├── state-data.js        # Static state-by-state data
└── server.js            # Main application entry point: sets up Express, mounts routes, starts server & core services
```

---

## Frontend

### Prerequisites

- **Node.js** v16+  
- Optionally create a `.env.local` with:
  ```bash
  REACT_APP_API_URL=https://localhost:10000/api
  ```

### Installation & Running

```bash
# clone & install
git clone https://github.com/9na8t3b5ca8e/political-arena-frontend.git
cd political-arena-frontend
npm install

# start dev server
npm start

# to build for production
npm run build
```

### File Structure

```
political-arena-frontend/
├── public/
│   ├── index.html       # HTML template
│   └── _redirects       # Redirects config for hosting (e.g. Netlify)
├── src/
│   ├── index.js         # React entry point
│   ├── App.js           # Root component & routing
│   ├── api.js           # API helper (fetch wrapper)
│   ├── state-data.js    # Static political data for all U.S. states
│   ├── components/      # Reusable UI components
│   │   ├── Navbar.js
│   │   └── PasswordChangeModal.js
│   └── pages/           # Route-level pages
│       ├── HomePage.js
│       ├── MapPage.js
│       ├── StatePage.js
│       └── ProfilePage.js
├── build/               # Production build output (auto-generated)
│   └── static/js/
├── .gitignore
└── package.json
```

---

## Contributing

1. Fork the desired repo (frontend or backend).  
2. Create a feature branch:  
   ```bash
   git checkout -b feat/your-feature
   ```  
3. Commit your changes, push, and open a Pull Request.  
4. Ensure new code follows existing style and, when applicable, includes tests.

---

## License

This project is licensed under the MIT License.
