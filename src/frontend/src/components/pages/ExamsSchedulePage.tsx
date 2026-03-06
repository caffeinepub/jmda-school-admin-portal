import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useClasses } from "../../hooks/useQueries";
import { useExams } from "../../hooks/useSchoolData";

export default function ExamsSchedulePage() {
  const { data: classes = [] } = useClasses();
  const [exams] = useExams();
  const [classFilter, setClassFilter] = useState("all");

  const filteredExams = useMemo(() => {
    const filtered =
      classFilter === "all"
        ? exams
        : exams.filter((e) => {
            const cls = classes.find((c) => c.id.toString() === classFilter);
            return cls && e.className === cls.name;
          });
    return filtered
      .filter((e) => e.type === "exam")
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [exams, classFilter, classes]);

  const today = new Date().toISOString().split("T")[0];

  const upcomingExams = filteredExams.filter((e) => e.date >= today);
  const pastExams = filteredExams.filter((e) => e.date < today);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-display font-bold">Exam Schedule</h1>
        <p className="text-sm text-muted-foreground">
          Upcoming and past exam schedule
        </p>
      </div>

      <div className="max-w-xs no-print">
        <Label>Filter by Class</Label>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger data-ocid="exams-schedule.select">
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

      {upcomingExams.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            Upcoming Exams
            <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
              {upcomingExams.length}
            </Badge>
          </h2>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Exam Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Max Marks</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingExams.map((e, idx) => {
                  const daysLeft = Math.ceil(
                    (new Date(e.date).getTime() - new Date(today).getTime()) /
                      (1000 * 60 * 60 * 24),
                  );
                  return (
                    <TableRow
                      key={e.id}
                      data-ocid={`exams-schedule.row.${idx + 1}`}
                    >
                      <TableCell className="text-muted-foreground text-xs">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="font-medium">{e.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {e.className || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {e.subject || "-"}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {e.date || "-"}
                      </TableCell>
                      <TableCell>{e.maxMarks}</TableCell>
                      <TableCell>
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                          {daysLeft === 0
                            ? "Today"
                            : daysLeft === 1
                              ? "Tomorrow"
                              : `${daysLeft} days`}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {pastExams.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            Past Exams
            <Badge variant="secondary" className="text-xs">
              {pastExams.length}
            </Badge>
          </h2>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Exam Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Max Marks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastExams.map((e, idx) => (
                  <TableRow
                    key={e.id}
                    data-ocid={`exams-schedule.row.${idx + 1}`}
                    className="opacity-70"
                  >
                    <TableCell className="text-muted-foreground text-xs">
                      {idx + 1}
                    </TableCell>
                    <TableCell className="font-medium">{e.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {e.className || "-"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {e.subject || "-"}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {e.date || "-"}
                    </TableCell>
                    <TableCell>{e.maxMarks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {filteredExams.length === 0 && (
        <div
          className="py-12 text-center text-muted-foreground"
          data-ocid="exams-schedule.empty_state"
        >
          No exams scheduled.
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-normal">
              Total Exams
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl font-display font-bold">
              {filteredExams.length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-normal">
              Upcoming
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl font-display font-bold text-amber-400">
              {upcomingExams.length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-normal">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl font-display font-bold text-emerald-400">
              {pastExams.length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-normal">
              Classes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl font-display font-bold">
              {new Set(filteredExams.map((e) => e.className)).size}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
