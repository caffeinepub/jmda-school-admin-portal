import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Printer,
  Users,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import {
  useMyClass,
  useMyStudents,
  useMyTeacherId,
} from "../../hooks/useQueries";
import { useEmployees } from "../../hooks/useSchoolData";

type TeacherPage =
  | "dashboard"
  | "my-students"
  | "mark-attendance"
  | "my-timetable"
  | "my-salary";

const PAGE_TITLES: Record<TeacherPage, string> = {
  dashboard: "My Dashboard",
  "my-students": "My Students",
  "mark-attendance": "Mark Attendance",
  "my-timetable": "My Timetable",
  "my-salary": "My Salary Slip",
};

type AttendanceStatus = "present" | "absent" | "late";

// ── Teacher Sidebar ──────────────────────────────────────────────────────────
function TeacherSidebar({
  currentPage,
  onNavigate,
}: {
  currentPage: TeacherPage;
  onNavigate: (page: TeacherPage) => void;
}) {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();

  const navItems: {
    page: TeacherPage;
    label: string;
    icon: React.ElementType;
  }[] = [
    { page: "dashboard", label: "My Dashboard", icon: LayoutDashboard },
    { page: "my-students", label: "My Students", icon: Users },
    { page: "mark-attendance", label: "Mark Attendance", icon: ClipboardList },
    { page: "my-timetable", label: "My Timetable", icon: CalendarDays },
    { page: "my-salary", label: "My Salary Slip", icon: Wallet },
  ];

  return (
    <aside
      className="w-64 h-full flex flex-col min-h-0"
      style={{ background: "var(--teacher-sidebar-bg)" }}
    >
      {/* Logo */}
      <div className="px-4 py-4 border-b border-teacher-border shrink-0">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--teacher-primary)" }}
          >
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p
              className="text-sm font-display font-bold"
              style={{ color: "var(--teacher-sidebar-fg)" }}
            >
              JMDA
            </p>
            <p className="text-[10px] text-teacher-muted">Teacher Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div
        className="flex-1 min-h-0 overflow-y-scroll py-2"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "var(--teacher-border) transparent",
        }}
      >
        <nav className="px-2 space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.page}
              type="button"
              onClick={() => onNavigate(item.page)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors"
              style={{
                background:
                  currentPage === item.page
                    ? "var(--teacher-nav-active-bg)"
                    : "transparent",
                color:
                  currentPage === item.page
                    ? "var(--teacher-primary)"
                    : "var(--teacher-sidebar-fg)",
                fontWeight: currentPage === item.page ? 600 : 400,
              }}
              data-ocid={`teacher_sidebar.${item.page}.link`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {currentPage === item.page && (
                <ChevronRight className="w-3 h-3 opacity-60" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* User */}
      <div
        className="border-t p-3 shrink-0"
        style={{ borderColor: "var(--teacher-border)" }}
      >
        {identity ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: "var(--teacher-primary-light)" }}
              >
                <GraduationCap
                  className="w-3.5 h-3.5"
                  style={{ color: "var(--teacher-primary)" }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-medium truncate"
                  style={{ color: "var(--teacher-sidebar-fg)" }}
                >
                  {identity.getPrincipal().toString().slice(0, 14)}...
                </p>
                <p className="text-[10px] text-teacher-muted">Class Teacher</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-xs"
              style={{ color: "var(--teacher-muted)" }}
              onClick={clear}
              data-ocid="teacher_sidebar.logout_button"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            className="w-full gap-2 text-xs"
            style={{ background: "var(--teacher-primary)", color: "white" }}
            onClick={login}
            disabled={isLoggingIn}
            data-ocid="teacher_sidebar.primary_button"
          >
            <LogIn className="w-3.5 h-3.5" />
            {isLoggingIn ? "Signing in..." : "Sign In"}
          </Button>
        )}
      </div>
    </aside>
  );
}

