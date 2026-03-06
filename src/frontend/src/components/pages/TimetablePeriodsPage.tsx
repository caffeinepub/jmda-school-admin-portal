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
import { useLocalStorage } from "../../hooks/useLocalStorage";

interface TimePeriod {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

const DEFAULT_PERIODS: TimePeriod[] = [
  { id: "p1", name: "Period 1", startTime: "09:00", endTime: "09:45" },
  { id: "p2", name: "Period 2", startTime: "09:45", endTime: "10:30" },
  { id: "p3", name: "Period 3", startTime: "10:45", endTime: "11:30" },
  { id: "p4", name: "Period 4", startTime: "11:30", endTime: "12:15" },
  { id: "p5", name: "Lunch Break", startTime: "12:15", endTime: "13:00" },
  { id: "p6", name: "Period 5", startTime: "13:00", endTime: "13:45" },
  { id: "p7", name: "Period 6", startTime: "13:45", endTime: "14:30" },
  { id: "p8", name: "Period 7", startTime: "14:30", endTime: "15:15" },
];

export default function TimetablePeriodsPage() {
  const [periods, setPeriods] = useLocalStorage<TimePeriod[]>(
    "jmda_time_periods",
    DEFAULT_PERIODS,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", startTime: "", endTime: "" });

  const openAdd = () => {
    setEditId(null);
    setForm({ name: "", startTime: "", endTime: "" });
    setDialogOpen(true);
  };

  const openEdit = (p: TimePeriod) => {
    setEditId(p.id);
    setForm({ name: p.name, startTime: p.startTime, endTime: p.endTime });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error("Period name is required.");
      return;
    }
    if (!form.startTime || !form.endTime) {
      toast.error("Start and end time are required.");
      return;
    }
    if (editId) {
      setPeriods((prev) =>
        prev.map((p) => (p.id === editId ? { ...p, ...form } : p)),
      );
      toast.success("Period updated.");
    } else {
      setPeriods((prev) => [...prev, { id: `tp_${Date.now()}`, ...form }]);
      toast.success("Period added.");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setPeriods((prev) => prev.filter((p) => p.id !== id));
    toast.success("Period deleted.");
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Time Periods</h1>
          <p className="text-sm text-muted-foreground">
            Manage class periods and their time slots
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="gap-2"
          data-ocid="timetable-periods.primary_button"
        >
          <Plus className="w-4 h-4" /> Add Period
        </Button>
      </div>

      {periods.length === 0 ? (
        <div
          className="py-12 text-center text-muted-foreground"
          data-ocid="timetable-periods.empty_state"
        >
          No periods configured. Add your first period.
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden max-w-2xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Period Name</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {periods.map((period, idx) => {
                const [sh, sm] = period.startTime.split(":").map(Number);
                const [eh, em] = period.endTime.split(":").map(Number);
                const durationMins = eh * 60 + em - (sh * 60 + sm);
                return (
                  <TableRow
                    key={period.id}
                    data-ocid={`timetable-periods.row.${idx + 1}`}
                  >
                    <TableCell className="text-muted-foreground text-xs">
                      {idx + 1}
                    </TableCell>
                    <TableCell className="font-medium">{period.name}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {period.startTime}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {period.endTime}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {durationMins > 0 ? `${durationMins} min` : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7"
                          onClick={() => openEdit(period)}
                          data-ocid={`timetable-periods.edit_button.${idx + 1}`}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(period.id)}
                          data-ocid={`timetable-periods.delete_button.${idx + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-ocid="timetable-periods.dialog">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Period" : "Add Period"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Period Name *</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Period 1, Lunch Break"
                data-ocid="timetable-periods.input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Time *</Label>
                <Input
                  type="time"
                  value={form.startTime}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, startTime: e.target.value }))
                  }
                  data-ocid="timetable-periods.input"
                />
              </div>
              <div>
                <Label>End Time *</Label>
                <Input
                  type="time"
                  value={form.endTime}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, endTime: e.target.value }))
                  }
                  data-ocid="timetable-periods.input"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                data-ocid="timetable-periods.cancel_button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                data-ocid="timetable-periods.save_button"
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
