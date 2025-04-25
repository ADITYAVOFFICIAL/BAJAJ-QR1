import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Doctor } from '../types';
import { PlaceholderIcon } from './common/PlaceholderIcon';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faStethoscope,
    faMagnifyingGlass,
    faChevronRight
} from '@fortawesome/free-solid-svg-icons';

interface NavbarProps {
  /** Current debounced search term from the parent hook */
  searchTerm: string;
  /** Callback to update the debounced search term in the parent hook */
  onSearchChange: (term: string) => void;
  /** Callback function when a search is submitted (Enter or suggestion click) */
  onSearchSubmit: (term: string) => void;
  /** Array of doctor suggestions based on the debounced search term */
  suggestions: Doctor[];
}

const DEBOUNCE_DELAY = 300; // milliseconds

/**
 * Application Navbar component featuring a title and a debounced autocomplete search bar
 * for finding doctors. Uses Font Awesome for icons and Tailwind CSS for styling.
 */
export const Navbar: React.FC<NavbarProps> = ({
  searchTerm, // This is the debounced value from the parent
  onSearchChange, // This updates the debounced value in the parent
  onSearchSubmit,
  suggestions,
}) => {
  // Local state to hold the immediate value of the input field
  const [localSearchTerm, setLocalSearchTerm] = useState<string>(searchTerm);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Ref to store the debounce timer ID
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Effect to sync local input value if the parent's debounced term changes
  // (e.g., due to filter clear or direct submission)
  useEffect(() => {
    if (localSearchTerm !== searchTerm) {
        setLocalSearchTerm(searchTerm);
    }
    // Only run when the parent's searchTerm changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);


  // Effect to close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Effect to clean up the debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // --- Debounced Input Handler ---
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    // Update local state immediately for responsive input feel
    setLocalSearchTerm(value);
    setActiveSuggestionIndex(-1); // Reset keyboard selection

    // Clear the previous debounce timer if it exists
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set a new timer to call the parent's onSearchChange after the delay
    debounceTimerRef.current = setTimeout(() => {
      onSearchChange(value); // Call the prop to update the debounced state in the parent hook
    }, DEBOUNCE_DELAY);

    // Show/hide suggestions based on the *immediate* local value
    // Note: The `suggestions` prop will update based on the parent's debounced `searchTerm`
    setShowSuggestions(value.length > 0); // Show if input has text, even if suggestions haven't loaded yet
  };
  // --- End Debounced Input Handler ---

  // Handler for clicking a suggestion item - submits search immediately
  const handleSuggestionClick = useCallback((doctorName: string) => {
    // Clear any pending debounce timer as we are submitting directly
    if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
    }
    setLocalSearchTerm(doctorName); // Update local input visually
    onSearchSubmit(doctorName); // Submit immediately to parent
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
    inputRef.current?.blur();
  }, [onSearchSubmit]);

  // Handler for keyboard interactions
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle Enter press even when suggestions aren't visible (direct search)
    if (event.key === 'Enter' && (!showSuggestions || suggestions.length === 0 || activeSuggestionIndex === -1)) {
        event.preventDefault();
        // Clear any pending debounce timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        onSearchSubmit(localSearchTerm); // Submit the current local term immediately
        setShowSuggestions(false);
        inputRef.current?.blur();
        return;
    }

    // Handle navigation/selection only if suggestions are visible
    if (showSuggestions && suggestions.length > 0) {
        switch (event.key) {
            case 'Enter':
                event.preventDefault();
                if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
                handleSuggestionClick(suggestions[activeSuggestionIndex].name);
                }
                break;
            case 'ArrowUp':
                event.preventDefault();
                setActiveSuggestionIndex(prev => (prev <= 0 ? suggestions.length - 1 : prev - 1));
                break;
            case 'ArrowDown':
                event.preventDefault();
                setActiveSuggestionIndex(prev => (prev >= suggestions.length - 1 ? 0 : prev + 1));
                break;
            case 'Escape':
                setShowSuggestions(false);
                setActiveSuggestionIndex(-1);
                break;
            default:
                break;
        }
    }
  };

  // Handler to show suggestions on focus
  const handleInputFocus = () => {
    // Show suggestions if there's local text and the parent has provided suggestions
    // (based on the possibly slightly delayed debounced term)
    if (localSearchTerm.length > 0 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Effect to scroll the active suggestion into view
  useEffect(() => {
    if (activeSuggestionIndex >= 0 && containerRef.current) {
      const listElement = containerRef.current.querySelector('ul');
      const activeItem = listElement?.children[activeSuggestionIndex] as HTMLLIElement | undefined;
      activeItem?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeSuggestionIndex]);


  return (
    <nav className="bg-white shadow-md p-4 sticky top-0 z-30 border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Title with Icon */}
        <div className="flex items-center gap-3 text-blue-700"> 
            <FontAwesomeIcon icon={faStethoscope} className="h-8 w-8 scale-150" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Find Your Doctor
            </h1>
        </div>

        {/* Search Container */}
        <div ref={containerRef} className="relative w-full md:w-2/5 lg:w-1/3">
          {/* Input wrapper */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="h-4 w-4 text-gray-400" />
            </div>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search by doctor name..."
              // --- Bind value to local state ---
              value={localSearchTerm}
              // --- Use debounced handler ---
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleInputFocus}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 text-base placeholder-gray-500 transition duration-200 ease-in-out hover:border-gray-400"
              data-testid="autocomplete-input"
              aria-autocomplete="list"
              aria-controls="autocomplete-suggestions"
              aria-expanded={showSuggestions}
              aria-activedescendant={activeSuggestionIndex >= 0 ? `suggestion-item-${activeSuggestionIndex}` : undefined}
              role="combobox"
            />
          </div>

          {/* Suggestions List */}
          {/* Suggestions visibility depends on local input, content depends on parent prop */}
          {showSuggestions && suggestions.length > 0 && (
            <ul
              id="autocomplete-suggestions"
              className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-72 overflow-y-auto z-40 text-gray-800 divide-y divide-gray-100"
              role="listbox"
            >
              {suggestions.map((doctor, index) => (
                <li
                  key={doctor.id}
                  id={`suggestion-item-${index}`}
                  onClick={() => handleSuggestionClick(doctor.name)}
                  className={`px-4 py-3 cursor-pointer flex items-center gap-4 transition-colors duration-150 group ${index === activeSuggestionIndex ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  data-testid="suggestion-item"
                  role="option"
                  aria-selected={index === activeSuggestionIndex}
                >
                  {/* Doctor Photo/Placeholder */}
                  <div className="flex-shrink-0 w-10 h-10">
                    {doctor.photo && doctor.photo !== "null" ? (
                       <img
                          src={doctor.photo}
                          alt=""
                          className="w-full h-full rounded-lg object-cover border border-gray-200 shadow-sm"
                          onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                          loading="lazy"
                       />
                    ) : null}
                     <PlaceholderIcon
                        initials={doctor.initials}
                        className={`w-full h-full rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 font-semibold text-sm flex-shrink-0 border border-gray-300 shadow-sm ${doctor.photo && doctor.photo !== "null" ? 'hidden' : ''}`}
                     />
                  </div>
                  {/* Doctor Name & Specialty */}
                  <div className="flex-grow overflow-hidden">
                     <span className={`font-medium text-sm block truncate ${index === activeSuggestionIndex ? 'text-blue-800' : 'text-gray-800 group-hover:text-gray-900'}`}>
                        {doctor.name}
                     </span>
                     <span className={`text-xs block truncate uppercase font-medium ${index === activeSuggestionIndex ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-600'}`}>
                        {doctor.specialityNames?.[0] || 'SPECIALIST'}
                     </span>
                  </div>
                  {/* Chevron Icon */}
                   <FontAwesomeIcon
                     icon={faChevronRight}
                     className={`w-3 h-3 flex-shrink-0 ml-auto transition-colors duration-150 ${index === activeSuggestionIndex ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`}
                   />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
};

Navbar.displayName = 'Navbar';