// ── Dashboard Page ────────────────────────────────────────────────────────────
function TeacherDashboard({
  onNavigate,
}: { onNavigate: (page: TeacherPage) => void }) {
  const { data: myClass, isLoading: classLoading } = useMyClass();
  const { data: myStudents } = useMyStudents();

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Welcome */}
      <div
        className="rounded-xl p-6"
        style={{
          background:
            "linear-gradient(135deg, var(--teacher-primary) 0%, var(--teacher-primary-dark) 100%)",
        }}
      >
        <p className="text-white/70 text-sm mb-1">Welcome back,</p>
        <h1 className="text-2xl font-display font-bold text-white">
          {classLoading
            ? "Loading..."
            : myClass
              ? `${myClass.name} Teacher`
              : "Class Teacher"}
        </h1>
        <p className="text-white/70 text-sm mt-1">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="teacher-card" data-ocid="teacher_dashboard.card">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: "var(--teacher-primary-light)" }}
              >
                <Users
                  className="w-5 h-5"
                  style={{ color: "var(--teacher-primary)" }}
                />
              </div>
              <div>
                <p
                  className="text-2xl font-bold"
                  style={{ color: "var(--teacher-primary)" }}
                >
                  {myStudents?.length ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">My Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="teacher-card" data-ocid="teacher_dashboard.card">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: "var(--teacher-primary-light)" }}
              >
                <BookOpen
                  className="w-5 h-5"
                  style={{ color: "var(--teacher-primary)" }}
                />
              </div>
              <div>
                <p
                  className="text-lg font-bold"
                  style={{ color: "var(--teacher-primary)" }}
                >
                  {myClass?.name ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground">My Class</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="teacher-card" data-ocid="teacher_dashboard.card">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: "var(--teacher-primary-light)" }}
              >
                <CalendarDays
                  className="w-5 h-5"
                  style={{ color: "var(--teacher-primary)" }}
                />
              </div>
              <div>
                <p
                  className="text-lg font-bold"
                  style={{ color: "var(--teacher-primary)" }}
                >
                  {new Date().toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                  })}
                </p>
                <p className="text-xs text-muted-foreground">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onNavigate("mark-attendance")}
            className="flex items-center gap-3 p-4 rounded-xl border transition-colors text-left"
            style={{
              borderColor: "var(--teacher-border)",
              background: "var(--teacher-card-bg)",
            }}
            data-ocid="teacher_dashboard.primary_button"
          >
            <ClipboardList
              className="w-5 h-5 shrink-0"
              style={{ color: "var(--teacher-primary)" }}
            />
            <div>
              <p className="text-sm font-medium">Mark Attendance</p>
              <p className="text-xs text-muted-foreground">Today's roll call</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onNavigate("my-students")}
            className="flex items-center gap-3 p-4 rounded-xl border transition-colors text-left"
            style={{
              borderColor: "var(--teacher-border)",
              background: "var(--teacher-card-bg)",
            }}
            data-ocid="teacher_dashboard.secondary_button"
          >
            <Users
              className="w-5 h-5 shrink-0"
              style={{ color: "var(--teacher-primary)" }}
            />
            <div>
              <p className="text-sm font-medium">My Students</p>
              <p className="text-xs text-muted-foreground">View class list</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── My Students Page ──────────────────────────────────────────────────────────
