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
  name: string;
  role: string;
  department: string;
  mobile: string;
  salary: number;
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
  return useLocalStorage<Employee[]>("jmda_employees", [
    {
      id: "e1",
      name: "Rajesh Kumar",
      role: "Principal",
      department: "Administration",
      mobile: "9876543210",
      salary: 45000,
    },
    {
      id: "e2",
      name: "Sunita Sharma",
      role: "Vice Principal",
      department: "Administration",
      mobile: "9876543211",
      salary: 38000,
    },
  ]);
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
  return useLocalStorage<HomeworkItem[]>("jmda_homework", [
    {
      id: "h1",
      className: "Class 5",
      subject: "Mathematics",
      title: "Chapter 4 Exercise - Fractions",
      description: "Complete exercises 4.1 to 4.5 from textbook",
      dueDate: "2026-03-10",
    },
    {
      id: "h2",
      className: "Class 3",
      subject: "English",
      title: "Write a paragraph about your school",
      description: "Write 10 sentences describing your school",
      dueDate: "2026-03-08",
    },
  ]);
}

export function useExams() {
  return useLocalStorage<ExamItem[]>("jmda_exams", [
    {
      id: "ex1",
      name: "Mid-Term Examination 2026",
      type: "exam",
      className: "Class 5",
      subject: "Mathematics",
      date: "2026-03-15",
      maxMarks: 100,
      marks: {},
    },
    {
      id: "ex2",
      name: "Unit Test 1",
      type: "class_test",
      className: "Class 3",
      subject: "English",
      date: "2026-03-12",
      maxMarks: 25,
      marks: {},
    },
  ]);
}

export function useStudentExtended() {
  return useLocalStorage<Record<string, StudentExtended>>(
    "jmda_student_extended",
    {},
  );
}
