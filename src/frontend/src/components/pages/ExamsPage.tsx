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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, FileText, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useClasses, useStudents } from "../../hooks/useQueries";
import {
  type ExamItem,
  useExams,
  useSubjects,
} from "../../hooks/useSchoolData";

export default function ExamsPage() {
  const [exams, setExams] = useExams();
  const { data: classes = [] } = useClasses();
  const { data: students = [] } = useStudents();
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
  const [marksExamId, setMarksExamId] = useState<string | null>(null);
  const [marksInput, setMarksInput] = useState<Record<string, number>>({});

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

  const openMarkEntry = (exam: ExamItem) => {
    setMarksExamId(exam.id);
    setMarksInput({ ...exam.marks });
  };

  const saveMarks = () => {
    setExams((prev) =>
      prev.map((e) => (e.id === marksExamId ? { ...e, marks: marksInput } : e)),
    );
    toast.success("Marks saved!");
    setMarksExamId(null);
  };

  const selectedExam = exams.find((e) => e.id === marksExamId);
  const studentsForExam = useMemo(() => {
    if (!selectedExam) return [];
    return students.filter((s) => s.className === selectedExam.className);
  }, [students, selectedExam]);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">
            Exams & Class Tests
          </h1>
          <p className="text-sm text-muted-foreground">{exams.length} exams</p>
        </div>
        <Button
          onClick={openAdd}
          className="gap-2"
          data-ocid="exams.add_button"
        >
          <Plus className="w-4 h-4" /> Add Exam
        </Button>
      </div>

      {marksExamId && selectedExam ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMarksExamId(null)}
            >
              ← Back
            </Button>
            <div>
              <h2 className="font-semibold">
                {selectedExam.name} - Mark Entry
              </h2>
              <p className="text-xs text-muted-foreground">
                Max Marks: {selectedExam.maxMarks}
              </p>
            </div>
          </div>
          {studentsForExam.length === 0 ? (
            <div
              className="py-8 text-center text-muted-foreground"
              data-ocid="exams.empty_state"
            >
              No students in {selectedExam.className}.
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Reg No</TableHead>
                    <TableHead>Marks (/{selectedExam.maxMarks})</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentsForExam.map((s, idx) => (
                    <TableRow
                      key={s.id.toString()}
                      data-ocid={`exams.row.${idx + 1}`}
                    >
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {s.registrationNo || "-"}
                      </TableCell>
                      <TableCell className="w-32">
                        <Input
                          type="number"
                          min={0}
                          max={selectedExam.maxMarks}
                          value={marksInput[s.id.toString()] ?? ""}
                          onChange={(e) =>
                            setMarksInput((prev) => ({
                              ...prev,
                              [s.id.toString()]: Number(e.target.value),
                            }))
                          }
                          className="h-8 text-sm"
                          data-ocid={`exams.input.${idx + 1}`}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={saveMarks} data-ocid="exams.save_button">
              Save Marks
            </Button>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="exams">
          <TabsList>
            <TabsTrigger value="exams" data-ocid="exams.tab">
              Exams
            </TabsTrigger>
            <TabsTrigger value="class_tests" data-ocid="exams.tab">
              Class Tests
            </TabsTrigger>
          </TabsList>

          {(["exams", "class_tests"] as const).map((tabType) => {
            const filtered = exams.filter(
              (e) => e.type === (tabType === "exams" ? "exam" : "class_test"),
            );
            return (
              <TabsContent key={tabType} value={tabType} className="mt-4">
                {filtered.length === 0 ? (
                  <div
                    className="py-12 text-center text-muted-foreground"
                    data-ocid="exams.empty_state"
                  >
                    No {tabType === "exams" ? "exams" : "class tests"} yet.
                  </div>
                ) : (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Max Marks</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.map((e, idx) => (
                          <TableRow
                            key={e.id}
                            data-ocid={`exams.row.${idx + 1}`}
                          >
                            <TableCell className="font-medium">
                              {e.name}
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
                                  onClick={() => openMarkEntry(e)}
                                  title="Enter Marks"
                                  data-ocid={`exams.button.${idx + 1}`}
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-7 h-7"
                                  onClick={() => openEdit(e)}
                                  data-ocid={`exams.edit_button.${idx + 1}`}
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="w-7 h-7 text-destructive hover:text-destructive"
                                      data-ocid={`exams.delete_button.${idx + 1}`}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Delete Exam?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Delete "{e.name}"?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel data-ocid="exams.cancel_button">
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(e.id)}
                                        className="bg-destructive"
                                        data-ocid="exams.confirm_button"
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
              </TabsContent>
            );
          })}
        </Tabs>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-ocid="exams.dialog">
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
                data-ocid="exams.input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, type: v as "exam" | "class_test" }))
                  }
                >
                  <SelectTrigger data-ocid="exams.select">
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
                    setForm((f) => ({ ...f, maxMarks: Number(e.target.value) }))
                  }
                  data-ocid="exams.input"
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
                  <SelectTrigger data-ocid="exams.select">
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
                  <SelectTrigger data-ocid="exams.select">
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
                data-ocid="exams.input"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                data-ocid="exams.cancel_button"
              >
                Cancel
              </Button>
              <Button onClick={handleSave} data-ocid="exams.save_button">
                {editId ? "Update" : "Add"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
