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
import { useStudentExtended } from "../../hooks/useSchoolData";

export default function ReportsParentInfoPage() {
  const { data: students = [] } = useStudents();
  const { data: classes = [] } = useClasses();
  const [studentExtended] = useStudentExtended();
  const [classFilter, setClassFilter] = useState("all");

  const filteredStudents = useMemo(() => {
    if (classFilter === "all") return students;
    const cls = classes.find((c) => c.id.toString() === classFilter);
    return students.filter((s) => s.className === cls?.name);
  }, [students, classes, classFilter]);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">
            Parents Info Report
          </h1>
          <p className="text-sm text-muted-foreground">
            Parent and guardian contact information report
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.print()}
          className="gap-2 no-print"
          data-ocid="reports-parent-info.primary_button"
        >
          <Printer className="w-4 h-4" /> Print
        </Button>
      </div>

      <div className="max-w-xs no-print">
        <Label>Filter by Class</Label>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger data-ocid="reports-parent-info.select">
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

      {filteredStudents.length === 0 ? (
        <div
          className="py-12 text-center text-muted-foreground"
          data-ocid="reports-parent-info.empty_state"
        >
          No students found.
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Father Name</TableHead>
                <TableHead>Father Mobile</TableHead>
                <TableHead>Mother Name</TableHead>
                <TableHead>Mother Mobile</TableHead>
                <TableHead>Guardian</TableHead>
                <TableHead>Guardian Mobile</TableHead>
                <TableHead>Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((s, idx) => {
                const ext = studentExtended[s.id.toString()];
                return (
                  <TableRow
                    key={s.id.toString()}
                    data-ocid={`reports-parent-info.row.${idx + 1}`}
                  >
                    <TableCell className="text-muted-foreground text-xs">
                      {idx + 1}
                    </TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {s.className}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {ext?.fatherName || "-"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {ext?.fatherMobile || "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {ext?.motherName || "-"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {ext?.motherMobile || "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {s.guardianName || "-"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {s.guardianContact || "-"}
                    </TableCell>
                    <TableCell
                      className="text-sm text-muted-foreground max-w-[200px] truncate"
                      title={ext?.address}
                    >
                      {ext?.address || "-"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
