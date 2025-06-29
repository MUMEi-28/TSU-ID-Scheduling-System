<?php
/**
 * Utility functions for consistent data handling across the scheduling system
 */

/**
 * Normalize slot time to canonical format: '8:00am-9:00am' (no spaces, lowercase am/pm)
 * @param string $time The time string to normalize
 * @return string The normalized time string
 */
function normalize_slot_time($time) {
    if (empty($time)) return '';
    
    // Remove all spaces and convert to lowercase
    $normalized = strtolower(preg_replace('/\s+/', '', $time));
    
    // Ensure consistent format: ensure am/pm is lowercase and no spaces around dash
    $normalized = preg_replace('/(\d+):(\d+)(am|pm)\s*-\s*(\d+):(\d+)(am|pm)/', '$1:$2$3-$4:$5$6', $normalized);
    
    return $normalized;
}

/**
 * Normalize schedule date to YYYY-MM-DD format
 * @param string $date The date string to normalize
 * @return string The normalized date string
 */
function normalize_schedule_date($date) {
    if (empty($date)) return '';
    
    // If already in YYYY-MM-DD format, return as is
    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        return $date;
    }
    
    // Try to parse and format the date
    $timestamp = strtotime($date);
    if ($timestamp !== false) {
        return date('Y-m-d', $timestamp);
    }
    
    return $date; // Return original if parsing fails
}

/**
 * Get canonical time slots array (for frontend consistency)
 * @return array Array of canonical time slot strings
 */
function get_canonical_time_slots() {
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
 * Validate if a time string matches canonical format
 * @param string $time The time string to validate
 * @return bool True if valid canonical format
 */
function is_valid_canonical_time($time) {
    $canonical_slots = get_canonical_time_slots();
    return in_array(normalize_slot_time($time), $canonical_slots);
}
?> 