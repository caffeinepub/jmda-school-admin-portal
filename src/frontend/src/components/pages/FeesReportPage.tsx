import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart2, Printer } from "lucide-react";
import { useMemo, useState } from "react";
import {
  useClasses,
  useFeePayments,
  useStudents,
} from "../../hooks/useQueries";
import { useStudentExtended } from "../../hooks/useSchoolData";

interface StudentFeeRow {
  id: string;
  roll: string;
  standard: string;
  session: string;
  name: string;
  email: string;
  phone: string;
  totalFee: number;
  paidFee: number;
  presentDue: number;
  previousDue: number;
  totalDue: number;
}

export default function FeesReportPage() {
  const { data: payments = [], isLoading: paymentsLoading } = useFeePayments();
  const { data: students = [], isLoading: studentsLoading } = useStudents();
  const { data: classes = [], isLoading: classesLoading } = useClasses();
  const [extendedData] = useStudentExtended();

  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedSession, setSelectedSession] = useState<string>("all");

  const isLoading = paymentsLoading || studentsLoading || classesLoading;

  // Derive unique sessions from fee payments
  const sessions = useMemo(() => {
    const set = new Set<string>();
    for (const p of payments) {
      if (p.feesTerm) set.add(p.feesTerm);
    }
    return Array.from(set).sort();
  }, [payments]);

  // Build class-wise rows
  const rows = useMemo((): StudentFeeRow[] => {
    return students
      .filter((s) => selectedClass === "all" || s.className === selectedClass)
      .map((s): StudentFeeRow => {
        const sid = s.id.toString();
        const ext = extendedData[sid] ?? {};

        // Filter payments for this student, optionally by session
        const studentPayments = payments.filter(
          (p) =>
            p.studentId.toString() === sid &&
            (selectedSession === "all" || p.feesTerm === selectedSession),
        );

        const totalFee = studentPayments.reduce(
          (sum, p) => sum + Number(p.total),
          0,
        );
        const paidFee = studentPayments.reduce(
          (sum, p) => sum + Number(p.deposit),
          0,
        );
        // Sum of previous balances across all payments for this student
        const previousDue = studentPayments.reduce(
          (sum, p) => sum + Number(p.previousBalance),
          0,
        );
        const presentDue = studentPayments.reduce(
          (sum, p) => sum + Number(p.dueableBalance),
          0,
        );
        const totalDue = presentDue + previousDue;

        // Roll: use registrationNo as roll number; index-based fallback
        const roll = s.registrationNo || sid;

        // Session label
        const session =
          selectedSession !== "all"
            ? selectedSession
            : sessions.length > 0
              ? sessions.join(", ")
              : "—";

        // Email and phone from extended data
        const phone =
          (ext as { mobileNo?: string }).mobileNo || s.guardianContact || "—";
        const email = (ext as { email?: string }).email || "—";

        return {
          id: sid,
          roll,
          standard: s.className || "—",
          session,
          name: s.name,
          email,
          phone,
          totalFee,
          paidFee,
          presentDue,
          previousDue,
          totalDue,
        };
      });
  }, [
    students,
    payments,
    extendedData,
    selectedClass,
    selectedSession,
    sessions,
  ]);

  // Totals row
  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, r) => ({
          totalFee: acc.totalFee + r.totalFee,
          paidFee: acc.paidFee + r.paidFee,
          presentDue: acc.presentDue + r.presentDue,
          previousDue: acc.previousDue + r.previousDue,
          totalDue: acc.totalDue + r.totalDue,
        }),
        { totalFee: 0, paidFee: 0, presentDue: 0, previousDue: 0, totalDue: 0 },
      ),
    [rows],
  );

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap no-print">
        <div>
          <h1 className="text-2xl font-display font-bold">Fees Report</h1>
          <p className="text-sm text-muted-foreground">
            Class-wise student fee summary
          </p>
        </div>
        <Button
          onClick={() => window.print()}
          variant="outline"
          className="gap-2"
          data-ocid="fees_report.print_button"
        >
          <Printer className="w-4 h-4" />
          Print Report
        </Button>
      </div>

      {/* Print header */}
      <div className="hidden print:block text-center pb-4 border-b border-border">
        <h1 className="text-2xl font-bold">JMDA School Admin Portal</h1>
        <p className="text-lg mt-1">Fees Report — Class Wise</p>
        <p className="text-sm text-muted-foreground mt-0.5">
          Generated on {new Date().toLocaleDateString("en-IN")}
        </p>
      </div>

      {/* Filters */}
      <div
        className="flex flex-wrap gap-3 no-print"
        data-ocid="fees_report.filters_panel"
      >
        <div className="flex flex-col gap-1 min-w-[160px]">
          <span className="text-xs text-muted-foreground font-medium">
            Filter by Class
          </span>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger data-ocid="fees_report.class_select">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls.id.toString()} value={cls.name}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1 min-w-[160px]">
          <span className="text-xs text-muted-foreground font-medium">
            Filter by Session
          </span>
          <Select value={selectedSession} onValueChange={setSelectedSession}>
            <SelectTrigger data-ocid="fees_report.session_select">
              <SelectValue placeholder="All Sessions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sessions</SelectItem>
              {sessions.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-11 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div
          className="py-16 text-center text-muted-foreground"
          data-ocid="fees_report.empty_state"
        >
          <BarChart2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No students found for the selected filters</p>
        </div>
      ) : (
        <div
          className="rounded-lg border border-border overflow-x-auto"
          data-ocid="fees_report.table"
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="text-xs font-semibold whitespace-nowrap">
                  ID
                </TableHead>
                <TableHead className="text-xs font-semibold whitespace-nowrap">
                  Roll
                </TableHead>
                <TableHead className="text-xs font-semibold whitespace-nowrap">
                  Standard
                </TableHead>
                <TableHead className="text-xs font-semibold whitespace-nowrap">
                  Session
                </TableHead>
                <TableHead className="text-xs font-semibold whitespace-nowrap">
                  Name
                </TableHead>
                <TableHead className="text-xs font-semibold whitespace-nowrap">
                  Email
                </TableHead>
                <TableHead className="text-xs font-semibold whitespace-nowrap">
                  Phone
                </TableHead>
                <TableHead className="text-xs font-semibold text-right whitespace-nowrap">
                  Total Fee
                </TableHead>
                <TableHead className="text-xs font-semibold text-right whitespace-nowrap text-emerald-600">
                  Paid Fee
                </TableHead>
                <TableHead className="text-xs font-semibold text-right whitespace-nowrap text-amber-600">
                  Present Due
                </TableHead>
                <TableHead className="text-xs font-semibold text-right whitespace-nowrap text-orange-600">
                  Previous Due
                </TableHead>
                <TableHead className="text-xs font-semibold text-right whitespace-nowrap text-rose-600">
                  Total Due
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, idx) => (
                <TableRow
                  key={row.id}
                  data-ocid={`fees_report.row.${idx + 1}`}
                  className="hover:bg-muted/20 text-sm"
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {row.id}
                  </TableCell>
                  <TableCell className="font-medium text-xs">
                    {row.roll}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs">
                    {row.standard}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {row.session}
                  </TableCell>
                  <TableCell className="font-medium whitespace-nowrap">
                    {row.name}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {row.email}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {row.phone}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {fmt(row.totalFee)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-emerald-600">
                    {fmt(row.paidFee)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-amber-600">
                    {fmt(row.presentDue)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-orange-600">
                    {fmt(row.previousDue)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-semibold text-rose-600">
                    {fmt(row.totalDue)}
                  </TableCell>
                </TableRow>
              ))}

              {/* Grand Totals */}
              <TableRow className="bg-muted/40 font-bold border-t-2 border-border">
                <TableCell colSpan={7} className="text-sm font-bold">
                  Grand Total ({rows.length} students)
                </TableCell>
                <TableCell className="text-right font-mono text-sm font-bold">
                  {fmt(totals.totalFee)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm font-bold text-emerald-600">
                  {fmt(totals.paidFee)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm font-bold text-amber-600">
                  {fmt(totals.presentDue)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm font-bold text-orange-600">
                  {fmt(totals.previousDue)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm font-bold text-rose-600">
                  {fmt(totals.totalDue)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
