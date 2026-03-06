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
import { Printer } from "lucide-react";
import { useMemo, useState } from "react";
import { useClasses, useTeachers } from "../../hooks/useQueries";
import { useTimetable } from "../../hooks/useSchoolData";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function TimetableForTeacherPage() {
  const { data: teachers = [] } = useTeachers();
  const { data: classes = [] } = useClasses();
  const [timetable] = useTimetable();
  const [teacherName, setTeacherName] = useState("");

  const teacherPeriods = useMemo(() => {
    if (!teacherName) return [];
    return timetable.filter((p) => p.teacher === teacherName);
  }, [timetable, teacherName]);

  const getCellPeriod = (day: string, period: number) => {
    return teacherPeriods.find(
      (p) => p.day === day && p.periodNumber === period,
    );
  };

  const getClassName = (classId: string) => {
    return classes.find((c) => c.id.toString() === classId)?.name ?? classId;
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">
            Generate For Teacher
          </h1>
          <p className="text-sm text-muted-foreground">
            View teacher's assigned periods across all classes
          </p>
        </div>
        {teacherName && (
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="gap-2 no-print"
            data-ocid="timetable-for-teacher.primary_button"
          >
            <Printer className="w-4 h-4" /> Print Timetable
          </Button>
        )}
      </div>

      <div className="max-w-xs no-print">
        <Label>Select Teacher</Label>
        <Select value={teacherName} onValueChange={setTeacherName}>
          <SelectTrigger data-ocid="timetable-for-teacher.select">
            <SelectValue placeholder="Select teacher..." />
          </SelectTrigger>
          <SelectContent>
            {teachers.map((t) => (
              <SelectItem key={t.id.toString()} value={t.name}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {teacherName && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="border border-border p-2 bg-muted/30 text-left font-semibold text-xs">
                    Period
                  </th>
                  {DAYS.map((d) => (
                    <th
                      key={d}
                      className="border border-border p-2 bg-muted/30 text-center font-semibold text-xs min-w-[130px]"
                    >
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map((period) => (
                  <tr key={period}>
                    <td className="border border-border p-2 text-center text-xs font-bold text-muted-foreground bg-muted/10 w-16">
                      P{period}
                    </td>
                    {DAYS.map((day) => {
                      const cell = getCellPeriod(day, period);
                      return (
                        <td
                          key={day}
                          className="border border-border p-2 align-top"
                        >
                          {cell ? (
                            <div className="rounded bg-primary/10 border border-primary/20 p-1.5">
                              <p className="font-medium text-xs text-foreground">
                                {cell.subject}
                              </p>
                              <Badge
                                variant="secondary"
                                className="text-[10px] mt-0.5"
                              >
                                {getClassName(cell.classId)}
                              </Badge>
                              {cell.time && (
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                  {cell.time}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">
                              —
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {teacherPeriods.length === 0 && (
            <div
              className="py-8 text-center text-muted-foreground"
              data-ocid="timetable-for-teacher.empty_state"
            >
              No periods assigned to {teacherName} yet.
            </div>
          )}
        </>
      )}

      {!teacherName && (
        <div
          className="py-16 text-center text-muted-foreground"
          data-ocid="timetable-for-teacher.empty_state"
        >
          Select a teacher to view their timetable.
        </div>
      )}
    </div>
  );
}
