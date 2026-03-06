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
import { useMemo, useState } from "react";
import { useClasses, useStudents } from "../../hooks/useQueries";
import { useExams } from "../../hooks/useSchoolData";

export default function ExamsResultSheetPage() {
  const { data: students = [] } = useStudents();
  const { data: classes = [] } = useClasses();
  const [exams] = useExams();
  const [classFilter, setClassFilter] = useState("");

  const selectedClass = classes.find((c) => c.id.toString() === classFilter);

  const classExams = useMemo(() => {
    if (!selectedClass) return [];
    return exams.filter(
      (e) => e.type === "exam" && e.className === selectedClass.name,
    );
  }, [exams, selectedClass]);

  const classStudents = useMemo(() => {
    if (!selectedClass) return [];
    return students.filter((s) => s.className === selectedClass.name);
  }, [students, selectedClass]);

  const resultData = useMemo(() => {
    return classStudents.map((student) => {
      const results = classExams.map((exam) => {
        const marks = exam.marks[student.id.toString()];
        return { exam, marks: marks !== undefined ? Number(marks) : null };
      });
      const validResults = results.filter((r) => r.marks !== null);
      const totalObtained = validResults.reduce(
        (a, r) => a + (r.marks ?? 0),
        0,
      );
      const totalMax = validResults.reduce((a, r) => a + r.exam.maxMarks, 0);
      const pct =
        totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : null;
      return { student, results, totalObtained, totalMax, pct };
    });
  }, [classStudents, classExams]);

  // Rank students
  const ranked = useMemo(() => {
    return [...resultData]
      .sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0))
      .map((row, idx) => ({ ...row, rank: idx + 1 }));
  }, [resultData]);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Result Sheet</h1>
          <p className="text-sm text-muted-foreground">
            Class-wise result sheet showing all students and subjects
          </p>
        </div>
        {classFilter && (
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="gap-2 no-print"
            data-ocid="exams-result-sheet.primary_button"
          >
            <Printer className="w-4 h-4" /> Print Sheet
          </Button>
        )}
      </div>

      <div className="max-w-xs no-print">
        <Label>Select Class</Label>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger data-ocid="exams-result-sheet.select">
            <SelectValue placeholder="Select class..." />
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

      {classFilter && classExams.length === 0 && (
        <div
          className="py-8 text-center text-muted-foreground"
          data-ocid="exams-result-sheet.empty_state"
        >
          No exams found for {selectedClass?.name}.
        </div>
      )}

      {classFilter && classExams.length > 0 && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Reg No</TableHead>
                <TableHead>Name</TableHead>
                {classExams.map((e) => (
                  <TableHead key={e.id} className="min-w-[80px]">
                    {e.subject}
                    <span className="block text-[10px] text-muted-foreground font-normal">
                      /{e.maxMarks}
                    </span>
                  </TableHead>
                ))}
                <TableHead>Total</TableHead>
                <TableHead>%</TableHead>
                <TableHead>Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ranked.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={classExams.length + 6}
                    className="text-center text-muted-foreground py-8"
                    data-ocid="exams-result-sheet.empty_state"
                  >
                    No students in this class.
                  </TableCell>
                </TableRow>
              ) : (
                ranked.map((row, idx) => {
                  const allPassed = row.results
                    .filter((r) => r.marks !== null)
                    .every(
                      (r) =>
                        r.marks !== null && r.marks >= r.exam.maxMarks * 0.35,
                    );
                  return (
                    <TableRow
                      key={row.student.id.toString()}
                      data-ocid={`exams-result-sheet.row.${idx + 1}`}
                    >
                      <TableCell className="font-bold text-primary">
                        {row.rank}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {row.student.registrationNo || "-"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {row.student.name}
                      </TableCell>
                      {row.results.map((r) => (
                        <TableCell key={r.exam.id} className="text-center">
                          {r.marks !== null ? (
                            <span
                              className={
                                r.marks >= r.exam.maxMarks * 0.35
                                  ? "text-foreground"
                                  : "text-rose-400 font-semibold"
                              }
                            >
                              {r.marks}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="font-semibold">
                        {row.totalObtained}/{row.totalMax}
                      </TableCell>
                      <TableCell>
                        {row.pct !== null ? (
                          <span className="font-semibold">{row.pct}%</span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`text-xs ${
                            allPassed
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                          }`}
                        >
                          {allPassed ? "Pass" : "Fail"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {!classFilter && (
        <div
          className="py-12 text-center text-muted-foreground"
          data-ocid="exams-result-sheet.empty_state"
        >
          Select a class to view the result sheet.
        </div>
      )}
    </div>
  );
}
