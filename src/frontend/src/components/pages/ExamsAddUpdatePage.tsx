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
import { Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useClasses } from "../../hooks/useQueries";
import {
  type ExamItem,
  useExams,
  useSubjects,
} from "../../hooks/useSchoolData";

export default function ExamsAddUpdatePage() {
  const [exams, setExams] = useExams();
  const { data: classes = [] } = useClasses();
  const [subjects] = useSubjects();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    type: "exam" as "exam" | "class_test",
    className: "",
    subject: "",
    date: "",
    maxMarks: 100,
  });

  const openAdd = () => {
    setEditId(null);
    setForm({
      name: "",
      type: "exam",
      className: "",
      subject: "",
      date: "",
      maxMarks: 100,
    });
    setDialogOpen(true);
  };

  const openEdit = (e: ExamItem) => {
    setEditId(e.id);
    setForm({
      name: e.name,
      type: e.type,
      className: e.className,
      subject: e.subject,
      date: e.date,
      maxMarks: e.maxMarks,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error("Exam name is required.");
      return;
    }
    if (editId) {
      setExams((prev) =>
        prev.map((e) => (e.id === editId ? { ...e, ...form } : e)),
      );
      toast.success("Exam updated.");
    } else {
      setExams((prev) => [
        ...prev,
        { id: `ex_${Date.now()}`, ...form, marks: {} },
      ]);
      toast.success("Exam added.");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
    toast.success("Exam deleted.");
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Add / Update Exam</h1>
          <p className="text-sm text-muted-foreground">
            {exams.length} exams total
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="gap-2"
          data-ocid="exams-add-update.primary_button"
        >
          <Plus className="w-4 h-4" /> Add Exam
        </Button>
      </div>

      {exams.length === 0 ? (
        <div
          className="py-12 text-center text-muted-foreground"
          data-ocid="exams-add-update.empty_state"
        >
          No exams yet. Create one to get started.
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Max Marks</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.map((e, idx) => (
                <TableRow
                  key={e.id}
                  data-ocid={`exams-add-update.row.${idx + 1}`}
                >
                  <TableCell className="text-muted-foreground text-xs">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="font-medium">{e.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={e.type === "exam" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {e.type === "exam" ? "Exam" : "Class Test"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {e.className || "-"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {e.subject || "-"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {e.date || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                      {e.maxMarks}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7"
                        onClick={() => openEdit(e)}
                        data-ocid={`exams-add-update.edit_button.${idx + 1}`}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-7 h-7 text-destructive hover:text-destructive"
                            data-ocid={`exams-add-update.delete_button.${idx + 1}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Exam?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Delete "{e.name}"? This will also remove all marks
                              data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel data-ocid="exams-add-update.cancel_button">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(e.id)}
                              className="bg-destructive"
                              data-ocid="exams-add-update.confirm_button"
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
        <DialogContent data-ocid="exams-add-update.dialog">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Exam" : "Add Exam"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Exam Name *</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                data-ocid="exams-add-update.input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      type: v as "exam" | "class_test",
                    }))
                  }
                >
                  <SelectTrigger data-ocid="exams-add-update.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="class_test">Class Test</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Max Marks</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.maxMarks}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      maxMarks: Number(e.target.value),
                    }))
                  }
                  data-ocid="exams-add-update.input"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Class</Label>
                <Select
                  value={form.className}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, className: v }))
                  }
                >
                  <SelectTrigger data-ocid="exams-add-update.select">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id.toString()} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Subject</Label>
                <Select
                  value={form.subject}
                  onValueChange={(v) => setForm((f) => ({ ...f, subject: v }))}
                >
                  <SelectTrigger data-ocid="exams-add-update.select">
                    <SelectValue placeholder="Subject..." />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.name}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
                data-ocid="exams-add-update.input"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                data-ocid="exams-add-update.cancel_button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                data-ocid="exams-add-update.save_button"
              >
                {editId ? "Update" : "Add"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
