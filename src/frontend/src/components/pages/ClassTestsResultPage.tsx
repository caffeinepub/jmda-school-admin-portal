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
import { useStudents } from "../../hooks/useQueries";
import { useExams } from "../../hooks/useSchoolData";

export default function ClassTestsResultPage() {
  const [exams] = useExams();
  const { data: students = [] } = useStudents();
  const [selectedExamId, setSelectedExamId] = useState("");

  const classTests = exams.filter((e) => e.type === "class_test");
  const selectedTest = classTests.find((e) => e.id === selectedExamId);

  const resultData = useMemo(() => {
    if (!selectedTest) return [];
    const studentsInClass = students.filter(
      (s) => s.className === selectedTest.className,
    );
    return studentsInClass
      .map((s) => {
        const marks = selectedTest.marks[s.id.toString()];
        const obtained = marks !== undefined ? Number(marks) : null;
        const pct =
          obtained !== null
            ? Math.round((obtained / selectedTest.maxMarks) * 100)
            : null;
        const passed = pct !== null && pct >= 35;
        return { student: s, obtained, pct, passed };
      })
      .sort((a, b) => (b.obtained ?? -1) - (a.obtained ?? -1))
      .map((row, idx) => ({
        ...row,
        rank: row.obtained !== null ? idx + 1 : null,
      }));
  }, [selectedTest, students]);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Test Result</h1>
          <p className="text-sm text-muted-foreground">
            Class test results with ranking
          </p>
        </div>
        {selectedTest && resultData.length > 0 && (
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="gap-2 no-print"
            data-ocid="classtests-result.primary_button"
          >
            <Printer className="w-4 h-4" /> Print Result
          </Button>
        )}
      </div>

      <div className="max-w-sm">
        <Label>Select Class Test</Label>
        <Select value={selectedExamId} onValueChange={setSelectedExamId}>
          <SelectTrigger data-ocid="classtests-result.select">
            <SelectValue placeholder="Select test..." />
          </SelectTrigger>
          <SelectContent>
            {classTests.length === 0 ? (
              <SelectItem value="none" disabled>
                No class tests found
              </SelectItem>
            ) : (
              classTests.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name} {e.className ? `(${e.className})` : ""}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {selectedTest && (
        <div className="flex items-center gap-3 flex-wrap">
          <Badge className="bg-primary/20 text-primary border-primary/30">
            {selectedTest.name}
          </Badge>
          <Badge variant="secondary">{selectedTest.className}</Badge>
          <Badge variant="secondary">{selectedTest.subject}</Badge>
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
            Max: {selectedTest.maxMarks}
          </Badge>
        </div>
      )}

      {selectedTest && resultData.length === 0 && (
        <div
          className="py-8 text-center text-muted-foreground"
          data-ocid="classtests-result.empty_state"
        >
          No students in {selectedTest.className}.
        </div>
      )}

      {selectedTest && resultData.length > 0 && (
        <div className="rounded-lg border border-border overflow-x-auto max-w-2xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Reg No</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Marks Obtained</TableHead>
                <TableHead>Max Marks</TableHead>
                <TableHead>%</TableHead>
                <TableHead>Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resultData.map((row, idx) => (
                <TableRow
                  key={row.student.id.toString()}
                  data-ocid={`classtests-result.row.${idx + 1}`}
                >
                  <TableCell className="font-bold text-primary">
                    {row.rank ?? "—"}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {row.student.registrationNo || "-"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {row.student.name}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {row.obtained !== null ? row.obtained : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {selectedTest.maxMarks}
                  </TableCell>
                  <TableCell>
                    {row.pct !== null ? `${row.pct}%` : "—"}
                  </TableCell>
                  <TableCell>
                    {row.obtained !== null ? (
                      <Badge
                        className={`text-xs ${
                          row.passed
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                        }`}
                      >
                        {row.passed ? "Pass" : "Fail"}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Absent
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {!selectedExamId && (
        <div
          className="py-12 text-center text-muted-foreground"
          data-ocid="classtests-result.empty_state"
        >
          {classTests.length === 0
            ? "No class tests found."
            : "Select a class test to view results."}
        </div>
      )}
    </div>
  );
}
