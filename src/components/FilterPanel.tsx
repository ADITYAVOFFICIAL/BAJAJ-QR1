// src/components/FilterPanel.tsx

import React from 'react'; // Import React itself for React.memo
import { FilterState, SortCriterion } from '../types'; // Import necessary types
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotateLeft, faCheck } from '@fortawesome/free-solid-svg-icons'; // Import icons

interface FilterPanelProps {
  /** Total number of doctors currently matching the filters */
  totalDoctorsCount: number;
  /** List of unique specialty names available from all doctors */
  availableSpecialties: string[];
  /** Current state of filters, including the sortOptions array */
  filters: Omit<FilterState, 'searchTerm' | 'sortOption'> & { sortOptions: SortCriterion[] }; // Use correct FilterState structure
  /** Callback to update the selected consultation type */
  onConsultationTypeChange: (type: 'Video Consult' | 'In Clinic' | null) => void;
  /** Callback to toggle a specialty filter */
  onSpecialtyChange: (specialty: string) => void;
  /** Callback to toggle a sort criterion */
  onSortChange: (option: SortCriterion) => void; // Renamed prop to match hook's handler logic intention
  /** Callback to clear all filters and sorting */
  onClearFilters: () => void;
}

/**
 * Helper function to generate consistent data-testid attributes for specialty checkboxes.
 * Handles spaces and special characters by replacing them with hyphens.
 * @param specialty - The specialty name string.
 * @returns A formatted string suitable for data-testid.
 */
