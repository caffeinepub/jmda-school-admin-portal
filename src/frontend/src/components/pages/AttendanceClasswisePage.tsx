import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useMemo, useState } from "react";
import { useClasses, useStudents } from "../../hooks/useQueries";
import { useAttendanceRecords } from "../../hooks/useSchoolData";

export default function AttendanceClasswisePage() {
  const { data: classes = [] } = useClasses();
  const { data: students = [] } = useStudents();
  const [attendanceRecords] = useAttendanceRecords();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const classStats = useMemo(() => {
    return classes.map((cls) => {
      const studentsInClass = students.filter(
        (s) => s.className === cls.name,
      ).length;

      const filteredRecords = attendanceRecords.filter((r) => {
        if (r.classId !== cls.id.toString()) return false;
        if (fromDate && r.date < fromDate) return false;
        if (toDate && r.date > toDate) return false;
        return true;
      });

      let totalPresent = 0;
      let totalAbsent = 0;
      let totalLate = 0;
      let totalRecords = 0;

      for (const r of filteredRecords) {
        const vals = Object.values(r.records);
        totalPresent += vals.filter((v) => v === "present").length;
        totalAbsent += vals.filter((v) => v === "absent").length;
        totalLate += vals.filter((v) => v === "late").length;
        totalRecords += vals.length;
      }

      const attendancePct =
        totalRecords > 0
          ? Math.round((totalPresent / totalRecords) * 100)
          : null;

      return {
        cls,
        studentsInClass,
        days: filteredRecords.length,
        totalPresent,
        totalAbsent,
        totalLate,
        attendancePct,
      };
    });
  }, [classes, students, attendanceRecords, fromDate, toDate]);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-display font-bold">Class wise Report</h1>
        <p className="text-sm text-muted-foreground">
          Attendance summary grouped by class
        </p>
      </div>

      <Card className="border-border">
        <CardContent className="p-4 flex flex-wrap gap-4">
          <div>
            <Label className="text-xs">From Date</Label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-8 text-sm"
              data-ocid="attendance-classwise.input"
            />
          </div>
          <div>
            <Label className="text-xs">To Date</Label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-8 text-sm"
              data-ocid="attendance-classwise.input"
            />
          </div>
        </CardContent>
      </Card>

      {classes.length === 0 ? (
        <div
          className="py-12 text-center text-muted-foreground"
          data-ocid="attendance-classwise.empty_state"
        >
          No classes found. Create classes first.
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Days Recorded</TableHead>
                <TableHead>Present</TableHead>
                <TableHead>Absent</TableHead>
                <TableHead>Late</TableHead>
                <TableHead>Attendance %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classStats.map((stat, idx) => (
                <TableRow
                  key={stat.cls.id.toString()}
                  data-ocid={`attendance-classwise.row.${idx + 1}`}
                >
                  <TableCell className="text-muted-foreground text-xs">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="font-medium">{stat.cls.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {stat.studentsInClass}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {stat.days}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                      {stat.totalPresent}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-xs">
                      {stat.totalAbsent}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                      {stat.totalLate}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {stat.attendancePct !== null ? (
                      <Badge
                        className={`text-xs ${
                          stat.attendancePct >= 75
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                        }`}
                      >
                        {stat.attendancePct}%
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        {classStats.slice(0, 3).map((stat) => (
          <Card key={stat.cls.id.toString()} className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                {stat.cls.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl font-display font-bold text-primary">
                {stat.attendancePct !== null ? `${stat.attendancePct}%` : "N/A"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.studentsInClass} students · {stat.days} days
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
