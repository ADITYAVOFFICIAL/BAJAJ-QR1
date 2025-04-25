import React, { useState } from 'react';
import { Doctor } from '../types'; // Ensure Doctor type includes clinicName and address with logoUrl
import { PlaceholderIcon } from './common/PlaceholderIcon';

// --- Font Awesome Setup ---
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBriefcase,
    faIndianRupeeSign,
    faVideo,
    faHospital,         // Used for Clinic Name & In-Clinic Mode
    faLanguage,
    faLocationDot,      // Used for Address Line 1
    faMapMarkerAlt,     // Used for Locality
    faCity,             // Used for City
    faCalendarCheck     // Used for Button
} from '@fortawesome/free-solid-svg-icons';
// --- End Font Awesome Setup ---


interface DoctorCardProps {
  /** The doctor data object to display */
  doctor: Doctor;
}

/**
 * Internal component logic for displaying detailed information for a single doctor.
 * Includes clinic name, logo, full address, and introduction without truncation.
 * Optimized for responsiveness.
 */
const DoctorCardComponent: React.FC<DoctorCardProps> = ({ doctor }) => {
  const [imageError, setImageError] = useState(false);
  const [logoError, setLogoError] = useState(false); // State for clinic logo error

  // Format specialties and languages for display
  const specialtiesText = doctor.specialityNames.join(', ') || 'N/A';
  const languagesText = doctor.languages?.join(', ') || 'N/A';

  // Determine if a valid photo URL exists and hasn't failed loading
  const hasValidPhoto = doctor.photo && doctor.photo !== "null" && !imageError;
  // Determine if a valid clinic logo URL exists and hasn't failed loading
  const hasValidLogo = doctor.address?.logoUrl && !logoError;

  // Callback for doctor image loading errors
  const handleImageError = () => {
    console.warn(`Failed to load image for Dr. ${doctor.name}: ${doctor.photo}`);
    setImageError(true);
  };

  // Callback for clinic logo loading errors
  const handleLogoError = () => {
    console.warn(`Failed to load clinic logo for ${doctor.clinicName}: ${doctor.address?.logoUrl}`);
    setLogoError(true);
  };

  // Placeholder function for booking action
  const handleBookAppointment = () => {
    console.log(`Booking appointment with ${doctor.name} (ID: ${doctor.id})`);
    alert(`Booking functionality for ${doctor.name} is not implemented in this demo.`);
  };

  return (
    <article
      className="relative flex flex-col sm:flex-row items-start gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 ease-in-out group" // Moderate padding/gap, rounded-lg
      data-testid="doctor-card"
      aria-labelledby={`doctor-name-${doctor.id}`}
    >
      {/* Clinic Logo - Top Right Corner */}
      {hasValidLogo && (
        <img
          src={doctor.address?.logoUrl}
          alt={`${doctor.clinicName || 'Clinic'} logo`}
          // Positioned top-right, slightly inset, z-10 to be above photo if overlap
          // Base size for mobile, larger size for lg screens (desktop)
          className="absolute top-2.5 right-2.5 h-9 w-auto max-w-[70px] lg:h-14 lg:max-w-[120px] object-contain bg-white p-1 rounded-md border border-gray-200 shadow-sm z-10"
          onError={handleLogoError}
          loading="lazy"
          title={`Logo for ${doctor.clinicName}`}
        />
      )}

      {/* Left Side: Profile Photo or Placeholder */}
      {/* z-0 ensures photo is below logo if they overlap */}
      <div className="flex-shrink-0 mx-auto sm:mx-0 mb-3 sm:mb-0 relative z-0">
        {hasValidPhoto ? (
          <img
            src={doctor.photo ?? undefined}
            alt={`Dr. ${doctor.name}`}
            // Moderate size, standard border/shadow, changed to rounded-lg
            className="w-20 h-20 rounded-lg object-cover border-2 border-gray-100 shadow-md"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <PlaceholderIcon
            initials={doctor.initials}
            // Moderate size, match styling, changed to rounded-lg
            className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 font-semibold text-xl flex-shrink-0 border-2 border-gray-300 shadow-sm"
          />
        )}
      </div>

      {/* Right Side: Doctor Details & Actions */}
      <div className="flex-grow text-center sm:text-left w-full flex flex-col">
        {/* Top section: Name, Specialty */}
        <div className="mb-3">
            <h3 id={`doctor-name-${doctor.id}`} data-testid="doctor-name" className="text-lg font-semibold text-gray-800 group-hover:text-blue-700 transition-colors duration-200 mb-0.5"> {/* Standard font size */}
                {doctor.name}
            </h3>
            <p data-testid="doctor-specialty" className="text-blue-600 font-medium text-sm mb-3"> {/* Standard font size */}
                {specialtiesText}
            </p>
        </div>

        {/* Middle section: Details List */}
        {/* Standard text size (sm), moderate spacing (space-y-2) */}
        <ul className="space-y-2 text-sm text-gray-700 mb-4">
            {/* Experience */}
            <li data-testid="doctor-experience" className="flex items-center justify-center sm:justify-start" title={`${doctor.parsedExperience} years of experience`}>
                <FontAwesomeIcon icon={faBriefcase} className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                {/* Removed min-w for better responsiveness */}
                <span className="font-medium text-gray-500 mr-1.5">Experience:</span>
                <span className="text-gray-800 font-medium">{doctor.parsedExperience} years</span>
            </li>
            {/* Fees */}
            <li data-testid="doctor-fee" className="flex items-center justify-center sm:justify-start" title={`Consultation Fee: ${doctor.parsedFees === Infinity ? 'Not Available' : `₹${doctor.parsedFees}`}`}>
                 <FontAwesomeIcon icon={faIndianRupeeSign} className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                 <span className="font-medium text-gray-500 mr-1.5">Fees:</span>
                 <span className="text-gray-800 font-medium">
                    {doctor.parsedFees === Infinity ? 'N/A' : `₹ ${doctor.parsedFees}`}
                 </span>
            </li>
            {/* Clinic Name */}
            {doctor.clinicName && (
                 <li className="flex items-center justify-center sm:justify-start" title={`Clinic: ${doctor.clinicName}`}>
                    <FontAwesomeIcon icon={faHospital} className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                    <span className="font-medium text-gray-500 mr-1.5">Clinic:</span>
                    <span className="text-gray-800 truncate">{doctor.clinicName}</span>
                </li>
            )}
             {/* Address Line 1 */}
             {doctor.address?.addressLine1 && (
                 <li className="flex items-start justify-center sm:justify-start" title={`Address: ${doctor.address.addressLine1}`}>
                    <FontAwesomeIcon icon={faLocationDot} className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="font-medium text-gray-500 mr-1.5">Address:</span>
                    {/* Allow address to wrap */}
                    <span className="text-gray-800">{doctor.address.addressLine1}</span>
                </li>
             )}
             {/* Locality */}
             {doctor.address?.locality && (
                 <li className="flex items-center justify-center sm:justify-start" title={`Locality: ${doctor.address.locality}`}>
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                    <span className="font-medium text-gray-500 mr-1.5">Locality:</span>
                    <span className="text-gray-800 truncate">{doctor.address.locality}</span>
                </li>
             )}
             {/* City */}
             {doctor.address?.city && (
                 <li className="flex items-center justify-center sm:justify-start" title={`City: ${doctor.address.city}`}>
                    <FontAwesomeIcon icon={faCity} className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                    <span className="font-medium text-gray-500 mr-1.5">City:</span>
                    <span className="text-gray-800 truncate">{doctor.address.city}</span>
                </li>
             )}
            {/* Consultation Modes */}
             <li className="flex items-center justify-center sm:justify-start" title={`Available Consultation Modes: ${doctor.consultationModes.join(', ') || 'N/A'}`}>
                 <span className="font-medium text-gray-500 mr-1.5">Modes:</span>
                 <span className="flex flex-wrap items-center gap-x-2 gap-y-1"> {/* Standard gap */}
                    {doctor.consultationModes.length > 0 ? doctor.consultationModes.map(mode => (
                        <span key={mode} className="flex items-center text-xs bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200 shadow-xs"> {/* Standard tag size */}
                            <FontAwesomeIcon icon={mode === 'Video Consult' ? faVideo : faHospital} className={`w-3 h-3 ${mode === 'Video Consult' ? 'text-green-600' : 'text-blue-600'}`} />
                            <span className="ml-1.5">{mode}</span>
                        </span>
                    )) : <span className="text-gray-500 italic text-xs">N/A</span>}
                 </span>
            </li>
            {/* Languages */}
             <li className="flex items-center justify-center sm:justify-start" title={`Speaks: ${languagesText}`}>
                 <FontAwesomeIcon icon={faLanguage} className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                 <span className="font-medium text-gray-500 mr-1.5">Languages:</span>
                 <span className="text-gray-800 truncate">{languagesText}</span>
            </li>
        </ul>

        {/* Introduction - No truncation */}
        {doctor.introduction && (
            <div className="mb-4 border-t border-gray-100 pt-3">
                 <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">About</h4>
                 <p className="text-xs text-gray-600"> {/* Small text size */}
                    {doctor.introduction}
                 </p>
            </div>
        )}

        {/* Bottom section: Action Button */}
        {/* Use mt-auto to push to bottom */}
        <div className="flex justify-center sm:justify-end mt-auto pt-3 border-t border-gray-100">
            <button
                onClick={handleBookAppointment}
                // Enhanced button styling
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:bg-blue-800 transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-100 hover:shadow-lg"
            >
                <FontAwesomeIcon icon={faCalendarCheck} className="w-4 h-4" />
                Book Appointment
            </button>
        </div>
      </div>
    </article>
  );
};

// Wrap the component export with React.memo
export const DoctorCard = React.memo(DoctorCardComponent);

// Add display name for better debugging
DoctorCard.displayName = 'DoctorCard';