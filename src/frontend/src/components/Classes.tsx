import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { ClassView } from "../backend.d";
import {
  useAddStudentToClass,
  useClasses,
  useCreateClass,
  useDeleteClass,
  useIsAdmin,
  useRemoveStudentFromClass,
  useStudents,
  useTeachers,
  useUpdateClass,
} from "../hooks/useQueries";

interface ClassFormData {
  name: string;
  gradeLevel: string;
  teacherId: string;
}

const emptyForm: ClassFormData = { name: "", gradeLevel: "", teacherId: "" };

function validateForm(data: ClassFormData): string | null {
  if (!data.name.trim()) return "Class name is required.";
  if (
    !data.gradeLevel ||
    Number.isNaN(Number(data.gradeLevel)) ||
    Number(data.gradeLevel) < 1 ||
    Number(data.gradeLevel) > 12
  )
    return "Grade level must be between 1 and 12.";
  if (!data.teacherId) return "Please select a teacher.";
  return null;
}

function ClassDetail({
  cls,
  onBack,
  isAdmin,
}: {
  cls: ClassView;
  onBack: () => void;
  isAdmin: boolean;
}) {
  const { data: students } = useStudents();
  const { data: teachers } = useTeachers();
  const addStudent = useAddStudentToClass();
  const removeStudent = useRemoveStudentFromClass();
  const [addStudentId, setAddStudentId] = useState("");

  const teacher = teachers?.find((t) => t.id === cls.teacherId);
  const enrolledStudents = (students ?? []).filter((s) =>
    cls.studentIds.some((id) => id === s.id),
  );
  const availableStudents = (students ?? []).filter(
    (s) => !cls.studentIds.some((id) => id === s.id),
  );

  const handleAdd = async () => {
    if (!addStudentId) return;
    try {
      await addStudent.mutateAsync({
        classId: cls.id,
        studentId: BigInt(addStudentId),
      });
      toast.success("Student added to class.");
      setAddStudentId("");
    } catch {
      toast.error("Failed to add student.");
    }
  };

  const handleRemove = async (studentId: bigint) => {
    try {
      await removeStudent.mutateAsync({ classId: cls.id, studentId });
      toast.success("Student removed from class.");
    } catch {
      toast.error("Failed to remove student.");
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto animate-fade-in">
      <Button
        variant="ghost"
        onClick={onBack}
        className="gap-2 text-muted-foreground hover:text-foreground mb-6 -ml-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Classes
      </Button>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="font-display text-3xl font-bold text-foreground">
            {cls.name}
          </h1>
          <Badge className="bg-primary/20 text-primary border-primary/30 font-semibold">
            Grade {cls.gradeLevel.toString()}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          Teacher:{" "}
          <span className="text-foreground font-medium">
            {teacher?.name ?? "Unassigned"}
          </span>
          {teacher && (
            <span className="text-muted-foreground">
              {" "}
              · {teacher.department}
            </span>
          )}
        </p>
      </div>

      {/* Enrolled Students */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-card mb-4">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-semibold text-foreground text-sm">
              Enrolled Students
            </h2>
          </div>
          <Badge className="bg-muted text-muted-foreground border-border font-mono text-xs">
            {enrolledStudents.length}
          </Badge>
        </div>

        {enrolledStudents.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground text-sm">
              No students enrolled yet.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {enrolledStudents.map((student) => (
              <li
                key={student.id.toString()}
                className="flex items-center justify-between px-4 py-3 hover:bg-accent/20 transition-colors"
              >
                <div>
                  <p className="font-medium text-foreground text-sm">
                    {student.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Grade {student.gradeLevel.toString()} ·{" "}
                    {student.guardianContact}
                  </p>
                </div>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 hover:bg-destructive/15 hover:text-destructive shrink-0"
                    onClick={() => handleRemove(student.id)}
                    disabled={removeStudent.isPending}
                  >
                    <UserMinus className="w-3.5 h-3.5" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add student */}
      {isAdmin && availableStudents.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 shadow-card">
          <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-primary" />
            Add Student to Class
          </h3>
          <div className="flex gap-3">
            <Select value={addStudentId} onValueChange={setAddStudentId}>
              <SelectTrigger className="flex-1 bg-background border-border">
                <SelectValue placeholder="Select a student..." />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {availableStudents.map((s) => (
                  <SelectItem key={s.id.toString()} value={s.id.toString()}>
                    {s.name} (Grade {s.gradeLevel.toString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleAdd}
              disabled={!addStudentId || addStudent.isPending}
              className="bg-primary text-primary-foreground"
            >
              {addStudent.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Add"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Classes() {
  const { data: classes, isLoading } = useClasses();
  const { data: teachers } = useTeachers();
  const { data: isAdmin } = useIsAdmin();
  const createClass = useCreateClass();
  const updateClass = useUpdateClass();
  const deleteClass = useDeleteClass();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ClassView | null>(null);
  const [editing, setEditing] = useState<ClassView | null>(null);
  const [form, setForm] = useState<ClassFormData>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassView | null>(null);

  const filtered = (classes ?? []).filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const getTeacherName = (id: bigint) =>
    teachers?.find((t) => t.id === id)?.name ?? "Unassigned";

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (c: ClassView) => {
    setEditing(c);
    setForm({
      name: c.name,
      gradeLevel: c.gradeLevel.toString(),
      teacherId: c.teacherId.toString(),
    });
    setFormError(null);
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    const err = validateForm(form);
    if (err) {
      setFormError(err);
      return;
    }
    const payload = {
      name: form.name.trim(),
      gradeLevel: BigInt(form.gradeLevel),
      teacherId: BigInt(form.teacherId),
    };

    try {
      if (editing) {
        await updateClass.mutateAsync({ id: editing.id, ...payload });
        toast.success("Class updated.");
      } else {
        await createClass.mutateAsync(payload);
        toast.success("Class created.");
      }
      setFormOpen(false);
    } catch {
      toast.error("Something went wrong.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteClass.mutateAsync(deleteTarget.id);
      toast.success("Class deleted.");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete class.");
    }
  };

  const isPending = createClass.isPending || updateClass.isPending;

  // Show class detail
  if (selectedClass) {
    const live =
      classes?.find((c) => c.id === selectedClass.id) ?? selectedClass;
    return (
      <ClassDetail
        key={live.id.toString()}
        cls={live}
        onBack={() => setSelectedClass(null)}
        isAdmin={!!isAdmin}
      />
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Classes
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {classes?.length ?? 0} active classes
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={openAdd}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            <Plus className="w-4 h-4" />
            New Class
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search classes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-card border-border"
        />
      </div>

      {/* Class cards grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"].map((sk) => (
            <div
              key={sk}
              className="rounded-xl p-4 bg-card border border-border shadow-card"
            >
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl p-16 bg-card border border-border text-center shadow-card animate-fade-in">
          <BookOpen className="w-12 h-12 text-muted-foreground opacity-40 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            {search
              ? "No classes match your search."
              : "No classes created yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {filtered.map((cls) => (
            <button
              key={cls.id.toString()}
              type="button"
              className="group rounded-xl p-4 bg-card border border-border hover:border-primary/40 transition-all cursor-pointer shadow-card hover:shadow-glow-sm text-left w-full"
              onClick={() => setSelectedClass(cls)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors truncate">
                    {cls.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-primary/15 text-primary border-primary/30 text-xs font-semibold">
                      Grade {cls.gradeLevel.toString()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {cls.studentIds.length} student
                      {cls.studentIds.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 hover:bg-primary/15 hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(cls);
                      }}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 hover:bg-destructive/15 hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(cls);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground/70">Teacher:</span>{" "}
                {getTeacherName(cls.teacherId)}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editing ? "Edit Class" : "Create Class"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {formError && (
              <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {formError}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="cname">Class Name</Label>
              <Input
                id="cname"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. Algebra II"
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cgrade">Grade Level (1–12)</Label>
              <Input
                id="cgrade"
                type="number"
                min={1}
                max={12}
                value={form.gradeLevel}
                onChange={(e) =>
                  setForm((p) => ({ ...p, gradeLevel: e.target.value }))
                }
                placeholder="e.g. 10"
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Teacher</Label>
              <Select
                value={form.teacherId}
                onValueChange={(v) => setForm((p) => ({ ...p, teacherId: v }))}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select a teacher..." />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {(teachers ?? []).map((t) => (
                    <SelectItem key={t.id.toString()} value={t.id.toString()}>
                      {t.name} — {t.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setFormOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              className="bg-primary text-primary-foreground"
            >
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editing ? "Update" : "Create Class"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete Class?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <strong className="text-foreground">{deleteTarget?.name}</strong>.
              Students will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {deleteClass.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
