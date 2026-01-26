# Admin Online Learning

Administration system for an online learning platform, built with React, TypeScript, Vite, and TailwindCSS.

## 📋 System Requirements

Before you begin, make sure your computer has the following installed:

-   **Node.js**: version 16.x or higher (18.x recommended)
-   **npm**: version 8.x or higher (comes with Node.js)
-   **Git**: for cloning the repository

Check installed versions:

```bash
node --version
npm --version
git --version
```

## 🚀 Installation Steps

### Step 1: Clone the repository

```bash
git clone https://github.com/PTIT-graduation-project-2025-D21/Admin-Online-Learning.git
git clone https://github.com/PTIT-graduation-project-2025-D21/Web-Online-Learning.git
```

### Step 2: Install dependencies

Use npm to install all required packages:

```bash
npm install
npm run dev
```

This process may take a few minutes. Npm will automatically install all dependencies listed in `package.json`.

### Step 3: Configure API URL (Optional)

The project uses `public/config.js` file to configure the API URL. By default, the API URL is set to:

```javascript
window.config = {
    API_URL: 'https://ptit-online-api.site/api/v1',
}
```

If you want to change the API URL, edit the `public/config.js` file:

```javascript
window.config = {
    API_URL: 'http://localhost:3000/api/v1', // Your API URL
}
```

### Step 4: Run the project in development mode

```bash
npm start
```

or

```bash
npm run dev
```

The application will run at: `http://localhost:8158`

The server will automatically reload when you make code changes.

## 📦 Available Commands

Below are the npm scripts you can use:

### Development

```bash
npm start           # Run development server
npm run dev         # Alias for npm start
```

### Build

```bash
npm run build       # Build project for production
npm run preview     # Preview the build before deployment
```

### Code Quality

```bash
npm run lint        # Check code errors with ESLint
npm run lint:fix    # Automatically fix ESLint errors
npm run prettier    # Check code formatting
npm run prettier:fix # Automatically format code
npm run format      # Run both prettier:fix and lint:fix
```

## 🏗️ Build for Production

To build the project for production:

```bash
npm run build
```

The built files will be created in the `build/` directory. You can deploy this directory to your server.

To preview the build:

```bash
npm run preview
```

## 🛠️ Technologies Used

### Core

-   **React 18.2.0** - UI Library
-   **TypeScript 4.9.3** - Type-safe JavaScript
-   **Vite 4.3.3** - Fast build tool and dev server
-   **React Router 6.9.0** - Routing

### UI & Styling

-   **TailwindCSS 3.3.1** - CSS framework
-   **Framer Motion 10.8.5** - Animation
-   **React Icons 4.8.0** - Icon library
-   **ApexCharts 3.37.3** - Charts
-   **React Quill 2.0.0** - Rich text editor

### State Management

-   **Redux Toolkit 1.9.3** - State management
-   **React Redux 8.0.5** - React bindings for Redux
-   **Redux Persist 6.0.0** - Persist state

### Form & Validation

-   **Formik 2.2.9** - Form management
-   **Yup 1.1.1** - Schema validation

### HTTP Client

-   **Axios 1.3.4** - HTTP requests

### Utilities

-   **Lodash 4.17.21** - Utility functions
-   **Day.js 1.11.7** - Date manipulation
-   **i18next 22.4.13** - Internationalization

## 📁 Project Structure

```
Admin-Online-Learning/
├── public/                 # Static assets
│   ├── config.js          # API configuration
│   ├── data/              # Static data files
│   └── img/               # Images
├── src/
│   ├── @types/            # TypeScript type definitions
│   ├── assets/            # Asset files (styles, markdown, svg)
│   ├── components/        # React components
│   │   ├── docs/          # Documentation components
│   │   ├── layouts/       # Layout components
│   │   ├── route/         # Route components
│   │   ├── shared/        # Shared components
│   │   ├── template/      # Template components
│   │   └── ui/            # UI components
│   ├── configs/           # Configuration files
│   ├── constants/         # Constants
│   ├── locales/           # i18n translations
│   ├── mock/              # Mock data and fake API
│   ├── services/          # API services
│   ├── store/             # Redux store
│   ├── utils/             # Utility functions
│   ├── views/             # Page views
│   ├── App.tsx            # Root component
│   └── main.tsx           # Entry point
├── package.json           # Dependencies
├── vite.config.ts         # Vite configuration
├── tailwind.config.cjs    # TailwindCSS configuration
└── tsconfig.json          # TypeScript configuration
```

## 🌐 Server Configuration

The project is configured to run with the following settings:

-   **Port**: 8158
-   **Host**: 0.0.0.0 (allows access from network)
-   **Base URL**: /learning-cms/

## ⚙️ Advanced Configuration

### Change port

To change the port, edit the `vite.config.ts` file:

```typescript
server: {
    host: true,
    port: 3000, // Your port
}
```

### Change base URL

If you deploy to a different subdirectory, change `base` in `vite.config.ts` and `homepage` in `package.json`:

```typescript
// vite.config.ts
base: '/your-path/',
```

```json
// package.json
"homepage": "/your-path"
```

## 🐛 Troubleshooting

### Error installing dependencies

If you encounter errors when running `npm install`, try:

```bash
# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Port already in use

If port 8158 is already in use, you can:

1. Change the port in `vite.config.ts`
2. Or kill the process using that port

### API connection error

-   Check the API URL in `public/config.js`
-   Make sure the API server is running
-   Check CORS configuration on the API server

## 📝 Notes

-   The project uses **mock API** (MirageJS) which can be enabled/disabled in `src/configs/app.config.ts`:

    ```typescript
    enableMock: false // Set true to use mock API
    ```

-   The default language is **Vietnamese** (can be changed in `src/configs/app.config.ts`)

## 👥 Contributing

When contributing code, please ensure:

1. Code is formatted:

    ```bash
    npm run format
    ```

2. No lint errors:
    ```bash
    npm run lint
    ```

## 📄 License

[Add your license information here]

## 📞 Contact

[Add your contact information here]
