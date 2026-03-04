# JMDA School Admin Portal

## Current State

Full school management portal with:
- Dashboard with stats, announcements, quick actions
- Student management (CRUD with full admission form)
- Teacher management (CRUD)
- Classes, Subjects, Families, Active/Inactive, Admission Letter, ID Cards, Promote Students
- Employees management
- Fees module: Generate Invoice, Collect Fees, Paid Slip, Defaulters, Report, Delete
- Salary, Attendance, Timetable, Homework, Exams, Class Tests, Reports pages
- Admin access control via Internet Identity + claim admin flow

**Bug:** The `access-control.mo` `getUserRole` function calls `Runtime.trap("User is not registered")` for any principal not in `userRoles`. This causes ALL read queries (`getAllStudents`, `getAllTeachers`, `getAllClasses`, `getAllAnnouncements`, `getSchoolStats`) to throw errors for:
1. Anonymous users (before login)
2. Logged-in users who haven't been registered via `_initializeAccessControlWithSecret`

Result: Students and Teachers sections show empty / fail to load.

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- `access-control.mo`: Change `getUserRole` to return `#user` for unregistered (non-anonymous) principals instead of calling `Runtime.trap`. This makes all authenticated users default to `#user` role, allowing read operations to succeed.
- Keep all write operations (create, update, delete) still requiring `#admin`.

### Remove
- Nothing removed

## Implementation Plan

1. Regenerate backend Motoko code with the `getUserRole` fix: for unregistered non-anonymous principals, return `#user` instead of `Runtime.trap`.
2. Preserve all existing data structures, CRUD operations, fee payment logic, and admin claim logic exactly as they are.
3. No frontend changes needed -- the fix is purely in the backend authorization layer.
