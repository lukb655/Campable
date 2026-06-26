#!/bin/bash
# ================================================================
#  Trip App — Automated Fix Runner
#  Each fix runs headlessly via Claude Code and opens a GitHub PR.
#
#  BEFORE RUNNING:
#    1. cd into your project repo directory
#    2. Make sure 'gh' CLI is authenticated (gh auth status)
#    3. Run:  bash trip_fixes.sh
#
#  All output is logged to trip_fixes_<timestamp>.log
# ================================================================

set -euo pipefail

LOG_FILE="trip_fixes_$(date +%Y%m%d_%H%M%S).log"
DELAY=15   # seconds between fixes to let git settle

log() { echo "$1" | tee -a "$LOG_FILE"; }

run_fix() {
    local num="$1"
    local name="$2"
    local prompt="$3"

    log ""
    log "══════════════════════════════════════════════════"
    log "  FIX $num: $name"
    log "  Started: $(date)"
    log "══════════════════════════════════════════════════"

    if claude --dangerously-skip-permissions -p "$prompt" >> "$LOG_FILE" 2>&1; then
        log "  ✓  Fix $num finished: $(date)"
    else
        log "  ✗  Fix $num FAILED — check log for details: $(date)"
    fi

    sleep $DELAY
}

log "Trip App Automated Fixes"
log "Project dir: $(pwd)"
log "Started:     $(date)"
log "Log file:    $LOG_FILE"
log ""

# ── FIX 1 ─────────────────────────────────────────────────────
run_fix 1 "Created vs Joined Trip Display" \
"You are working in a trip-planning web app. Explore the codebase to understand how trips are listed on the main/home page and how the data model tracks whether the current user created a trip vs joined one as a member.

Implement these UI changes on the trip card/list component:
1. If the current user is the trip CREATOR or ADMIN: show a small settings/gear icon on the trip card that links to that trip's settings page.
2. If the current user JOINED the trip (they are a member but not the creator): add a visible label or badge such as 'Joined' to distinguish it from trips they own. Also display the creator's name somewhere on the card (e.g., 'by [Name]' or 'Created by [Name]').

Keep styling consistent with the existing design system. Make minimal, clean changes — do not redesign the card layout.

When finished:
- Create a new git branch: feature/created-vs-joined-trip-display
- Commit all changes with message: 'feat: distinguish created vs joined trips on main page'
- Push branch to origin
- Open a GitHub PR titled 'feat: Distinguish created vs joined trips on main page' describing what changed and why"

# ── FIX 2 ─────────────────────────────────────────────────────
run_fix 2 "Admin-Only Crew Management" \
"You are working in a trip-planning web app. Explore the codebase to find the crew/members tab for a trip. Identify every place where a user can add a new member or remove an existing member from a trip.

Implement a permission check so that ONLY the trip creator or admin can perform add/remove member actions. For all other crew members:
- Hide or disable the add member button/UI
- Hide or disable any remove/kick buttons next to other crew members
- Do not show these controls at all to non-admin users (hiding is cleaner than disabling)

Make sure to check both the frontend UI guards AND any backend/API calls — the restriction should be enforced in both places if the project has a backend. Do not break the admin's existing ability to manage crew.

When finished:
- Create a new git branch: fix/admin-only-crew-management
- Commit all changes with message: 'fix: restrict crew add/remove to trip admin only'
- Push branch to origin
- Open a GitHub PR titled 'fix: Admin-only crew member management' describing what changed"

# ── FIX 3 ─────────────────────────────────────────────────────
run_fix 3 "Hide Dues UI When Dues Disabled" \
"You are working in a trip-planning web app. Explore the codebase to find:
1. The trip settings where dues can be enabled or disabled (find the setting name/key used in the data model)
2. The crew member list UI where 'Pay Dues', 'Settled Up', 'Paid', or any dues-related status is displayed per member

Implement conditional rendering: when trip dues are DISABLED in settings, completely hide the following from the crew member list:
- The 'Pay Dues' button (or equivalent)
- Any 'Settled Up', 'Paid', or payment-status indicators on each crew member row

When dues are ENABLED, these should still appear exactly as before. This should be a purely conditional render — do not delete these components, just gate them on the dues-enabled setting.

When finished:
- Create a new git branch: fix/hide-dues-ui-when-disabled
- Commit all changes with message: 'fix: hide dues UI on crew tab when trip dues are disabled'
- Push branch to origin
- Open a GitHub PR titled 'fix: Conditionally hide dues UI based on trip settings'"

# ── FIX 4 ─────────────────────────────────────────────────────
run_fix 4 "Itemized Trip Dues (Campsite, Firewood, etc.)" \
"You are working in a trip-planning web app. Explore the existing dues/costs system to understand the current data model and UI.

Add a new feature for itemized shared expenses. Users should be able to:
1. Add named cost items to a trip (e.g., 'Campsite fee', 'Firewood', 'Ice', 'Propane') each with a dollar amount
2. View the list of added items and their amounts
3. See each item's cost split across crew members (amount / crew count)
4. Edit or delete items

Place this in a logical location — either a new 'Costs' or 'Expenses' section within the trip, or integrate it into the existing dues area if it fits cleanly. Use the existing design system and data patterns in the project.

If the project has a backend/database, add the necessary schema changes or API routes. If it is frontend-only, add the appropriate state management.

