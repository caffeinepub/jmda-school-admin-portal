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

interface Classroom {
  id: string;
  roomNo: string;
  capacity: number;
  floor: string;
}

const DEFAULT_CLASSROOMS: Classroom[] = [
  { id: "r1", roomNo: "101", capacity: 40, floor: "Ground Floor" },
  { id: "r2", roomNo: "102", capacity: 40, floor: "Ground Floor" },
  { id: "r3", roomNo: "201", capacity: 45, floor: "First Floor" },
  { id: "r4", roomNo: "202", capacity: 45, floor: "First Floor" },
  { id: "r5", roomNo: "Lab-1", capacity: 30, floor: "Ground Floor" },
];

export default function TimetableClassroomsPage() {
  const [classrooms, setClassrooms] = useLocalStorage<Classroom[]>(
    "jmda_classrooms",
    DEFAULT_CLASSROOMS,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    roomNo: "",
    capacity: 40,
    floor: "",
  });

  const openAdd = () => {
    setEditId(null);
    setForm({ roomNo: "", capacity: 40, floor: "" });
    setDialogOpen(true);
  };

  const openEdit = (room: Classroom) => {
    setEditId(room.id);
    setForm({
      roomNo: room.roomNo,
      capacity: room.capacity,
      floor: room.floor,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.roomNo.trim()) {
      toast.error("Room number is required.");
      return;
    }
    if (editId) {
      setClassrooms((prev) =>
        prev.map((r) => (r.id === editId ? { ...r, ...form } : r)),
      );
      toast.success("Classroom updated.");
    } else {
      setClassrooms((prev) => [...prev, { id: `room_${Date.now()}`, ...form }]);
      toast.success("Classroom added.");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setClassrooms((prev) => prev.filter((r) => r.id !== id));
    toast.success("Classroom deleted.");
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Class Rooms</h1>
          <p className="text-sm text-muted-foreground">
            Manage classroom details and capacity
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="gap-2"
          data-ocid="timetable-classrooms.primary_button"
        >
          <Plus className="w-4 h-4" /> Add Room
        </Button>
      </div>

      {classrooms.length === 0 ? (
        <div
          className="py-12 text-center text-muted-foreground"
          data-ocid="timetable-classrooms.empty_state"
        >
          No classrooms configured. Add your first classroom.
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden max-w-2xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Room No</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Floor</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classrooms.map((room, idx) => (
                <TableRow
                  key={room.id}
                  data-ocid={`timetable-classrooms.row.${idx + 1}`}
                >
                  <TableCell className="text-muted-foreground text-xs">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="font-semibold">{room.roomNo}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {room.capacity} students
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {room.floor || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7"
                        onClick={() => openEdit(room)}
                        data-ocid={`timetable-classrooms.edit_button.${idx + 1}`}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(room.id)}
                        data-ocid={`timetable-classrooms.delete_button.${idx + 1}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-ocid="timetable-classrooms.dialog">
          <DialogHeader>
            <DialogTitle>
              {editId ? "Edit Classroom" : "Add Classroom"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Room Number *</Label>
              <Input
                value={form.roomNo}
                onChange={(e) =>
                  setForm((f) => ({ ...f, roomNo: e.target.value }))
                }
                placeholder="e.g. 101, Lab-1"
                data-ocid="timetable-classrooms.input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Capacity</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      capacity: Number(e.target.value),
                    }))
                  }
                  data-ocid="timetable-classrooms.input"
                />
              </div>
              <div>
                <Label>Floor</Label>
                <Input
                  value={form.floor}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, floor: e.target.value }))
                  }
                  placeholder="e.g. Ground Floor"
                  data-ocid="timetable-classrooms.input"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                data-ocid="timetable-classrooms.cancel_button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                data-ocid="timetable-classrooms.save_button"
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
