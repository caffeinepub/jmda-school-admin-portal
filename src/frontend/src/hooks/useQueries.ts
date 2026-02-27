import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import type {
  Student,
  Teacher,
  ClassView,
  Announcement,
  SchoolStats,
} from "../backend.d";
import { UserRole } from "../backend.d";

// ── Query Keys ──────────────────────────────────────────────────────────────
export const QUERY_KEYS = {
  students: ["students"] as const,
  teachers: ["teachers"] as const,
  classes: ["classes"] as const,
  announcements: ["announcements"] as const,
  stats: ["stats"] as const,
  role: ["role"] as const,
  isAdmin: ["isAdmin"] as const,
};

// ── Read Queries ─────────────────────────────────────────────────────────────
export function useSchoolStats() {
  const { actor, isFetching } = useActor();
  return useQuery<SchoolStats>({
    queryKey: QUERY_KEYS.stats,
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getSchoolStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useStudents() {
  const { actor, isFetching } = useActor();
  return useQuery<Student[]>({
    queryKey: QUERY_KEYS.students,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStudents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTeachers() {
  const { actor, isFetching } = useActor();
  return useQuery<Teacher[]>({
    queryKey: QUERY_KEYS.teachers,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTeachers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useClasses() {
  const { actor, isFetching } = useActor();
  return useQuery<ClassView[]>({
    queryKey: QUERY_KEYS.classes,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllClasses();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAnnouncements() {
  const { actor, isFetching } = useActor();
  return useQuery<Announcement[]>({
    queryKey: QUERY_KEYS.announcements,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAnnouncements();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: QUERY_KEYS.isAdmin,
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCallerRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: QUERY_KEYS.role,
    queryFn: async () => {
      if (!actor) return UserRole.guest;
      try {
        return await actor.getCallerUserRole();
      } catch {
        return UserRole.guest;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Admin Claim Mutations ─────────────────────────────────────────────────────
export function useClaimAdmin() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.claimAdmin();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.isAdmin });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.role });
    },
  });
}

export function useForceClaimAdmin() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.forceClaimAdmin();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.isAdmin });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.role });
    },
  });
}

// ── Student Mutations ─────────────────────────────────────────────────────────
export function useCreateStudent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      gradeLevel: bigint;
      guardianContact: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createStudent(data.name, data.gradeLevel, data.guardianContact);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.students });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.stats });
    },
  });
}

export function useUpdateStudent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      name: string;
      gradeLevel: bigint;
      guardianContact: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateStudent(data.id, data.name, data.gradeLevel, data.guardianContact);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.students });
    },
  });
}

export function useDeleteStudent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteStudent(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.students });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.stats });
    },
  });
}

// ── Teacher Mutations ─────────────────────────────────────────────────────────
export function useCreateTeacher() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; department: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.createTeacher(data.name, data.department);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.teachers });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.stats });
    },
  });
}

export function useUpdateTeacher() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: bigint; name: string; department: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateTeacher(data.id, data.name, data.department);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.teachers });
    },
  });
}

export function useDeleteTeacher() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteTeacher(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.teachers });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.stats });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.classes });
    },
  });
}

// ── Class Mutations ───────────────────────────────────────────────────────────
export function useCreateClass() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      gradeLevel: bigint;
      teacherId: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createClass(data.name, data.gradeLevel, data.teacherId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.classes });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.stats });
    },
  });
}

export function useUpdateClass() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      name: string;
      gradeLevel: bigint;
      teacherId: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateClass(data.id, data.name, data.gradeLevel, data.teacherId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.classes });
    },
  });
}

export function useDeleteClass() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteClass(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.classes });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.stats });
    },
  });
}

export function useAddStudentToClass() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { classId: bigint; studentId: bigint }) => {
      if (!actor) throw new Error("No actor");
      return actor.addStudentToClass(data.classId, data.studentId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.classes });
    },
  });
}

export function useRemoveStudentFromClass() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { classId: bigint; studentId: bigint }) => {
      if (!actor) throw new Error("No actor");
      return actor.removeStudentFromClass(data.classId, data.studentId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.classes });
    },
  });
}

// ── Announcement Mutations ────────────────────────────────────────────────────
export function useCreateAnnouncement() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; message: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.createAnnouncement(data.title, data.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.announcements });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.stats });
    },
  });
}

export function useDeleteAnnouncement() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteAnnouncement(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.announcements });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.stats });
    },
  });
}
