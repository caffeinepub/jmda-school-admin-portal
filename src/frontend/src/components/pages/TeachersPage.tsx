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
import {
  Dialog,
  DialogContent,
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
import { Edit, Loader2, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Teacher } from "../../backend.d";
import {
  useCreateTeacher,
  useDeleteTeacher,
  useIsAdmin,
  useTeachers,
  useUpdateTeacher,
} from "../../hooks/useQueries";

export default function TeachersPage() {
  const { data: teachers = [], isLoading } = useTeachers();
  const { data: isAdmin } = useIsAdmin();
  const createTeacher = useCreateTeacher();
  const updateTeacher = useUpdateTeacher();
  const deleteTeacher = useDeleteTeacher();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<bigint | null>(null);
  const [form, setForm] = useState({ name: "", department: "" });

  const openAdd = () => {
    setEditId(null);
    setForm({ name: "", department: "" });
    setDialogOpen(true);
  };

  const openEdit = (t: Teacher) => {
    setEditId(t.id);
    setForm({ name: t.name, department: t.department });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required.");
      return;
    }
    try {
      if (editId !== null) {
        await updateTeacher.mutateAsync({
          id: editId,
          name: form.name,
          department: form.department,
        });
        toast.success("Teacher updated.");
      } else {
        await createTeacher.mutateAsync({
          name: form.name,
          department: form.department,
        });
        toast.success("Teacher added.");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save teacher.");
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteTeacher.mutateAsync(id);
      toast.success("Teacher deleted.");
    } catch {
      toast.error("Failed to delete teacher.");
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Teachers</h1>
          <p className="text-sm text-muted-foreground">
            {teachers.length} teachers
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={openAdd}
            className="gap-2"
            data-ocid="teachers.add_button"
          >
            <Plus className="w-4 h-4" /> Add Teacher
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : teachers.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16"
          data-ocid="teachers.empty_state"
        >
          <Users className="w-12 h-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No teachers added yet.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                {isAdmin && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((t, idx) => (
                <TableRow
                  key={t.id.toString()}
                  data-ocid={`teachers.row.${idx + 1}`}
                >
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {t.department || "-"}
                    </Badge>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7"
                          onClick={() => openEdit(t)}
                          data-ocid={`teachers.edit_button.${idx + 1}`}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-7 h-7 text-destructive hover:text-destructive"
                              data-ocid={`teachers.delete_button.${idx + 1}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Teacher?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Delete {t.name}?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel data-ocid="teachers.cancel_button">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(t.id)}
                                className="bg-destructive"
                                data-ocid="teachers.confirm_button"
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-ocid="teachers.dialog">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Teacher" : "Add Teacher"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                data-ocid="teachers.input"
              />
            </div>
            <div>
              <Label>Department</Label>
              <Input
                value={form.department}
                onChange={(e) =>
                  setForm((f) => ({ ...f, department: e.target.value }))
                }
                placeholder="Mathematics, Science..."
                data-ocid="teachers.input"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                data-ocid="teachers.cancel_button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={createTeacher.isPending || updateTeacher.isPending}
                data-ocid="teachers.save_button"
              >
                {(createTeacher.isPending || updateTeacher.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editId ? "Update" : "Add"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
