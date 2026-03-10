import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Printer, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { useClasses, useStudents } from "../../hooks/useQueries";
import {
  useAttendanceRecords,
  useExams,
  useStudentExtended,
} from "../../hooks/useSchoolData";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getGrade(pct: number): string {
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B+";
  if (pct >= 60) return "B";
  if (pct >= 50) return "C";
  if (pct >= 35) return "D";
  return "F";
}

function getStatus(pct: number): string {
  if (pct >= 90) return "BEST";
  if (pct >= 80) return "Excellent";
  if (pct >= 70) return "Very Good";
  if (pct >= 60) return "Good";
  if (pct >= 50) return "Average";
  if (pct >= 35) return "Pass";
  return "Fail";
}

interface ReportExtras {
  affectiveRating: number;
  affectiveScore: number;
  psychomotorRating: number;
  psychomotorScore: number;
  comments: string;
}

// ── StarRating ───────────────────────────────────────────────────────────────

function StarRating({
  value,
  onChange,
  readOnly,
}: {
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i <= value ? "fill-yellow-500 text-yellow-500" : "text-gray-300"
          } ${!readOnly ? "cursor-pointer hover:fill-yellow-400 hover:text-yellow-400" : ""}`}
          onClick={() => !readOnly && onChange?.(i)}
        />
      ))}
    </div>
  );
}

// ── ProgressiveReportCardPage ────────────────────────────────────────────────

export default function ProgressiveReportCardPage() {
  const { data: students = [] } = useStudents();
  const { data: classes = [] } = useClasses();
  const [exams] = useExams();
  const [attendanceRecords] = useAttendanceRecords();
  const [studentExtended] = useStudentExtended();
  const [reportExtras, setReportExtras] = useLocalStorage<
    Record<string, ReportExtras>
  >("jmda_report_extras", {});

  const [classFilter, setClassFilter] = useState("");
  const [studentId, setStudentId] = useState("");
  const [session, setSession] = useState("2025-26");
  const [editMode, setEditMode] = useState(false);
  const [draftExtras, setDraftExtras] = useState<ReportExtras>({
    affectiveRating: 0,
    affectiveScore: 0,
    psychomotorRating: 0,
    psychomotorScore: 0,
    comments: "",
  });

  const studentsInClass = useMemo(() => {
    if (!classFilter) return students;
    const cls = classes.find((c) => c.id.toString() === classFilter);
    return students.filter((s) => s.className === cls?.name);
  }, [students, classes, classFilter]);

  const selectedStudent = students.find((s) => s.id.toString() === studentId);
  const ext = selectedStudent
    ? studentExtended[selectedStudent.id.toString()]
    : null;
  const extras: ReportExtras = selectedStudent
    ? (reportExtras[selectedStudent.id.toString()] ?? {
        affectiveRating: 0,
        affectiveScore: 0,
        psychomotorRating: 0,
        psychomotorScore: 0,
        comments: "",
      })
    : {
        affectiveRating: 0,
        affectiveScore: 0,
        psychomotorRating: 0,
        psychomotorScore: 0,
        comments: "",
      };

  // Class exams (type "exam") for the student's class
  const classExams = useMemo(() => {
    if (!selectedStudent) return [];
    return exams.filter(
      (e) => e.type === "exam" && e.className === selectedStudent.className,
    );
  }, [exams, selectedStudent]);

  // Unique subjects
  const subjects = useMemo(() => {
    const seen = new Set<string>();
    const out: Array<{ name: string; maxMarks: number }> = [];
    for (const e of classExams) {
      if (!seen.has(e.subject)) {
        seen.add(e.subject);
        out.push({ name: e.subject, maxMarks: e.maxMarks });
      }
    }
    return out;
  }, [classExams]);

  // Unique exam session names
  const examSessions = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const e of classExams) {
      if (!seen.has(e.name)) {
        seen.add(e.name);
        out.push(e.name);
      }
    }
    return out;
  }, [classExams]);

  // Exam rows: one per session name
  const examRows = useMemo(() => {
    if (!selectedStudent) return [];
    return examSessions.map((name) => {
      const examsInSession = classExams.filter((e) => e.name === name);
      const marksPerSubject: Record<string, { obtained: number; max: number }> =
        {};
      let totalObtained = 0;
      let totalMax = 0;
      for (const e of examsInSession) {
        const obtained = Number(e.marks[selectedStudent.id.toString()] ?? 0);
        marksPerSubject[e.subject] = { obtained, max: e.maxMarks };
        totalObtained += obtained;
        totalMax += e.maxMarks;
      }
      const pct =
        totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
      return {
        name,
        marksPerSubject,
        totalObtained,
        totalMax,
        pct,
        grade: getGrade(pct),
        status: getStatus(pct),
      };
    });
  }, [examSessions, classExams, selectedStudent]);

  // Overall performance
  const overallPerf = useMemo(() => {
    if (examRows.length === 0) return null;
    const marksPerSubject: Record<string, { obtained: number; max: number }> =
      {};
    let totalObtained = 0;
    let totalMax = 0;
    for (const subj of subjects) {
      let obtainedSum = 0;
      let maxSum = 0;
      for (const row of examRows) {
        if (row.marksPerSubject[subj.name]) {
          obtainedSum += row.marksPerSubject[subj.name].obtained;
          maxSum += row.marksPerSubject[subj.name].max;
        }
      }
      marksPerSubject[subj.name] = { obtained: obtainedSum, max: maxSum };
      totalObtained += obtainedSum;
      totalMax += maxSum;
    }
    const pct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
    return {
      marksPerSubject,
      totalObtained,
      totalMax,
      pct,
      grade: getGrade(pct),
      status: getStatus(pct),
    };
  }, [examRows, subjects]);

  // Class tests grouped by subject
  const classTestsBySubject = useMemo(() => {
    if (!selectedStudent) return [];
    const tests = exams.filter(
      (e) =>
        e.type === "class_test" && e.className === selectedStudent.className,
    );
    const bySubject: Record<
      string,
      { totalTests: number; totalMarks: number; obtained: number }
    > = {};
    for (const t of tests) {
      if (!bySubject[t.subject])
        bySubject[t.subject] = { totalTests: 0, totalMarks: 0, obtained: 0 };
      bySubject[t.subject].totalTests++;
      bySubject[t.subject].totalMarks += t.maxMarks;
      bySubject[t.subject].obtained += Number(
        t.marks[selectedStudent.id.toString()] ?? 0,
      );
    }
    // Return rows aligned with subjects, or all subjects with zero
    const refSubjects =
      subjects.length > 0
        ? subjects.map((s) => s.name)
        : Object.keys(bySubject);
    return refSubjects.map((name) => {
      const d = bySubject[name] ?? {
        totalTests: 0,
        totalMarks: 0,
        obtained: 0,
      };
      const avg =
        d.totalMarks > 0 ? Math.round((d.obtained / d.totalMarks) * 100) : 0;
      return { subject: name, ...d, avg };
    });
  }, [exams, selectedStudent, subjects]);

  const classTestTotals = useMemo(() => {
    const totalTests = classTestsBySubject.reduce(
      (a, c) => a + c.totalTests,
      0,
    );
    const totalMarks = classTestsBySubject.reduce(
      (a, c) => a + c.totalMarks,
      0,
    );
    const obtained = classTestsBySubject.reduce((a, c) => a + c.obtained, 0);
    const score =
      totalMarks > 0 ? Math.round((obtained / totalMarks) * 100) : 0;
    return { totalTests, totalMarks, obtained, score };
  }, [classTestsBySubject]);

  // Attendance stats
  const attendanceStats = useMemo(() => {
    if (!selectedStudent) return null;
    const cls = classes.find((c) => c.name === selectedStudent.className);
    if (!cls) return null;
    let present = 0;
    let absent = 0;
    let total = 0;
    for (const r of attendanceRecords) {
      if (r.classId !== cls.id.toString()) continue;
      const status = r.records[selectedStudent.id.toString()];
      if (status) {
        total++;
        if (status === "present") present++;
        if (status === "absent") absent++;
      }
    }
    const leaves = total - present - absent;
    const pct = total > 0 ? Math.round((present / total) * 100) : null;
    return { present, absent, leaves, pct };
  }, [selectedStudent, classes, attendanceRecords]);

  // Class comparison
  const classComparison = useMemo(() => {
    if (!selectedStudent || !overallPerf || classExams.length === 0)
      return null;
    const classStudents = students.filter(
      (s) => s.className === selectedStudent.className,
    );
    const allPcts: number[] = [];
    for (const s of classStudents) {
      let obtained = 0;
      let max = 0;
      for (const e of classExams) {
        obtained += Number(e.marks[s.id.toString()] ?? 0);
        max += e.maxMarks;
      }
      if (max > 0) allPcts.push(Math.round((obtained / max) * 100));
    }
    if (allPcts.length === 0) return null;
    const avg =
      Math.round((allPcts.reduce((a, b) => a + b, 0) / allPcts.length) * 10) /
      10;
    const maxPct = Math.max(...allPcts);
    const minPct = Math.min(...allPcts);
    const sorted = [...allPcts].sort((a, b) => b - a);
    const position = sorted.findIndex((p) => p <= overallPerf.pct) + 1;
    return {
      strength: classStudents.length,
      avg,
      maxPct,
      minPct,
      position: position > 0 ? position : classStudents.length,
    };
  }, [selectedStudent, overallPerf, students, classExams]);

  // Overall star rating
  const overallRating = useMemo(() => {
    if (!overallPerf) return 0;
    if (overallPerf.pct >= 90) return 5;
    if (overallPerf.pct >= 75) return 4;
    if (overallPerf.pct >= 60) return 3;
    if (overallPerf.pct >= 45) return 2;
    if (overallPerf.pct >= 35) return 1;
    return 0;
  }, [overallPerf]);

  const handleSaveExtras = () => {
    if (selectedStudent) {
      setReportExtras((prev) => ({
        ...prev,
        [selectedStudent.id.toString()]: draftExtras,
      }));
      setEditMode(false);
    }
  };

  const startEditExtras = () => {
    setDraftExtras({ ...extras });
    setEditMode(true);
  };

  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Vertical header cell helper
  const VertHeader = ({ label }: { label: string }) => (
    <th
      className="border-r border-gray-300 last:border-r-0 px-1 py-1 text-center align-bottom font-semibold"
      style={{ minWidth: "28px" }}
    >
      <div
        style={{
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          transform: "rotate(180deg)",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {label}
      </div>
    </th>
  );

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* ── Controls (screen only) ── */}
      <div className="no-print flex flex-col sm:flex-row sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">
            Progressive Report Card
          </h1>
          <p className="text-sm text-muted-foreground">
            Generate and print student progressive report cards
          </p>
        </div>
        {selectedStudent && (
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="gap-2 sm:ml-auto"
            data-ocid="progressive-report-card.primary_button"
          >
            <Printer className="w-4 h-4" /> Print Report Card
          </Button>
        )}
      </div>

      <div
        className="no-print flex flex-wrap gap-4"
        data-ocid="progressive-report-card.panel"
      >
        <div>
          <Label className="text-xs">Session</Label>
          <Select value={session} onValueChange={setSession}>
            <SelectTrigger
              className="w-28"
              data-ocid="progressive-report-card.select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025-26">2025-26</SelectItem>
              <SelectItem value="2024-25">2024-25</SelectItem>
              <SelectItem value="2026-27">2026-27</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Class</Label>
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger
              className="w-40"
              data-ocid="progressive-report-card.select"
            >
              <SelectValue placeholder="All classes..." />
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
          <Label className="text-xs">Student</Label>
          <Select value={studentId} onValueChange={setStudentId}>
            <SelectTrigger
              className="w-56"
              data-ocid="progressive-report-card.select"
            >
              <SelectValue placeholder="Select student..." />
            </SelectTrigger>
            <SelectContent>
              {studentsInClass.map((s) => (
                <SelectItem key={s.id.toString()} value={s.id.toString()}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Empty state ── */}
      {!studentId && (
        <div
          className="no-print py-16 text-center text-muted-foreground"
          data-ocid="progressive-report-card.empty_state"
        >
          Select a student to generate their Progressive Report Card.
        </div>
      )}

      {/* ── Edit Extras (screen only) ── */}
      {selectedStudent && editMode && (
        <div className="no-print border border-dashed border-primary/40 p-4 rounded-lg space-y-4 bg-card">
          <h3 className="font-semibold text-sm">
            Edit Affective / Psychomotor Domains &amp; Comments
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Affective Domain Rating</Label>
                <StarRating
                  value={draftExtras.affectiveRating}
                  onChange={(v) =>
                    setDraftExtras((p) => ({ ...p, affectiveRating: v }))
                  }
                />
              </div>
              <div>
                <Label className="text-xs">Affective Score (%)</Label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={draftExtras.affectiveScore}
                  onChange={(e) =>
                    setDraftExtras((p) => ({
                      ...p,
                      affectiveScore: Number(e.target.value),
                    }))
                  }
                  className="mt-1 block border border-border rounded px-2 py-1 text-sm w-24 bg-background text-foreground"
                />
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Psychomotor Domain Rating</Label>
                <StarRating
                  value={draftExtras.psychomotorRating}
                  onChange={(v) =>
                    setDraftExtras((p) => ({ ...p, psychomotorRating: v }))
                  }
                />
              </div>
              <div>
                <Label className="text-xs">Psychomotor Score (%)</Label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={draftExtras.psychomotorScore}
                  onChange={(e) =>
                    setDraftExtras((p) => ({
                      ...p,
                      psychomotorScore: Number(e.target.value),
                    }))
                  }
                  className="mt-1 block border border-border rounded px-2 py-1 text-sm w-24 bg-background text-foreground"
                />
              </div>
            </div>
          </div>
          <div>
            <Label className="text-xs">Comments / Observations</Label>
            <Textarea
              value={draftExtras.comments}
              onChange={(e) =>
                setDraftExtras((p) => ({ ...p, comments: e.target.value }))
              }
              rows={3}
              placeholder="Enter teacher observations..."
              className="mt-1"
              data-ocid="progressive-report-card.textarea"
            />
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSaveExtras}
              data-ocid="progressive-report-card.save_button"
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditMode(false)}
              data-ocid="progressive-report-card.cancel_button"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* ── REPORT CARD ── */}
      {selectedStudent && (
        <div className="bg-white text-black text-xs max-w-5xl mx-auto border border-gray-400 print:border-0 print:shadow-none shadow-sm">
          <div className="p-5">
            {/* Header */}
            <div className="text-center pb-3 mb-3 border-b-2 border-black">
              <h1 className="text-base font-bold uppercase tracking-wide">
                JMDA SCHOOL
              </h1>
              <p className="text-[10px] text-gray-500">India</p>
              <p className="text-[10px]">Session: {session}</p>
              <h2 className="text-sm font-bold text-blue-700 mt-0.5">
                Student Report Card
              </h2>
            </div>

            {/* Student Info */}
            <div className="border border-gray-400 mb-3">
              <div className="grid grid-cols-[72px_1fr_1fr_110px] gap-0">
                {/* Photo */}
                <div className="border-r border-gray-300 flex items-center justify-center bg-gray-50 m-1">
                  <div className="w-16 h-16 border border-gray-300 flex items-center justify-center text-gray-400 text-[9px] text-center">
                    Photo
                  </div>
                </div>
                {/* Middle-left */}
                <div className="border-r border-gray-300 p-2 space-y-1">
                  <div>
                    <span className="font-bold">REGISTRATION</span>
                    <span className="ml-2">
                      {selectedStudent.registrationNo || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold">NAME</span>
                    <span className="ml-2 font-semibold">
                      {selectedStudent.name}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold">CLASS</span>
                    <span className="ml-2">{selectedStudent.className}</span>
                  </div>
                </div>
                {/* Middle-right */}
                <div className="border-r border-gray-300 p-2 space-y-1">
                  <div>
                    <span className="font-bold">DATE OF BIRTH</span>
                    <span className="ml-2">{ext?.dateOfBirth || "—"}</span>
                  </div>
                  <div>
                    <span className="font-bold">GENDER</span>
                    <span className="ml-2">{ext?.gender || "—"}</span>
                  </div>
                  <div>
                    <span className="font-bold">ADMISSION DATE</span>
                    <span className="ml-2">{ext?.dateOfAdmission || "—"}</span>
                  </div>
                </div>
                {/* Attendance */}
                <div className="p-2 space-y-1">
                  <div>
                    <span className="font-bold">ATTENDANCE</span>
                    <span className="ml-1">
                      {attendanceStats?.pct !== null && attendanceStats
                        ? `${attendanceStats.pct}%`
                        : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold">LEAVES</span>
                    <span className="ml-1">
                      {attendanceStats ? attendanceStats.leaves : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold">ABSENTS</span>
                    <span className="ml-1">
                      {attendanceStats ? attendanceStats.absent : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cognitive Domain - Examination */}
            <div className="border border-gray-400 mb-3">
              <div className="bg-gray-100 border-b border-gray-400 px-2 py-1 font-bold text-[11px]">
                🎓 COGNITIVE DOMAIN – EXAMINATION
              </div>
              {subjects.length === 0 ? (
                <div className="p-4 text-center text-[11px] text-gray-400">
                  No examination data. Add exams for {selectedStudent.className}{" "}
                  to see results.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-[10px]">
                    <thead>
                      <tr className="border-b border-gray-400">
                        <th className="border-r border-gray-300 px-1 py-1 text-left font-semibold w-32">
                          EXAMINATIONS
                        </th>
                        {subjects.map((s) => (
                          <VertHeader
                            key={s.name}
                            label={`${s.name} (${s.maxMarks})`}
                          />
                        ))}
                        <VertHeader label="OBTAINED MARKS" />
                        <VertHeader label="TOTAL MARKS" />
                        <VertHeader label="PERCENTAGE" />
                        <VertHeader label="GRADE" />
                        <th className="px-1 py-1 text-center font-semibold align-bottom">
                          STATUS
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Exam rows */}
                      {examRows.map((row, idx) => (
                        <tr
                          key={row.name}
                          className="border-b border-gray-300"
                          data-ocid={`progressive-report-card.row.${idx + 1}`}
                        >
                          <td className="border-r border-gray-300 px-1 py-1 font-medium">
                            {row.name}
                          </td>
                          {subjects.map((s) => (
                            <td
                              key={s.name}
                              className="border-r border-gray-300 px-1 py-1 text-center"
                            >
                              {row.marksPerSubject[s.name]?.obtained ?? "—"}
                            </td>
                          ))}
                          <td className="border-r border-gray-300 px-1 py-1 text-center font-semibold">
                            {row.totalObtained}
                          </td>
                          <td className="border-r border-gray-300 px-1 py-1 text-center">
                            {row.totalMax}
                          </td>
                          <td className="border-r border-gray-300 px-1 py-1 text-center">
                            {row.pct}%
                          </td>
                          <td className="border-r border-gray-300 px-1 py-1 text-center font-bold">
                            {row.grade}
                          </td>
                          <td className="px-1 py-1 text-center">
                            {row.status}
                          </td>
                        </tr>
                      ))}

                      {/* Overall performance */}
                      {overallPerf && (
                        <tr className="border-b border-gray-400 bg-blue-50">
                          <td className="border-r border-gray-300 px-1 py-1 font-bold text-blue-700">
                            OVER ALL PERFORMANCE
                          </td>
                          {subjects.map((s) => (
                            <td
                              key={s.name}
                              className="border-r border-gray-300 px-1 py-1 text-center font-semibold text-blue-700"
                            >
                              {overallPerf.marksPerSubject[s.name]?.obtained ??
                                "—"}
                            </td>
                          ))}
                          <td className="border-r border-gray-300 px-1 py-1 text-center font-bold text-blue-700">
                            {overallPerf.totalObtained}
                          </td>
                          <td className="border-r border-gray-300 px-1 py-1 text-center text-blue-700">
                            {overallPerf.totalMax}
                          </td>
                          <td className="border-r border-gray-300 px-1 py-1 text-center text-blue-700">
                            {overallPerf.pct}%
                          </td>
                          <td className="border-r border-gray-300 px-1 py-1 text-center font-bold text-blue-700">
                            {overallPerf.grade}
                          </td>
                          <td className="px-1 py-1 text-center font-bold text-blue-700">
                            {overallPerf.status}
                          </td>
                        </tr>
                      )}

                      {/* Subject Wise Performance header */}
                      <tr className="border-b border-gray-300 bg-gray-50">
                        <td className="border-r border-gray-300 px-1 py-1 font-bold">
                          SUBJECT WISE PERFORMANCE
                        </td>
                        {subjects.map((s) => (
                          <td
                            key={s.name}
                            className="border-r border-gray-300 px-1 py-1 text-center text-gray-400"
                          >
                            ↓
                          </td>
                        ))}
                        {/* Summary cell spans remaining columns with 4 rows */}
                        <td
                          className="border-r border-gray-300 px-2 py-2 align-top"
                          rowSpan={5}
                        >
                          {overallPerf && (
                            <div className="space-y-1">
                              <div className="font-semibold">TOTAL SCORE</div>
                              <div className="text-sm font-bold">
                                {overallPerf.totalObtained} /{" "}
                                {overallPerf.totalMax}
                              </div>
                              <div className="font-semibold mt-1">
                                PERCENTAGE
                              </div>
                              <div className="text-sm font-bold">
                                {overallPerf.pct}%
                              </div>
                              <div className="font-semibold mt-1">GRADE</div>
                              <div className="text-sm font-bold">
                                {overallPerf.grade}
                              </div>
                              <div className="font-semibold mt-1">STATUS</div>
                              <div className="text-sm font-bold text-green-700">
                                {overallPerf.status}
                              </div>
                            </div>
                          )}
                        </td>
                        <td colSpan={3} className="px-1 py-1" />
                      </tr>

                      {/* Subject Total Marks */}
                      <tr className="border-b border-gray-300">
                        <td className="border-r border-gray-300 px-1 py-1">
                          TOTAL MARKS
                        </td>
                        {subjects.map((s) => {
                          const sm = overallPerf?.marksPerSubject[s.name];
                          return (
                            <td
                              key={s.name}
                              className="border-r border-gray-300 px-1 py-1 text-center"
                            >
                              {sm?.max ?? s.maxMarks}
                            </td>
                          );
                        })}
                        <td colSpan={3} />
                      </tr>

                      {/* Subject Percentage */}
                      <tr className="border-b border-gray-300">
                        <td className="border-r border-gray-300 px-1 py-1">
                          PERCENTAGE
                        </td>
                        {subjects.map((s) => {
                          const sm = overallPerf?.marksPerSubject[s.name];
                          const pct =
                            sm && sm.max > 0
                              ? Math.round((sm.obtained / sm.max) * 100)
                              : 0;
                          return (
                            <td
                              key={s.name}
                              className="border-r border-gray-300 px-1 py-1 text-center"
                            >
                              {sm ? `${pct}%` : "—"}
                            </td>
                          );
                        })}
                        <td colSpan={3} />
                      </tr>

                      {/* Subject Grade */}
                      <tr className="border-b border-gray-300">
                        <td className="border-r border-gray-300 px-1 py-1">
                          GRADE
                        </td>
                        {subjects.map((s) => {
                          const sm = overallPerf?.marksPerSubject[s.name];
                          const pct =
                            sm && sm.max > 0
                              ? Math.round((sm.obtained / sm.max) * 100)
                              : 0;
                          return (
                            <td
                              key={s.name}
                              className="border-r border-gray-300 px-1 py-1 text-center font-bold"
                            >
                              {sm ? getGrade(pct) : "—"}
                            </td>
                          );
                        })}
                        <td colSpan={3} />
                      </tr>

                      {/* Subject Status */}
                      <tr className="border-b border-gray-400">
                        <td className="border-r border-gray-300 px-1 py-1">
                          STATUS
                        </td>
                        {subjects.map((s) => {
                          const sm = overallPerf?.marksPerSubject[s.name];
                          const pct =
                            sm && sm.max > 0
                              ? Math.round((sm.obtained / sm.max) * 100)
                              : 0;
                          return (
                            <td
                              key={s.name}
                              className="border-r border-gray-300 px-1 py-1 text-center font-bold"
                            >
                              {sm ? getStatus(pct) : "—"}
                            </td>
                          );
                        })}
                        <td colSpan={3} />
                      </tr>

                      {/* Class Comparison */}
                      {classComparison && (
                        <tr>
                          <td
                            className="border-r border-gray-300 px-1 py-1 font-bold"
                            colSpan={1}
                          >
                            COMPARISON
                            <br />
                            WITH CLASS
                          </td>
                          <td
                            className="border-r border-gray-300 px-1 py-1"
                            colSpan={2}
                          >
                            <div className="font-semibold">CLASS STRENGTH</div>
                            <div className="font-bold">
                              {classComparison.strength} STUDENTS
                            </div>
                          </td>
                          <td
                            className="border-r border-gray-300 px-1 py-1"
                            colSpan={Math.max(1, subjects.length - 2)}
                          >
                            <div>CLASS AVERAGE</div>
                            <div className="font-bold">
                              {classComparison.avg}%
                            </div>
                          </td>
                          <td
                            className="border-r border-gray-300 px-1 py-1"
                            colSpan={2}
                          >
                            <div>CLASS MAX AVG</div>
                            <div className="font-bold">
                              {classComparison.maxPct}%
                            </div>
                          </td>
                          <td className="border-r border-gray-300 px-1 py-1">
                            <div>CLASS MIN AVG</div>
                            <div className="font-bold">
                              {classComparison.minPct}%
                            </div>
                          </td>
                          <td className="px-1 py-1" colSpan={3}>
                            <div>STUDENT POSITION</div>
                            <div className="font-bold">
                              {classComparison.position} out of{" "}
                              {classComparison.strength}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Lower section */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Class Tests */}
              <div className="border border-gray-400">
                <div className="bg-gray-100 border-b border-gray-400 px-2 py-1 font-bold text-[11px]">
                  📋 COGNITIVE DOMAIN – CLASS TESTS
                </div>
                <table className="w-full border-collapse text-[10px]">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="border-r border-gray-300 px-1 py-1 text-left font-semibold">
                        SUBJECTS
                      </th>
                      <VertHeader label="TOTAL TESTS" />
                      <VertHeader label="TOTAL MARKS" />
                      <VertHeader label="OBTAINED" />
                      <th className="px-1 py-1 text-center font-semibold align-bottom">
                        <div
                          style={{
                            writingMode: "vertical-rl",
                            transform: "rotate(180deg)",
                            height: "56px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          AVERAGE
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(classTestsBySubject.length > 0
                      ? classTestsBySubject
                      : subjects.map((s) => ({
                          subject: s.name,
                          totalTests: 0,
                          totalMarks: 0,
                          obtained: 0,
                          avg: 0,
                        }))
                    ).map((ct, idx) => (
                      <tr
                        key={ct.subject}
                        className="border-b border-gray-300"
                        data-ocid={`progressive-report-card.row.${idx + 20}`}
                      >
                        <td className="border-r border-gray-300 px-1 py-1">
                          {ct.subject}
                        </td>
                        <td className="border-r border-gray-300 px-1 py-1 text-center">
                          {ct.totalTests}
                        </td>
                        <td className="border-r border-gray-300 px-1 py-1 text-center">
                          {ct.totalMarks}
                        </td>
                        <td className="border-r border-gray-300 px-1 py-1 text-center">
                          {ct.obtained}
                        </td>
                        <td className="px-1 py-1 text-center">
                          {ct.avg > 0 ? `${ct.avg}%` : "0%"}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t border-gray-400 bg-gray-50 font-semibold">
                      <td className="border-r border-gray-300 px-1 py-1">
                        <div>OVERALL TESTS</div>
                        <div className="text-sm font-bold">
                          {classTestTotals.totalTests}
                        </div>
                      </td>
                      <td className="border-r border-gray-300 px-1 py-1 text-center">
                        <div>OBTAINED</div>
                        <div className="font-bold">
                          {classTestTotals.obtained}
                        </div>
                      </td>
                      <td className="border-r border-gray-300 px-1 py-1 text-center">
                        <div>TOTAL</div>
                        <div className="font-bold">
                          {classTestTotals.totalMarks}
                        </div>
                      </td>
                      <td colSpan={2} className="px-1 py-1 text-center">
                        <div>SCORE</div>
                        <div className="text-sm font-bold">
                          {classTestTotals.score}%
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Affective + Psychomotor + Comments */}
              <div className="space-y-2 flex flex-col">
                <div className="border border-gray-400 grid grid-cols-2 gap-0 divide-x divide-gray-300">
                  <div className="p-2">
                    <div className="font-bold text-[10px] border-b border-gray-300 pb-1 mb-1">
                      😊 AFFECTIVE DOMAINS
                    </div>
                    <div className="text-[10px]">OVERALL RATING</div>
                    <StarRating value={extras.affectiveRating} readOnly />
                    <div className="text-[10px] mt-1">
                      SCORE{" "}
                      <span className="font-bold">
                        {extras.affectiveScore}%
                      </span>
                    </div>
                  </div>
                  <div className="p-2">
                    <div className="font-bold text-[10px] border-b border-gray-300 pb-1 mb-1">
                      ⚙️ PSYCHOMOTOR DOMAINS
                    </div>
                    <div className="text-[10px]">OVERALL RATING</div>
                    <StarRating value={extras.psychomotorRating} readOnly />
                    <div className="text-[10px] mt-1">
                      SCORE{" "}
                      <span className="font-bold">
                        {extras.psychomotorScore}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="border border-gray-400 p-2 flex-1">
                  <div className="font-bold text-[10px] border-b border-gray-300 pb-1 mb-1">
                    💬 COMMENTS / OBSERVATIONS
                  </div>
                  <div className="text-[10px] whitespace-pre-wrap min-h-[56px]">
                    {extras.comments || " "}
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Domains button (screen only) */}
            {!editMode && (
              <div className="no-print mb-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={startEditExtras}
                  data-ocid="progressive-report-card.edit_button"
                >
                  Edit Domains &amp; Comments
                </Button>
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-gray-400 pt-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold text-[10px]">
                    OVERALL RATING
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <StarRating value={overallRating} readOnly />
                    <span className="text-xs font-bold">{overallRating}/5</span>
                  </div>
                  <div className="font-semibold text-[10px] mt-1">
                    OVERALL SCORE
                  </div>
                  <div className="text-base font-bold">
                    {overallPerf ? `${overallPerf.pct}%` : "—"}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-semibold">{today}</div>
                  <div className="text-[9px] text-gray-500 mt-1">DATE</div>
                </div>
                <div className="text-center">
                  <div className="border-b border-gray-400 h-8 w-32" />
                  <div className="text-[9px] text-gray-500 mt-1">SIGNATURE</div>
                </div>
                <div className="text-center">
                  <div className="border border-gray-300 h-8 w-24" />
                  <div className="text-[9px] text-gray-500 mt-1">STAMP</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
