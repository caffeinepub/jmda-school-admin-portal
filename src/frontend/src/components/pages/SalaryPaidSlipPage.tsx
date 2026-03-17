import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default function SalaryPaidSlipPage() {
  const [salaryRecords] = useSalaryRecords();
  const { data: teachers = [] } = useTeachers();
  const [employees] = useEmployees();
  const [staffId, setStaffId] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("2026");

  const allStaff = [
    ...teachers.map((t) => ({
      id: `teacher_${t.id}`,
      name: t.name,
      role: "Teacher",
      salary: 0,
    })),
    ...employees.map((e) => ({
      id: `emp_${e.id}`,
      name: e.name,
      role: e.role,
      salary: e.salary,
    })),
  ];

  const slip = salaryRecords.find(
    (r) => r.employeeId === staffId && r.month === month && r.year === year,
  );
  const staffInfo = allStaff.find((s) => s.id === staffId);

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-display font-bold">Salary Paid Slip</h1>
        <p className="text-sm text-muted-foreground">
          Generate salary slip for any employee
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label>Employee</Label>
          <Select value={staffId} onValueChange={setStaffId}>
            <SelectTrigger data-ocid="salary_slip.select">
              <SelectValue placeholder="Select staff..." />
            </SelectTrigger>
            <SelectContent>
              {allStaff.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Month</Label>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger data-ocid="salary_slip.select">
              <SelectValue placeholder="Month" />
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
            <SelectTrigger data-ocid="salary_slip.select">
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

      {staffId && month && (
        <div
          className="border rounded-xl p-6 space-y-4 print:border-0"
          id="salary-slip-print"
        >
          <div className="text-center border-b pb-4">
            <h2 className="text-xl font-bold">JMDA School</h2>
            <p className="text-sm text-muted-foreground">
              Salary Slip — {month} {year}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Employee Name</p>
              <p className="font-medium">{staffInfo?.name || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Designation</p>
              <p className="font-medium">{staffInfo?.role || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Month</p>
              <p className="font-medium">
                {month} {year}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Payment Status</p>
              <p className="font-medium">{slip ? "Paid" : "Not Paid"}</p>
            </div>
          </div>
          {slip ? (
            <div className="rounded-lg bg-green-50 border border-green-200 p-4">
              <p className="text-xs text-muted-foreground mb-1">Amount Paid</p>
              <p className="text-3xl font-bold text-green-700">
                ₹{slip.amount.toLocaleString("en-IN")}
              </p>
              {slip.remarks && (
                <p className="text-sm text-muted-foreground mt-1">
                  Remarks: {slip.remarks}
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
              <p className="text-sm text-yellow-700">
                No salary payment found for {month} {year}. Use "Pay Salary" to
                record a payment.
              </p>
            </div>
          )}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t text-center text-sm">
            <div>
              <div className="border-t border-gray-400 mt-8 pt-1 text-muted-foreground">
                Employee Signature
              </div>
            </div>
            <div>
              <div className="border-t border-gray-400 mt-8 pt-1 text-muted-foreground">
                Accountant
              </div>
            </div>
            <div>
              <div className="border-t border-gray-400 mt-8 pt-1 text-muted-foreground">
                Principal
              </div>
            </div>
          </div>
        </div>
      )}

      {staffId && month && (
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => window.print()}
          data-ocid="salary_slip.button"
        >
          <Printer className="w-4 h-4" /> Print Slip
        </Button>
      )}
    </div>
  );
}
