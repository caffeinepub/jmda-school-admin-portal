import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useStudents } from "../../hooks/useQueries";
import { useExams } from "../../hooks/useSchoolData";

export default function ClassTestsMarksPage() {
  const [exams, setExams] = useExams();
  const { data: students = [] } = useStudents();
  const [selectedExamId, setSelectedExamId] = useState("");
  const [marksInput, setMarksInput] = useState<Record<string, number>>({});

  const classTests = exams.filter((e) => e.type === "class_test");

  const selectedExam = classTests.find((e) => e.id === selectedExamId);

  const studentsForExam = useMemo(() => {
    if (!selectedExam) return [];
    return students.filter((s) => s.className === selectedExam.className);
  }, [students, selectedExam]);

  const handleSelectTest = (testId: string) => {
    setSelectedExamId(testId);
    const test = classTests.find((e) => e.id === testId);
    setMarksInput(
      Object.fromEntries(
        Object.entries(test?.marks ?? {}).map(([k, v]) => [k, Number(v)]),
      ),
    );
  };

  const saveMarks = () => {
    setExams((prev) =>
      prev.map((e) =>
        e.id === selectedExamId ? { ...e, marks: marksInput } : e,
      ),
    );
    toast.success("Marks saved!");
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-display font-bold">Manage Test Marks</h1>
        <p className="text-sm text-muted-foreground">
          Enter marks for class tests
        </p>
      </div>

      <div className="max-w-sm">
        <Label>Select Class Test</Label>
        <Select value={selectedExamId} onValueChange={handleSelectTest}>
          <SelectTrigger data-ocid="classtests-marks.select">
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

      {selectedExam && (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <Badge className="bg-primary/20 text-primary border-primary/30">
              {selectedExam.name}
            </Badge>
            <Badge variant="secondary">{selectedExam.className}</Badge>
            <Badge variant="secondary">{selectedExam.subject}</Badge>
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
              Max: {selectedExam.maxMarks}
            </Badge>
          </div>

          {studentsForExam.length === 0 ? (
            <div
              className="py-8 text-center text-muted-foreground"
              data-ocid="classtests-marks.empty_state"
            >
              No students in {selectedExam.className}.
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden max-w-2xl">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Reg No</TableHead>
                    <TableHead>Marks (/{selectedExam.maxMarks})</TableHead>
                    <TableHead>%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentsForExam.map((s, idx) => {
                    const mark = marksInput[s.id.toString()];
                    const pct =
                      mark !== undefined
                        ? Math.round((mark / selectedExam.maxMarks) * 100)
                        : null;
                    return (
                      <TableRow
                        key={s.id.toString()}
                        data-ocid={`classtests-marks.row.${idx + 1}`}
                      >
                        <TableCell className="text-muted-foreground text-xs">
                          {idx + 1}
                        </TableCell>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {s.registrationNo || "-"}
                        </TableCell>
                        <TableCell className="w-32">
                          <Input
                            type="number"
                            min={0}
                            max={selectedExam.maxMarks}
                            value={marksInput[s.id.toString()] ?? ""}
                            onChange={(e) =>
                              setMarksInput((prev) => ({
                                ...prev,
                                [s.id.toString()]: Number(e.target.value),
                              }))
                            }
                            className="h-8 text-sm"
                            data-ocid={`classtests-marks.input.${idx + 1}`}
                          />
                        </TableCell>
                        <TableCell>
                          {pct !== null ? (
                            <Badge
                              className={`text-xs ${
                                pct >= 35
                                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                  : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                              }`}
                            >
                              {pct}%
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={saveMarks}
              data-ocid="classtests-marks.save_button"
            >
              Save Marks
            </Button>
          </div>
        </>
      )}

      {!selectedExamId && (
        <div
          className="py-12 text-center text-muted-foreground"
          data-ocid="classtests-marks.empty_state"
        >
          {classTests.length === 0
            ? "No class tests found. Create class tests from the Exams section."
            : "Select a class test to enter marks."}
        </div>
      )}
    </div>
  );
}
