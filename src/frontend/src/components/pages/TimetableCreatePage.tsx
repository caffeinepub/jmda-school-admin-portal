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
import { Edit, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useClasses } from "../../hooks/useQueries";
import {
  type TimetablePeriod,
  useSubjects,
  useTimetable,
} from "../../hooks/useSchoolData";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function TimetableCreatePage() {
  const { data: classes = [] } = useClasses();
  const [timetable, setTimetable] = useTimetable();
  const [subjects] = useSubjects();
  const [classId, setClassId] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    day: "Monday",
    periodNumber: 1,
    subject: "",
    teacher: "",
    time: "",
  });

  const periodsForClass = useMemo(() => {
    if (!classId) return [];
    return timetable.filter((p) => p.classId === classId);
  }, [timetable, classId]);

  const getCellPeriod = (day: string, period: number) => {
    return periodsForClass.find(
      (p) => p.day === day && p.periodNumber === period,
    );
  };

  const openAdd = (day: string, period: number) => {
    setEditId(null);
    setForm({ day, periodNumber: period, subject: "", teacher: "", time: "" });
    setDialogOpen(true);
  };

  const openEdit = (p: TimetablePeriod) => {
    setEditId(p.id);
    setForm({
      day: p.day,
      periodNumber: p.periodNumber,
      subject: p.subject,
      teacher: p.teacher,
      time: p.time,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.subject.trim()) {
      toast.error("Subject is required.");
      return;
    }
    if (!classId) {
      toast.error("Please select a class.");
      return;
    }
    if (editId) {
      setTimetable((prev) =>
        prev.map((p) => (p.id === editId ? { ...p, ...form } : p)),
      );
      toast.success("Period updated.");
    } else {
      const id = `tt_${Date.now()}`;
      setTimetable((prev) => [
        ...prev.filter(
          (p) =>
            !(
              p.classId === classId &&
              p.day === form.day &&
              p.periodNumber === form.periodNumber
            ),
        ),
        { id, classId, ...form },
      ]);
      toast.success("Period added.");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setTimetable((prev) => prev.filter((p) => p.id !== id));
    toast.success("Period removed.");
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-display font-bold">Create Timetable</h1>
        <p className="text-sm text-muted-foreground">
          Build weekly class schedules by assigning subjects to periods
        </p>
      </div>

      <div className="max-w-xs">
        <Label>Select Class</Label>
        <Select value={classId} onValueChange={setClassId}>
          <SelectTrigger data-ocid="timetable-create.select">
            <SelectValue placeholder="Select class..." />
          </SelectTrigger>
          <SelectContent>
            {classes.map((c) => (
              <SelectItem key={c.id.toString()} value={c.id.toString()}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {classId && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="border border-border p-2 bg-muted/30 text-left font-semibold text-xs">
                  Period
                </th>
                {DAYS.map((d) => (
                  <th
                    key={d}
                    className="border border-border p-2 bg-muted/30 text-center font-semibold text-xs min-w-[120px]"
                  >
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((period) => (
                <tr key={period}>
                  <td className="border border-border p-2 text-center text-xs font-bold text-muted-foreground bg-muted/10 w-16">
                    P{period}
                  </td>
                  {DAYS.map((day) => {
                    const cell = getCellPeriod(day, period);
                    return (
                      <td
                        key={day}
                        className="border border-border p-1 align-top"
                      >
                        {cell ? (
                          <div className="rounded bg-primary/10 border border-primary/20 p-1.5 group">
                            <p className="font-medium text-xs text-foreground">
                              {cell.subject}
                            </p>
                            {cell.teacher && (
                              <p className="text-[10px] text-muted-foreground">
                                {cell.teacher}
                              </p>
                            )}
                            {cell.time && (
                              <p className="text-[10px] text-muted-foreground">
                                {cell.time}
                              </p>
                            )}
                            <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => openEdit(cell)}
                                className="w-5 h-5 rounded flex items-center justify-center hover:bg-muted"
                                data-ocid="timetable-create.edit_button"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(cell.id)}
                                className="w-5 h-5 rounded flex items-center justify-center hover:bg-destructive/20 text-destructive"
                                data-ocid="timetable-create.delete_button"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openAdd(day, period)}
                            className="w-full h-12 flex items-center justify-center text-muted-foreground hover:bg-muted/30 rounded transition-colors"
                            data-ocid="timetable-create.button"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!classId && (
        <div
          className="py-16 text-center text-muted-foreground"
          data-ocid="timetable-create.empty_state"
        >
          Select a class to create or edit its timetable.
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-ocid="timetable-create.dialog">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Period" : "Add Period"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Day</Label>
                <Select
                  value={form.day}
                  onValueChange={(v) => setForm((f) => ({ ...f, day: v }))}
                >
                  <SelectTrigger data-ocid="timetable-create.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Period</Label>
                <Select
                  value={String(form.periodNumber)}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, periodNumber: Number(v) }))
                  }
                >
                  <SelectTrigger data-ocid="timetable-create.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIODS.map((p) => (
                      <SelectItem key={p} value={String(p)}>
                        Period {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Subject *</Label>
              <Select
                value={form.subject}
                onValueChange={(v) => setForm((f) => ({ ...f, subject: v }))}
              >
                <SelectTrigger data-ocid="timetable-create.select">
                  <SelectValue placeholder="Select subject..." />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.name}>
                      {s.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="Free Period">Free Period</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Teacher</Label>
              <Input
                value={form.teacher}
                onChange={(e) =>
                  setForm((f) => ({ ...f, teacher: e.target.value }))
                }
                placeholder="Teacher name"
                data-ocid="timetable-create.input"
              />
            </div>
            <div>
              <Label>Time</Label>
              <Input
                value={form.time}
                onChange={(e) =>
                  setForm((f) => ({ ...f, time: e.target.value }))
                }
                placeholder="e.g. 9:00 - 9:45"
                data-ocid="timetable-create.input"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                data-ocid="timetable-create.cancel_button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                data-ocid="timetable-create.save_button"
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
