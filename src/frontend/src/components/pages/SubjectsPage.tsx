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
import { BookOpen, Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useClasses } from "../../hooks/useQueries";
import { type Subject, useSubjects } from "../../hooks/useSchoolData";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useSubjects();
  const { data: classes = [] } = useClasses();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", code: "", className: "All" });

  const openAdd = () => {
    setEditId(null);
    setForm({ name: "", code: "", className: "All" });
    setDialogOpen(true);
  };
  const openEdit = (s: Subject) => {
    setEditId(s.id);
    setForm({ name: s.name, code: s.code, className: s.className });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error("Subject name is required.");
      return;
    }
    if (editId) {
      setSubjects((prev) =>
        prev.map((s) => (s.id === editId ? { ...s, ...form } : s)),
      );
      toast.success("Subject updated.");
    } else {
      setSubjects((prev) => [...prev, { id: `sub_${Date.now()}`, ...form }]);
      toast.success("Subject added.");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    toast.success("Subject deleted.");
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Subjects</h1>
          <p className="text-sm text-muted-foreground">
            {subjects.length} subjects
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="gap-2"
          data-ocid="subjects.add_button"
        >
          <Plus className="w-4 h-4" /> Add Subject
        </Button>
      </div>

      {subjects.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16"
          data-ocid="subjects.empty_state"
        >
          <BookOpen className="w-12 h-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No subjects added yet.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Class</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map((s, idx) => (
                <TableRow key={s.id} data-ocid={`subjects.row.${idx + 1}`}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="font-mono text-xs">{s.code}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {s.className}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7"
                        onClick={() => openEdit(s)}
                        data-ocid={`subjects.edit_button.${idx + 1}`}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-7 h-7 text-destructive hover:text-destructive"
                            data-ocid={`subjects.delete_button.${idx + 1}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Subject?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Delete {s.name}?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel data-ocid="subjects.cancel_button">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(s.id)}
                              className="bg-destructive"
                              data-ocid="subjects.confirm_button"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-ocid="subjects.dialog">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Subject" : "Add Subject"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Subject Name *</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                data-ocid="subjects.input"
              />
            </div>
            <div>
              <Label>Subject Code</Label>
              <Input
                value={form.code}
                onChange={(e) =>
                  setForm((f) => ({ ...f, code: e.target.value }))
                }
                data-ocid="subjects.input"
              />
            </div>
            <div>
              <Label>Class</Label>
              <Select
                value={form.className}
                onValueChange={(v) => setForm((f) => ({ ...f, className: v }))}
              >
                <SelectTrigger data-ocid="subjects.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Classes</SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c.id.toString()} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                data-ocid="subjects.cancel_button"
              >
                Cancel
              </Button>
              <Button onClick={handleSave} data-ocid="subjects.save_button">
                {editId ? "Update" : "Add"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
