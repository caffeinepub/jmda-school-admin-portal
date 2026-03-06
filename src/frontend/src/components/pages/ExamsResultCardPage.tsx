import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { useExams } from "../../hooks/useSchoolData";

export default function ExamsResultCardPage() {
  const { data: students = [] } = useStudents();
  const { data: classes = [] } = useClasses();
  const [exams] = useExams();
  const [classFilter, setClassFilter] = useState("");
  const [studentId, setStudentId] = useState("");

  const studentsInClass = useMemo(() => {
    if (!classFilter) return students;
    const cls = classes.find((c) => c.id.toString() === classFilter);
    return students.filter((s) => s.className === cls?.name);
  }, [students, classes, classFilter]);

  const selectedStudent = students.find((s) => s.id.toString() === studentId);

  const studentResults = useMemo(() => {
    if (!selectedStudent) return [];
    return exams
      .filter(
        (e) =>
          e.type === "exam" &&
          e.className === selectedStudent.className &&
          e.marks[selectedStudent.id.toString()] !== undefined,
      )
      .map((e) => {
        const marks = e.marks[selectedStudent.id.toString()] ?? 0;
        const pct = Math.round((marks / e.maxMarks) * 100);
        const grade =
          pct >= 90
            ? "A+"
            : pct >= 80
              ? "A"
              : pct >= 70
                ? "B+"
                : pct >= 60
                  ? "B"
                  : pct >= 50
                    ? "C"
                    : pct >= 35
                      ? "D"
                      : "F";
        return { exam: e, marks, pct, grade, passed: pct >= 35 };
      });
  }, [exams, selectedStudent]);

  const overallStats = useMemo(() => {
    if (studentResults.length === 0) return null;
    const totalMarks = studentResults.reduce((a, r) => a + r.marks, 0);
    const maxTotal = studentResults.reduce((a, r) => a + r.exam.maxMarks, 0);
    const pct = Math.round((totalMarks / maxTotal) * 100);
    const passed = studentResults.every((r) => r.passed);
    return { totalMarks, maxTotal, pct, passed };
  }, [studentResults]);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Result Card</h1>
          <p className="text-sm text-muted-foreground">
            Printable student result card
          </p>
        </div>
        {selectedStudent && studentResults.length > 0 && (
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="gap-2 no-print"
            data-ocid="exams-result-card.primary_button"
          >
            <Printer className="w-4 h-4" /> Print Card
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-4 no-print">
        <div>
          <Label className="text-xs">Class</Label>
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger
              className="w-40"
              data-ocid="exams-result-card.select"
            >
              <SelectValue placeholder="All classes..." />
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
          <Label className="text-xs">Student</Label>
          <Select value={studentId} onValueChange={setStudentId}>
            <SelectTrigger
              className="w-52"
              data-ocid="exams-result-card.select"
            >
              <SelectValue placeholder="Select student..." />
            </SelectTrigger>
            <SelectContent>
              {studentsInClass.map((s) => (
                <SelectItem key={s.id.toString()} value={s.id.toString()}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedStudent && (
        <Card className="border-border max-w-2xl">
          <CardHeader className="pb-3 border-b border-border">
            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                JMDA School Admin Portal
              </p>
              <h2 className="text-xl font-display font-bold">
                Student Result Card
              </h2>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Name: </span>
                <span className="font-semibold">{selectedStudent.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Reg No: </span>
                <span className="font-mono">
                  {selectedStudent.registrationNo || "-"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Class: </span>
                <span className="font-semibold">
                  {selectedStudent.className}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Guardian: </span>
                <span>{selectedStudent.guardianName || "-"}</span>
              </div>
            </div>

            {studentResults.length === 0 ? (
              <div
                className="py-8 text-center text-muted-foreground"
                data-ocid="exams-result-card.empty_state"
              >
                No exam results found for this student.
              </div>
            ) : (
              <>
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Max Marks</TableHead>
                        <TableHead>Obtained</TableHead>
                        <TableHead>%</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Result</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentResults.map((r, idx) => (
                        <TableRow
                          key={r.exam.id}
                          data-ocid={`exams-result-card.row.${idx + 1}`}
                        >
                          <TableCell className="text-muted-foreground text-xs">
                            {idx + 1}
                          </TableCell>
                          <TableCell className="font-medium">
                            {r.exam.subject}
                          </TableCell>
                          <TableCell>{r.exam.maxMarks}</TableCell>
                          <TableCell className="font-semibold">
                            {r.marks}
                          </TableCell>
                          <TableCell>{r.pct}%</TableCell>
                          <TableCell>
                            <Badge
                              className={`text-xs ${
                                r.passed
                                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                  : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                              }`}
                            >
                              {r.grade}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`text-xs ${
                                r.passed
                                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                  : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                              }`}
                            >
                              {r.passed ? "Pass" : "Fail"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {overallStats && (
                  <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">
                        Total Marks
                      </p>
                      <p className="font-bold text-lg font-display">
                        {overallStats.totalMarks}/{overallStats.maxTotal}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">
                        Percentage
                      </p>
                      <p className="font-bold text-lg font-display text-primary">
                        {overallStats.pct}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Result</p>
                      <Badge
                        className={`text-sm ${
                          overallStats.passed
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                        }`}
                      >
                        {overallStats.passed ? "PASS" : "FAIL"}
                      </Badge>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {!studentId && (
        <div
          className="py-12 text-center text-muted-foreground"
          data-ocid="exams-result-card.empty_state"
        >
          Select a student to view their result card.
        </div>
      )}
    </div>
  );
}
