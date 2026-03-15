import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export type FeePaymentId = bigint;
export interface SchoolStats {
    teacherCount: bigint;
    totalFeeCollected: bigint;
    classCount: bigint;
    studentCount: bigint;
    announcementCount: bigint;
}
export interface FeePayment {
    id: FeePaymentId;
    feesTerm: string;
    total: bigint;
    studentId: StudentId;
    admissionFee: bigint;
    date: string;
    fine: bigint;
    createdAt: Time;
    transport: bigint;
    deposit: bigint;
    others: bigint;
    discountInFee: bigint;
    uniform: bigint;
    books: bigint;
    termlyFee: bigint;
    dueableBalance: bigint;
    artMaterial: bigint;
    registrationFee: bigint;
    previousBalance: bigint;
}
export interface Teacher {
    id: TeacherId;
    name: string;
    department: string;
}
export type TeacherId = bigint;
export type StudentId = bigint;
export interface ClassView {
    id: ClassId;
    name: string;
    studentIds: Array<StudentId>;
    gradeLevel: bigint;
    teacherId: TeacherId;
}
export interface Announcement {
    id: AnnouncementId;
    title: string;
    date: Time;
    message: string;
}
export type AnnouncementId = bigint;
export type ClassId = bigint;
export interface UserProfile {
    name: string;
}
export interface Student {
    id: StudentId;
    guardianContact: string;
    name: string;
    gradeLevel: bigint;
    registrationNo: string;
    className: string;
    guardianName: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addStudentToClass(classId: ClassId, studentId: StudentId): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    claimAdmin(): Promise<boolean>;
    createAnnouncement(title: string, message: string): Promise<AnnouncementId>;
    createClass(name: string, gradeLevel: bigint, teacherId: TeacherId): Promise<ClassId>;
    createFeePayment(studentId: StudentId, feesTerm: string, date: string, termlyFee: bigint, admissionFee: bigint, registrationFee: bigint, artMaterial: bigint, transport: bigint, books: bigint, uniform: bigint, fine: bigint, others: bigint, previousBalance: bigint, discountInFee: bigint, deposit: bigint): Promise<FeePaymentId>;
    createStudent(registrationNo: string, name: string, gradeLevel: bigint, guardianContact: string, guardianName: string, className: string): Promise<StudentId>;
    createTeacher(name: string, department: string): Promise<TeacherId>;
    deleteAnnouncement(id: AnnouncementId): Promise<void>;
    deleteClass(id: ClassId): Promise<void>;
    deleteFeePayment(id: FeePaymentId): Promise<void>;
    deleteStudent(id: StudentId): Promise<void>;
    deleteTeacher(id: TeacherId): Promise<void>;
    forceClaimAdmin(): Promise<boolean>;
    getAllAnnouncements(): Promise<Array<Announcement>>;
    getAllClasses(): Promise<Array<ClassView>>;
    getAllFeePayments(): Promise<Array<FeePayment>>;
    getAllStudents(): Promise<Array<Student>>;
    getAllTeachers(): Promise<Array<Teacher>>;
    getAnnouncement(id: AnnouncementId): Promise<Announcement | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClass(id: ClassId): Promise<ClassView | null>;
    getFeePaymentsByStudent(studentId: StudentId): Promise<Array<FeePayment>>;
    getMyClass(): Promise<ClassView | null>;
    getMyStudents(): Promise<Array<Student>>;
    getMyTeacherId(): Promise<TeacherId | null>;
    getSchoolStats(): Promise<SchoolStats>;
    getStudent(id: StudentId): Promise<Student | null>;
    getTeacher(id: TeacherId): Promise<Teacher | null>;
    getTeacherByPrincipal(principal: Principal): Promise<Teacher | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    linkTeacherLogin(principal: Principal, teacherId: bigint): Promise<void>;
    removeStudentFromClass(classId: ClassId, studentId: StudentId): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateClass(id: ClassId, name: string, gradeLevel: bigint, teacherId: TeacherId): Promise<void>;
    updateStudent(id: StudentId, registrationNo: string, name: string, gradeLevel: bigint, guardianContact: string, guardianName: string, className: string): Promise<void>;
    updateTeacher(id: TeacherId, name: string, department: string): Promise<void>;
}
