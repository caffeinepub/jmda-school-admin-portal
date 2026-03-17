import { Button } from "@/components/ui/button";
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
import { useState } from "react";
import { useTeachers } from "../../hooks/useQueries";
import { useEmployees, useSalaryRecords } from "../../hooks/useSchoolData";

const YEARS = ["2024", "2025", "2026", "2027"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function SalaryReportPage() {
  const [salaryRecords] = useSalaryRecords();
  const { data: teachers = [] } = useTeachers();
  const [employees] = useEmployees();
  const [year, setYear] = useState("2026");

  const allStaff = [
    ...teachers.map((t) => ({
      id: `teacher_${t.id}`,
      name: t.name,
      role: "Teacher",
    })),
    ...employees.map((e) => ({
      id: `emp_${e.id}`,
      name: e.name,
      role: e.role,
    })),
  ];

  // Build a report: each staff member with total paid per year and month-wise breakdown
  const report = allStaff
    .map((s) => {
      const recs = salaryRecords.filter(
        (r) => r.employeeId === s.id && r.year === year,
      );
      const total = recs.reduce((sum, r) => sum + r.amount, 0);
      const monthMap: Record<string, number> = recs.reduce<
        Record<string, number>
      >((acc, r) => {
        acc[r.month] = (acc[r.month] ?? 0) + r.amount;
        return acc;
      }, {});
      return { ...s, total, monthMap, count: recs.length };
    })
    .filter((s) => s.total > 0);

  const grandTotal = report.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Salary Report</h1>
          <p className="text-sm text-muted-foreground">
            Annual salary summary by employee
          </p>
        </div>
        {report.length > 0 && (
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => window.print()}
            data-ocid="salary_report.button"
          >
            <Printer className="w-4 h-4" /> Print Report
          </Button>
        )}
      </div>

      <div className="max-w-xs">
        <Label>Year</Label>
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger data-ocid="salary_report.select">
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

      {report.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 text-muted-foreground"
          data-ocid="salary_report.empty_state"
        >
          <p>No salary records found for {year}.</p>
          <p className="text-sm">Use "Pay Salary" to record payments first.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="p-3 bg-muted/50 text-center">
            <p className="font-semibold">JMDA School — Salary Report {year}</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Months Paid</TableHead>
                <TableHead className="text-right">Total Paid (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.map((r, idx) => (
                <TableRow key={r.id} data-ocid={`salary_report.row.${idx + 1}`}>
                  <TableCell className="text-muted-foreground">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>{r.role}</TableCell>
                  <TableCell className="text-sm">
                    {MONTHS.filter((m) => r.monthMap[m]).join(", ") || "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    ₹{r.total.toLocaleString("en-IN")}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold bg-muted/30">
                <TableCell colSpan={4}>Grand Total</TableCell>
                <TableCell className="text-right font-mono">
                  ₹{grandTotal.toLocaleString("en-IN")}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
