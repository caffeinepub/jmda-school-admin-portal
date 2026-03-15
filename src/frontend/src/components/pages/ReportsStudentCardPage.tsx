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

function cleanField(val: string | undefined | null): string {
  if (!val || val.includes("TODO_MIGRATION") || val.trim() === "") return "-";
  return val;
}
import { useMemo, useState } from "react";
import { useClasses, useStudents } from "../../hooks/useQueries";
import { useAttendanceRecords, useExams } from "../../hooks/useSchoolData";

export default function ReportsStudentCardPage() {
  const { data: students = [] } = useStudents();
  const { data: classes = [] } = useClasses();
  const [exams] = useExams();
  const [attendanceRecords] = useAttendanceRecords();
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
          e.className === selectedStudent.className &&
          e.marks[selectedStudent.id.toString()] !== undefined,
      )
      .map((e) => {
        const marks = Number(e.marks[selectedStudent.id.toString()] ?? 0);
        const pct = Math.round((marks / e.maxMarks) * 100);
        return { exam: e, marks, pct };
      });
  }, [exams, selectedStudent]);

  const attendanceStats = useMemo(() => {
    if (!selectedStudent) return null;
    const studentClass = classes.find(
      (c) => c.name === selectedStudent.className,
    );
    if (!studentClass) return null;
    let present = 0;
    let total = 0;
    for (const r of attendanceRecords) {
      if (r.classId !== studentClass.id.toString()) continue;
      const status = r.records[selectedStudent.id.toString()];
      if (status) {
        total++;
        if (status === "present") present++;
      }
    }
    return {
      present,
      total,
      pct: total > 0 ? Math.round((present / total) * 100) : null,
    };
  }, [selectedStudent, classes, attendanceRecords]);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">
            Students Report Card
          </h1>
          <p className="text-sm text-muted-foreground">
            Academic performance and attendance report
          </p>
        </div>
        {selectedStudent && (
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="gap-2 no-print"
            data-ocid="reports-student-card.primary_button"
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
              data-ocid="reports-student-card.select"
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
              data-ocid="reports-student-card.select"
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
                Student Report Card
              </h2>
              <p className="text-sm text-muted-foreground">
                Academic Year: 2025-26
              </p>
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
                  {cleanField(selectedStudent.registrationNo)}
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
                <span>{cleanField(selectedStudent.guardianName)}</span>
              </div>
            </div>

            {attendanceStats && (
              <div className="rounded-lg bg-muted/30 p-3 grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Days Present</p>
                  <p className="font-bold text-emerald-400">
                    {attendanceStats.present}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Days</p>
                  <p className="font-bold">{attendanceStats.total}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Attendance</p>
                  <p
                    className={`font-bold ${(attendanceStats.pct ?? 0) >= 75 ? "text-emerald-400" : "text-rose-400"}`}
                  >
                    {attendanceStats.pct !== null
                      ? `${attendanceStats.pct}%`
                      : "N/A"}
                  </p>
                </div>
              </div>
            )}

            {studentResults.length === 0 ? (
              <div
                className="py-6 text-center text-muted-foreground text-sm"
                data-ocid="reports-student-card.empty_state"
              >
                No exam results available.
              </div>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject / Exam</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Max Marks</TableHead>
                      <TableHead>Obtained</TableHead>
                      <TableHead>%</TableHead>
                      <TableHead>Result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentResults.map((r, idx) => (
                      <TableRow
                        key={r.exam.id}
                        data-ocid={`reports-student-card.row.${idx + 1}`}
                      >
                        <TableCell className="font-medium">
                          {r.exam.subject}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {r.exam.type === "exam" ? "Exam" : "Class Test"}
                          </Badge>
                        </TableCell>
                        <TableCell>{r.exam.maxMarks}</TableCell>
                        <TableCell className="font-semibold">
                          {r.marks}
                        </TableCell>
                        <TableCell>{r.pct}%</TableCell>
                        <TableCell>
                          <Badge
                            className={`text-xs ${
                              r.pct >= 35
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                            }`}
                          >
                            {r.pct >= 35 ? "Pass" : "Fail"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!studentId && (
        <div
          className="py-12 text-center text-muted-foreground"
          data-ocid="reports-student-card.empty_state"
        >
          Select a student to view their report card.
        </div>
      )}
    </div>
  );
}
