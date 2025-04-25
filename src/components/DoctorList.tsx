import React from 'react'; // Import React for React.memo
import { Doctor } from '../types';
import { DoctorCard } from './DoctorCard'; // Assuming DoctorCard is also memoized or simple enough
import { Spinner } from './Spinner';

interface DoctorListProps {
  /** Array of doctor objects to display */
  doctors: Doctor[];
  /** Boolean indicating if data is currently being loaded */
  isLoading: boolean;
  /** String containing an error message, or null if no error */
  error: string | null;
}

/**
 * Internal component logic for rendering the list of DoctorCard components
 * or status messages (loading, error, empty).
 */
const DoctorListComponent: React.FC<DoctorListProps> = ({ doctors, isLoading, error }) => {

  // Function to render the main content based on state
  const renderContent = () => {
    // --- Loading State ---
    if (isLoading) {
      return (
        <div
            role="status" // Indicate loading status
            aria-live="polite" // Announce loading state changes
            className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 p-8 text-center" // Increased min-height
        >
          <Spinner className="w-14 h-14 text-blue-600 mb-5" /> {/* Slightly larger spinner */}
          <p className="text-lg font-medium text-gray-700">Loading Doctors...</p>
          <p className="text-sm text-gray-600 mt-1">Please wait while we fetch the information.</p>
        </div>
      );
    }

    // --- Error State ---
    if (error) {
      return (
        <div
            role="alert" // Indicate error message
            className="flex flex-col items-center justify-center min-h-[400px] text-red-700 bg-red-50 border-2 border-red-200 rounded-lg p-8 text-center shadow-md" // More prominent border/shadow
        >
           {/* Error Icon */}
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-red-400 mb-4"> {/* Larger icon */}
             <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.008v.008H12v-.008Z" />
           </svg>
          <p className="text-xl font-semibold mb-2 text-red-800">Error Loading Doctors</p>
          <p className="text-base mb-4 text-red-700">{error}</p> {/* Slightly larger error text */}
          <p className="text-sm text-gray-600">Please try refreshing the page or check the API endpoint.</p>
        </div>
      );
    }

    // --- Empty State ---
    if (doctors.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 p-8 text-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-100/80"> {/* Dashed border, slightly different bg */}
          {/* Magnifying Glass Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-20 h-20 text-gray-400 mb-5"> {/* Larger icon */}
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <p className="text-2xl font-semibold text-gray-700 mb-2">No Doctors Found</p>
          <p className="text-base text-gray-600">We couldn't find any doctors matching your current search and filters.</p>
          <p className="text-sm text-gray-500 mt-1">Try adjusting the search term or filter options.</p>
        </div>
      );
    }

    // --- Success State (Doctors list) ---
    return (
      <div>
        {/* Screen-reader only heading announcing results is good practice,
            but the count is now visually displayed in FilterPanel.
            Keeping aria-live is important for announcing updates. */}
        <h2 className="sr-only">
            List of available doctors matching filters ({doctors.length} found)
        </h2>
        {/* Use aria-live to announce changes when filters update the list */}
        {/* Increased spacing between cards */}
        <div aria-live="polite" className="space-y-5 md:space-y-6">
            {doctors.map((doctor) => (
              // Assuming DoctorCard is also memoized for best results
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
        </div>
      </div>
    );
  };

  // --- Main Section Element ---
  return (
    // `flex-grow` takes remaining space. `min-h-0` is crucial for overflow scrolling in flex children.
    // Increased padding for more breathing room.
    <section
        className="flex-grow p-5 md:p-8 lg:p-10 bg-gradient-to-b from-gray-50 to-gray-100 min-h-0" // Subtle gradient, more padding
        aria-busy={isLoading} // Indicate loading state
        aria-label="List of doctors" // Label the region
    >
        {renderContent()}
    </section>
  );
};

// Wrap the component export with React.memo for performance optimization
export const DoctorList = React.memo(DoctorListComponent);

// Add display name for better debugging in React DevTools
DoctorList.displayName = 'DoctorList';