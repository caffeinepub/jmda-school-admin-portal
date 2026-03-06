import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { Save } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useClasses, useStudents } from "../../hooks/useQueries";
import {
  type AttendanceStatus,
  useAttendanceRecords,
} from "../../hooks/useSchoolData";

export default function StudentsAttendancePage() {
  const { data: classes = [] } = useClasses();
  const { data: students = [] } = useStudents();
  const [attendanceRecords, setAttendanceRecords] = useAttendanceRecords();
  const [classId, setClassId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [currentAttendance, setCurrentAttendance] = useState<
    Record<string, AttendanceStatus>
  >({});

  const selectedClass = classes.find((c) => c.id.toString() === classId);
  const studentsInClass = useMemo(() => {
    if (!selectedClass) return [];
    return students.filter((s) => s.className === selectedClass.name);
  }, [students, selectedClass]);

  const handleClassChange = (newClassId: string) => {
    setClassId(newClassId);
    const record = attendanceRecords.find(
      (r) => r.classId === newClassId && r.date === date,
    );
    setCurrentAttendance(record?.records ?? {});
  };

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    const record = attendanceRecords.find(
      (r) => r.classId === classId && r.date === newDate,
    );
    setCurrentAttendance(record?.records ?? {});
  };

  const setStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setCurrentAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSave = () => {
    if (!classId) {
      toast.error("Please select a class.");
      return;
    }
    setAttendanceRecords((prev) => {
      const filtered = prev.filter(
        (r) => !(r.classId === classId && r.date === date),
      );
      return [...filtered, { classId, date, records: currentAttendance }];
    });
    toast.success("Attendance saved!");
  };

  const summary = useMemo(() => {
    const total = studentsInClass.length;
    const present = Object.values(currentAttendance).filter(
      (s) => s === "present",
    ).length;
    const absent = Object.values(currentAttendance).filter(
      (s) => s === "absent",
    ).length;
    const late = Object.values(currentAttendance).filter(
      (s) => s === "late",
    ).length;
    return { total, present, absent, late };
  }, [studentsInClass, currentAttendance]);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-display font-bold">Students Attendance</h1>
        <p className="text-sm text-muted-foreground">
          Record daily student attendance by class
        </p>
      </div>

      <Card className="border-border">
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Select Class</Label>
            <Select value={classId} onValueChange={handleClassChange}>
              <SelectTrigger data-ocid="students-attendance.select">
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
          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              data-ocid="students-attendance.input"
            />
          </div>
        </CardContent>
      </Card>

      {selectedClass && studentsInClass.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              Present: {summary.present}
            </Badge>
            <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">
              Absent: {summary.absent}
            </Badge>
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
              Late: {summary.late}
            </Badge>
            <Badge variant="secondary">Total: {summary.total}</Badge>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Reg No</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsInClass.map((s, idx) => (
                  <TableRow
                    key={s.id.toString()}
                    data-ocid={`students-attendance.row.${idx + 1}`}
                  >
                    <TableCell className="text-muted-foreground text-xs">
                      {idx + 1}
                    </TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {s.registrationNo || "-"}
                    </TableCell>
                    <TableCell>
                      <RadioGroup
                        value={currentAttendance[s.id.toString()] ?? "present"}
                        onValueChange={(v) =>
                          setStudentStatus(
                            s.id.toString(),
                            v as AttendanceStatus,
                          )
                        }
                        className="flex gap-4"
                      >
                        {(["present", "absent", "late"] as const).map(
                          (status) => (
                            <div
                              key={status}
                              className="flex items-center gap-1.5"
                            >
                              <RadioGroupItem
                                value={status}
                                id={`${s.id}-${status}`}
                                data-ocid={`students-attendance.radio.${idx + 1}`}
                              />
                              <Label
                                htmlFor={`${s.id}-${status}`}
                                className={`text-xs capitalize cursor-pointer ${
                                  status === "present"
                                    ? "text-emerald-400"
                                    : status === "absent"
                                      ? "text-rose-400"
                                      : "text-amber-400"
                                }`}
                              >
                                {status}
                              </Label>
                            </div>
                          ),
                        )}
                      </RadioGroup>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              className="gap-2"
              data-ocid="students-attendance.save_button"
            >
              <Save className="w-4 h-4" /> Save Attendance
            </Button>
          </div>
        </>
      )}

      {selectedClass && studentsInClass.length === 0 && (
        <div
          className="py-12 text-center text-muted-foreground"
          data-ocid="students-attendance.empty_state"
        >
          No students enrolled in this class.
        </div>
      )}

      {!classId && (
        <div
          className="py-12 text-center text-muted-foreground"
          data-ocid="students-attendance.empty_state"
        >
          Select a class and date to take attendance.
        </div>
      )}
    </div>
  );
}
