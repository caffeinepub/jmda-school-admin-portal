import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Plus, Search, Trash2, UserX } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Page } from "../../App";
import {
  useDeleteStudent,
  useIsAdmin,
  useStudents,
} from "../../hooks/useQueries";

interface StudentsPageProps {
  onNavigate: (page: Page, params?: Record<string, string>) => void;
}

export default function StudentsPage({ onNavigate }: StudentsPageProps) {
  const { data: students, isLoading } = useStudents();
  const { data: isAdmin } = useIsAdmin();
  const deleteStudent = useDeleteStudent();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (students ?? []).filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.className.toLowerCase().includes(q) ||
        s.registrationNo.toLowerCase().includes(q),
    );
  }, [students, search]);

  const handleDelete = async (id: bigint) => {
    try {
      await deleteStudent.mutateAsync(id);
      toast.success("Student deleted.");
    } catch {
      toast.error("Failed to delete student.");
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            All Students
          </h1>
          <p className="text-sm text-muted-foreground">
            {students?.length ?? 0} students enrolled
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => onNavigate("add-student")}
            className="gap-2"
            data-ocid="students.add_button"
          >
            <Plus className="w-4 h-4" />
            Add New Student
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, class, reg no..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-ocid="students.search_input"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 text-center"
          data-ocid="students.empty_state"
        >
          <UserX className="w-12 h-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            {search
              ? "No students match your search."
              : "No students enrolled yet."}
          </p>
          {isAdmin && !search && (
            <Button className="mt-4" onClick={() => onNavigate("add-student")}>
              Add First Student
            </Button>
          )}
        </div>
      ) : (
        <div
          className="rounded-lg border border-border overflow-hidden"
          data-ocid="students.table"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reg No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Guardian</TableHead>
                <TableHead>Mobile</TableHead>
                {isAdmin && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((student, idx) => (
                <TableRow
                  key={student.id.toString()}
                  data-ocid={`students.row.${idx + 1}`}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {student.registrationNo?.includes("TODO_MIGRATION")
                      ? "-"
                      : student.registrationNo || "-"}
                  </TableCell>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {student.className}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {student.guardianName?.includes("TODO_MIGRATION")
                      ? "-"
                      : student.guardianName || "-"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground font-mono">
                    {student.guardianContact?.includes("TODO_MIGRATION")
                      ? "-"
                      : student.guardianContact || "-"}
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 text-muted-foreground hover:text-foreground"
                          onClick={() =>
                            onNavigate("edit-student", {
                              id: student.id.toString(),
                            })
                          }
                          data-ocid={`students.edit_button.${idx + 1}`}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-7 h-7 text-destructive hover:text-destructive"
                              data-ocid={`students.delete_button.${idx + 1}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Student?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete {student.name}.
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel data-ocid="students.cancel_button">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(student.id)}
                                className="bg-destructive hover:bg-destructive/90"
                                data-ocid="students.confirm_button"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
