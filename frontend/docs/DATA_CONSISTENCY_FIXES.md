# Data Consistency Fixes - TSU ID Scheduling System

## Overview

This document outlines the comprehensive fixes implemented to ensure consistent data handling across the TSU ID Scheduling System. The main issues were inconsistent slot time formats, hardcoded values, and lack of normalization between frontend and backend.

## Problems Identified

1. **Inconsistent Slot Time Formats**: Different components used different formats (`"8:00am - 9:00am"`, `"8:00am-9:00am"`, `"8:00 - 9:00"`)
2. **Hardcoded Values**: Frontend components used hardcoded `maxSlot = 12` instead of dynamic backend values
3. **No Normalization**: Backend queries didn't normalize time strings, causing mismatches
4. **Data Truncation**: Database schema had inconsistent field lengths
5. **Missing Indexes**: Performance issues due to missing database indexes

## Solutions Implemented

### 1. Canonical Time Format Definition

**Canonical Format**: `"8:00am-9:00am"` (no spaces, lowercase am/pm, consistent dash)

**Display Format**: `"8:00am - 9:00am"` (spaces around dash for UI)

### 2. Utility Functions

#### Backend (`backend/utils.php`)
```php
normalize_slot_time($time)           // Converts any format to canonical
normalize_schedule_date($date)       // Ensures YYYY-MM-DD format
get_canonical_time_slots()           // Returns array of canonical times
is_valid_canonical_time($time)       // Validates format
```

#### Frontend (`frontend/src/utils/timeUtils.js`)
```javascript
normalizeSlotTime(time)              // Converts any format to canonical
normalizeDate(date)                  // Ensures YYYY-MM-DD format
getCanonicalTimeSlots()              // Returns array of canonical times
getDisplayTimeSlots()                // Returns array of display times
displayToCanonical(displayTime)      // Converts display to canonical
canonicalToDisplay(canonicalTime)    // Converts canonical to display
isValidCanonicalTime(time)           // Validates format
```

### 3. Database Schema Updates

#### Updated `backend/database/schema.sql`
- Added clear comments about canonical format
- Added sample data with correct format
- Added missing indexes for performance
- Added unique constraint to prevent duplicate slots

### 4. Backend API Updates

All backend files now include `utils.php` and use normalization:

- `get_slot_count.php` - Normalizes input times
- `get_max_slot_count.php` - Normalizes input times  
- `adjustLimitofSlots.php` - Normalizes input times
- `confirm_slot.php` - Normalizes input times
- `register.php` - Normalizes input times

### 5. Frontend Component Updates

#### Updated Components
- `TimePicker.jsx` - Uses canonical time slots and normalization
- `adjustmentSlotDropDown.jsx` - Uses canonical time slots
- `AdminPage.jsx` - Uses normalization for API calls
- `ScheduleReceipt.jsx` - Converts canonical to display format
- `TimeSlot.jsx` - Removed hardcoded maxSlot, uses dynamic maxCapacity
- `TimeSlotContainer.jsx` - Uses dynamic data instead of hardcoded values

### 6. Data Migration

Created `backend/migrate_data.php` to normalize existing data:
- Converts all existing slot_time values to canonical format
- Converts all existing schedule_time values to canonical format
- Converts all existing schedule_date values to YYYY-MM-DD format
- Verifies data integrity after migration

## Implementation Steps

### 1. Run Database Migration
```bash
cd backend
php migrate_data.php
```

### 2. Update Database Schema
```sql
-- Run the updated schema.sql to add indexes and constraints
```

### 3. Test the System
1. Test slot adjustment functionality
2. Test student booking process
3. Verify time displays correctly in all components
4. Check that max capacity is dynamic, not hardcoded

## Benefits

1. **Consistent Data**: All time strings are now in the same format
2. **No More Mismatches**: Frontend and backend use the same canonical format
3. **Dynamic Capacity**: Max slot capacity is now dynamic, not hardcoded
4. **Better Performance**: Added database indexes for faster queries
5. **Future-Proof**: Utility functions ensure consistency going forward
6. **Maintainable**: Clear separation between display and canonical formats

## File Structure

```
backend/
├── utils.php                    # Normalization utilities
├── migrate_data.php            # Data migration script
├── database/schema.sql         # Updated schema with indexes
├── get_slot_count.php          # Updated with normalization
├── get_max_slot_count.php      # Updated with normalization
├── adjustLimitofSlots.php      # Updated with normalization
├── confirm_slot.php            # Updated with normalization
└── register.php                # Updated with normalization

frontend/src/
├── utils/timeUtils.js          # Frontend normalization utilities
├── Components/Student/NewScheduleSelection/
│   └── TimePicker.jsx          # Updated with canonical times
├── Components/Admin/
│   ├── AdminPage.jsx           # Updated with normalization
│   └── adjustmentSlotDropDown.jsx # Updated with canonical times
└── Components/Student/Pages/
    └── ScheduleReceipt.jsx     # Updated with format conversion
```

## Testing Checklist

- [ ] Slot adjustment works correctly
- [ ] Student booking process works
- [ ] Time displays correctly in all components
- [ ] Max capacity is dynamic (not hardcoded to 12)
- [ ] No duplicate slots are created
- [ ] Existing data is properly migrated
- [ ] Performance is acceptable with new indexes

## Notes

- The system now maintains backward compatibility while ensuring future consistency
- All new data will be in canonical format
- Display format is only used for UI presentation
- Backend always works with canonical format
- Migration script should be run once to normalize existing data 