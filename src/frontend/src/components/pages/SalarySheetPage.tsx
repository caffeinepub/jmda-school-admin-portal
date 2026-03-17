import { Badge } from "@/components/ui/badge";
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
const YEARS = ["2024", "2025", "2026", "2027"];

export default function SalarySheetPage() {
  const [salaryRecords] = useSalaryRecords();
  const { data: teachers = [] } = useTeachers();
  const [employees] = useEmployees();
  const [month, setMonth] = useState("");
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

  const filtered = month
    ? allStaff.map((s) => {
        const rec = salaryRecords.find(
          (r) => r.employeeId === s.id && r.month === month && r.year === year,
        );
        return {
          ...s,
          amount: rec?.amount ?? null,
          remarks: rec?.remarks ?? "",
        };
      })
    : [];

  const total = filtered.reduce((sum, r) => sum + (r.amount ?? 0), 0);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Salary Sheet</h1>
          <p className="text-sm text-muted-foreground">
            Monthly salary sheet for all staff
          </p>
        </div>
        {filtered.length > 0 && (
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => window.print()}
            data-ocid="salary_sheet.button"
          >
            <Printer className="w-4 h-4" /> Print Sheet
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-sm">
        <div>
          <Label>Month</Label>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger data-ocid="salary_sheet.select">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Year</Label>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger data-ocid="salary_sheet.select">
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
      </div>

      {!month ? (
        <div
          className="flex flex-col items-center justify-center py-16 text-muted-foreground"
          data-ocid="salary_sheet.empty_state"
        >
          <p>Select a month to view the salary sheet.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="p-3 bg-muted/50 text-center">
            <p className="font-semibold">
              JMDA School — Salary Sheet ({month} {year})
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead className="text-right">Amount (₹)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r, idx) => (
                <TableRow key={r.id} data-ocid={`salary_sheet.row.${idx + 1}`}>
                  <TableCell className="text-muted-foreground">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>{r.role}</TableCell>
                  <TableCell className="text-right font-mono">
                    {r.amount !== null ? r.amount.toLocaleString("en-IN") : "—"}
                  </TableCell>
                  <TableCell>
                    {r.amount !== null ? (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        Paid
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {r.remarks || "—"}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold bg-muted/30">
                <TableCell colSpan={3}>Total</TableCell>
                <TableCell className="text-right font-mono">
                  ₹{total.toLocaleString("en-IN")}
                </TableCell>
                <TableCell colSpan={2} />
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
