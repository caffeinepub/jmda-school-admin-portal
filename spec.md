# JMDA School Admin Portal

## Current State
- Employees are stored in browser localStorage (useLocalStorage hook) — data is lost on different devices or browser clears
- Students are stored in the Motoko backend canister
- All logins use Internet Identity (Principal ID)
- Admin grants access to teachers/students via Manage Login pages (principal-based)
- No username/password credential system exists

## Requested Changes (Diff)

### Add
- Employee credentials system: admin assigns a username (auto-generated Employee ID like EMP001, T001) and a password for each employee when adding/editing them
- Student credentials system: admin assigns a username (auto-generated STU001, STU002) and a password for each student
- Backend storage for employees (move from localStorage to Motoko canister)
- Backend storage for employee credentials (username + hashed/stored password)
- Backend storage for student credentials (username + password)
- A separate "Staff/Student Login" page: when a user visits the portal, they can choose "Admin Login" (Internet Identity) or "Staff/Student Login" (username + password)
- On staff/student login: user enters username + password → backend verifies → links their current Internet Identity session to the employee/student account → grants appropriate role
- Admin can view, reset, or revoke credentials from Employees > Manage Login and Students > Manage Login
- Auto-generate Employee IDs: teachers get T001, T002...; other staff get EMP001, EMP002...; students get STU001, STU002...

### Modify
- Employee form (EditEmployeePage): add Username (auto-generated, shown read-only) and Password fields under Basic Information for admin to set/reset credentials
- EmployeesPage: show Employee ID (auto-generated from backend sequence) in the table
- Manage Login pages: show existing credentials, allow admin to reset password
- Login/landing page: show two login options — Admin (Internet Identity) and Staff/Student (username + password form)

### Remove
- Employee localStorage storage — migrate to backend canister

## Implementation Plan
1. Add Motoko types and functions for Employee storage (CRUD: create, read, update, delete employee)
2. Add Motoko functions for credentials: setEmployeeCredentials(empId, username, password), verifyEmployeeCredentials(username, password) → returns employee role, resetPassword, revokeCredentials
3. Add student credential functions: setStudentCredentials, verifyStudentCredentials
4. Auto-generate sequential IDs for employees (T001 for teachers, EMP001 for others) and students (STU001)
5. Frontend: update EditEmployeePage to call backend create/update employee, show auto-generated username
6. Frontend: update EmployeesPage to fetch from backend
7. Frontend: add Staff/Student login form on the login/landing screen
8. Frontend: after staff login, call verifyCredentials, link principal, navigate to appropriate portal
9. Frontend: update Manage Login pages to show credentials and allow password reset
