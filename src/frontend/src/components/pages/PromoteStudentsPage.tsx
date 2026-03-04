import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useClasses,
  useStudents,
  useUpdateStudent,
} from "../../hooks/useQueries";

export default function PromoteStudentsPage() {
  const { data: classes = [] } = useClasses();
  const { data: students = [] } = useStudents();
  const updateStudent = useUpdateStudent();
  const [fromClassId, setFromClassId] = useState("");
  const [toClassId, setToClassId] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const fromClass = classes.find((c) => c.id.toString() === fromClassId);
  const toClass = classes.find((c) => c.id.toString() === toClassId);

  const studentsInClass = useMemo(() => {
    if (!fromClass) return [];
    return students.filter((s) => s.className === fromClass.name);
  }, [students, fromClass]);

  const toggleAll = () => {
    if (selected.size === studentsInClass.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(studentsInClass.map((s) => s.id.toString())));
    }
  };

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handlePromote = async () => {
    if (!toClass) {
      toast.error("Please select target class.");
      return;
    }
    if (selected.size === 0) {
      toast.error("Please select at least one student.");
      return;
    }

    const toPromote = studentsInClass.filter((s) =>
      selected.has(s.id.toString()),
    );
    try {
      await Promise.all(
        toPromote.map((s) =>
          updateStudent.mutateAsync({
            id: s.id,
            registrationNo: s.registrationNo,
            name: s.name,
            gradeLevel: toClass.gradeLevel,
            guardianContact: s.guardianContact,
            guardianName: s.guardianName,
            className: toClass.name,
          }),
        ),
      );
      toast.success(`${selected.size} student(s) promoted to ${toClass.name}!`);
      setSelected(new Set());
      setFromClassId("");
      setToClassId("");
    } catch {
      toast.error("Failed to promote students.");
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-2xl">
      <div>
        <h1 className="text-2xl font-display font-bold">Promote Students</h1>
        <p className="text-sm text-muted-foreground">
          Move students from one class to another
        </p>
      </div>

      <Card className="border-border">
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>From Class</Label>
            <Select
              value={fromClassId}
              onValueChange={(v) => {
                setFromClassId(v);
                setSelected(new Set());
              }}
            >
              <SelectTrigger data-ocid="promote.select">
                <SelectValue placeholder="Select source class..." />
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
            <Label>To Class</Label>
            <Select value={toClassId} onValueChange={setToClassId}>
              <SelectTrigger data-ocid="promote.select">
                <SelectValue placeholder="Select target class..." />
              </SelectTrigger>
              <SelectContent>
                {classes
                  .filter((c) => c.id.toString() !== fromClassId)
                  .map((c) => (
                    <SelectItem key={c.id.toString()} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {fromClass && (
        <>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={
                        selected.size === studentsInClass.length &&
                        studentsInClass.length > 0
                      }
                      onCheckedChange={toggleAll}
                      data-ocid="promote.checkbox"
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Reg No</TableHead>
                  <TableHead>Current Class</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsInClass.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground py-8"
                      data-ocid="promote.empty_state"
                    >
                      No students in this class.
                    </TableCell>
                  </TableRow>
                ) : (
                  studentsInClass.map((s, idx) => (
                    <TableRow
                      key={s.id.toString()}
                      data-ocid={`promote.row.${idx + 1}`}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selected.has(s.id.toString())}
                          onCheckedChange={() => toggle(s.id.toString())}
                          data-ocid={`promote.checkbox.${idx + 1}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {s.registrationNo || "-"}
                      </TableCell>
                      <TableCell>{s.className}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {selected.size} selected
            </p>
            <Button
              onClick={handlePromote}
              disabled={updateStudent.isPending || selected.size === 0}
              data-ocid="promote.primary_button"
            >
              {updateStudent.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Promote Selected to {toClass?.name ?? "..."}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