const formatSpecialtyTestId = (specialty: string): string => {
    // Replace spaces, slashes, etc., with hyphens. Remove other non-alphanumeric chars except hyphens.
    const formatted = specialty.replace(/[\s/]+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
    return `filter-specialty-${formatted}`;
}

/**
 * Component displaying filter and sort options for the doctor list.
 * Allows users to refine the list by consultation type, specialties,
 * and multiple sorting preferences (fees, experience).
 * Wrapped with React.memo for performance optimization.
 */
const FilterPanelComponent: React.FC<FilterPanelProps> = ({
  totalDoctorsCount,
  availableSpecialties,
  filters,
  onConsultationTypeChange,
  onSpecialtyChange,
  onSortChange, // Use the prop name matching the hook handler's purpose (toggling)
  onClearFilters,
}) => {
  // Destructure filters state.
  // --- FIX: Provide default empty array for sortOptions ---
  const {
      consultationType,
      specialties: selectedSpecialties,
      sortOptions = [] // Default to empty array if filters.sortOptions is undefined
  } = filters ?? {}; // Also handle case where filters prop itself might be null/undefined initially
  // --- End FIX ---

  /** Handles changes for the Consultation Type radio buttons */
  const handleConsultationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value as 'Video Consult' | 'In Clinic';
    // Allow deselecting by clicking the currently selected radio button
    onConsultationTypeChange(value === consultationType ? null : value);
  };

  /** Handles changes for the Specialty checkboxes */
  const handleSpecialtyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSpecialtyChange(event.target.value); // Calls the toggle handler from the hook
  };

  /**
   * Generates dynamic CSS classes for sort buttons based on whether
   * the sort criterion is active (present in the sortOptions array).
   * @param type - The sort criterion ('fees' or 'experience').
   * @returns Tailwind CSS class string for the button.
   */
  const getSortButtonClass = (type: SortCriterion): string => {
    const base = "flex items-center justify-between w-full text-left px-3 py-2.5 mb-2 text-sm border rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-500 transition-all duration-150 ease-in-out shadow-sm";
    // Now safe to call .includes() because sortOptions defaults to []
    if (sortOptions.includes(type)) {
      // Active state styling
      return `${base} bg-blue-50 border-blue-400 text-blue-800 font-semibold hover:bg-blue-100 ring-1 ring-blue-300`;
    }
    // Inactive state styling
    return `${base} border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 text-gray-700`;
  };

  return (
    <aside
        // Styling for the filter panel container
        className="w-full md:w-72 lg:w-80 flex-shrink-0 p-5 border-r border-gray-200 bg-gradient-to-b from-white to-gray-50 shadow-sm md:overflow-y-auto md:h-[calc(100vh-var(--navbar-height,80px))] md:sticky md:top-[var(--navbar-height,80px)] custom-scrollbar" // Added custom-scrollbar class
        aria-labelledby="filter-panel-heading"
    >
      {/* Panel Header Area */}
      <div className="mb-5 pb-3 border-b border-gray-200">
        <div className="flex justify-between items-center mb-3">
            <h3 id="filter-panel-heading" className="text-lg font-semibold text-gray-900">
                Filters & Sort
            </h3>
            {/* Clear All Button */}
            <button
                onClick={onClearFilters}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-red-100 hover:text-red-700 rounded-md border border-gray-200 hover:border-red-200 transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 active:bg-red-200"
                title="Clear all filters and sorting"
                // data-testid="clear-filters-button" // Not required by spec
            >
                <FontAwesomeIcon icon={faRotateLeft} className="h-3 w-3" />
                Clear All
            </button>
        </div>
         {/* Display Total Doctors Count */}
        <div className="text-sm text-center md:text-left text-gray-600 bg-gray-100 px-3 py-1.5 rounded-md border border-gray-200">
            <span className="font-medium">{totalDoctorsCount}</span> Doctors Found
        </div>
      </div>

      {/* Filter Sections Container */}
      <div className="space-y-6">

        {/* Consultation Mode Filter Section */}
        <section aria-labelledby="filter-header-moc">
          <h4 id="filter-header-moc" data-testid="filter-header-moc" className="text-sm font-semibold mb-3 text-gray-700 uppercase tracking-wide">Consultation Mode</h4>
          <div className="space-y-3">
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

        {/* Specialties Filter Section */}
        <section aria-labelledby="filter-header-speciality">
          <h4 id="filter-header-speciality" data-testid="filter-header-speciality" className="text-sm font-semibold mb-3 text-gray-700 uppercase tracking-wide">Speciality</h4>
          {/* Scrollable container for specialties */}
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-2 -mr-2 border rounded-lg p-3 border-gray-200 bg-white shadow-inner custom-scrollbar">
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

        {/* Sort Options Section */}
        <section aria-labelledby="filter-header-sort" className="pt-4 border-t border-gray-200">
          <h4 id="filter-header-sort" data-testid="filter-header-sort" className="text-sm font-semibold mb-3 text-gray-700 uppercase tracking-wide">Sort By (Multi-select)</h4>
          {/* Fees Sort Button */}
          <button
              onClick={() => onSortChange('fees')} // Calls the toggle handler
              className={getSortButtonClass('fees')}
              data-testid="sort-fees"
              aria-pressed={sortOptions.includes('fees')} // Check if 'fees' is active
          >
              Fees (Low to High)
              {/* Conditionally render checkmark if 'fees' is active */}
              {sortOptions.includes('fees') && (
                  <FontAwesomeIcon icon={faCheck} className="w-4 h-4 text-blue-600 flex-shrink-0" />
              )}
          </button>
          {/* Experience Sort Button */}
          <button
              onClick={() => onSortChange('experience')} // Calls the toggle handler
              className={getSortButtonClass('experience')}
              data-testid="sort-experience"
              aria-pressed={sortOptions.includes('experience')} // Check if 'experience' is active
          >
              Experience (High to Low)
              {/* Conditionally render checkmark if 'experience' is active */}
              {sortOptions.includes('experience') && (
                   <FontAwesomeIcon icon={faCheck} className="w-4 h-4 text-blue-600 flex-shrink-0" />
              )}
          </button>
        </section>
      </div>
    </aside>
  );
};

// Memoize the component for performance optimization
export const FilterPanel = React.memo(FilterPanelComponent);
// Set display name for better debugging
FilterPanel.displayName = 'FilterPanel';