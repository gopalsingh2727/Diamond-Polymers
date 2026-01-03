// searchUtils.ts
// Generic search function that works with any data type

/**
 * Searches through an array of objects based on specified fields
 * @param data - Array of objects to search through
 * @param searchTerm - Search term to filter by
 * @param searchFields - Array of field paths to search in (supports nested fields with dot notation)
 * @returns Filtered array
 */
export const searchData = <T extends Record<string, any>,>(
data: T[],
searchTerm: string,
searchFields: string[])
: T[] => {
  if (!searchTerm || !searchTerm.trim()) {
    return data;
  }

  const normalizedSearch = searchTerm.toLowerCase().trim();




  const results = data.filter((item, index) => {
    const matches = searchFields.some((field) => {
      const value = getNestedValue(item, field);

      if (value === null || value === undefined) {
        return false;
      }

      const stringValue = String(value).toLowerCase();
      const match = stringValue.includes(normalizedSearch);

      if (index === 0) {

      }

      return match;
    });

    return matches;
  });


  return results;
};

/**
 * Gets nested value from object using dot notation
 * @param obj - Object to get value from
 * @param path - Dot-notated path (e.g., "branchId.name")
 * @returns Value at the path or undefined
 */
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => {
    return current?.[key];
  }, obj);
};

/**
 * Highlights search term in text
 * @param text - Text to highlight in
 * @param searchTerm - Term to highlight
 * @returns Text with highlighted term
 */
export const highlightSearchTerm = (text: string, searchTerm: string): string => {
  if (!searchTerm || !text) return text;

  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

/**
 * Debounce function for search input
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any,>(
func: T,
delay: number)
: ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};