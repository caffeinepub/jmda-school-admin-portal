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
import { useClasses } from "../../hooks/useQueries";
import { useTimetable } from "../../hooks/useSchoolData";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function TimetableForClassPage() {
  const { data: classes = [] } = useClasses();
  const [timetable] = useTimetable();
  const [classId, setClassId] = useState("");

  const selectedClass = classes.find((c) => c.id.toString() === classId);

  const periodsForClass = useMemo(() => {
    if (!classId) return [];
    return timetable.filter((p) => p.classId === classId);
  }, [timetable, classId]);

  const getCellPeriod = (day: string, period: number) => {
    return periodsForClass.find(
      (p) => p.day === day && p.periodNumber === period,
    );
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">
            Generate For Class
          </h1>
          <p className="text-sm text-muted-foreground">
            View and print timetable for a specific class
          </p>
        </div>
        {classId && (
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="gap-2 no-print"
            data-ocid="timetable-for-class.primary_button"
          >
            <Printer className="w-4 h-4" /> Print Timetable
          </Button>
        )}
      </div>

      <div className="max-w-xs no-print">
        <Label>Select Class</Label>
        <Select value={classId} onValueChange={setClassId}>
          <SelectTrigger data-ocid="timetable-for-class.select">
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

      {classId && selectedClass && (
        <>
          <div className="print-only hidden print:block mb-4">
            <h2 className="text-lg font-bold">
              Timetable — {selectedClass.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              JMDA School Admin Portal
            </p>
          </div>
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
                      className="border border-border p-2 bg-muted/30 text-center font-semibold text-xs min-w-[120px]"
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
                            <div>
                              <p className="font-medium text-xs text-foreground">
                                {cell.subject}
                              </p>
                              {cell.teacher && (
                                <p className="text-[10px] text-muted-foreground">
                                  {cell.teacher}
                                </p>
                              )}
                              {cell.time && (
                                <p className="text-[10px] text-muted-foreground">
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
        </>
      )}

      {!classId && (
        <div
          className="py-16 text-center text-muted-foreground"
          data-ocid="timetable-for-class.empty_state"
        >
          Select a class to view its timetable.
        </div>
      )}
    </div>
  );
}
