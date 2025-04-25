/**
 * Represents the raw structure of a doctor object directly from the API.
 * Matches the provided API structure.
 */
export interface RawDoctorData {
  id: string;
  name: string;
  name_initials?: string;
  photo?: string | null;
  doctor_introduction?: string;
  specialities: { name: string }[];
  fees: string; // e.g., "₹ 500"
  experience: string; // e.g., "13 Years of experience"
  languages?: string[];
  clinic?: {
      name: string;
      address?: {
          locality?: string;
          city?: string;
          address_line1?: string;
          location?: string;
          logo_url?: string;
      };
  };
  video_consult: boolean;
  in_clinic: boolean;
}

/**
* Represents the processed and augmented structure of a doctor object
* used within the application components and hooks for easier handling.
*/
export interface Doctor {
  id: string;
  name: string;
  initials?: string;
  photo?: string | null;
  introduction?: string;
  specialityNames: string[];
  parsedFees: number;
  parsedExperience: number;
  consultationModes: ('Video Consult' | 'In Clinic')[];
  video_consult: boolean;
  in_clinic: boolean;
  languages?: string[];
  // --- New Fields ---
  clinicName?: string; // Optional clinic name
  address?: {          // Optional address object
      locality?: string;
      city?: string;
      addressLine1?: string;
      logoUrl?: string; // Add clinic logo URL
      // Add location (lat/long string) if needed later
  };
  // --- End New Fields ---
}

/**
* Represents the current state of applied filters and sorting.
*/
export interface FilterState {
  searchTerm: string;
  consultationType: 'Video Consult' | 'In Clinic' | null;
  specialties: Set<string>; // Using Set for efficient add/delete/has checks
  sortOption: 'fees' | 'experience' | null;
}

/**
* Return value type for the useDoctorFinder hook, exposing state and handlers.
*/
export interface UseDoctorFinderReturn extends FilterState {
  allDoctors: Doctor[]; // All processed doctors from API
  filteredDoctors: Doctor[]; // Doctors after applying filters and search
  availableSpecialties: string[]; // Unique specialties from all doctors
  isLoading: boolean; // API loading state
  error: string | null; // API error message
  suggestions: Doctor[]; // Autocomplete suggestions (max 3)
  setSearchTerm: (term: string) => void; // Update search term (controlled input)
  setConsultationType: (type: 'Video Consult' | 'In Clinic' | null) => void; // Set consultation filter
  toggleSpecialty: (specialty: string) => void; // Add/remove specialty filter
  setSortOption: (option: 'fees' | 'experience' | null) => void; // Set sort option (or toggle off)
  clearFilters: () => void; // Reset all filters, search, and sort
  updateSearchTermFromSuggestion: (term: string) => void; // Set search term from suggestion/submit
}