# Doctor Finder - React Application

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
<!-- Add other relevant badges like build status, version, etc. if applicable -->

A client-side React application to list, search, filter, and sort doctors based on data fetched from an API. Features include autocomplete search, dynamic filtering/sorting, URL state synchronization, and performance optimizations like lazy loading and list virtualization.

## Overview

This application provides a user-friendly interface for finding doctors. Key functionalities include:

*   Searching for doctors by name with autocomplete suggestions.
*   Filtering based on consultation type (Video Consult / In Clinic) and multiple specialties.
*   Sorting the list by consultation fees (ascending) or experience (descending).
*   Viewing detailed doctor information via cards.

All filtering, searching, and sorting operations occur client-side after an initial data fetch. The application state (filters, search, sort) is synchronized with URL query parameters for persistence and shareability.

## ✨ Features

*   **Autocomplete Search Bar:** ([`src/components/Navbar.tsx`](src/components/Navbar.tsx))
    *   Real-time suggestions (top 3 matches) based on doctor names.
    *   Filters list on suggestion selection or Enter key press.
    *   Debounced input handling for improved performance.
*   **Dynamic Filter Panel:** ([`src/components/FilterPanel.tsx`](src/components/FilterPanel.tsx))
    *   **Consultation Type:** Single-select radio buttons (Video Consult / In Clinic).
    *   **Specialties:** Multi-select checkboxes dynamically populated from API data.
    *   **Sort Options:** Buttons for 'Fees (Low to High)' or 'Experience (High to Low)'.
*   **Doctor List & Card:** ([`src/components/DoctorList.tsx`](src/components/DoctorList.tsx) & [`src/components/DoctorCard.tsx`](src/components/DoctorCard.tsx))
    *   Displays filtered/sorted doctors with comprehensive details (including clinic, address, languages, etc.).
    *   Handles loading ([`src/components/Spinner.tsx`](src/components/Spinner.tsx)) and error states gracefully.
    *   Shows a message when no doctors match the criteria.
*   **Client-Side Logic:** ([`src/hooks/useDoctorFinder.ts`](src/hooks/useDoctorFinder.ts))
    *   Single API data fetch on initial load.
    *   All subsequent filtering, searching, and sorting performed in the browser.
*   **URL State Sync:** ([`src/hooks/useDoctorFinder.ts`](src/hooks/useDoctorFinder.ts))
    *   Reflects current filters, search, and sort options in URL query parameters (`?search=...&consultation=...&specialty=...&sort=...`).
    *   Restores state from URL parameters on page load/navigation.
*   **Performance Optimizations:**
    *   **Lazy Loading:** ([`src/App.tsx`](src/App.tsx)) Uses `React.lazy` and `Suspense` for `FilterPanel` and `DoctorList` to reduce initial bundle size.
    *   **List Virtualization:** ([`src/components/DoctorList.tsx`](src/components/DoctorList.tsx)) Uses `react-window` to efficiently render long lists by only rendering visible items.
*   **Responsive Design:** Built with Tailwind CSS for adaptability across various screen sizes.

## 🛠️ Tech Stack

*   **Framework:** React 18+
*   **Language:** TypeScript 5+
*   **Build Tool:** Vite 5+
*   **Styling:** Tailwind CSS 3+
*   **Routing:** React Router DOM v6
*   **Icons:** Font Awesome (via `@fortawesome/react-fontawesome`)
*   **List Virtualization:** `react-window` + `react-virtualized-auto-sizer`
*   **State Management:** React Hooks (`useState`, `useMemo`, `useEffect`, `useCallback`) + `useSearchParams`
*   **Linting:** ESLint + TypeScript ESLint

## 📁 Project Structure

```plaintext
bajaj/
├── public/               # Static assets (e.g., favicons)
├── src/
│   ├── assets/           # Image assets (if any)
│   ├── components/       # React components
│   │   ├── common/       # Shared simple components (e.g., PlaceholderIcon)
│   │   ├── DoctorCard.tsx  # Displays single doctor details
│   │   ├── DoctorList.tsx  # Displays list of doctors (virtualized)
│   │   ├── FilterPanel.tsx # Filtering and sorting controls
│   │   ├── Navbar.tsx      # Top navigation/search bar
│   │   └── Spinner.tsx     # Loading indicator
│   ├── hooks/            # Custom React hooks
│   │   └── useDoctorFinder.ts # Core logic for data fetching, filtering, state
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   ├── App.css           # App-specific styles (minimal)
│   ├── App.tsx           # Main application layout, routing, lazy loading setup
│   ├── index.css         # Global styles and Tailwind directives
│   ├── main.tsx          # Application entry point
│   └── vite-env.d.ts     # Vite environment types
├── .gitignore            # Git ignore rules
├── eslint.config.js      # ESLint configuration (or .eslintrc.js/json)
├── index.html            # HTML entry point for Vite
├── package.json          # Project dependencies and scripts
├── README.md             # This file
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS configuration (for Tailwind)
├── tsconfig.app.json     # TypeScript config for app source
├── tsconfig.json         # Base TypeScript config
├── tsconfig.node.json    # TypeScript config for Node env (Vite config, etc.)
└── vite.config.ts        # Vite build tool configuration
```

## 🚀 Getting Started

### Prerequisites

*   Node.js (LTS version recommended, e.g., v18 or v20+)
*   npm, yarn, or pnpm

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd bajaj
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    *or*
    yarn install
    *or*
    pnpm install
    *or*
    bun install
    ```

### Running the Development Server

1.  **Start the server:**
    ```bash
    npm run dev
    *or*
    yarn dev
    *or*
    pnpm dev
    *or*
    bun run dev
    ```

2.  Open your browser and navigate to `http://localhost:5173` (or the port specified in the output).

## 📜 Available Scripts

*   `dev`: Starts the development server with Hot Module Replacement (HMR).
*   `build`: Compiles TypeScript and builds the application for production in the `dist/` folder.
*   `lint`: Runs ESLint to analyze code for potential errors and style issues.
*   `preview`: Serves the production build locally for previewing.

## 🌐 API

*   **Data Source URL:** The application fetches data from the URL specified in the `VITE_PUBLIC_DOCTOR_API` environment variable defined in the `.env` file (`https://srijandubey.github.io/campus-api-mock/SRM-C1-25.json`).
*   The application fetches data from this URL once on initial load. All subsequent operations are client-side.

## ✅ Testing (`data-testid`)

This project includes specific `data-testid` attributes required by the assessment criteria for automated testing. Ensure these are correctly implemented on the corresponding elements.

**Examples:**

*   `autocomplete-input`: The search input field.
*   `suggestion-item`: Each item in the autocomplete suggestion list.
*   `doctor-card`: The main container for each doctor's information.
*   `filter-video-consult`: Radio button for video consult filter.
*   `filter-specialty-Dentist`: Checkbox for the 'Dentist' specialty.
*   `sort-fees`: Button to sort by fees.

*(Refer to the full requirements list provided in the assessment for all mandatory `data-testid` values.)*

## 👥 Contributers

<div align="center">
  <a href="https://github.com/ADITYAVOFFICIAL/BAJAJ-QR1/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=ADITYAVOFFICIAL/BAJAJ-QR1" />
</a>
</div>

## 📝 Notes

*   Functionality is prioritized based on the requirements.
*   The "Clear All" filters button is implemented.
*   Browser navigation (Back/Forward) correctly restores state via URL parameters.
*   Ensure you fill the final submission form linked in the assessment details.