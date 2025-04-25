import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Doctor, RawDoctorData, UseDoctorFinderReturn } from '../types';

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
 * Custom hook to manage fetching, filtering, sorting, and state synchronization
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
  const [sortOption, setSortOption] = useState<'fees' | 'experience' | null>(
    () => (searchParams.get('sort') as 'fees' | 'experience') || null
  );

  // Effect to fetch and process data on initial mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (!API_URL) {
          throw new Error("API URL is not defined. Please check your environment variables.");
        }
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const rawData: RawDoctorData[] = await response.json();

        // Process raw data into the Doctor type for internal use
        const processedDoctors: Doctor[] = rawData.map((rawDoc): Doctor => {
            const modes: ('Video Consult' | 'In Clinic')[] = [];
            if (rawDoc.video_consult) modes.push('Video Consult');
            if (rawDoc.in_clinic) modes.push('In Clinic');
  
            // --- Extract Clinic/Address Data ---
            const clinicName = rawDoc.clinic?.name;
            const address = rawDoc.clinic?.address ? {
                locality: rawDoc.clinic.address.locality,
                city: rawDoc.clinic.address.city,
                addressLine1: rawDoc.clinic.address.address_line1,
                logoUrl: rawDoc.clinic.address.logo_url, // Extract logo URL
            } : undefined;
            // --- End Extraction ---
  
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
            // --- Assign Clinic/Address Data ---
            clinicName: clinicName,
            address: address,
            // --- End Assignment ---
          };
        });
        setAllDoctors(processedDoctors);
      } catch (e) {
        console.error("Failed to fetch or process doctor data:", e);
        setError(e instanceof Error ? e.message : 'An unknown error occurred');
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
    // Append each selected specialty individually
    selectedSpecialties.forEach(spec => params.append('specialty', spec));
    if (sortOption) params.set('sort', sortOption);

    // Use replace: true to avoid polluting browser history on every filter change
    setSearchParams(params, { replace: true });
  }, [searchTerm, consultationType, selectedSpecialties, sortOption, setSearchParams]);

  // Memoized calculation of unique available specialties from all doctors
  const availableSpecialties = useMemo(() => {
    const specialties = new Set<string>();
    allDoctors.forEach(doc => {
      doc.specialityNames.forEach((specName: string) => specialties.add(specName));
    });
    return Array.from(specialties).sort(); // Sort alphabetically
  }, [allDoctors]);

  // Memoized calculation of the filtered and sorted list of doctors
  const filteredDoctors = useMemo(() => {
    let doctors = [...allDoctors]; // Start with a copy of all doctors

    // Apply search term filter (case-insensitive)
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      doctors = doctors.filter(doc =>
        doc.name.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Apply consultation type filter
    if (consultationType) {
      doctors = doctors.filter(doc =>
        doc.consultationModes.includes(consultationType)
      );
    }

    // Apply specialty filters (doctor must have at least one of the selected specialties)
    if (selectedSpecialties.size > 0) {
      doctors = doctors.filter(doc =>
        doc.specialityNames.some(specName => selectedSpecialties.has(specName))
      );
    }

    // Apply sorting
    if (sortOption === 'fees') {
      // Ascending order of fees (Infinity sorts last)
      doctors.sort((a, b) => a.parsedFees - b.parsedFees);
    } else if (sortOption === 'experience') {
      // Descending order of experience
      doctors.sort((a, b) => b.parsedExperience - a.parsedExperience);
    }

    return doctors;
  }, [allDoctors, searchTerm, consultationType, selectedSpecialties, sortOption]);

  // Memoized calculation of autocomplete suggestions
  const suggestions = useMemo(() => {
    if (!searchTerm.trim()) return []; // No suggestions if search term is empty
    const lowerSearchTerm = searchTerm.toLowerCase();
    // Filter all doctors by name and take the top N matches
    return allDoctors
      .filter(doc => doc.name.toLowerCase().includes(lowerSearchTerm))
      .slice(0, MAX_SUGGESTIONS);
  }, [allDoctors, searchTerm]);

  // --- Callback Handlers ---
  // Use useCallback to ensure stable function references for child components

  // Updates search term as user types (controlled input)
  const handleSetSearchTerm = useCallback((term: string) => {
      setSearchTerm(term);
  }, []);

  // Sets the consultation type filter
  const handleSetConsultationType = useCallback((type: 'Video Consult' | 'In Clinic' | null) => {
      setConsultationType(type);
  }, []);

  // Toggles a specialty filter on/off
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

  // Sets the sort option. Clicking the same option again toggles it off.
  const handleSetSortOption = useCallback((option: 'fees' | 'experience' | null) => {
    setSortOption(prev => (prev === option ? null : option));
  }, []);

  // Updates the search term definitively (e.g., when selecting a suggestion or pressing Enter)
  const updateSearchTermFromSuggestion = useCallback((term: string) => {
      setSearchTerm(term);
      // Optionally clear suggestions list here if needed, though Navbar handles hiding
  }, []);

  // Resets all filters, search term, and sort option to their default states
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setConsultationType(null);
    setSelectedSpecialties(new Set());
    setSortOption(null);
    // URL params will be updated by the useEffect dependency change
  }, []);

  // Return the state and handlers
  return {
    allDoctors,
    filteredDoctors,
    availableSpecialties,
    isLoading,
    error,
    suggestions,
    // Filter State
    searchTerm,
    consultationType,
    specialties: selectedSpecialties, // Use 'specialties' key consistent with FilterState type
    sortOption,
    // Handlers
    setSearchTerm: handleSetSearchTerm,
    setConsultationType: handleSetConsultationType,
    toggleSpecialty: handleToggleSpecialty,
    setSortOption: handleSetSortOption,
    clearFilters,
    updateSearchTermFromSuggestion,
  };
}