When finished:
- Create a new git branch: feature/itemized-trip-dues
- Commit all changes with message: 'feat: add itemized dues for campsite costs, firewood, etc.'
- Push branch to origin
- Open a GitHub PR titled 'feat: Itemized trip expenses (campsite, firewood, etc.)' with a description of the data model and UI approach"

# ── FIX 5 ─────────────────────────────────────────────────────
run_fix 5 "Grocery Responsibilities and Cooking Roles" \
"You are working in a trip-planning web app. Explore the codebase to understand how crew members and meals/grocery items are currently handled.

Add TWO separate role systems:

SYSTEM A — Grocery Responsibilities:
- Any crew member can be assigned as 'responsible' for specific grocery/supply items (e.g., 'John brings hot dogs, buns, mustard')
- This is about who is bringing or buying each item, not cooking
- Show this in an appropriate location (e.g., a 'Packing' or 'Supplies' tab, or within the grocery/meal planning area)

SYSTEM B — Cooking Assignments:
- Crew members can be designated as the COOK for a specific meal (e.g., 'Sarah cooks Saturday dinner')
- This is separate from what items someone brings
- Show cook assignments on or near the meal/recipe entries, or in a dedicated cooking schedule view

Keep these two systems visually and functionally separate. Use clear labels so users understand the difference between 'who brings it' and 'who cooks it'. Match the existing design system.

Add any necessary data model changes, API routes (if backend exists), and UI components.

When finished:
- Create a new git branch: feature/grocery-responsibilities-and-cooking-roles
- Commit all changes with message: 'feat: add grocery responsibilities and cooking role assignments'
- Push branch to origin
- Open a GitHub PR titled 'feat: Grocery responsibilities and cooking roles' explaining both systems"

# ── FIX 6 ─────────────────────────────────────────────────────
run_fix 6 "Crew Headcount in Trip Overview" \
"You are working in a trip-planning web app. Find the trip overview/summary page — specifically the section that shows stats like total miles and total meals.

Add a 'Crew' or 'Headcount' stat to this section showing the total number of crew members on the trip. It should appear alongside (or in the same visual row/grid as) the existing miles and meals stats, using the same styling and format.

Pull the crew count from the existing crew/members data — do not hardcode it. If the current user is included in the count, make sure that is consistent with how the rest of the app counts members.

When finished:
- Create a new git branch: fix/crew-headcount-in-overview
- Commit all changes with message: 'feat: add crew headcount stat to trip overview'
- Push branch to origin
- Open a GitHub PR titled 'feat: Show crew headcount in trip overview alongside miles and meals'"

# ── FIX 7 ─────────────────────────────────────────────────────
run_fix 7 "Fix Cover Photo Compatibility" \
"You are working in a trip-planning web app. Investigate why only certain photos work as trip cover photos. Find the cover photo upload and display logic — look for:
- File type validation or filtering (accepted MIME types or extensions)
- File size limits
- Image processing or resizing logic
- How the image is stored (base64, file path, URL, blob storage, etc.)
- How the image is displayed (img tag, background-image CSS, etc.)
- Any browser-specific issues with the current implementation

Fix the issue so that any common photo format works (JPEG, PNG, WEBP, HEIC if feasible, GIF). If there are legitimate technical constraints that cannot be removed (e.g., a hard size limit from a free storage tier), update the cover photo selection UI to clearly display those constraints to the user before they attempt to upload (e.g., 'Max 5MB, JPG/PNG/WEBP only').

When finished:
- Create a new git branch: fix/cover-photo-compatibility
- Commit all changes with message: 'fix: ensure any common photo format works as trip cover photo'
- Push branch to origin
- Open a GitHub PR titled 'fix: Cover photo compatibility — support all common image formats' describing what was causing the issue and how it was resolved"

# ── FIX 8 ─────────────────────────────────────────────────────
run_fix 8 "Trip Completed Status and Archive" \
"You are working in a trip-planning web app. Add a trip completion and archiving system:

1. MARK AS COMPLETED:
- Add a 'Mark Trip as Completed' action available to the trip admin/creator (in trip settings or via a prominent button)
- Completed trips should have a visual indicator (e.g., 'Completed' badge or checkmark)
- When marking complete, optionally prompt for a completion date if not already past

2. ARCHIVE:
- Add an 'Archive' section or tab on the main trips page (separate from active trips)
- Completed trips should be movable to / automatically appear in the archive
- Archived trips should be viewable in read-only mode — crew can still see all details, meals, costs, etc., but nothing is editable
- Active trips list should not show archived/completed trips by default

Add any necessary data model fields (e.g., status: 'active' | 'completed', completedAt date), API routes if the project has a backend, and update all relevant queries/filters to respect the new status field.

When finished:
- Create a new git branch: feature/trip-completed-and-archive
- Commit all changes with message: 'feat: add trip completed status and archive section'
- Push branch to origin
- Open a GitHub PR titled 'feat: Trip completed status and archive' describing the data model changes and new UI sections"

# ── DONE ──────────────────────────────────────────────────────
log ""
log "══════════════════════════════════════════════════"
log "  ALL FIXES COMPLETE"
log "  Finished: $(date)"
log "  Full log: $LOG_FILE"
log "══════════════════════════════════════════════════"
