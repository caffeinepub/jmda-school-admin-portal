import { useLocalStorage } from "./useLocalStorage";

// ── Types ────────────────────────────────────────────────────────────────────

export interface Family {
  id: string;
  name: string;
  address: string;
  phone: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  className: string;
}

export interface Employee {
  id: string;
  // Section 1 - Basic Information
  picture: string;
  name: string;
  mobile: string;
  dateOfJoining: string;
  role: string;
  salary: number;
  // kept for backward compat
  department: string;
  teacherId?: string;
  // Section 2 - Other Information
  fatherHusbandName: string;
  nationalId: string;
  education: string;
  gender: string;
  religion: string;
  bloodGroup: string;
  experience: string;
  email: string;
  dateOfBirth: string;
  homeAddress: string;
}

export interface EmployeeCredential {
  employeeId: string;
  username: string; // auto-generated display ID (T001, EMP001)
  password: string;
  active: boolean;
}

export interface StudentCredential {
  studentId: string; // student backend ID (bigint as string)
  username: string; // STU001, STU002
  password: string;
  active: boolean;
}

export interface SalaryRecord {
  id: string;
  employeeId: string;
  month: string;
  year: string;
  amount: number;
  remarks: string;
}

export type AttendanceStatus = "present" | "absent" | "late";

export interface AttendanceRecord {
  classId: string;
  date: string;
  records: Record<string, AttendanceStatus>; // studentId -> status
}

export interface TimetablePeriod {
  id: string;
  classId: string;
  day: string;
  periodNumber: number;
  subject: string;
  teacher: string;
  time: string;
}

export interface HomeworkItem {
  id: string;
  className: string;
  subject: string;
  title: string;
  description: string;
  dueDate: string;
}

export interface ExamItem {
  id: string;
  name: string;
  type: "exam" | "class_test";
  className: string;
  subject: string;
  date: string;
  maxMarks: number;
  marks: Record<string, number>; // studentId -> marks
}

export interface StudentExtended {
  studentId: string;
  dateOfBirth: string;
  gender: string;
  identificationMark: string;
  bloodGroup: string;
  motherTongue: string;
  birthPlace: string;
  cast: string;
  previousSchool: string;
  previousId: string;
  aadhaarNumber: string;
  orphan: string;
  disease: string;
  religion: string;
  familyId: string;
  totalSiblings: number;
  address: string;
  fatherName: string;
  fatherEducation: string;
  fatherMobile: string;
  fatherOccupation: string;
  fatherIncome: number;
  motherName: string;
  motherEducation: string;
  motherMobile: string;
  motherOccupation: string;
  motherIncome: number;
  dateOfAdmission: string;
  discountInFee: number;
  active: boolean;
  picture: string;
}

export interface AdminProfile {
  name: string;
  schoolName: string;
  designation: string;
  email: string;
  phone: string;
  address: string;
  picture: string;
}

// ── Hooks ────────────────────────────────────────────────────────────────────

export function useFamilies() {
  return useLocalStorage<Family[]>("jmda_families", []);
}

export function useSubjects() {
  return useLocalStorage<Subject[]>("jmda_subjects", [
    { id: "s1", name: "Mathematics", code: "MATH", className: "All" },
    { id: "s2", name: "English", code: "ENG", className: "All" },
    { id: "s3", name: "Science", code: "SCI", className: "All" },
    { id: "s4", name: "Social Studies", code: "SST", className: "All" },
    { id: "s5", name: "Hindi", code: "HIN", className: "All" },
  ]);
}

export function useEmployees() {
  return useLocalStorage<Employee[]>("jmda_employees", []);
}

export function useSalaryRecords() {
  return useLocalStorage<SalaryRecord[]>("jmda_salary", []);
}

export function useAttendanceRecords() {
  return useLocalStorage<AttendanceRecord[]>("jmda_attendance", []);
}

export function useTimetable() {
  return useLocalStorage<TimetablePeriod[]>("jmda_timetable", []);
}

export function useHomework() {
  return useLocalStorage<HomeworkItem[]>("jmda_homework", []);
}

export function useExams() {
  return useLocalStorage<ExamItem[]>("jmda_exams", []);
}

export function useStudentExtended() {
  return useLocalStorage<Record<string, StudentExtended>>(
    "jmda_student_extended",
    {},
  );
}

export function useEmployeeCredentials() {
  return useLocalStorage<EmployeeCredential[]>("jmda_employee_credentials", []);
}

export function useStudentCredentials() {
  return useLocalStorage<StudentCredential[]>("jmda_student_credentials", []);
}

export function useAdminProfile() {
  return useLocalStorage<AdminProfile>("jmda_admin_profile", {
    name: "",
    schoolName: "JMDA School",
    designation: "Administrator",
    email: "",
    phone: "",
    address: "",
    picture: "",
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns the employee's display ID: T001/T002 for teachers, EMP001/EMP002 for others */
export function getEmployeeDisplayId(
  employees: Employee[],
  emp: Employee,
): string {
  if (emp.teacherId) return emp.teacherId;
  const isTeacher = emp.role === "Teacher";
  const sameRoleGroup = employees.filter((e) =>
    isTeacher ? e.role === "Teacher" : e.role !== "Teacher",
  );
  const idx = sameRoleGroup.findIndex((e) => e.id === emp.id);
  const n = String(idx + 1).padStart(3, "0");
  return isTeacher ? `T${n}` : `EMP${n}`;
}

/** @deprecated Use getEmployeeDisplayId instead */
export function getEmployeeTeacherId(emp: Employee, index: number): string {
  return emp.teacherId || `T${String(index + 1).padStart(3, "0")}`;
}
