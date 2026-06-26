#!/bin/bash
# Campable Redesign — Fixes 6-18 (resume after kill)

LOG="redesign_remainder_$(date +%Y%m%d_%H%M%S).log"
DELAY=15

log() { echo "$1" | tee -a "$LOG"; }

run_fix() {
    local num="$1"
    local name="$2"
    local prompt="$3"

    log ""
    log "══════════════════════════════════════════════════"
    log "  FIX $num: $name"
    log "  Started: $(date)"
    log "══════════════════════════════════════════════════"

    if claude --dangerously-skip-permissions -p "$prompt" >> "$LOG" 2>&1; then
        log "  ✓  Fix $num done: $(date)"
    else
        log "  ✗  Fix $num FAILED: $(date)"
    fi

    sleep $DELAY
}

log "Campable Redesign — Fixes 6-18"
log "Project: $(pwd)"
log "Started: $(date)"
log "Log:     $LOG"

run_fix 6 "Home Page: Leave Trip + Complete Trip Buttons" \
"Add two action buttons at the bottom of the Home page. Leave Trip button: visible to all non-admin members, shows a confirmation dialog on tap, on confirm removes the user from trips/{tripId}/members and navigates to trip selection screen. Complete Trip button: visible to admin only, shows a confirmation dialog on tap, on confirm sets trips/{tripId}/status to completed in Firestore and navigates to a trip summary or home screen. Style Leave Trip as muted/secondary and Complete Trip as prominent accent/primary. Match existing button styles. When done, commit all changes with a descriptive message."

run_fix 7 "Crew Tab: Invite Code Display" \
"At the top of the Crew tab, display the trip invite/join code if sharing is enabled. Pull join code from trips/{tripId}/joinCode in Firestore. If it exists, display it in a styled code block with a Copy Code button that copies to clipboard. If join code sharing is disabled (field null or shareCode false), hide this section. Admin sees an additional toggle to enable/disable code sharing, which updates trips/{tripId}/shareCode in Firestore. When done, commit all changes with a descriptive message."

run_fix 8 "Crew Tab: Members List with Owner Badge" \
"Display the full crew members list on the Crew tab. Fetch all members from trips/{tripId}/members. Display each member as a row with profile picture or initials fallback, display name, and role. The trip owner/admin is visually distinguished with an Owner badge or crown icon next to their name. Sort list with owner first, then other members alphabetically. When done, commit all changes with a descriptive message."

run_fix 9 "Crew Tab: Settled Up & Dues Status" \
"Add a Dues and Settled Up section to the Crew tab, shown only if dues/cost-splitting is enabled on the trip. Display each member's name and their current balance derived from Costs data. Members fully settled show a green Settled checkmark. Members with outstanding balance show the amount owed in a warning color. This section is read-only status only — the Pay Dues button does NOT go here, it belongs only in the Costs tab. When done, commit all changes with a descriptive message."

run_fix 10 "Crew Tab: Cook & Responsibilities" \
"Add a Cook and Responsibilities section to the Crew tab. Display a list of trip responsibilities such as Cook, Fire Starter, First Aid, and Navigation, each showing the assigned crew member. Admin can assign or reassign roles via a dropdown or modal selector. Assignments saved to trips/{tripId}/responsibilities in Firestore as a map of role to userId. Non-admin members see the list as read-only. When done, commit all changes with a descriptive message."

run_fix 11 "Crew Tab: Expandable Member Profiles" \
"Make each member row in the Crew tab tappable, expanding into a full profile card as a modal or inline expansion. Expanded profile shows: full name, enlarged profile picture, emergency contact name and phone number, dietary restrictions or notes, and any other fields from the user Firestore profile. Emergency contact fields are editable by the member themselves only. Admin can view all profiles but cannot edit another member's personal fields. When done, commit all changes with a descriptive message."

run_fix 12 "Crew Tab: Group Chat" \
"Add a group chat panel to the Crew tab. Use Firestore trips/{tripId}/messages subcollection with an onSnapshot listener for real-time updates. Each message shows sender avatar or initials, sender name, message text, and timestamp. Messages ordered by timestamp ascending with auto-scroll to latest on new message. Input bar fixed at the bottom with a text field and send button. No push notifications required at this stage. If complexity is high, scaffold the UI shell and Firestore read/write only. When done, commit all changes with a descriptive message."

