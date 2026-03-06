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

export default function ExamsBlankAwardPage() {
  const { data: classes = [] } = useClasses();
  const { data: students = [] } = useStudents();
  const [exams] = useExams();
  const [classFilter, setClassFilter] = useState("");
  const [examId, setExamId] = useState("");

  const selectedClass = classes.find((c) => c.id.toString() === classFilter);
  const selectedExam = exams.find((e) => e.id === examId);

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

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Blank Award List</h1>
          <p className="text-sm text-muted-foreground">
            Printable blank marks entry list for invigilators
          </p>
        </div>
        {examId && classStudents.length > 0 && (
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="gap-2 no-print"
            data-ocid="exams-blank-award.primary_button"
          >
            <Printer className="w-4 h-4" /> Print Award List
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-4 no-print">
        <div>
          <Label className="text-xs">Class</Label>
          <Select
            value={classFilter}
            onValueChange={(v) => {
              setClassFilter(v);
              setExamId("");
            }}
          >
            <SelectTrigger
              className="w-40"
              data-ocid="exams-blank-award.select"
            >
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
        {classFilter && (
          <div>
            <Label className="text-xs">Exam</Label>
            <Select value={examId} onValueChange={setExamId}>
              <SelectTrigger
                className="w-60"
                data-ocid="exams-blank-award.select"
              >
                <SelectValue placeholder="Select exam..." />
              </SelectTrigger>
              <SelectContent>
                {classExams.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {examId && selectedExam && selectedClass && (
        <Card className="border-border max-w-2xl">
          <CardHeader className="pb-3 border-b border-border">
            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                JMDA School Admin Portal
              </p>
              <h2 className="text-xl font-display font-bold">
                Blank Award List
              </h2>
              <p className="text-sm text-muted-foreground">
                {selectedExam.name} · {selectedClass.name} ·{" "}
                {selectedExam.subject}
              </p>
              <p className="text-sm">Max Marks: {selectedExam.maxMarks}</p>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {classStudents.length === 0 ? (
              <div
                className="py-8 text-center text-muted-foreground"
                data-ocid="exams-blank-award.empty_state"
              >
                No students in {selectedClass.name}.
              </div>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Reg No</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead className="w-32">
                        Marks (/{selectedExam.maxMarks})
                      </TableHead>
                      <TableHead className="w-24">Signature</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classStudents.map((s, idx) => (
                      <TableRow
                        key={s.id.toString()}
                        data-ocid={`exams-blank-award.row.${idx + 1}`}
                      >
                        <TableCell className="text-muted-foreground text-xs">
                          {idx + 1}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {s.registrationNo || "-"}
                        </TableCell>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell>
                          <div className="h-7 border-b border-dashed border-border" />
                        </TableCell>
                        <TableCell>
                          <div className="h-7 border-b border-dashed border-border" />
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

      {!examId && (
        <div
          className="py-12 text-center text-muted-foreground"
          data-ocid="exams-blank-award.empty_state"
        >
          Select a class and exam to generate a blank award list.
        </div>
      )}
    </div>
  );
}
