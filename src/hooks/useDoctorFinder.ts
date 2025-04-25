// src/hooks/useDoctorFinder.ts

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Doctor,
    RawDoctorData,
    UseDoctorFinderReturn,
    SortCriterion // Import the specific type for sort criteria
} from '../types';

const API_URL = import.meta.env.VITE_PUBLIC_DOCTOR_API;
const MAX_SUGGESTIONS = 3;

/**
 * Parses the fee string (e.g., "₹ 500") into a number.
 * Returns Infinity if parsing fails or string is empty, ensuring these items sort last.
 * @param feeString - The fee string from the API.
 * @returns The numeric fee or Infinity.
 */
function parseFee(feeString: string): number {
  if (!feeString) return Infinity;
  // Remove currency symbols, commas, etc., keeping only digits and decimal point
  const numberString = feeString.replace(/[^0-9.]/g, '');
  const fee = parseInt(numberString, 10);
  return isNaN(fee) ? Infinity : fee;
}

/**
 * Parses the experience string (e.g., "13 Years of experience") into a number.
 * Returns 0 if parsing fails or string is empty.
 * @param expString - The experience string from the API.
 * @returns The numeric experience in years or 0.
 */
function parseExperience(expString: string): number {
  if (!expString) return 0;
  // Find the first sequence of digits
  const match = expString.match(/\d+/);
  const exp = match ? parseInt(match[0], 10) : 0;
  return isNaN(exp) ? 0 : exp;
}

/**
 * Custom hook to manage fetching, filtering, multi-sorting, and state synchronization
 * for the doctor listing page.
 * @returns An object containing state variables and handler functions.
 */