run_fix 13 "Meals Tab: Extras Section" \
"Keep the current Meals tab layout and design completely intact. Add a new Extras section below the existing meal cards with two sub-categories: Drinks and Snacks. Each extra item has a name, optional purchase price, and optional assigned crew member. Add Extra button opens a small form with fields: item name, category (Drink or Snack), optional price, optional assignee. Extras stored in Firestore under trips/{tripId}/extras. Display extras in a compact list grouped by category with Drinks first then Snacks. When done, commit all changes with a descriptive message."

run_fix 14 "Costs Tab: Full Redesign" \
"Redesign the Costs tab layout. 1) Large summary tile at top showing Total Trip Cost as sum of all costs displayed as a prominent dollar amount. 2) Three cost category tiles below: Shared Costs (split evenly among crew), Individual Costs (tied to specific members), Food Costs (from Meals tab including extras with prices). Each tile shows its subtotal and a collapsible list of line items expandable on tap. 3) Pay Dues button as the primary action — only place this button appears in the entire app. 4) Change Distribution button visible to admin only, opens a modal to change how shared costs are split: evenly, by custom percentage, or by subset of members. Distribution method saved to trips/{tripId}/costSettings. Extend Firestore schema only if necessary. When done, commit all changes with a descriptive message."

run_fix 15 "Packing List Tab" \
"Build out the Packing List tab. Display a full packing list of all items grouped by category if categories exist or as a flat list otherwise. Each item shows: item name, responsible person if assigned, optional purchase cost, and a checkbox to mark as packed. Add Item button available to any crew member, form fields: item name, optional category, optional responsible person from crew dropdown, optional purchase cost. Any crew member can remove any item with a confirm before delete. Print List button opens a print-friendly view using window.print() that strips nav, buttons, and non-essential UI. Items stored in Firestore at trips/{tripId}/packingList as a subcollection. When done, commit all changes with a descriptive message."

run_fix 16 "Waypoints Tab" \
"Build out the Waypoints tab with an interactive map and waypoint management. Display all waypoints on an embedded map using whatever map library is already in the project. Each waypoint renders as a pin with a type-specific icon: Vista uses a scenic viewpoint icon, Trail uses a trail icon and includes a mileage field, Other Point uses a generic marker and includes a description field. Add Waypoint button opens a form with required fields: name and type, plus conditional fields: mileage for Trail and description for Other, plus optional lat/lng coordinates with a map picker if possible. Any member can remove a waypoint with confirm before delete. Each waypoint card has an Add to Itinerary option that opens a mini form with fields: event name, day picker, and time picker, saving to trips/{tripId}/itinerary with a waypointId reference. Waypoints stored in trips/{tripId}/waypoints in Firestore. When done, commit all changes with a descriptive message."

run_fix 17 "Itinerary Tab" \
"Build out the Itinerary tab as a day-by-day timeline. Display all itinerary events grouped by day (Day 1, Day 2, etc. or calendar date if trip dates are set). Within each day, show events and scheduled meals together in time order, pulling meals from the Meals tab data. If an event has a waypointId reference, display the linked waypoint name, type, and relevant detail (mileage if Trail, description if Other, or Vista label) as a sub-line under the event. Events show: time, event name, linked waypoint info if any, and assigned crew member if set. Add Event button opens a form with fields: day, time, name, optional waypoint selector, optional assignee. Events saved to trips/{tripId}/itinerary. Meals with a scheduled time appear automatically without re-entry. When done, commit all changes with a descriptive message."

run_fix 18 "Sign Up: Privacy Policy Confirmation" \
"Update the sign-up page to include a Privacy Policy section at the bottom of the form. Display the policy inline as a scrollable text area or collapsible expandable block — not a separate page. Add a required checkbox: I have read and agree to the Privacy Policy. The sign-up submit button is disabled until this checkbox is checked. On account creation, store agreedToPrivacyPolicy: true and privacyPolicyAgreedAt: timestamp on the user Firestore document. Pull Privacy Policy text from a Firestore config document at config/privacyPolicy or a static constant in the codebase. If final policy text is not yet written, use a placeholder with a TODO comment — do not hardcode a full policy inline. When done, commit all changes with a descriptive message."

log ""
log "══════════════════════════════════════════════════"
log "  FIXES 6-18 COMPLETE"
log "  Finished: $(date)"
log "  Log: $LOG"
log "══════════════════════════════════════════════════"
