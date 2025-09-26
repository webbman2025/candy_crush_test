/**
 * Formats a number with comma separators for thousands, millions, etc.
 * @param num - The number to format
 * @returns The formatted number as a string with comma separators
 *
 * @example
 * formatNumberWithCommas(1234) // "1,234"
 * formatNumberWithCommas(1234567) // "1,234,567"
 * formatNumberWithCommas(0) // "0"
 */
export const formatNumberWithCommas = (num: number): string => {
  return num.toLocaleString();
};
