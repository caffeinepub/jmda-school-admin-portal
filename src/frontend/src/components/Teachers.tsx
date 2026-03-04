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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  GraduationCap,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Teacher } from "../backend.d";
import {
  useCreateTeacher,
  useDeleteTeacher,
  useIsAdmin,
  useTeachers,
  useUpdateTeacher,
} from "../hooks/useQueries";

interface TeacherFormData {
  name: string;
  department: string;
}

const emptyForm: TeacherFormData = { name: "", department: "" };

const DEPARTMENTS = [
  "Mathematics",
  "Science",
  "English Language Arts",
  "Social Studies",
  "Physical Education",
  "Arts & Music",
  "Technology",
  "Foreign Languages",
  "Special Education",
  "Administration",
];

const deptColors: Record<string, string> = {
  Mathematics: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Science: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "English Language Arts":
    "bg-purple-500/15 text-purple-400 border-purple-500/30",
  "Social Studies": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "Physical Education": "bg-orange-500/15 text-orange-400 border-orange-500/30",
  "Arts & Music": "bg-pink-500/15 text-pink-400 border-pink-500/30",
  Technology: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  "Foreign Languages": "bg-teal-500/15 text-teal-400 border-teal-500/30",
  "Special Education": "bg-rose-500/15 text-rose-400 border-rose-500/30",
  Administration: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

function getDeptColor(dept: string) {
  return deptColors[dept] ?? "bg-muted text-muted-foreground border-border";
}

function validateForm(data: TeacherFormData): string | null {
  if (!data.name.trim()) return "Name is required.";
  if (!data.department.trim()) return "Department is required.";
  return null;
}

export default function Teachers() {
  const { data: teachers, isLoading } = useTeachers();
  const { data: isAdmin } = useIsAdmin();
  const createTeacher = useCreateTeacher();
  const updateTeacher = useUpdateTeacher();
  const deleteTeacher = useDeleteTeacher();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Teacher | null>(null);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [form, setForm] = useState<TeacherFormData>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  const filtered = (teachers ?? []).filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.department.toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (t: Teacher) => {
    setEditing(t);
    setForm({ name: t.name, department: t.department });
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
      department: form.department.trim(),
    };

    try {
      if (editing) {
        await updateTeacher.mutateAsync({ id: editing.id, ...payload });
        toast.success("Teacher updated.");
      } else {
        await createTeacher.mutateAsync(payload);
        toast.success("Teacher added.");
      }
      setFormOpen(false);
    } catch {
      toast.error("Something went wrong.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTeacher.mutateAsync(deleteTarget.id);
      toast.success("Teacher deleted.");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete teacher.");
    }
  };

  const isPending = createTeacher.isPending || updateTeacher.isPending;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Teachers
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {teachers?.length ?? 0} faculty members
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={openAdd}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            <Plus className="w-4 h-4" />
            Add Teacher
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search teachers or departments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-card border-border"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-card animate-fade-in">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground font-semibold">
                Name
              </TableHead>
              <TableHead className="text-muted-foreground font-semibold">
                Department
              </TableHead>
              {isAdmin && (
                <TableHead className="text-muted-foreground font-semibold text-right">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              ["sk1", "sk2", "sk3", "sk4", "sk5"].map((sk) => (
                <TableRow key={sk} className="border-border">
                  <TableCell>
                    <Skeleton className="h-4 w-36" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-28 rounded-full" />
                  </TableCell>
                  {isAdmin && <TableCell />}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 3 : 2}
                  className="text-center py-16"
                >
                  <div className="flex flex-col items-center gap-2">
                    <GraduationCap className="w-10 h-10 text-muted-foreground opacity-40" />
                    <p className="text-muted-foreground text-sm">
                      {search
                        ? "No teachers match your search."
                        : "No teachers added yet."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((teacher) => (
                <TableRow
                  key={teacher.id.toString()}
                  className="border-border hover:bg-accent/20 transition-colors"
                >
                  <TableCell className="font-medium text-foreground">
                    {teacher.name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`text-xs font-semibold border ${getDeptColor(teacher.department)}`}
                    >
                      {teacher.department}
                    </Badge>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(teacher)}
                          className="w-8 h-8 hover:bg-primary/15 hover:text-primary"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(teacher)}
                          className="w-8 h-8 hover:bg-destructive/15 hover:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editing ? "Edit Teacher" : "Add Teacher"}
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
              <Label htmlFor="tname">Full Name</Label>
              <Input
                id="tname"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. Dr. Marcus Webb"
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tdept">Department</Label>
              <Input
                id="tdept"
                list="dept-list"
                value={form.department}
                onChange={(e) =>
                  setForm((p) => ({ ...p, department: e.target.value }))
                }
                placeholder="e.g. Mathematics"
                className="bg-background border-border"
              />
              <datalist id="dept-list">
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
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
              {editing ? "Update" : "Add Teacher"}
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
              Delete Teacher?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <strong className="text-foreground">{deleteTarget?.name}</strong>.
              This action cannot be undone.
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
              {deleteTeacher.isPending ? (
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
