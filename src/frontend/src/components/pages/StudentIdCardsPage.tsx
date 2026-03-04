import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GraduationCap, Printer } from "lucide-react";
import { useMemo, useState } from "react";
import type { Student } from "../../backend.d";
import { useClasses, useStudents } from "../../hooks/useQueries";
import { useStudentExtended } from "../../hooks/useSchoolData";

function IdCard({
  student,
  ext,
}: { student: Student; ext: Record<string, unknown> | null }) {
  return (
    <div className="w-64 border-2 border-primary rounded-xl overflow-hidden bg-card shadow-card">
      <div className="bg-primary px-3 py-2 text-center">
        <p className="text-xs font-bold text-primary-foreground">JMDA SCHOOL</p>
        <p className="text-[10px] text-primary-foreground/80">
          Student Identity Card
        </p>
      </div>
      <div className="p-3 flex gap-3">
        <div className="w-14 h-16 rounded-lg bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0">
          {(ext as { picture?: string })?.picture ? (
            <img
              src={(ext as { picture?: string }).picture}
              alt={student.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <GraduationCap className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-foreground truncate">
            {student.name}
          </p>
          <p className="text-xs text-muted-foreground">
            Class: {student.className}
          </p>
          <p className="text-xs text-muted-foreground">
            Reg: {student.registrationNo || "-"}
          </p>
          <p className="text-xs text-muted-foreground">
            DOB:{" "}
            {(ext as { dateOfBirth?: string })?.dateOfBirth
              ? new Date(
                  (ext as { dateOfBirth: string }).dateOfBirth,
                ).toLocaleDateString("en-IN")
              : "-"}
          </p>
        </div>
      </div>
      <div className="border-t border-border px-3 py-2">
        <p className="text-[10px] text-muted-foreground">
          Guardian: {student.guardianName}
        </p>
        <p className="text-[10px] text-muted-foreground">
          Contact: {student.guardianContact}
        </p>
      </div>
    </div>
  );
}

export default function StudentIdCardsPage() {
  const { data: students = [] } = useStudents();
  const { data: classes = [] } = useClasses();
  const [extendedData] = useStudentExtended();
  const [selectedClassId, setSelectedClassId] = useState("all");

  const filteredStudents = useMemo(() => {
    if (selectedClassId === "all") return students;
    const cls = classes.find((c) => c.id.toString() === selectedClassId);
    if (!cls) return [];
    return students.filter((s) => s.className === cls.name);
  }, [students, classes, selectedClassId]);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between gap-4 no-print">
        <h1 className="text-2xl font-display font-bold">Student ID Cards</h1>
        {filteredStudents.length > 0 && (
          <Button
            onClick={() => window.print()}
            className="gap-2"
            data-ocid="id_cards.primary_button"
          >
            <Printer className="w-4 h-4" /> Print Cards
          </Button>
        )}
      </div>

      <div className="max-w-xs no-print">
        <Label>Filter by Class</Label>
        <Select value={selectedClassId} onValueChange={setSelectedClassId}>
          <SelectTrigger data-ocid="id_cards.select">
            <SelectValue placeholder="All Classes" />
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
          className="py-16 text-center text-muted-foreground"
          data-ocid="id_cards.empty_state"
        >
          No students found.
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          {filteredStudents.map((s, idx) => (
            <div key={s.id.toString()} data-ocid={`id_cards.item.${idx + 1}`}>
              <IdCard
                student={s}
                ext={
                  (extendedData[s.id.toString()] as unknown as Record<
                    string,
                    unknown
                  >) ?? null
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
