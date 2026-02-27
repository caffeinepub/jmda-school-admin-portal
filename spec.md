# JMDA School Admin Portal

## Current State
A school administration portal with:
- Role-based access control (admin/user/guest) via authorization component
- CRUD operations for Students, Teachers, Classes, Announcements
- Dashboard with stats
- "Claim Admin Access" button for first-time admin setup
- Internet Identity login

The current problem: the `claimAdmin` function fails with "An admin may already be assigned" because a previous principal was saved as admin in the canister's stable state. The user (a different principal or same principal re-logging in) cannot claim admin.

## Requested Changes (Diff)

### Add
- `forceClaimAdmin()` backend function: clears all existing user roles, resets `adminAssigned` flag, then assigns the caller as admin. Returns `Bool`.
- Frontend button: when `claimAdmin()` fails, show a secondary "Reset & Claim Admin" option that calls `forceClaimAdmin()`.

### Modify
- `claimAdmin()`: also sets `adminAssigned := true` on success (currently missing).
- Dashboard UI: after successful `forceClaimAdmin`, refresh role and show full admin controls.

### Remove
- Nothing removed.

## Implementation Plan
1. Regenerate backend with `forceClaimAdmin` function added alongside existing `claimAdmin`.
2. Update frontend Dashboard to call `forceClaimAdmin` as a fallback when `claimAdmin` returns false, with a clear "Reset & Claim Admin" button.
3. Deploy.