function MyStudentsPage() {
  const { data: students, isLoading } = useMyStudents();
  const { data: myClass } = useMyClass();

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: "var(--teacher-primary-light)" }}
        >
          <Users
            className="w-5 h-5"
            style={{ color: "var(--teacher-primary)" }}
          />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold">My Students</h1>
          <p className="text-sm text-muted-foreground">
            {myClass ? myClass.name : "No class assigned"} ·{" "}
            {students?.length ?? 0} students
          </p>
        </div>
      </div>

      {isLoading ? (
        <div
          className="flex items-center justify-center py-12"
          data-ocid="teacher_students.loading_state"
        >
          <div
            className="w-6 h-6 rounded-full border-2 animate-spin"
            style={{
              borderColor: "var(--teacher-primary)",
              borderTopColor: "transparent",
            }}
          />
        </div>
      ) : !students || students.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 text-center"
          data-ocid="teacher_students.empty_state"
        >
          <Users className="w-12 h-12 text-muted-foreground mb-3" />
          <p className="font-medium text-muted-foreground">
            No students assigned yet
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Ask the admin to assign you to a class and link your teacher
            profile.
          </p>
        </div>
      ) : (
        <div
          className="rounded-lg border overflow-hidden"
          style={{ borderColor: "var(--teacher-border)" }}
        >
          <Table data-ocid="teacher_students.table">
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Guardian</TableHead>
                <TableHead>Contact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student, idx) => (
                <TableRow
                  key={student.id.toString()}
                  data-ocid={`teacher_students.row.${idx + 1}`}
                >
                  <TableCell className="text-muted-foreground text-sm">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {student.className}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {student.guardianName || "—"}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {student.guardianContact || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ── Mark Attendance Page ──────────────────────────────────────────────────────
function MarkAttendancePage() {
  const { data: students } = useMyStudents();
  const { data: myClass } = useMyClass();
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [attendance, setAttendance] = useState<
    Record<string, AttendanceStatus>
  >({});
  const [saved, setSaved] = useState(false);

  const classId = myClass ? myClass.id.toString() : "no-class";
  const storageKey = `attendance_${date}_${classId}`;

  const loadAttendance = (d: string) => {
    const key = `attendance_${d}_${classId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored) as Record<string, AttendanceStatus>;
      } catch {
        /* ignore */
      }
    }
    return {};
  };

  const handleDateChange = (d: string) => {
    setDate(d);
    setAttendance(loadAttendance(d));
    setSaved(false);
  };

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem(storageKey, JSON.stringify(attendance));
    setSaved(true);
  };

  const statusIcon = (s: AttendanceStatus | undefined) => {
    if (s === "present")
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (s === "absent") return <XCircle className="w-4 h-4 text-destructive" />;
    if (s === "late") return <ChevronDown className="w-4 h-4 text-amber-500" />;
    return null;
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: "var(--teacher-primary-light)" }}
        >
          <ClipboardList
            className="w-5 h-5"
            style={{ color: "var(--teacher-primary)" }}
          />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold">Mark Attendance</h1>
          <p className="text-sm text-muted-foreground">
            {myClass?.name ?? "No class assigned"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium" htmlFor="att-date">
          Date:
        </label>
        <input
          id="att-date"
          type="date"
          value={date}
          max={today}
          onChange={(e) => handleDateChange(e.target.value)}
          className="border rounded-md px-3 py-1.5 text-sm bg-background text-foreground"
          style={{ borderColor: "var(--teacher-border)" }}
          data-ocid="teacher_attendance.input"
        />
      </div>

      {!students || students.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16"
          data-ocid="teacher_attendance.empty_state"
        >
          <Users className="w-12 h-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            No students assigned to your class yet.
          </p>
        </div>
      ) : (
        <>
          <div
            className="rounded-lg border overflow-hidden"
            style={{ borderColor: "var(--teacher-border)" }}
          >
            <Table data-ocid="teacher_attendance.table">
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student, idx) => {
                  const sid = student.id.toString();
                  const status = attendance[sid];
                  return (
                    <TableRow
                      key={sid}
                      data-ocid={`teacher_attendance.row.${idx + 1}`}
                    >
                      <TableCell className="text-muted-foreground text-sm">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {statusIcon(status)}
                          {student.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        {status ? (
                          <Badge
                            variant="secondary"
                            className="text-xs capitalize"
                            style={{
                              background:
                                status === "present"
                                  ? "oklch(var(--teacher-success-light))"
                                  : status === "absent"
                                    ? "oklch(var(--destructive) / 0.1)"
                                    : "oklch(var(--warning) / 0.1)",
                              color:
                                status === "present"
                                  ? "var(--teacher-primary)"
                                  : status === "absent"
                                    ? "oklch(var(--destructive))"
                                    : "#d97706",
                            }}
                          >
                            {status}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Not marked
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {(
                            ["present", "absent", "late"] as AttendanceStatus[]
                          ).map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setStatus(sid, s)}
                              className="px-2 py-0.5 rounded text-xs border transition-colors capitalize"
                              style={{
                                borderColor:
                                  status === s
                                    ? "var(--teacher-primary)"
                                    : "var(--teacher-border)",
                                background:
                                  status === s
                                    ? "var(--teacher-primary-light)"
                                    : "transparent",
                                color:
                                  status === s
                                    ? "var(--teacher-primary)"
                                    : "var(--muted-foreground)",
                                fontWeight: status === s ? 600 : 400,
                              }}
                              data-ocid={`teacher_attendance.toggle.${idx + 1}`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleSave}
              style={{ background: "var(--teacher-primary)", color: "white" }}
              data-ocid="teacher_attendance.save_button"
            >
              {saved ? (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              ) : (
                <ClipboardList className="w-4 h-4 mr-2" />
              )}
              {saved ? "Saved!" : "Save Attendance"}
            </Button>
            {saved && (
              <span
                className="text-sm text-muted-foreground"
                data-ocid="teacher_attendance.success_state"
              >
                Attendance saved for {date}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── My Timetable Page ────────────────────────────────────────────────────────
function MyTimetablePage() {
  const { data: myClass } = useMyClass();
  const raw = localStorage.getItem("jmda_timetable");
  let timetableEntries: {
    day: string;
    subject: string;
    time: string;
    teacher: string;
  }[] = [];
  if (raw) {
    try {
      const all = JSON.parse(raw) as {
        classId: string;
        day: string;
        subject: string;
        time: string;
        teacher: string;
        periodNumber: number;
      }[];
      if (myClass) {
        timetableEntries = all.filter(
          (t) => t.classId === myClass.id.toString(),
        );
      } else {
        timetableEntries = all;
      }
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: "var(--teacher-primary-light)" }}
        >
          <CalendarDays
            className="w-5 h-5"
            style={{ color: "var(--teacher-primary)" }}
          />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold">My Timetable</h1>
          <p className="text-sm text-muted-foreground">
            {myClass?.name ?? "No class assigned"}
          </p>
        </div>
      </div>

      {timetableEntries.length === 0 ? (
        <Card
          className="teacher-card"
          data-ocid="teacher_timetable.empty_state"
        >
          <CardContent className="py-10 text-center">
            <CalendarDays className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">Timetable not set up yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Contact admin to set up your class timetable.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div
          className="rounded-lg border overflow-hidden"
          style={{ borderColor: "var(--teacher-border)" }}
        >
          <Table data-ocid="teacher_timetable.table">
            <TableHeader>
              <TableRow>
                <TableHead>Day</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Subject</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timetableEntries.map((entry, idx) => (
                <TableRow
                  key={`${entry.day}-${entry.subject}-${idx}`}
                  data-ocid={`teacher_timetable.row.${idx + 1}`}
                >
                  <TableCell className="font-medium">{entry.day}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {entry.time || "—"}
                  </TableCell>
                  <TableCell>{entry.subject}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ── My Salary Page ────────────────────────────────────────────────────────────
function MySalaryPage() {
  const { identity } = useInternetIdentity();
  const [employees] = useEmployees();
  const { data: myTeacherId } = useMyTeacherId();

  // Find the employee record linked to this teacher's ID
  const emp = myTeacherId
    ? (employees.find((e, idx) => {
        const tid = e.teacherId || `T${String(idx + 1).padStart(3, "0")}`;
        return tid === String(myTeacherId);
      }) ??
      employees.find((e) => e.role === "Teacher") ??
      employees[0])
    : (employees.find((e) => e.role === "Teacher") ?? employees[0]);

  const handlePrint = () => window.print();

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-lg">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: "var(--teacher-primary-light)" }}
        >
          <Wallet
            className="w-5 h-5"
            style={{ color: "var(--teacher-primary)" }}
          />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold">My Salary Slip</h1>
          <p className="text-sm text-muted-foreground">
            Current month salary details
          </p>
        </div>
      </div>

      {!emp ? (
        <Card className="teacher-card" data-ocid="teacher_salary.empty_state">
          <CardContent className="py-10 text-center">
            <Wallet className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No salary record found.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Contact admin to set up your employee record.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="teacher-card" data-ocid="teacher_salary.card">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet
                className="w-4 h-4"
                style={{ color: "var(--teacher-primary)" }}
              />
              Salary Slip —{" "}
              {new Date().toLocaleDateString("en-IN", {
                month: "long",
                year: "numeric",
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Employee Name</p>
                <p className="font-medium">{emp.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Role</p>
                <p className="font-medium">{emp.role || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Date of Joining</p>
                <p className="font-medium">{emp.dateOfJoining || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">
                  Principal ID (short)
                </p>
                <p className="font-mono text-xs">
                  {identity?.getPrincipal().toString().slice(0, 14)}...
                </p>
              </div>
            </div>
            <div
              className="rounded-lg p-4 mt-2"
              style={{ background: "var(--teacher-primary-light)" }}
            >
              <p className="text-xs text-muted-foreground mb-1">
                Monthly Salary
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: "var(--teacher-primary)" }}
              >
                ₹{emp.salary ? emp.salary.toLocaleString("en-IN") : "0"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handlePrint}
              data-ocid="teacher_salary.button"
            >
              <Printer className="w-4 h-4" /> Print Slip
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Teacher Portal Root ───────────────────────────────────────────────────────
export default function TeacherPortalPage() {
  const [currentPage, setCurrentPage] = useState<TeacherPage>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigate = (page: TeacherPage) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
  };

  const renderContent = () => {
    switch (currentPage) {
      case "dashboard":
        return <TeacherDashboard onNavigate={handleNavigate} />;
      case "my-students":
        return <MyStudentsPage />;
      case "mark-attendance":
        return <MarkAttendancePage />;
      case "my-timetable":
        return <MyTimetablePage />;
      case "my-salary":
        return <MySalaryPage />;
    }
  };

  return (
    <div
      className="flex min-h-screen"
      style={{ background: "var(--teacher-bg)" }}
    >
      {/* Desktop Sidebar */}
      <div className="hidden lg:block sticky top-0 h-screen">
        <TeacherSidebar currentPage={currentPage} onNavigate={handleNavigate} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 bg-black/60 z-40 lg:hidden cursor-default"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed left-0 top-0 h-screen w-64 z-50 lg:hidden animate-slide-in-left overflow-y-auto">
            <TeacherSidebar
              currentPage={currentPage}
              onNavigate={handleNavigate}
            />
          </div>
        </>
      )}

      {/* Main */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <div
          className="lg:hidden flex items-center justify-between px-4 py-3 border-b sticky top-0 z-30"
          style={{
            background: "var(--teacher-card-bg)",
            borderColor: "var(--teacher-border)",
          }}
        >
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9"
              onClick={() => setMobileMenuOpen((v) => !v)}
              data-ocid="teacher_sidebar.button"
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </Button>
            <span className="font-display font-bold text-sm">
              JMDA ·{" "}
              <span style={{ color: "var(--teacher-primary)" }}>
                {PAGE_TITLES[currentPage]}
              </span>
            </span>
          </div>
        </div>

        {/* Page content */}
        <div key={currentPage} className="flex-1 animate-fade-in">
          {renderContent()}
        </div>

        {/* Footer */}
        <footer
          className="px-6 py-4 border-t mt-auto"
          style={{ borderColor: "var(--teacher-border)" }}
        >
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: "var(--teacher-primary)" }}
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
