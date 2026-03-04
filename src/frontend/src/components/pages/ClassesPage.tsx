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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookOpen, Edit, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useClasses,
  useCreateClass,
  useDeleteClass,
  useIsAdmin,
  useStudents,
  useTeachers,
  useUpdateClass,
} from "../../hooks/useQueries";

export default function ClassesPage() {
  const { data: classes = [], isLoading } = useClasses();
  const { data: teachers = [] } = useTeachers();
  const { data: students = [] } = useStudents();
  const { data: isAdmin } = useIsAdmin();
  const createClass = useCreateClass();
  const updateClass = useUpdateClass();
  const deleteClass = useDeleteClass();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<bigint | null>(null);
  const [form, setForm] = useState({
    name: "",
    gradeLevel: "1",
    teacherId: "",
  });

  const openAdd = () => {
    setEditId(null);
    setForm({ name: "", gradeLevel: "1", teacherId: "" });
    setDialogOpen(true);
  };

  const openEdit = (cls: (typeof classes)[0]) => {
    setEditId(cls.id);
    setForm({
      name: cls.name,
      gradeLevel: cls.gradeLevel.toString(),
      teacherId: cls.teacherId.toString(),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Class name is required.");
      return;
    }
    try {
      const teacherId = BigInt(form.teacherId || "0");
      if (editId !== null) {
        await updateClass.mutateAsync({
          id: editId,
          name: form.name,
          gradeLevel: BigInt(form.gradeLevel),
          teacherId,
        });
        toast.success("Class updated.");
      } else {
        await createClass.mutateAsync({
          name: form.name,
          gradeLevel: BigInt(form.gradeLevel),
          teacherId,
        });
        toast.success("Class created.");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save class.");
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteClass.mutateAsync(id);
      toast.success("Class deleted.");
    } catch {
      toast.error("Failed to delete class.");
    }
  };

  const getTeacherName = (id: bigint) =>
    teachers.find((t) => t.id === id)?.name ?? "-";
  const getStudentCount = (cls: (typeof classes)[0]) => {
    return students.filter((s) => s.className === cls.name).length;
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Classes</h1>
          <p className="text-sm text-muted-foreground">
            {classes.length} classes
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={openAdd}
            className="gap-2"
            data-ocid="classes.add_button"
          >
            <Plus className="w-4 h-4" /> Add Class
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-12 bg-muted/30 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : classes.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16"
          data-ocid="classes.empty_state"
        >
          <BookOpen className="w-12 h-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No classes created yet.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Name</TableHead>
                <TableHead>Grade Level</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Students</TableHead>
                {isAdmin && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((cls, idx) => (
                <TableRow
                  key={cls.id.toString()}
                  data-ocid={`classes.row.${idx + 1}`}
                >
                  <TableCell className="font-medium">{cls.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      Grade {cls.gradeLevel.toString()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {getTeacherName(cls.teacherId)}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-primary/20 text-primary border-primary/30">
                      {getStudentCount(cls)}
                    </Badge>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7"
                          onClick={() => openEdit(cls)}
                          data-ocid={`classes.edit_button.${idx + 1}`}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-7 h-7 text-destructive hover:text-destructive"
                              data-ocid={`classes.delete_button.${idx + 1}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Class?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Delete {cls.name}? Students will not be deleted.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel data-ocid="classes.cancel_button">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(cls.id)}
                                className="bg-destructive"
                                data-ocid="classes.confirm_button"
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
        <DialogContent data-ocid="classes.dialog">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Class" : "Add Class"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Class Name *</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Class 5A"
                data-ocid="classes.input"
              />
            </div>
            <div>
              <Label>Grade Level</Label>
              <Input
                type="number"
                min={1}
                max={12}
                value={form.gradeLevel}
                onChange={(e) =>
                  setForm((f) => ({ ...f, gradeLevel: e.target.value }))
                }
                data-ocid="classes.input"
              />
            </div>
            <div>
              <Label>Assign Teacher</Label>
              <Select
                value={form.teacherId}
                onValueChange={(v) => setForm((f) => ({ ...f, teacherId: v }))}
              >
                <SelectTrigger data-ocid="classes.select">
                  <SelectValue placeholder="Select teacher..." />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t.id.toString()} value={t.id.toString()}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                data-ocid="classes.cancel_button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={createClass.isPending || updateClass.isPending}
                data-ocid="classes.save_button"
              >
                {(createClass.isPending || updateClass.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editId ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
