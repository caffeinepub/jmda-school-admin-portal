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
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useClasses } from "../../hooks/useQueries";
import {
  type HomeworkItem,
  useHomework,
  useSubjects,
} from "../../hooks/useSchoolData";

export default function HomeworkPage() {
  const [homework, setHomework] = useHomework();
  const { data: classes = [] } = useClasses();
  const [subjects] = useSubjects();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    className: "",
    subject: "",
    title: "",
    description: "",
    dueDate: "",
  });

  const openAdd = () => {
    setEditId(null);
    setForm({
      className: "",
      subject: "",
      title: "",
      description: "",
      dueDate: "",
    });
    setDialogOpen(true);
  };
  const openEdit = (h: HomeworkItem) => {
    setEditId(h.id);
    setForm({
      className: h.className,
      subject: h.subject,
      title: h.title,
      description: h.description,
      dueDate: h.dueDate,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      toast.error("Title is required.");
      return;
    }
    if (editId) {
      setHomework((prev) =>
        prev.map((h) => (h.id === editId ? { ...h, ...form } : h)),
      );
      toast.success("Homework updated.");
    } else {
      setHomework((prev) => [...prev, { id: `hw_${Date.now()}`, ...form }]);
      toast.success("Homework added.");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setHomework((prev) => prev.filter((h) => h.id !== id));
    toast.success("Homework deleted.");
  };

  const isOverdue = (dueDate: string) =>
    dueDate && new Date(dueDate) < new Date();

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Homework</h1>
          <p className="text-sm text-muted-foreground">
            {homework.length} assignments
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="gap-2"
          data-ocid="homework.add_button"
        >
          <Plus className="w-4 h-4" /> Add Homework
        </Button>
      </div>

      {homework.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16"
          data-ocid="homework.empty_state"
        >
          <BookOpen className="w-12 h-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No homework assigned yet.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {homework.map((h, idx) => (
                <TableRow key={h.id} data-ocid={`homework.row.${idx + 1}`}>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {h.className || "-"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {h.subject || "-"}
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {h.title}
                  </TableCell>
                  <TableCell>
                    {h.dueDate ? (
                      <Badge
                        className={
                          isOverdue(h.dueDate)
                            ? "bg-rose-500/20 text-rose-400 border-rose-500/30 text-xs"
                            : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs"
                        }
                      >
                        {new Date(h.dueDate).toLocaleDateString("en-IN")}
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7"
                        onClick={() => openEdit(h)}
                        data-ocid={`homework.edit_button.${idx + 1}`}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-7 h-7 text-destructive hover:text-destructive"
                            data-ocid={`homework.delete_button.${idx + 1}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Homework?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Delete "{h.title}"?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel data-ocid="homework.cancel_button">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(h.id)}
                              className="bg-destructive"
                              data-ocid="homework.confirm_button"
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
        <DialogContent data-ocid="homework.dialog">
          <DialogHeader>
            <DialogTitle>
              {editId ? "Edit Homework" : "Add Homework"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Class</Label>
                <Select
                  value={form.className}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, className: v }))
                  }
                >
                  <SelectTrigger data-ocid="homework.select">
                    <SelectValue placeholder="Select class..." />
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
                  <SelectTrigger data-ocid="homework.select">
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
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                data-ocid="homework.input"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
                data-ocid="homework.textarea"
              />
            </div>
            <div>
              <Label>Due Date</Label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dueDate: e.target.value }))
                }
                data-ocid="homework.input"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                data-ocid="homework.cancel_button"
              >
                Cancel
              </Button>
              <Button onClick={handleSave} data-ocid="homework.save_button">
                {editId ? "Update" : "Add"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
