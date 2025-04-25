import React from 'react'; // Import React itself for React.memo
import { FilterState } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faRotateLeft } from '@fortawesome/free-solid-svg-icons'; 
interface FilterPanelProps {
  /** Total number of doctors currently matching the filters (passed from parent) */
  totalDoctorsCount: number;
  /** List of unique specialty names available from all doctors */
  availableSpecialties: string[];
  /** Current state of filters (excluding search term) */
  filters: Omit<FilterState, 'searchTerm'>;
  /** Callback to update the selected consultation type */
  onConsultationTypeChange: (type: 'Video Consult' | 'In Clinic' | null) => void;
  /** Callback to toggle a specialty filter */
  onSpecialtyChange: (specialty: string) => void;
  /** Callback to update the sort option */
  onSortChange: (option: 'fees' | 'experience' | null) => void;
  /** Callback to clear all filters and sorting */
  onClearFilters: () => void;
}

// Helper to generate consistent test IDs for specialties, handling spaces and slashes
// Kept within the file as it's specific to this component's test IDs
const formatSpecialtyTestId = (specialty: string): string => {
    const formatted = specialty.replace(/[\s/]+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
    return `filter-specialty-${formatted}`;
}

/**
 * Component displaying filter and sort options for the doctor list.
 * It allows users to refine the list based on consultation type, specialties,
 * and sorting preferences (fees or experience).
 * Wrapped with React.memo for performance optimization.
 */
const FilterPanelComponent: React.FC<FilterPanelProps> = ({
  totalDoctorsCount,
  availableSpecialties,
  filters,
  onConsultationTypeChange,
  onSpecialtyChange,
  onSortChange,
  onClearFilters,
}) => {
  const { consultationType, specialties: selectedSpecialties, sortOption } = filters;

  // Handler for radio button changes (Consultation Type)
  const handleConsultationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value as 'Video Consult' | 'In Clinic';
    onConsultationTypeChange(value === consultationType ? null : value);
  };

  // Handler for checkbox changes (Specialties)
  const handleSpecialtyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSpecialtyChange(event.target.value);
  };

  // Helper to get dynamic classes for sort buttons
  const getSortButtonClass = (type: 'fees' | 'experience'): string => {
    const base = "flex items-center justify-between w-full text-left px-3 py-2.5 mb-2 text-sm border rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-500 transition-all duration-150 ease-in-out shadow-sm"; // Slightly larger padding/rounded
    if (sortOption === type) {
      // Active state
      return `${base} bg-blue-50 border-blue-400 text-blue-800 font-semibold hover:bg-blue-100 ring-1 ring-blue-300`;
    }
    // Inactive state
    return `${base} border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 text-gray-700`;
  };

  return (
    <aside
        className="w-full md:w-72 lg:w-80 flex-shrink-0 p-5 border-r border-gray-200 bg-gradient-to-b from-white to-gray-50 shadow-sm md:overflow-y-auto md:h-[calc(100vh-var(--navbar-height,80px))] md:sticky md:top-[var(--navbar-height,80px)]"
        aria-labelledby="filter-panel-heading" // Add label for accessibility
    >
      {/* Panel Header Area */}
      <div className="mb-5 pb-3 border-b border-gray-200">
        {/* Updated Header Layout */}
        <div className="flex justify-between items-center mb-3"> {/* Increased bottom margin slightly */}
            <h3 id="filter-panel-heading" className="text-lg font-semibold text-gray-900"> {/* Darker text */}
                Filters & Sort
            </h3>
            <button
                onClick={onClearFilters}
                // Updated Button Styling: Subtle initial look, red hover for emphasis, icon added
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-red-100 hover:text-red-700 rounded-md border border-gray-200 hover:border-red-200 transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 active:bg-red-200"
                title="Clear all filters and sorting"
            >
                <FontAwesomeIcon icon={faRotateLeft} className="h-3 w-3" /> {/* Reset Icon */}
                Clear All
            </button>
        </div>
         {/* Display Total Doctors Count (Unchanged) */}
        <div className="text-sm text-center md:text-left text-gray-600 bg-gray-100 px-3 py-1.5 rounded-md border border-gray-200">
            <span className="font-medium">{totalDoctorsCount}</span> Doctors Found
        </div>
      </div>

      {/* Filter Sections */}
      <div className="space-y-6"> {/* Add space between filter sections */}

        {/* Consultation Mode Filter */}
        <section aria-labelledby="filter-header-moc">
          <h4 id="filter-header-moc" data-testid="filter-header-moc" className="text-sm font-semibold mb-3 text-gray-700 uppercase tracking-wide">Consultation Mode</h4>
          <div className="space-y-3"> {/* Increased spacing slightly */}
              {/* Video Consult Radio */}
              <label className="flex items-center cursor-pointer text-sm text-gray-800 hover:text-blue-700 transition-colors group p-1.5 rounded hover:bg-blue-50/50">
              <input
                  type="radio"
                  name="consultationType"
                  value="Video Consult"
                  checked={consultationType === 'Video Consult'}
                  onChange={handleConsultationChange}
                  data-testid="filter-video-consult"
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-offset-1 transition duration-150 ease-in-out"
              />
              <span className="ml-2.5 select-none">Video Consult</span>
              </label>
              {/* In Clinic Radio */}
              <label className="flex items-center cursor-pointer text-sm text-gray-800 hover:text-blue-700 transition-colors group p-1.5 rounded hover:bg-blue-50/50">
              <input
                  type="radio"
                  name="consultationType"
                  value="In Clinic"
                  checked={consultationType === 'In Clinic'}
                  onChange={handleConsultationChange}
                  data-testid="filter-in-clinic"
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-offset-1 transition duration-150 ease-in-out"
              />
              <span className="ml-2.5 select-none">In Clinic</span>
              </label>
          </div>
        </section>

        {/* Specialties Filter */}
        <section aria-labelledby="filter-header-speciality">
          <h4 id="filter-header-speciality" data-testid="filter-header-speciality" className="text-sm font-semibold mb-3 text-gray-700 uppercase tracking-wide">Speciality</h4>
          {/* Scrollable container for specialties */}
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-2 -mr-2 border rounded-lg p-3 border-gray-200 bg-white shadow-inner custom-scrollbar"> {/* Use negative margin trick for scrollbar */}
              {availableSpecialties.length > 0 ? availableSpecialties.map((specialty) => (
              <label key={specialty} className="flex items-center cursor-pointer text-sm text-gray-800 hover:text-blue-700 transition-colors group p-1 rounded hover:bg-blue-50/50">
                  <input
                  type="checkbox"
                  value={specialty}
                  checked={selectedSpecialties.has(specialty)}
                  onChange={handleSpecialtyChange}
                  data-testid={formatSpecialtyTestId(specialty)} // Use helper for test ID
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-1 transition duration-150 ease-in-out"
                  />
                  <span className="ml-2.5 select-none">{specialty}</span>
              </label>
              )) : (
                  <p className="text-xs text-gray-500 italic px-1 py-2">No specialties available</p>
              )}
          </div>
        </section>

        {/* Sort Options */}
        <section aria-labelledby="filter-header-sort" className="pt-4 border-t border-gray-200"> {/* Add top border */}
          <h4 id="filter-header-sort" data-testid="filter-header-sort" className="text-sm font-semibold mb-3 text-gray-700 uppercase tracking-wide">Sort By</h4>
          {/* Fees Sort Button */}
          <button
              onClick={() => onSortChange('fees')}
              className={getSortButtonClass('fees')}
              data-testid="sort-fees"
              aria-pressed={sortOption === 'fees'}
          >
              Fees (Low to High)
              {sortOption === 'fees' && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-blue-600 flex-shrink-0"> {/* Slightly larger icon */}
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                  </svg>
              )}
          </button>
          {/* Experience Sort Button */}
          <button
              onClick={() => onSortChange('experience')}
              className={getSortButtonClass('experience')}
              data-testid="sort-experience"
              aria-pressed={sortOption === 'experience'}
          >
              Experience (High to Low)
              {sortOption === 'experience' && (
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-blue-600 flex-shrink-0"> {/* Slightly larger icon */}
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                  </svg>
              )}
          </button>
        </section>
      </div>
    </aside>
  );
};

// Wrap the component export with React.memo
export const FilterPanel = React.memo(FilterPanelComponent);

// Add display name for better debugging
FilterPanel.displayName = 'FilterPanel';