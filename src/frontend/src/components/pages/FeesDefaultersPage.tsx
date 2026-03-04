import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { AlertCircle, IndianRupee, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import type { Student } from "../../backend.d";
import { useFeePayments, useStudents } from "../../hooks/useQueries";

const FEE_TERMS = ["All", "Yearly Fees", "Term 1", "Term 2", "Term 3"];

export default function FeesDefaultersPage() {
  const { data: payments = [], isLoading: paymentsLoading } = useFeePayments();
  const { data: students = [], isLoading: studentsLoading } = useStudents();
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [termFilter, setTermFilter] = useState("All");

  const studentMap = useMemo(() => {
    const m = new Map<string, Student>();
    for (const s of students) m.set(s.id.toString(), s);
    return m;
  }, [students]);

  const uniqueClasses = useMemo(() => {
    const classes = new Set<string>();
    for (const s of students) {
      if (s.className) classes.add(s.className);
    }
    return ["All", ...Array.from(classes).sort()];
  }, [students]);

  // Only payments with due balance
  const defaulters = useMemo(() => {
    return payments
      .filter((p) => Number(p.dueableBalance) > 0)
      .map((p) => ({
        ...p,
        student: studentMap.get(p.studentId.toString()),
      }))
      .filter((p) => {
        const q = search.toLowerCase().trim();
        const name = p.student?.name?.toLowerCase() ?? "";
        const regNo = p.student?.registrationNo?.toLowerCase() ?? "";
        const matchesSearch = !q || name.includes(q) || regNo.includes(q);
        const matchesClass =
          classFilter === "All" || p.student?.className === classFilter;
        const matchesTerm = termFilter === "All" || p.feesTerm === termFilter;
        return matchesSearch && matchesClass && matchesTerm;
      });
  }, [payments, studentMap, search, classFilter, termFilter]);

  const totalDue = useMemo(
    () => defaulters.reduce((sum, p) => sum + Number(p.dueableBalance), 0),
    [defaulters],
  );

  const isLoading = paymentsLoading || studentsLoading;

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold">Fees Defaulters</h1>
        <p className="text-sm text-muted-foreground">
          Students with outstanding fee balances
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="border border-border rounded-lg px-4 py-3 bg-card flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/15 flex items-center justify-center">
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Defaulters</p>
            <p className="text-lg font-bold text-foreground">
              {defaulters.length}
            </p>
          </div>
        </div>
        <div className="border border-border rounded-lg px-4 py-3 bg-card flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-500/15 flex items-center justify-center">
            <IndianRupee className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Due Amount</p>
            <p className="text-lg font-bold text-rose-500 font-mono">
              ₹{totalDue.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or reg no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-ocid="fees_defaulters.search_input"
          />
        </div>
        <div className="w-40">
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger data-ocid="fees_defaulters.class_select">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              {uniqueClasses.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-40">
          <Select value={termFilter} onValueChange={setTermFilter}>
            <SelectTrigger data-ocid="fees_defaulters.term_select">
              <SelectValue placeholder="All Terms" />
            </SelectTrigger>
            <SelectContent>
              {FEE_TERMS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
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
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : defaulters.length === 0 ? (
        <div
          className="py-16 text-center text-muted-foreground"
          data-ocid="fees_defaulters.empty_state"
        >
          <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            No defaulters found for the selected filters
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Reg No</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Due Amount (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {defaulters.map((p, idx) => (
                <TableRow
                  key={p.id.toString()}
                  data-ocid={`fees_defaulters.row.${idx + 1}`}
                >
                  <TableCell className="text-muted-foreground text-sm">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {p.student?.name ?? "Unknown"}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {p.student?.registrationNo || "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {p.student?.className || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {p.feesTerm}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {p.date}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-rose-500 text-sm">
                    ₹{Number(p.dueableBalance).toLocaleString("en-IN")}
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