export function useDoctorFinder(): UseDoctorFinderReturn {
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize state from URL search parameters or defaults
  const [searchTerm, setSearchTerm] = useState<string>(() => searchParams.get('search') || '');
  const [consultationType, setConsultationType] = useState<'Video Consult' | 'In Clinic' | null>(
    () => (searchParams.get('consultation') as 'Video Consult' | 'In Clinic') || null
  );
  const [selectedSpecialties, setSelectedSpecialties] = useState<Set<string>>(
    () => new Set(searchParams.getAll('specialty')) // getAll handles multiple values
  );
  // State for multiple active sort criteria, initialized from URL
  const [sortOptions, setSortOptions] = useState<SortCriterion[]>(
    () => searchParams.getAll('sort') as SortCriterion[] // Get all 'sort' params
  );

  // Effect to fetch and process data on initial mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (!API_URL) {
          throw new Error("API URL (VITE_PUBLIC_DOCTOR_API) is not defined. Please check your environment variables.");
        }
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error fetching doctor data! status: ${response.status}`);
        }
        const rawData: RawDoctorData[] = await response.json();

        // Process raw data into the Doctor type for internal use
        const processedDoctors: Doctor[] = rawData.map((rawDoc): Doctor => {
            const modes: ('Video Consult' | 'In Clinic')[] = [];
            if (rawDoc.video_consult) modes.push('Video Consult');
            if (rawDoc.in_clinic) modes.push('In Clinic');

            // Extract Clinic/Address Data including logoUrl
            const clinicName = rawDoc.clinic?.name;
            const address = rawDoc.clinic?.address ? {
                locality: rawDoc.clinic.address.locality,
                city: rawDoc.clinic.address.city,
                addressLine1: rawDoc.clinic.address.address_line1,
                logoUrl: rawDoc.clinic.address.logo_url, // Extract logo URL
            } : undefined;

            return {
              id: rawDoc.id,
              name: rawDoc.name,
              initials: rawDoc.name_initials,
              photo: rawDoc.photo,
              introduction: rawDoc.doctor_introduction,
              specialityNames: rawDoc.specialities.map(spec => spec.name),
              parsedFees: parseFee(rawDoc.fees),
              parsedExperience: parseExperience(rawDoc.experience),
              consultationModes: modes,
              video_consult: rawDoc.video_consult,
              in_clinic: rawDoc.in_clinic,
              languages: rawDoc.languages,
              clinicName: clinicName,
              address: address,
            };
        });
        setAllDoctors(processedDoctors);
      } catch (e) {
        console.error("Failed to fetch or process doctor data:", e);
        setError(e instanceof Error ? e.message : 'An unknown error occurred while fetching data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Effect to update URL search parameters whenever filters/sort/search change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (consultationType) params.set('consultation', consultationType);
    selectedSpecialties.forEach(spec => params.append('specialty', spec));
    // Append each active sort option to the URL
    sortOptions.forEach(opt => params.append('sort', opt));

    // Use replace: true to avoid polluting browser history on every filter/sort change
    setSearchParams(params, { replace: true });
  }, [searchTerm, consultationType, selectedSpecialties, sortOptions, setSearchParams]);

  // Memoized calculation of unique available specialties from all doctors
  const availableSpecialties = useMemo(() => {
    const specialties = new Set<string>();
    allDoctors.forEach(doc => {
      doc.specialityNames.forEach((specName: string) => specialties.add(specName));
    });
    return Array.from(specialties).sort(); // Sort alphabetically
  }, [allDoctors]);

  // Memoized calculation of the filtered and multi-sorted list of doctors
  const filteredDoctors = useMemo(() => {
    let doctors = [...allDoctors]; // Start with a copy of all doctors

    // --- Apply Filters ---
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      doctors = doctors.filter(doc =>
        doc.name.toLowerCase().includes(lowerSearchTerm)
      );
    }
    if (consultationType) {
      doctors = doctors.filter(doc =>
        doc.consultationModes.includes(consultationType)
      );
    }
    if (selectedSpecialties.size > 0) {
      doctors = doctors.filter(doc =>
        doc.specialityNames.some(specName => selectedSpecialties.has(specName))
      );
    }

    // --- Apply Multi-level Sorting ---
    if (sortOptions.length > 0) {
      doctors.sort((a, b) => {
        for (const option of sortOptions) {
          let comparison = 0;
          if (option === 'fees') {
            // Ascending order for fees (lower fee comes first)
            comparison = a.parsedFees - b.parsedFees;
          } else if (option === 'experience') {
            // Descending order for experience (higher experience comes first)
            comparison = b.parsedExperience - a.parsedExperience;
          }

          // If the comparison result is non-zero, this criterion determines the order
          if (comparison !== 0) {
            return comparison;
          }
          // If comparison is zero, proceed to the next sort criterion in the array
        }
        // If all criteria result in zero comparison, maintain original relative order
        return 0;
      });
    }

    return doctors;
  }, [allDoctors, searchTerm, consultationType, selectedSpecialties, sortOptions]); // Depend on sortOptions array

  // Memoized calculation of autocomplete suggestions
  const suggestions = useMemo(() => {
    if (!searchTerm.trim()) return []; // No suggestions if search term is empty
    const lowerSearchTerm = searchTerm.toLowerCase();
    // Filter all doctors by name and take the top N matches
    return allDoctors
      .filter(doc => doc.name.toLowerCase().includes(lowerSearchTerm))
      .slice(0, MAX_SUGGESTIONS);
  }, [allDoctors, searchTerm]);

  // --- Callback Handlers (Memoized with useCallback) ---

  /** Updates search term state (debounced in Navbar) */
  const handleSetSearchTerm = useCallback((term: string) => {
      setSearchTerm(term);
  }, []);

  /** Sets the consultation type filter */
  const handleSetConsultationType = useCallback((type: 'Video Consult' | 'In Clinic' | null) => {
      setConsultationType(type);
  }, []);

  /** Toggles a specialty filter on/off */
  const handleToggleSpecialty = useCallback((specialty: string) => {
    setSelectedSpecialties(prev => {
      const newSet = new Set(prev);
      if (newSet.has(specialty)) {
        newSet.delete(specialty);
      } else {
        newSet.add(specialty);
      }
      return newSet;
    });
  }, []);

  /** Toggles a sort criterion on/off in the sortOptions array */
  const handleToggleSortOption = useCallback((option: SortCriterion) => {
    setSortOptions(prev => {
      const currentIndex = prev.indexOf(option);
      if (currentIndex > -1) {
        // If already present, remove it
        return prev.filter(item => item !== option);
      } else {
        // If not present, add it to the end of the array
        return [...prev, option];
      }
    });
  }, []);

  /** Updates the search term definitively (e.g., from suggestion click or Enter) */
  const updateSearchTermFromSuggestion = useCallback((term: string) => {
      setSearchTerm(term);
  }, []);

  /** Resets all filters, search term, and sort options to their default states */
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setConsultationType(null);
    setSelectedSpecialties(new Set());
    setSortOptions([]); // Reset sort options to an empty array
  }, []);

  // --- Return Value ---
  // Expose state and memoized handlers
  return {
    allDoctors,
    filteredDoctors,
    availableSpecialties,
    isLoading,
    error,
    suggestions,
    // Filter/Sort State
    searchTerm,
    consultationType,
    specialties: selectedSpecialties,
    sortOptions, // Expose the array of active sort options
    // Handlers
    setSearchTerm: handleSetSearchTerm,
    setConsultationType: handleSetConsultationType,
    toggleSpecialty: handleToggleSpecialty,
    toggleSortOption: handleToggleSortOption, // Expose the updated sort handler
    clearFilters,
    updateSearchTermFromSuggestion,
  };
}