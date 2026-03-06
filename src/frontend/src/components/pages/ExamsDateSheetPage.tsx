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
import { useClasses } from "../../hooks/useQueries";
import { useExams } from "../../hooks/useSchoolData";

export default function ExamsDateSheetPage() {
  const { data: classes = [] } = useClasses();
  const [exams] = useExams();
  const [classFilter, setClassFilter] = useState("");

  const selectedClass = classes.find((c) => c.id.toString() === classFilter);

  const dateSheetExams = useMemo(() => {
    if (!selectedClass) return [];
    return exams
      .filter(
        (e) =>
          e.type === "exam" && e.className === selectedClass.name && e.date,
      )
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [exams, selectedClass]);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Date Sheet</h1>
          <p className="text-sm text-muted-foreground">
            Printable exam date sheet for a class
          </p>
        </div>
        {classFilter && dateSheetExams.length > 0 && (
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="gap-2 no-print"
            data-ocid="exams-datesheet.primary_button"
          >
            <Printer className="w-4 h-4" /> Print Date Sheet
          </Button>
        )}
      </div>

      <div className="max-w-xs no-print">
        <Label>Select Class</Label>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger data-ocid="exams-datesheet.select">
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

      {classFilter && selectedClass && (
        <Card className="border-border max-w-2xl">
          <CardHeader className="pb-3 border-b border-border">
            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                JMDA School Admin Portal
              </p>
              <h2 className="text-xl font-display font-bold">
                Examination Date Sheet
              </h2>
              <p className="text-sm text-muted-foreground">
                Class: {selectedClass.name} · Academic Year: 2025-26
              </p>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {dateSheetExams.length === 0 ? (
              <div
                className="py-8 text-center text-muted-foreground"
                data-ocid="exams-datesheet.empty_state"
              >
                No exams with dates found for {selectedClass.name}.
              </div>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Day</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Exam Name</TableHead>
                      <TableHead>Max Marks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dateSheetExams.map((e, idx) => {
                      const dateObj = new Date(e.date);
                      const dayName = dateObj.toLocaleDateString("en-IN", {
                        weekday: "long",
                      });
                      const formatted = dateObj.toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      });
                      return (
                        <TableRow
                          key={e.id}
                          data-ocid={`exams-datesheet.row.${idx + 1}`}
                        >
                          <TableCell className="text-muted-foreground text-xs">
                            {idx + 1}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {formatted}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {dayName}
                          </TableCell>
                          <TableCell className="font-medium">
                            {e.subject || "-"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {e.name}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {e.maxMarks}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!classFilter && (
        <div
          className="py-12 text-center text-muted-foreground"
          data-ocid="exams-datesheet.empty_state"
        >
          Select a class to view the date sheet.
        </div>
      )}
    </div>
  );
}
