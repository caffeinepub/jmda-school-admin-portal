import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Printer } from "lucide-react";
import { useMemo, useState } from "react";
import { useClasses, useStudents } from "../../hooks/useQueries";
import { useAttendanceRecords } from "../../hooks/useSchoolData";

export default function StudentsAttendanceReportPage() {
  const { data: classes = [] } = useClasses();
  const { data: students = [] } = useStudents();
  const [attendanceRecords] = useAttendanceRecords();
  const [filterClass, setFilterClass] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filteredStudents = useMemo(() => {
    if (filterClass === "all") return students;
    const cls = classes.find((c) => c.id.toString() === filterClass);
    return students.filter((s) => s.className === cls?.name);
  }, [students, classes, filterClass]);

  const reportData = useMemo(() => {
    return filteredStudents.map((student) => {
      const studentClass = classes.find((c) => c.name === student.className);
      const classRecords = attendanceRecords.filter((r) => {
        if (studentClass && r.classId !== studentClass.id.toString())
          return false;
        if (fromDate && r.date < fromDate) return false;
        if (toDate && r.date > toDate) return false;
        return true;
      });

      let present = 0;
      let absent = 0;
      let late = 0;
      let totalDays = 0;

      for (const r of classRecords) {
        const status = r.records[student.id.toString()];
        if (status) {
          totalDays++;
          if (status === "present") present++;
          else if (status === "absent") absent++;
          else if (status === "late") late++;
        }
      }

      const pct =
        totalDays > 0 ? Math.round((present / totalDays) * 100) : null;

      return { student, present, absent, late, totalDays, pct };
    });
  }, [filteredStudents, attendanceRecords, classes, fromDate, toDate]);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">
            Students Attendance Report
          </h1>
          <p className="text-sm text-muted-foreground">
            Student-wise attendance summary
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.print()}
          className="gap-2 no-print"
          data-ocid="students-att-report.primary_button"
        >
          <Printer className="w-4 h-4" /> Print
        </Button>
      </div>

      <Card className="border-border no-print">
        <CardContent className="p-4 flex flex-wrap gap-4">
          <div>
            <Label className="text-xs">Class</Label>
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger
                className="w-40"
                data-ocid="students-att-report.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((c) => (
                  <SelectItem key={c.id.toString()} value={c.id.toString()}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">From Date</Label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-8 text-sm"
              data-ocid="students-att-report.input"
            />
          </div>
          <div>
            <Label className="text-xs">To Date</Label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-8 text-sm"
              data-ocid="students-att-report.input"
            />
          </div>
        </CardContent>
      </Card>

      {reportData.length === 0 ? (
        <div
          className="py-12 text-center text-muted-foreground"
          data-ocid="students-att-report.empty_state"
        >
          No students found.
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Reg No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Days Recorded</TableHead>
                <TableHead>Present</TableHead>
                <TableHead>Absent</TableHead>
                <TableHead>Late</TableHead>
                <TableHead>Attendance %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.map((row, idx) => (
                <TableRow
                  key={row.student.id.toString()}
                  data-ocid={`students-att-report.row.${idx + 1}`}
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
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {row.student.className}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {row.totalDays}
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
