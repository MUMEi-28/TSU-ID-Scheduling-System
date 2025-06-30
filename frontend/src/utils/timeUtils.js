/**
 * Utility functions for consistent time handling across the frontend
 */

/**
 * Normalize slot time to canonical format: '8:00am-9:00am' (no spaces, lowercase am/pm)
 * @param {string} time - The time string to normalize
 * @returns {string} The normalized time string
 */
export function normalizeSlotTime(time)
{
    if (!time) return '';

    // Remove all spaces and convert to lowercase
    let normalized = time.toLowerCase().replace(/\s+/g, '');

    // Ensure consistent format: ensure am/pm is lowercase and no spaces around dash
    normalized = normalized.replace(/(\d+):(\d+)(am|pm)\s*-\s*(\d+):(\d+)(am|pm)/, '$1:$2$3-$4:$5$6');

    return normalized;
}

/**
 * Get canonical time slots array (consistent with backend)
 * @returns {Array} Array of canonical time slot strings
 */
export function getCanonicalTimeSlots()
{
    return [
        '8:00am-9:00am',
        '9:00am-10:00am',
        '10:00am-11:00am',
        '11:00am-12:00pm',
        '1:00pm-2:00pm',
        '2:00pm-3:00pm',
        '3:00pm-4:00pm',
        '4:00pm-5:00pm'
    ];
}

/**
 * Get display format time slots (for UI display)
 * @returns {Array} Array of display format time slot strings
 */
export function getDisplayTimeSlots()
{
    return [
        '8:00am - 9:00am',
        '9:00am - 10:00am',
        '10:00am - 11:00am',
        '11:00am - 12:00pm',
        '1:00pm - 2:00pm',
        '2:00pm - 3:00pm',
        '3:00pm - 4:00pm',
        '4:00pm - 5:00pm'
    ];
}

/**
 * Convert display format to canonical format
 * @param {string} displayTime - Time in display format
 * @returns {string} Time in canonical format
 */
export function displayToCanonical(displayTime)
{
    return normalizeSlotTime(displayTime);
}

/**
 * Convert canonical format to display format
 * @param {string} canonicalTime - Time in canonical format
 * @returns {string} Time in display format
 */
export function canonicalToDisplay(canonicalTime)
{
    if (!canonicalTime) return '';

    // Add spaces around the dash for display
    return canonicalTime.replace(/(\d+):(\d+)(am|pm)-(\d+):(\d+)(am|pm)/, '$1:$2$3 - $4:$5$6');
}

/**
 * Validate if a time string matches canonical format
 * @param {string} time - The time string to validate
 * @returns {boolean} True if valid canonical format
 */
export function isValidCanonicalTime(time)
{
    const canonicalSlots = getCanonicalTimeSlots();
    return canonicalSlots.includes(normalizeSlotTime(time));
}

/**
 * Normalize date to YYYY-MM-DD format
 * @param {string|Date} date - The date to normalize
 * @returns {string} The normalized date string
 */
export function normalizeDate(date)
{
    if (!date) return '';
    if (typeof date === 'string')
    {
        if (/^\d{4}-\d{2}-\d{2}$/.test(date))
        {
            return date;
        }
        const parsed = new Date(date);
        if (!isNaN(parsed.getTime()))
        {
            // Use local date, not UTC
            const year = parsed.getFullYear();
            const month = String(parsed.getMonth() + 1).padStart(2, '0');
            const day = String(parsed.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
    } else if (date instanceof Date)
    {
        // Use local date, not UTC
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    return date;
} 