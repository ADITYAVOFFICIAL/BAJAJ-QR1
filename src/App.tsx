// src/App.tsx

import React, { Suspense } from 'react'; // Import Suspense
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
// Remove direct imports for lazy components:
// import { FilterPanel } from './components/FilterPanel';
// import { DoctorList } from './components/DoctorList';
import { useDoctorFinder } from './hooks/useDoctorFinder';
import { Spinner } from './components/Spinner'; // Import your loading spinner
import './index.css';

// --- Lazy Load Components ---
// Use React.lazy to dynamically import components.
const FilterPanel = React.lazy(() =>
  import('./components/FilterPanel').then(module => ({ default: module.FilterPanel }))
);
const DoctorList = React.lazy(() =>
  import('./components/DoctorList').then(module => ({ default: module.DoctorList }))
);
// --- End Lazy Load Components ---

/**
 * The main application layout component.
 * Uses lazy loading for FilterPanel and DoctorList to improve initial load performance.
 */
function DoctorFinderLayout() {
  const doctorFinderProps = useDoctorFinder();
  const {
    // Destructure all necessary props from the hook
    allDoctors,
    filteredDoctors,
    isLoading,
    error,
    searchTerm,
    suggestions,
    setSearchTerm,
    updateSearchTermFromSuggestion,
    availableSpecialties,
    consultationType,
    specialties,
    // --- FIX: Destructure correct sort state and handler ---
    sortOptions,       // Destructure the array of active sort options
    toggleSortOption,  // Destructure the correct handler function
    // --- End FIX ---
    setConsultationType,
    toggleSpecialty,
    // setSortOption, // Remove old handler if not needed elsewhere
    clearFilters,
  } = doctorFinderProps;

  // Determine if the *initial* data fetch is happening
  const isInitialDataLoading = isLoading && allDoctors.length === 0;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Navbar is loaded eagerly */}
      <Navbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm} // Debounced update handled within Navbar now
        onSearchSubmit={updateSearchTermFromSuggestion}
        suggestions={suggestions}
      />

      <div className="container mx-auto px-0 sm:px-4 lg:px-8 flex-grow py-6">
        <main className="flex flex-col md:flex-row flex-grow bg-white rounded-lg shadow-lg overflow-hidden">

          {/* --- Suspense for FilterPanel --- */}
          <Suspense fallback={
            <aside className="w-full md:w-72 lg:w-80 flex-shrink-0 p-5 flex items-center justify-center border-r border-gray-200 bg-white">
                <Spinner className="w-8 h-8 text-blue-600" />
            </aside>
          }>
            {/* Render FilterPanel once its code is loaded */}
            <FilterPanel
              // Pass filtered count for display
              totalDoctorsCount={filteredDoctors.length}
              availableSpecialties={availableSpecialties}
              // --- FIX: Pass correct sortOptions array ---
              filters={{
                  consultationType: consultationType,
                  specialties: specialties,
                  sortOptions: sortOptions // Pass the array here
                }}
              // --- End FIX ---
              onConsultationTypeChange={setConsultationType}
              onSpecialtyChange={toggleSpecialty}
              // --- FIX: Pass correct toggleSortOption handler ---
              onSortChange={toggleSortOption} // Pass the correct handler function
              // --- End FIX ---
              onClearFilters={clearFilters}
            />
          </Suspense>
          {/* --- End Suspense for FilterPanel --- */}


          {/* --- Suspense for DoctorList --- */}
          <Suspense fallback={
            <section className="flex-grow flex items-center justify-center p-10">
                <Spinner className="w-12 h-12 text-blue-600" />
            </section>
          }>
            {/* Render DoctorList once its code is loaded */}
            <DoctorList
              doctors={filteredDoctors}
              isLoading={isInitialDataLoading} // Use the flag for initial API load state
              error={error}
            />
          </Suspense>
          {/* --- End Suspense for DoctorList --- */}

        </main>
      </div>

      <footer className="text-center py-4 text-xs text-gray-500 mt-auto">
            Doctor Finder App © {new Date().getFullYear()}
       </footer>
    </div>
  );
}

/**
 * Root application component setting up the Router.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* The DoctorFinderLayout handles the main UI */}
        <Route path="*" element={<DoctorFinderLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;