import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import {
  type AttendanceStatus,
  useAttendanceRecords,
  useEmployees,
} from "../../hooks/useSchoolData";

export default function EmployeesAttendancePage() {
  const [employees] = useEmployees();
  const [attendanceRecords, setAttendanceRecords] = useAttendanceRecords();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [currentAttendance, setCurrentAttendance] = useState<
    Record<string, AttendanceStatus>
  >({});

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    const record = attendanceRecords.find(
      (r) => r.classId === "employees" && r.date === newDate,
    );
    setCurrentAttendance(record?.records ?? {});
  };

  const setEmployeeStatus = (employeeId: string, status: AttendanceStatus) => {
    setCurrentAttendance((prev) => ({ ...prev, [employeeId]: status }));
  };

  const handleSave = () => {
    setAttendanceRecords((prev) => {
      const filtered = prev.filter(
        (r) => !(r.classId === "employees" && r.date === date),
      );
      return [
        ...filtered,
        { classId: "employees", date, records: currentAttendance },
      ];
    });
    toast.success("Employee attendance saved!");
  };

  const summary = useMemo(() => {
    const total = employees.length;
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
  }, [employees, currentAttendance]);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-display font-bold">
          Employees Attendance
        </h1>
        <p className="text-sm text-muted-foreground">
          Record daily employee attendance
        </p>
      </div>

      <Card className="border-border">
        <CardContent className="p-4 max-w-xs">
          <Label>Date</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            data-ocid="employees-attendance.input"
          />
        </CardContent>
      </Card>

      {employees.length > 0 && (
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
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp, idx) => (
                  <TableRow
                    key={emp.id}
                    data-ocid={`employees-attendance.row.${idx + 1}`}
                  >
                    <TableCell className="text-muted-foreground text-xs">
                      {idx + 1}
                    </TableCell>
                    <TableCell className="font-medium">{emp.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {emp.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {emp.department}
                    </TableCell>
                    <TableCell>
                      <RadioGroup
                        value={currentAttendance[emp.id] ?? "present"}
                        onValueChange={(v) =>
                          setEmployeeStatus(emp.id, v as AttendanceStatus)
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
                                id={`${emp.id}-${status}`}
                                data-ocid={`employees-attendance.radio.${idx + 1}`}
                              />
                              <Label
                                htmlFor={`${emp.id}-${status}`}
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
              data-ocid="employees-attendance.save_button"
            >
              <Save className="w-4 h-4" /> Save Attendance
            </Button>
          </div>
        </>
      )}

      {employees.length === 0 && (
        <div
          className="py-12 text-center text-muted-foreground"
          data-ocid="employees-attendance.empty_state"
        >
          No employees found. Add employees first.
        </div>
      )}
    </div>
  );
}
