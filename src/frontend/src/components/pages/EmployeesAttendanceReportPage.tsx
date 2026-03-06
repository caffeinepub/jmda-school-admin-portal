import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Printer } from "lucide-react";
import { useMemo, useState } from "react";
import { useAttendanceRecords, useEmployees } from "../../hooks/useSchoolData";

export default function EmployeesAttendanceReportPage() {
  const [employees] = useEmployees();
  const [attendanceRecords] = useAttendanceRecords();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const reportData = useMemo(() => {
    return employees.map((emp) => {
      const filteredRecords = attendanceRecords.filter((r) => {
        if (r.classId !== "employees") return false;
        if (fromDate && r.date < fromDate) return false;
        if (toDate && r.date > toDate) return false;
        return true;
      });

      let present = 0;
      let absent = 0;
      let late = 0;
      let totalDays = 0;

      for (const r of filteredRecords) {
        const status = r.records[emp.id];
        if (status) {
          totalDays++;
          if (status === "present") present++;
          else if (status === "absent") absent++;
          else if (status === "late") late++;
        }
      }

      const pct =
        totalDays > 0 ? Math.round((present / totalDays) * 100) : null;

      return { emp, present, absent, late, totalDays, pct };
    });
  }, [employees, attendanceRecords, fromDate, toDate]);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">
            Employees Attendance Report
          </h1>
          <p className="text-sm text-muted-foreground">
            Employee-wise monthly attendance summary
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.print()}
          className="gap-2 no-print"
          data-ocid="employees-att-report.primary_button"
        >
          <Printer className="w-4 h-4" /> Print
        </Button>
      </div>

      <Card className="border-border no-print">
        <CardContent className="p-4 flex flex-wrap gap-4">
          <div>
            <Label className="text-xs">From Date</Label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-8 text-sm"
              data-ocid="employees-att-report.input"
            />
          </div>
          <div>
            <Label className="text-xs">To Date</Label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-8 text-sm"
              data-ocid="employees-att-report.input"
            />
          </div>
        </CardContent>
      </Card>

      {employees.length === 0 ? (
        <div
          className="py-12 text-center text-muted-foreground"
          data-ocid="employees-att-report.empty_state"
        >
          No employees found.
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
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
                  key={row.emp.id}
                  data-ocid={`employees-att-report.row.${idx + 1}`}
                >
                  <TableCell className="text-muted-foreground text-xs">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="font-medium">{row.emp.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {row.emp.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {row.emp.department}
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
