import React, { Suspense } from 'react';
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
// The import() function returns a Promise which resolves to a module.
// We then access the specific export
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
    sortOption,
    setConsultationType,
    toggleSpecialty,
    setSortOption,
    clearFilters,
  } = doctorFinderProps;

  // Determine if the *initial* data fetch is happening
  // This helps differentiate between API loading and component chunk loading
  const isInitialDataLoading = isLoading && allDoctors.length === 0;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Navbar is loaded eagerly as it's always visible */}
      <Navbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchSubmit={updateSearchTermFromSuggestion}
        suggestions={suggestions}
      />

      <div className="container mx-auto px-0 sm:px-4 lg:px-8 flex-grow py-6">
        <main className="flex flex-col md:flex-row flex-grow bg-white rounded-lg shadow-lg overflow-hidden">

          {/* --- Suspense for FilterPanel --- */}
          {/* Shows a fallback UI while the FilterPanel chunk is loading */}
          <Suspense fallback={
            // Simple fallback matching the panel's approximate size/position
            <aside className="w-full md:w-72 lg:w-80 flex-shrink-0 p-5 flex items-center justify-center border-r border-gray-200 bg-white">
                <Spinner className="w-8 h-8 text-blue-600" />
            </aside>
          }>
            {/* Render FilterPanel once its code is loaded */}
            <FilterPanel
              // Pass the count based on filtered results for a more dynamic display,
              // or use allDoctors.length if you prefer the total count before filtering.
              totalDoctorsCount={filteredDoctors.length}
              availableSpecialties={availableSpecialties}
              filters={{
                  consultationType: consultationType,
                  specialties: specialties,
                  sortOption: sortOption
                }}
              onConsultationTypeChange={setConsultationType}
              onSpecialtyChange={toggleSpecialty}
              onSortChange={setSortOption}
              onClearFilters={clearFilters}
            />
          </Suspense>
          {/* --- End Suspense for FilterPanel --- */}


          {/* --- Suspense for DoctorList --- */}
          {/* Shows a fallback UI while the DoctorList chunk (and its dependencies like react-window) is loading */}
          <Suspense fallback={
            // Simple fallback matching the list's approximate size/position
            <section className="flex-grow flex items-center justify-center p-10">
                <Spinner className="w-12 h-12 text-blue-600" />
            </section>
          }>
            {/* Render DoctorList once its code is loaded */}
            {/* Pass the specific initial data loading flag */}
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