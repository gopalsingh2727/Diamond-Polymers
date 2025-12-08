/**
 * Date Formatting Utilities
 * Safe date formatting that handles undefined, null, and invalid dates
 */

/**
 * Safely format a date string to locale string
 * Returns "N/A" if the date is invalid
 */
export const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleString();
};

/**
 * Format date to short format (MM/DD/YYYY)
 */
export const formatDateShort = (dateString: string | undefined | null): string => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString();
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export const formatDateRelative = (dateString: string | undefined | null): string => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return "N/A";
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString();
};
