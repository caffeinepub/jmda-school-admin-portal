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
  History,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { FeePayment, Student } from "../backend.d";
import {
  useCreateStudent,
  useDeleteStudent,
  useFeePaymentsByStudent,
  useIsAdmin,
  useStudents,
  useUpdateStudent,
} from "../hooks/useQueries";

interface StudentFormData {
  registrationNo: string;
  name: string;
  gradeLevel: string;
  guardianContact: string;
  guardianName: string;
  className: string;
}

const emptyForm: StudentFormData = {
  registrationNo: "",
  name: "",
  gradeLevel: "",
  guardianContact: "",
  guardianName: "",
  className: "",
};

function validateForm(data: StudentFormData): string | null {
  if (!data.registrationNo.trim()) return "Registration number is required.";
  if (!data.name.trim()) return "Student name is required.";
  if (
    !data.gradeLevel ||
    Number.isNaN(Number(data.gradeLevel)) ||
    Number(data.gradeLevel) < 1 ||
    Number(data.gradeLevel) > 12
  )
    return "Grade level must be between 1 and 12.";
  if (!data.guardianName.trim()) return "Guardian name is required.";
  if (!data.guardianContact.trim()) return "Guardian contact is required.";
  if (!data.className.trim()) return "Class name is required.";
  return null;
}

