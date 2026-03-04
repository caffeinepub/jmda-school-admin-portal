import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Printer } from "lucide-react";
import { useMemo, useState } from "react";
import {
  useClasses,
  useFeePayments,
  useStudents,
} from "../../hooks/useQueries";
import { useAttendanceRecords } from "../../hooks/useSchoolData";

export default function ReportsPage() {
  const { data: students = [] } = useStudents();
  const { data: classes = [] } = useClasses();
  const { data: feePayments = [] } = useFeePayments();
  const [attendanceRecords] = useAttendanceRecords();

  const [feeFrom, setFeeFrom] = useState("");
  const [feeTo, setFeeTo] = useState("");
  const [reportClass, setReportClass] = useState("all");
  const [attClass, setAttClass] = useState("");
  const [attFrom, setAttFrom] = useState("");
  const [attTo, setAttTo] = useState("");

  const studentMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of students) m.set(s.id.toString(), s.name);
    return m;
  }, [students]);

  const filteredFees = useMemo(() => {
    return feePayments.filter((p) => {
      const d = new Date(p.date);
      if (feeFrom && d < new Date(feeFrom)) return false;
      if (feeTo && d > new Date(feeTo)) return false;
      return true;
    });
  }, [feePayments, feeFrom, feeTo]);

  const totalFeesCollected = useMemo(
    () => filteredFees.reduce((a, p) => a + Number(p.deposit), 0),
    [filteredFees],
  );

  const filteredStudents = useMemo(() => {
    if (reportClass === "all") return students;
    const cls = classes.find((c) => c.id.toString() === reportClass);
    return students.filter((s) => s.className === cls?.name);
  }, [students, classes, reportClass]);

  const attSummary = useMemo(() => {
    if (!attClass) return [];
    return attendanceRecords
      .filter((r) => {
        if (r.classId !== attClass) return false;
        if (attFrom && r.date < attFrom) return false;
        if (attTo && r.date > attTo) return false;
        return true;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [attendanceRecords, attClass, attFrom, attTo]);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Reports</h1>
          <p className="text-sm text-muted-foreground">
            Generate and print reports
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.print()}
          className="gap-2 no-print"
          data-ocid="reports.primary_button"
        >
          <Printer className="w-4 h-4" /> Print Report
        </Button>
      </div>

      <Tabs defaultValue="fees">
        <TabsList className="no-print">
          <TabsTrigger value="fees" data-ocid="reports.tab">
            Fee Collection
          </TabsTrigger>
          <TabsTrigger value="students" data-ocid="reports.tab">
            Student List
          </TabsTrigger>
          <TabsTrigger value="attendance" data-ocid="reports.tab">
            Attendance Summary
          </TabsTrigger>
        </TabsList>

        {/* Fee Collection Report */}
        <TabsContent value="fees" className="space-y-4 mt-4">
          <Card className="border-border no-print">
            <CardContent className="p-4 flex flex-wrap gap-4">
              <div>
                <Label className="text-xs">From Date</Label>
                <Input
                  type="date"
                  value={feeFrom}
                  onChange={(e) => setFeeFrom(e.target.value)}
                  className="h-8 text-sm"
                  data-ocid="reports.input"
                />
              </div>
              <div>
                <Label className="text-xs">To Date</Label>
                <Input
                  type="date"
                  value={feeTo}
                  onChange={(e) => setFeeTo(e.target.value)}
                  className="h-8 text-sm"
                  data-ocid="reports.input"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Total Collected</p>
                <p className="text-2xl font-display font-bold text-primary">
                  ₹{totalFeesCollected.toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Records</p>
                <p className="text-2xl font-display font-bold text-foreground">
                  {filteredFees.length}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-lg border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Total (₹)</TableHead>
                  <TableHead className="text-right">Paid (₹)</TableHead>
                  <TableHead className="text-right">Due (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFees.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-8"
                      data-ocid="reports.empty_state"
                    >
                      No records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFees.map((p, idx) => (
                    <TableRow
                      key={p.id.toString()}
                      data-ocid={`reports.row.${idx + 1}`}
                    >
                      <TableCell className="text-muted-foreground text-xs">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {studentMap.get(p.studentId.toString()) ?? "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {p.feesTerm}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {p.date}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {Number(p.total).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-emerald-400">
                        {Number(p.deposit).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-rose-400">
                        {Number(p.dueableBalance).toLocaleString("en-IN")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Student List */}
        <TabsContent value="students" className="space-y-4 mt-4">
          <div className="max-w-xs no-print">
            <Label>Filter by Class</Label>
            <Select value={reportClass} onValueChange={setReportClass}>
              <SelectTrigger data-ocid="reports.select">
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

          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Reg No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Guardian</TableHead>
                  <TableHead>Mobile</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-8"
                      data-ocid="reports.empty_state"
                    >
                      No students.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((s, idx) => (
                    <TableRow
                      key={s.id.toString()}
                      data-ocid={`reports.row.${idx + 1}`}
                    >
                      <TableCell className="text-muted-foreground text-xs">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {s.registrationNo || "-"}
                      </TableCell>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {s.className}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {s.guardianName || "-"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {s.guardianContact || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Attendance Summary */}
        <TabsContent value="attendance" className="space-y-4 mt-4">
          <Card className="border-border no-print">
            <CardContent className="p-4 flex flex-wrap gap-4">
              <div>
                <Label className="text-xs">Class</Label>
                <Select value={attClass} onValueChange={setAttClass}>
                  <SelectTrigger className="w-40" data-ocid="reports.select">
                    <SelectValue placeholder="Class..." />
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
                <Label className="text-xs">From Date</Label>
                <Input
                  type="date"
                  value={attFrom}
                  onChange={(e) => setAttFrom(e.target.value)}
                  className="h-8 text-sm"
                  data-ocid="reports.input"
                />
              </div>
              <div>
                <Label className="text-xs">To Date</Label>
                <Input
                  type="date"
                  value={attTo}
                  onChange={(e) => setAttTo(e.target.value)}
                  className="h-8 text-sm"
                  data-ocid="reports.input"
                />
              </div>
            </CardContent>
          </Card>

          {attSummary.length === 0 ? (
            <div
              className="py-12 text-center text-muted-foreground"
              data-ocid="reports.empty_state"
            >
              Select a class and date range to view attendance summary.
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>Late</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attSummary.map((r, idx) => {
                    const present = Object.values(r.records).filter(
                      (s) => s === "present",
                    ).length;
                    const absent = Object.values(r.records).filter(
                      (s) => s === "absent",
                    ).length;
                    const late = Object.values(r.records).filter(
                      (s) => s === "late",
                    ).length;
                    return (
                      <TableRow
                        key={`${r.classId}-${r.date}`}
                        data-ocid={`reports.row.${idx + 1}`}
                      >
                        <TableCell>{r.date}</TableCell>
                        <TableCell>
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                            {present}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-xs">
                            {absent}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                            {late}
                          </Badge>
                        </TableCell>
                        <TableCell>{present + absent + late}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
