import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Printer } from "lucide-react";
import { useMemo, useState } from "react";
import { useClasses, useStudents } from "../../hooks/useQueries";
import { useAttendanceRecords } from "../../hooks/useSchoolData";

const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const YEARS = ["2024", "2025", "2026"];

export default function ReportsStudentMonthlyAttPage() {
  const { data: students = [] } = useStudents();
  const { data: classes = [] } = useClasses();
  const [attendanceRecords] = useAttendanceRecords();
  const [classFilter, setClassFilter] = useState("");
  const [month, setMonth] = useState(
    String(new Date().getMonth() + 1).padStart(2, "0"),
  );
  const [year, setYear] = useState(String(new Date().getFullYear()));

  const selectedClass = classes.find((c) => c.id.toString() === classFilter);

  const reportData = useMemo(() => {
    if (!selectedClass) return [];
    const classStudents = students.filter(
      (s) => s.className === selectedClass.name,
    );

    const monthRecords = attendanceRecords.filter((r) => {
      if (r.classId !== selectedClass.id.toString()) return false;
      return r.date.startsWith(`${year}-${month}`);
    });

    const workingDays = monthRecords.length;

    return classStudents.map((student) => {
      let present = 0;
      let absent = 0;
      let late = 0;

      for (const r of monthRecords) {
        const status = r.records[student.id.toString()];
        if (status === "present") present++;
        else if (status === "absent") absent++;
        else if (status === "late") late++;
      }

      const pct =
        workingDays > 0 ? Math.round((present / workingDays) * 100) : null;

      return { student, present, absent, late, workingDays, pct };
    });
  }, [students, selectedClass, attendanceRecords, month, year]);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">
            Students Monthly Attendance
          </h1>
          <p className="text-sm text-muted-foreground">
            Monthly attendance report by class
          </p>
        </div>
        {classFilter && reportData.length > 0 && (
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="gap-2 no-print"
            data-ocid="reports-student-monthly.primary_button"
          >
            <Printer className="w-4 h-4" /> Print
          </Button>
        )}
      </div>

      <Card className="border-border no-print">
        <CardContent className="p-4 flex flex-wrap gap-4">
          <div>
            <Label className="text-xs">Class</Label>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger
                className="w-40"
                data-ocid="reports-student-monthly.select"
              >
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
            <Label className="text-xs">Month</Label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger
                className="w-36"
                data-ocid="reports-student-monthly.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Year</Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger
                className="w-24"
                data-ocid="reports-student-monthly.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {!classFilter && (
        <div
          className="py-12 text-center text-muted-foreground"
          data-ocid="reports-student-monthly.empty_state"
        >
          Select a class, month, and year to view the attendance report.
        </div>
      )}

      {classFilter && reportData.length === 0 && (
        <div
          className="py-8 text-center text-muted-foreground"
          data-ocid="reports-student-monthly.empty_state"
        >
          No students found.
        </div>
      )}

      {classFilter && reportData.length > 0 && (
        <div className="rounded-lg border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Reg No</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Working Days</TableHead>
                <TableHead>Present</TableHead>
                <TableHead>Absent</TableHead>
                <TableHead>Late</TableHead>
                <TableHead>Attendance %</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.map((row, idx) => (
                <TableRow
                  key={row.student.id.toString()}
                  data-ocid={`reports-student-monthly.row.${idx + 1}`}
                >
                  <TableCell className="text-muted-foreground text-xs">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {row.student.registrationNo || "-"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {row.student.name}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {row.workingDays}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                      {row.present}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-xs">
                      {row.absent}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                      {row.late}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {row.pct !== null ? (
                      <Badge
                        className={`text-xs ${
                          row.pct >= 75
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                        }`}
                      >
                        {row.pct}%
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        No data
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {row.pct !== null ? (
                      <Badge
                        className={`text-xs ${
                          row.pct >= 75
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {row.pct >= 75 ? "Regular" : "Irregular"}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
