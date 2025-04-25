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
export type SortCriterion = 'fees' | 'experience';
export interface FilterState {
  searchTerm: string;
  consultationType: 'Video Consult' | 'In Clinic' | null;
  specialties: Set<string>;
  sortOptions: SortCriterion[]; 
}

/**
* Return value type for the useDoctorFinder hook, exposing state and handlers.
*/
export interface UseDoctorFinderReturn extends Omit<FilterState, 'sortOption'> { 
  sortOptions: SortCriterion[];
  allDoctors: Doctor[];
  filteredDoctors: Doctor[];
  availableSpecialties: string[];
  isLoading: boolean;
  error: string | null;
  suggestions: Doctor[];
  setSearchTerm: (term: string) => void;
  setConsultationType: (type: 'Video Consult' | 'In Clinic' | null) => void;
  toggleSpecialty: (specialty: string) => void;
  toggleSortOption: (option: SortCriterion) => void; // Renamed for clarity
  clearFilters: () => void;
  updateSearchTermFromSuggestion: (term: string) => void;
}