function FeeHistoryDialog({
  student,
  open,
  onClose,
}: {
  student: Student;
  open: boolean;
  onClose: () => void;
}) {
  const { data: payments, isLoading } = useFeePaymentsByStudent(
    open ? student.id : null,
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Fee History — {student.name}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Reg No: {student.registrationNo} · Class: {student.className}
          </p>
        </DialogHeader>
        <div className="overflow-auto flex-1">
          {isLoading ? (
            <div className="space-y-2 py-2">
              {["a", "b", "c"].map((k) => (
                <Skeleton key={k} className="h-12 w-full" />
              ))}
            </div>
          ) : !payments || payments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No fee payments recorded for this student.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground text-xs font-semibold">
                    Date
                  </TableHead>
                  <TableHead className="text-muted-foreground text-xs font-semibold">
                    Term
                  </TableHead>
                  <TableHead className="text-muted-foreground text-xs font-semibold text-right">
                    Total
                  </TableHead>
                  <TableHead className="text-muted-foreground text-xs font-semibold text-right">
                    Deposit
                  </TableHead>
                  <TableHead className="text-muted-foreground text-xs font-semibold text-right">
                    Balance
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...payments]
                  .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))
                  .map((p: FeePayment) => (
                    <TableRow
                      key={p.id.toString()}
                      className="border-border hover:bg-accent/20"
                    >
                      <TableCell className="text-sm text-foreground">
                        {p.date}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-primary/15 text-primary border-primary/30 text-xs font-medium">
                          {p.feesTerm}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm font-medium text-foreground">
                        {Number(p.total).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-emerald-400">
                        {Number(p.deposit).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        <span
                          className={
                            Number(p.dueableBalance) > 0
                              ? "text-destructive font-semibold"
                              : "text-muted-foreground"
                          }
                        >
                          {Number(p.dueableBalance).toLocaleString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Students() {
  const { data: students, isLoading } = useStudents();
  const { data: isAdmin } = useIsAdmin();
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState<StudentFormData>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [feeHistoryStudent, setFeeHistoryStudent] = useState<Student | null>(
    null,
  );

  const filtered = (students ?? []).filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.registrationNo.toLowerCase().includes(search.toLowerCase()) ||
      s.className.toLowerCase().includes(search.toLowerCase()) ||
      s.guardianName.toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (s: Student) => {
    setEditing(s);
    setForm({
      registrationNo: s.registrationNo,
      name: s.name,
      gradeLevel: s.gradeLevel.toString(),
      guardianContact: s.guardianContact,
      guardianName: s.guardianName,
      className: s.className,
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
      registrationNo: form.registrationNo.trim(),
      name: form.name.trim(),
      gradeLevel: BigInt(form.gradeLevel),
      guardianContact: form.guardianContact.trim(),
      guardianName: form.guardianName.trim(),
      className: form.className.trim(),
    };

    try {
      if (editing) {
        await updateStudent.mutateAsync({ id: editing.id, ...payload });
        toast.success("Student updated successfully.");
      } else {
        await createStudent.mutateAsync(payload);
        toast.success("Student added successfully.");
      }
      setFormOpen(false);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteStudent.mutateAsync(deleteTarget.id);
      toast.success("Student deleted.");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete student.");
    }
  };

  const isPending = createStudent.isPending || updateStudent.isPending;

  const gradeColor = (grade: bigint) => {
    const g = Number(grade);
    if (g <= 3)
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    if (g <= 6) return "bg-blue-500/15 text-blue-400 border-blue-500/30";
    if (g <= 9) return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    return "bg-purple-500/15 text-purple-400 border-purple-500/30";
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Students
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {students?.length ?? 0} enrolled students
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={openAdd}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, reg no, class..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-card border-border"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-card animate-fade-in">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground font-semibold text-xs">
                  Reg No
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold text-xs">
                  Name
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold text-xs hidden sm:table-cell">
                  Class
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold text-xs hidden md:table-cell">
                  Guardian
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold text-xs hidden lg:table-cell">
                  Grade
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold text-xs text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                ["sk1", "sk2", "sk3", "sk4", "sk5"].map((sk) => (
                  <TableRow key={sk} className="border-border">
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Skeleton className="h-5 w-14 rounded-full" />
                    </TableCell>
                    <TableCell />
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-10 h-10 text-muted-foreground opacity-40" />
                      <p className="text-muted-foreground text-sm">
                        {search
                          ? "No students match your search."
                          : "No students enrolled yet."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((student) => (
                  <TableRow
                    key={student.id.toString()}
                    className="border-border hover:bg-accent/20 transition-colors"
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {student.registrationNo}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {student.name}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                      {student.className}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {student.guardianName?.includes("TODO_MIGRATION")
                        ? "-"
                        : student.guardianName || "-"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge
                        className={`text-xs font-semibold border ${gradeColor(student.gradeLevel)}`}
                      >
                        Grade {student.gradeLevel.toString()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setFeeHistoryStudent(student)}
                          className="w-8 h-8 hover:bg-amber-500/15 hover:text-amber-400"
                          title="Fee History"
                        >
                          <History className="w-3.5 h-3.5" />
                        </Button>
                        {isAdmin && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(student)}
                              className="w-8 h-8 hover:bg-primary/15 hover:text-primary"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteTarget(student)}
                              className="w-8 h-8 hover:bg-destructive/15 hover:text-destructive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editing ? "Edit Student" : "Add Student"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {formError && (
              <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {formError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="sreg">Registration No *</Label>
                <Input
                  id="sreg"
                  value={form.registrationNo}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, registrationNo: e.target.value }))
                  }
                  placeholder="e.g. STU-2024-001"
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sgrade">Grade Level (1–12) *</Label>
                <Input
                  id="sgrade"
                  type="number"
                  min={1}
                  max={12}
                  value={form.gradeLevel}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, gradeLevel: e.target.value }))
                  }
                  placeholder="e.g. 9"
                  className="bg-background border-border"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sname">Student Name *</Label>
              <Input
                id="sname"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. Sarah Johnson"
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sclass">Class Name *</Label>
              <Input
                id="sclass"
                value={form.className}
                onChange={(e) =>
                  setForm((p) => ({ ...p, className: e.target.value }))
                }
                placeholder="e.g. 9-A or Grade 9 Blue"
                className="bg-background border-border"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="sguardianname">Guardian Name *</Label>
                <Input
                  id="sguardianname"
                  value={form.guardianName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, guardianName: e.target.value }))
                  }
                  placeholder="e.g. John Johnson"
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sguardian">Guardian Contact *</Label>
                <Input
                  id="sguardian"
                  value={form.guardianContact}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, guardianContact: e.target.value }))
                  }
                  placeholder="+1 555-0100"
                  className="bg-background border-border"
                />
              </div>
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
              {editing ? "Update" : "Add Student"}
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
              Delete Student?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <strong className="text-foreground">{deleteTarget?.name}</strong>{" "}
              from the system. This action cannot be undone.
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
              {deleteStudent.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Fee History Dialog */}
      {feeHistoryStudent && (
        <FeeHistoryDialog
          student={feeHistoryStudent}
          open={!!feeHistoryStudent}
          onClose={() => setFeeHistoryStudent(null)}
        />
      )}
    </div>
  );
}
