import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type TeacherId = bigint;
export interface Announcement {
    id: AnnouncementId;
    title: string;
    date: Time;
    message: string;
}
export interface ClassView {
    id: ClassId;
    name: string;
    studentIds: Array<StudentId>;
    gradeLevel: bigint;
    teacherId: TeacherId;
}
export type Time = bigint;
export interface SchoolStats {
    teacherCount: bigint;
    classCount: bigint;
    studentCount: bigint;
    announcementCount: bigint;
}
export type ClassId = bigint;
export type AnnouncementId = bigint;
export interface Teacher {
    id: TeacherId;
    name: string;
    department: string;
}
export type StudentId = bigint;
export interface UserProfile {
    name: string;
}
export interface Student {
    id: StudentId;
    guardianContact: string;
    name: string;
    gradeLevel: bigint;
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
    createStudent(name: string, gradeLevel: bigint, guardianContact: string): Promise<StudentId>;
    createTeacher(name: string, department: string): Promise<TeacherId>;
    deleteAnnouncement(id: AnnouncementId): Promise<void>;
    deleteClass(id: ClassId): Promise<void>;
    deleteStudent(id: StudentId): Promise<void>;
    deleteTeacher(id: TeacherId): Promise<void>;
    forceClaimAdmin(): Promise<boolean>;
    getAllAnnouncements(): Promise<Array<Announcement>>;
    getAllClasses(): Promise<Array<ClassView>>;
    getAllStudents(): Promise<Array<Student>>;
    getAllTeachers(): Promise<Array<Teacher>>;
    getAnnouncement(id: AnnouncementId): Promise<Announcement | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClass(id: ClassId): Promise<ClassView | null>;
    getSchoolStats(): Promise<SchoolStats>;
    getStudent(id: StudentId): Promise<Student | null>;
    getTeacher(id: TeacherId): Promise<Teacher | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    removeStudentFromClass(classId: ClassId, studentId: StudentId): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateClass(id: ClassId, name: string, gradeLevel: bigint, teacherId: TeacherId): Promise<void>;
    updateStudent(id: StudentId, name: string, gradeLevel: bigint, guardianContact: string): Promise<void>;
    updateTeacher(id: TeacherId, name: string, department: string): Promise<void>;
}
