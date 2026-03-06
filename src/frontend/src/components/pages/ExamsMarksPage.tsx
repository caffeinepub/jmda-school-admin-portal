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

export default function ExamsMarksPage() {
  const [exams, setExams] = useExams();
  const { data: students = [] } = useStudents();
  const [selectedExamId, setSelectedExamId] = useState("");
  const [marksInput, setMarksInput] = useState<Record<string, number>>({});
  const [editing, setEditing] = useState(false);

  const selectedExam = exams.find((e) => e.id === selectedExamId);

  const studentsForExam = useMemo(() => {
    if (!selectedExam) return [];
    return students.filter((s) => s.className === selectedExam.className);
  }, [students, selectedExam]);

  const handleSelectExam = (examId: string) => {
    setSelectedExamId(examId);
    const exam = exams.find((e) => e.id === examId);
    setMarksInput(
      Object.fromEntries(
        Object.entries(exam?.marks ?? {}).map(([k, v]) => [k, Number(v)]),
      ),
    );
    setEditing(true);
  };

  const saveMarks = () => {
    setExams((prev) =>
      prev.map((e) =>
        e.id === selectedExamId ? { ...e, marks: marksInput } : e,
      ),
    );
    toast.success("Marks saved!");
    setEditing(false);
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-display font-bold">Marks</h1>
        <p className="text-sm text-muted-foreground">
          Enter marks for students in an exam
        </p>
      </div>

      <div className="max-w-sm">
        <Label>Select Exam</Label>
        <Select value={selectedExamId} onValueChange={handleSelectExam}>
          <SelectTrigger data-ocid="exams-marks.select">
            <SelectValue placeholder="Select exam..." />
          </SelectTrigger>
          <SelectContent>
            {exams.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.name} {e.className ? `(${e.className})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedExam && editing && (
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
              data-ocid="exams-marks.empty_state"
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
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentsForExam.map((s, idx) => {
                    const mark = marksInput[s.id.toString()];
                    const passed =
                      mark !== undefined &&
                      mark >= selectedExam.maxMarks * 0.35;
                    return (
                      <TableRow
                        key={s.id.toString()}
                        data-ocid={`exams-marks.row.${idx + 1}`}
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
                            data-ocid={`exams-marks.input.${idx + 1}`}
                          />
                        </TableCell>
                        <TableCell>
                          {mark !== undefined ? (
                            <Badge
                              className={`text-xs ${
                                passed
                                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                  : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                              }`}
                            >
                              {passed ? "Pass" : "Fail"}
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
            <Button onClick={saveMarks} data-ocid="exams-marks.save_button">
              Save Marks
            </Button>
          </div>
        </>
      )}

      {!selectedExamId && (
        <div
          className="py-12 text-center text-muted-foreground"
          data-ocid="exams-marks.empty_state"
        >
          Select an exam to enter marks.
        </div>
      )}
    </div>
  );
}
