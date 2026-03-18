import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import {
  AlertCircle,
  BarChart2,
  BookOpen,
  BookText,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  Edit,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  Printer,
  Receipt,
  Settings,
  Star,
  Trash2,
  User,
  UserSquare,
  Users,
  Video,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import AdminProfilePage from "./components/pages/AdminProfilePage";
import StaffDashboardPage from "./components/pages/StaffDashboardPage";
import StaffLoginPage, {
  type StaffSession,
} from "./components/pages/StaffLoginPage";
import TeacherPortalPage from "./components/pages/TeacherPortalPage";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useIsAdmin, useMyTeacherId } from "./hooks/useQueries";

import ActiveInactivePage from "./components/pages/ActiveInactivePage";
import AddStudentPage from "./components/pages/AddStudentPage";
import AdmissionLetterPage from "./components/pages/AdmissionLetterPage";
import AttendanceClasswisePage from "./components/pages/AttendanceClasswisePage";
import AttendancePage from "./components/pages/AttendancePage";
import CertificatesGeneratePage from "./components/pages/CertificatesGeneratePage";
import CertificatesTemplatesPage from "./components/pages/CertificatesTemplatesPage";
import ClassTestsMarksPage from "./components/pages/ClassTestsMarksPage";
import ClassTestsResultPage from "./components/pages/ClassTestsResultPage";
import ClassesPage from "./components/pages/ClassesPage";
import ComingSoonPage from "./components/pages/ComingSoonPage";
// Pages
import DashboardPage from "./components/pages/DashboardPage";
import EditEmployeePage from "./components/pages/EditEmployeePage";
import EmployeesAttendancePage from "./components/pages/EmployeesAttendancePage";
import EmployeesAttendanceReportPage from "./components/pages/EmployeesAttendanceReportPage";
import EmployeesPage from "./components/pages/EmployeesPage";
import ExamsAddUpdatePage from "./components/pages/ExamsAddUpdatePage";
import ExamsBlankAwardPage from "./components/pages/ExamsBlankAwardPage";
import ExamsCreatePage from "./components/pages/ExamsCreatePage";
import ExamsDateSheetPage from "./components/pages/ExamsDateSheetPage";
import ExamsMarksPage from "./components/pages/ExamsMarksPage";
import ExamsPage from "./components/pages/ExamsPage";
import ExamsResultCardPage from "./components/pages/ExamsResultCardPage";
import ExamsResultSheetPage from "./components/pages/ExamsResultSheetPage";
import ExamsSchedulePage from "./components/pages/ExamsSchedulePage";
import FamiliesPage from "./components/pages/FamiliesPage";
import FeeHistoryPage from "./components/pages/FeeHistoryPage";
import FeesCollectPage from "./components/pages/FeesCollectPage";
import FeesDefaultersPage from "./components/pages/FeesDefaultersPage";
import FeesDeletePage from "./components/pages/FeesDeletePage";
import FeesInvoicePage from "./components/pages/FeesInvoicePage";
import FeesPaidSlipPage from "./components/pages/FeesPaidSlipPage";
import FeesReportPage from "./components/pages/FeesReportPage";
import HomeworkPage from "./components/pages/HomeworkPage";
import ManageLoginPage from "./components/pages/ManageLoginPage";
import ProgressiveReportCardPage from "./components/pages/ProgressiveReportCardPage";
import PromoteStudentsPage from "./components/pages/PromoteStudentsPage";
import ReportsPage from "./components/pages/ReportsPage";
import ReportsParentInfoPage from "./components/pages/ReportsParentInfoPage";
import ReportsStaffMonthlyAttPage from "./components/pages/ReportsStaffMonthlyAttPage";
import ReportsStudentCardPage from "./components/pages/ReportsStudentCardPage";
import ReportsStudentInfoPage from "./components/pages/ReportsStudentInfoPage";
import ReportsStudentMonthlyAttPage from "./components/pages/ReportsStudentMonthlyAttPage";
import SalaryPage from "./components/pages/SalaryPage";
import SalaryPaidSlipPage from "./components/pages/SalaryPaidSlipPage";
import SalaryPayPage from "./components/pages/SalaryPayPage";
import SalaryReportPage from "./components/pages/SalaryReportPage";
import SalarySheetPage from "./components/pages/SalarySheetPage";
import StudentIdCardsPage from "./components/pages/StudentIdCardsPage";
import StudentsAttendancePage from "./components/pages/StudentsAttendancePage";
import StudentsAttendanceReportPage from "./components/pages/StudentsAttendanceReportPage";
import StudentsPage from "./components/pages/StudentsPage";
import SubjectsPage from "./components/pages/SubjectsPage";
import TeachersPage from "./components/pages/TeachersPage";
import TimetableClassroomsPage from "./components/pages/TimetableClassroomsPage";
import TimetableCreatePage from "./components/pages/TimetableCreatePage";
import TimetableForClassPage from "./components/pages/TimetableForClassPage";
import TimetableForTeacherPage from "./components/pages/TimetableForTeacherPage";
import TimetablePage from "./components/pages/TimetablePage";
import TimetablePeriodsPage from "./components/pages/TimetablePeriodsPage";
import TimetableWeekdaysPage from "./components/pages/TimetableWeekdaysPage";
import { useAdminProfile } from "./hooks/useSchoolData";

// ── Page types ─────────────────────────────────────────────────────────────────────

export type Page =
  | "dashboard"
  | "general-settings"
  | "classes"
  | "subjects"
  | "students"
  | "add-student"
  | "edit-student"
  | "families"
  | "active-inactive"
  | "admission-letter"
  | "id-cards"
  | "print-list"
  | "promote-students"
  | "teachers"
  | "employees"
  | "edit-employee"
  | "accounts"
  | "fees-invoice"
  | "fees-collect"
  | "fees-paid-slip"
  | "fees-defaulters"
  | "fees-report"
  | "fees-delete"
  | "fee-history"
  | "salary"
  | "salary-pay"
  | "salary-paid-slip"
  | "salary-sheet"
  | "salary-report"
  | "attendance"
  | "timetable"
  | "homework"
  | "behaviour"
  | "store"
  | "whatsapp"
  | "messaging"
  | "sms"
  | "live-class"
  | "question-paper"
  | "exams"
  | "class-tests"
  | "reports"
  | "certificates"
  // Attendance sub-pages
  | "attendance-students"
  | "attendance-employees"
  | "attendance-classwise"
  | "attendance-students-report"
  | "attendance-employees-report"
  // Timetable sub-pages
  | "timetable-weekdays"
  | "timetable-periods"
  | "timetable-classrooms"
  | "timetable-create"
  | "timetable-for-class"
  | "timetable-for-teacher"
  // Exams sub-pages
  | "exams-create"
  | "exams-add-update"
  | "exams-marks"
  | "exams-result-card"
  | "exams-result-sheet"
  | "exams-schedule"
  | "exams-datesheet"
  | "exams-blank-award"
  // Class Tests sub-pages
  | "classtests-marks"
  | "classtests-result"
  // Reports sub-pages
  | "reports-student-card"
  | "reports-student-info"
  | "reports-parent-info"
  | "reports-student-monthly-att"
  | "reports-staff-monthly-att"
  | "progressive-report-card"
  // Certificates sub-pages
  | "certificates-generate"
  | "certificates-templates"
  // Manage Login sub-pages
  | "manage-login-students"
  | "manage-login-employees"
  | "staff-login"
  | "admin-profile";

const PAGE_TITLES: Record<Page, string> = {
  dashboard: "Dashboard",
  "general-settings": "General Settings",
  classes: "Classes",
  subjects: "Subjects",
  students: "All Students",
  "add-student": "Add Student",
  "edit-student": "Edit Student",
  families: "Manage Families",
  "active-inactive": "Active / Inactive",
  "admission-letter": "Admission Letter",
  "id-cards": "Student ID Cards",
  "print-list": "Print Basic List",
  "promote-students": "Promote Students",
  teachers: "Teachers",
  employees: "Employees",
  "edit-employee": "Edit Staff",
  accounts: "Accounts",
  "fees-invoice": "Generate Fees Invoice",
  "fees-collect": "Collect Fees",
  "fees-paid-slip": "Fees Paid Slip",
  "fees-defaulters": "Fees Defaulters",
  "fees-report": "Fees Report",
  "fees-delete": "Delete Fees",
  "fee-history": "Fee History",
  salary: "Salary",
  "salary-pay": "Pay Salary",
  "salary-paid-slip": "Salary Paid Slip",
  "salary-sheet": "Salary Sheet",
  "salary-report": "Salary Report",
  attendance: "Attendance",
  timetable: "Timetable",
  homework: "Homework",
  behaviour: "Behaviour & Skills",
  store: "Online Store & POS",
  whatsapp: "WhatsApp",
  messaging: "Messaging",
  sms: "SMS Services",
  "live-class": "Live Class",
  "question-paper": "Question Paper",
  exams: "Exams",
  "class-tests": "Class Tests",
  reports: "Reports",
  certificates: "Certificates",
  // Attendance sub-pages
  "attendance-students": "Students Attendance",
  "attendance-employees": "Employees Attendance",
  "attendance-classwise": "Class wise Report",
  "attendance-students-report": "Students Attendance Report",
  "attendance-employees-report": "Employees Attendance Report",
  // Timetable sub-pages
  "timetable-weekdays": "Weekdays",
  "timetable-periods": "Time Periods",
  "timetable-classrooms": "Class Rooms",
  "timetable-create": "Create Timetable",
  "timetable-for-class": "Generate For Class",
  "timetable-for-teacher": "Generate For Teacher",
  // Exams sub-pages
  "exams-create": "Create New Exam",
  "exams-add-update": "Add / Update Exam",
  "exams-marks": "Marks",
  "exams-result-card": "Result Card",
  "exams-result-sheet": "Result Sheet",
  "exams-schedule": "Exam Schedule",
  "exams-datesheet": "Date Sheet",
  "exams-blank-award": "Blank Award List",
  // Class Tests sub-pages
  "classtests-marks": "Manage Test Marks",
  "classtests-result": "Test Result",
  // Reports sub-pages
  "reports-student-card": "Students Report Card",
  "reports-student-info": "Students Info Report",
  "reports-parent-info": "Parents Info Report",
  "reports-student-monthly-att": "Students Monthly Attendance",
  "reports-staff-monthly-att": "Staff Monthly Attendance",
  "progressive-report-card": "Progressive Report Card",
  // Certificates sub-pages
  "certificates-generate": "Generate Certificate",
  "certificates-templates": "Certificate Templates",
  // Manage Login sub-pages
  "manage-login-students": "Manage Student Login",
  "manage-login-employees": "Manage Employee Login",
  "staff-login": "Staff Login",
  "admin-profile": "Admin Profile",
};

// ── Nav items ────────────────────────────────────────────────────────────────────

interface NavItem {
  page?: Page;
  label: string;
  icon: React.ElementType;
  children?: NavItem[];
  comingSoon?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { page: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    page: "general-settings",
    label: "General Settings",
    icon: Settings,
    comingSoon: true,
  },
  { page: "classes", label: "Classes", icon: BookOpen },
  { page: "subjects", label: "Subjects", icon: BookText },
  {
    label: "Students",
    icon: GraduationCap,
    children: [
      { page: "students", label: "All Students", icon: Users },
      { page: "add-student", label: "Add New", icon: GraduationCap },
      { page: "families", label: "Manage Families", icon: Building2 },
      { page: "active-inactive", label: "Active / Inactive", icon: UserSquare },
      { page: "admission-letter", label: "Admission Letter", icon: FileText },
      { page: "id-cards", label: "Student ID Cards", icon: UserSquare },
      {
        page: "print-list",
        label: "Print Basic List",
        icon: Printer,
        comingSoon: true,
      },
      {
        page: "manage-login-students",
        label: "Manage Login",
        icon: UserSquare,
      },
      {
        page: "promote-students",
        label: "Promote Students",
        icon: ChevronRight,
      },
    ],
  },
  { page: "teachers", label: "Teachers", icon: UserSquare },
  {
    label: "Employees",
    icon: Users,
    children: [
      { page: "employees", label: "All Employees", icon: Users },
      { page: "edit-employee", label: "Edit Staff", icon: Edit },
      {
        page: "manage-login-employees",
        label: "Manage Login",
        icon: UserSquare,
      },
    ],
  },
  { page: "accounts", label: "Accounts", icon: Wallet, comingSoon: true },
  {
    label: "Fees",
    icon: Wallet,
    children: [
      { page: "fees-invoice", label: "Generate Fees Invoice", icon: FileText },
      { page: "fees-collect", label: "Collect Fees", icon: Wallet },
      { page: "fees-paid-slip", label: "Fees Paid Slip", icon: Receipt },
      { page: "fees-defaulters", label: "Fees Defaulters", icon: AlertCircle },
      { page: "fees-report", label: "Fees Report", icon: BarChart2 },
      { page: "fees-delete", label: "Delete Fees", icon: Trash2 },
    ],
  },
  {
    label: "Salary",
    icon: Wallet,
    children: [
      { page: "salary-pay", label: "Pay Salary", icon: Wallet },
      { page: "salary-paid-slip", label: "Salary Paid Slip", icon: Receipt },
      { page: "salary-sheet", label: "Salary Sheet", icon: FileText },
      { page: "salary-report", label: "Salary Report", icon: BarChart2 },
    ],
  },
  {
    label: "Attendance",
    icon: ClipboardList,
    children: [
      {
        page: "attendance-students",
        label: "Students Attendance",
        icon: ClipboardList,
      },
      {
        page: "attendance-employees",
        label: "Employees Attendance",
        icon: ClipboardList,
      },
      {
        page: "attendance-classwise",
        label: "Class wise Report",
        icon: BarChart2,
      },
      {
        page: "attendance-students-report",
        label: "Students Attendance Report",
        icon: FileText,
      },
      {
        page: "attendance-employees-report",
        label: "Employees Attendance Report",
        icon: FileText,
      },
    ],
  },
  {
    label: "Timetable",
    icon: CalendarDays,
    children: [
      { page: "timetable-weekdays", label: "Weekdays", icon: CalendarDays },
      { page: "timetable-periods", label: "Time Periods", icon: Clock },
      { page: "timetable-classrooms", label: "Class Rooms", icon: Building2 },
      { page: "timetable-create", label: "Create Timetable", icon: Plus },
      {
        page: "timetable-for-class",
        label: "Generate For Class",
        icon: GraduationCap,
      },
      {
        page: "timetable-for-teacher",
        label: "Generate For Teacher",
        icon: UserSquare,
      },
    ],
  },
  { page: "homework", label: "Homework", icon: BookOpen },
  {
    page: "behaviour",
    label: "Behaviour & Skills",
    icon: Star,
    comingSoon: true,
  },
  {
    page: "store",
    label: "Online Store & POS",
    icon: Building2,
    comingSoon: true,
  },
  {
    page: "whatsapp",
    label: "WhatsApp",
    icon: MessageSquare,
    comingSoon: true,
  },
  {
    page: "messaging",
    label: "Messaging",
    icon: MessageSquare,
    comingSoon: true,
  },
  { page: "sms", label: "SMS Services", icon: MessageSquare, comingSoon: true },
  { page: "live-class", label: "Live Class", icon: Video, comingSoon: true },
  {
    page: "question-paper",
    label: "Question Paper",
    icon: FileText,
    comingSoon: true,
  },
  {
    label: "Exams",
    icon: BookOpen,
    children: [
      { page: "exams-create", label: "Create New Exam", icon: Plus },
      { page: "exams-add-update", label: "Add / Update Exam", icon: Edit },
      { page: "exams-marks", label: "Marks", icon: ClipboardList },
      { page: "exams-result-card", label: "Result Card", icon: FileText },
      { page: "exams-result-sheet", label: "Result Sheet", icon: FileText },
      { page: "exams-schedule", label: "Exam Schedule", icon: CalendarDays },
      { page: "exams-datesheet", label: "Date Sheet", icon: CalendarDays },
      { page: "exams-blank-award", label: "Blank Award List", icon: Star },
    ],
  },
  {
    label: "Class Tests",
    icon: ClipboardList,
    children: [
      {
        page: "classtests-marks",
        label: "Manage Test Marks",
        icon: ClipboardList,
      },
      { page: "classtests-result", label: "Test Result", icon: FileText },
    ],
  },
  {
    label: "Reports",
    icon: BarChart2,
    children: [
      {
        page: "reports-student-card",
        label: "Students Report Card",
        icon: FileText,
      },
      {
        page: "reports-student-info",
        label: "Students Info Report",
        icon: Users,
      },
      {
        page: "reports-parent-info",
        label: "Parents Info Report",
        icon: Users,
      },
      {
        page: "reports-student-monthly-att",
        label: "Students Monthly Attendance",
        icon: BarChart2,
      },
      {
        page: "reports-staff-monthly-att",
        label: "Staff Monthly Attendance",
        icon: BarChart2,
      },
      {
        page: "progressive-report-card",
        label: "Progressive Report Card",
        icon: FileText,
      },
    ],
  },
  {
    label: "Certificates",
    icon: Star,
    children: [
      {
        page: "certificates-generate",
        label: "Generate Certificate",
        icon: Star,
      },
      {
        page: "certificates-templates",
        label: "Certificate Templates",
        icon: FileText,
      },
    ],
  },
];

// ── Sidebar ────────────────────────────────────────────────────────────────────

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

function NavItemComponent({
  item,
  currentPage,
  onNavigate,
  depth = 0,
}: {
  item: NavItem;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(() => {
    if (!item.children) return false;
    return item.children.some(
      (c) =>
        c.page === currentPage ||
        c.children?.some((cc) => cc.page === currentPage),
    );
  });

  // Keep group expanded when currentPage changes to one of its children
  useEffect(() => {
    if (!item.children) return;
    const hasActive = item.children.some(
      (c) =>
        c.page === currentPage ||
        c.children?.some((cc) => cc.page === currentPage),
    );
    if (hasActive) setExpanded(true);
  }, [currentPage, item.children]);

  const isActive = item.page === currentPage;
  const hasActiveChild = item.children?.some((c) => c.page === currentPage);

  // Scroll active leaf item into view
  const activeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (isActive && activeRef.current) {
      activeRef.current.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [isActive]);

  if (item.children) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
            hasActiveChild
              ? "bg-primary/10 text-primary"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          }`}
          style={{ paddingLeft: `${(depth + 1) * 12}px` }}
        >
          <item.icon className="w-4 h-4 shrink-0" />
          <span className="flex-1 text-left font-medium">{item.label}</span>
          {expanded ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
        </button>
        {expanded && (
          <div className="ml-3 border-l border-sidebar-border pl-2 mt-0.5 space-y-0.5">
            {item.children.map((child, i) => (
              <NavItemComponent
                key={child.page ?? i}
                item={child}
                currentPage={currentPage}
                onNavigate={onNavigate}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!item.page) return null;

  return (
    <button
      ref={activeRef}
      type="button"
      onClick={() => onNavigate(item.page!)}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
        isActive
          ? "nav-item-active text-primary font-semibold"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      }`}
      style={{ paddingLeft: depth > 0 ? `${(depth + 1) * 10}px` : undefined }}
      data-ocid={`sidebar.nav_link.${item.page}`}
    >
      <item.icon className="w-4 h-4 shrink-0" />
      <span className="flex-1 text-left">{item.label}</span>
      {item.comingSoon && (
        <Badge className="text-[9px] py-0 h-4 bg-amber-500/20 text-amber-400 border-amber-500/30">
          Soon
        </Badge>
      )}
    </button>
  );
}

function AppSidebar({ currentPage, onNavigate }: SidebarProps) {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();
  const [adminProfile] = useAdminProfile();

  const displayName = adminProfile.name || null;
  const principalShort = identity
    ? `${identity.getPrincipal().toString().slice(0, 14)}...`
    : null;
  const initials = displayName
    ? displayName
        .split(" ")
        .map((w: string) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "A";

  return (
    <aside className="w-64 h-full bg-sidebar sidebar-glow flex flex-col min-h-0">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-display font-bold text-sidebar-foreground">
              JMDA
            </p>
            <p className="text-[10px] text-muted-foreground">
              School Admin Portal
            </p>
          </div>
        </div>
      </div>

      {/* Nav — takes all remaining height, always-visible scrollbar */}
      <div
        className="flex-1 min-h-0 overflow-y-scroll py-2"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "var(--sidebar-border) transparent",
        }}
      >
        <nav className="px-2 space-y-0.5">
          {NAV_ITEMS.map((item, i) => (
            <NavItemComponent
              key={item.page ?? `group-${i}`}
              item={item}
              currentPage={currentPage}
              onNavigate={onNavigate}
            />
          ))}
        </nav>
      </div>

      {/* User */}
      <div className="border-t border-sidebar-border p-3 shrink-0">
        {identity ? (
          <div className="space-y-1.5">
            {/* Clickable profile area */}
            <button
              type="button"
              onClick={() => onNavigate("admin-profile")}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-sidebar-accent transition-colors text-left"
              data-ocid="sidebar.open_modal_button"
            >
              <Avatar className="w-7 h-7 shrink-0">
                {adminProfile.picture ? (
                  <AvatarImage
                    src={adminProfile.picture}
                    alt={displayName ?? "Admin"}
                  />
                ) : null}
                <AvatarFallback className="text-xs bg-primary/20 text-primary font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-sidebar-foreground truncate">
                  {displayName ?? principalShort}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {isAdmin ? "Administrator" : "Viewer"}
                </p>
              </div>
              <User className="w-3 h-3 text-muted-foreground shrink-0" />
            </button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={clear}
              data-ocid="sidebar.logout_button"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            <Button
              variant="default"
              size="sm"
              className="w-full gap-2 text-xs"
              onClick={login}
              disabled={isLoggingIn}
              data-ocid="sidebar.primary_button"
            >
              <LogIn className="w-3.5 h-3.5" />
              {isLoggingIn ? "Signing in..." : "Sign In"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full gap-2 text-xs text-muted-foreground"
              onClick={() => onNavigate("staff-login")}
              data-ocid="sidebar.staff_login_button"
            >
              <LogIn className="w-3.5 h-3.5" />
              Staff / Student Login
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}

// ── Page Content ────────────────────────────────────────────────────────────────

interface PageNavProps {
  onNavigate: (page: Page, params?: Record<string, string>) => void;
  editStudentId?: string;
  editEmployeeId?: string;
}

function PageContent({
  page,
  onNavigate,
  editStudentId,
  editEmployeeId,
}: { page: Page } & PageNavProps) {
  switch (page) {
    case "dashboard":
      return <DashboardPage onNavigate={(p) => onNavigate(p)} />;
    case "students":
      return <StudentsPage onNavigate={onNavigate} />;
    case "add-student":
      return <AddStudentPage onNavigate={(p) => onNavigate(p)} />;
    case "edit-student":
      return (
        <AddStudentPage
          onNavigate={(p) => onNavigate(p)}
          editId={editStudentId}
        />
      );
    case "families":
      return <FamiliesPage />;
    case "active-inactive":
      return <ActiveInactivePage />;
    case "admission-letter":
      return <AdmissionLetterPage />;
    case "id-cards":
      return <StudentIdCardsPage />;
    case "promote-students":
      return <PromoteStudentsPage />;
    case "teachers":
      return <TeachersPage />;
    case "edit-employee":
      return (
        <EditEmployeePage
          onNavigate={(p) => onNavigate(p)}
          editId={editEmployeeId}
        />
      );
    case "classes":
      return <ClassesPage />;
    case "subjects":
      return <SubjectsPage />;
    case "employees":
      return <EmployeesPage onNavigate={onNavigate} />;
    case "fees-invoice":
      return <FeesInvoicePage />;
    case "fees-collect":
      return <FeesCollectPage />;
    case "fees-paid-slip":
      return <FeesPaidSlipPage />;
    case "fees-defaulters":
      return <FeesDefaultersPage />;
    case "fees-report":
      return <FeesReportPage />;
    case "fees-delete":
      return <FeesDeletePage />;
    case "fee-history":
      return <FeeHistoryPage />;
    case "salary":
    case "salary-pay":
      return <SalaryPayPage />;
    case "salary-paid-slip":
      return <SalaryPaidSlipPage />;
    case "salary-sheet":
      return <SalarySheetPage />;
    case "salary-report":
      return <SalaryReportPage />;
    case "attendance":
      return <AttendancePage />;
    case "attendance-students":
      return <StudentsAttendancePage />;
    case "attendance-employees":
      return <EmployeesAttendancePage />;
    case "attendance-classwise":
      return <AttendanceClasswisePage />;
    case "attendance-students-report":
      return <StudentsAttendanceReportPage />;
    case "attendance-employees-report":
      return <EmployeesAttendanceReportPage />;
    case "timetable":
      return <TimetablePage />;
    case "timetable-weekdays":
      return <TimetableWeekdaysPage />;
    case "timetable-periods":
      return <TimetablePeriodsPage />;
    case "timetable-classrooms":
      return <TimetableClassroomsPage />;
    case "timetable-create":
      return <TimetableCreatePage />;
    case "timetable-for-class":
      return <TimetableForClassPage />;
    case "timetable-for-teacher":
      return <TimetableForTeacherPage />;
    case "homework":
      return <HomeworkPage />;
    case "exams":
      return <ExamsPage />;
    case "exams-create":
      return <ExamsCreatePage />;
    case "exams-add-update":
      return <ExamsAddUpdatePage />;
    case "exams-marks":
      return <ExamsMarksPage />;
    case "exams-result-card":
      return <ExamsResultCardPage />;
    case "exams-result-sheet":
      return <ExamsResultSheetPage />;
    case "exams-schedule":
      return <ExamsSchedulePage />;
    case "exams-datesheet":
      return <ExamsDateSheetPage />;
    case "exams-blank-award":
      return <ExamsBlankAwardPage />;
    case "class-tests":
      return <ClassTestsMarksPage />;
    case "classtests-marks":
      return <ClassTestsMarksPage />;
    case "classtests-result":
      return <ClassTestsResultPage />;
    case "reports":
      return <ReportsPage />;
    case "reports-student-card":
      return <ReportsStudentCardPage />;
    case "reports-student-info":
      return <ReportsStudentInfoPage />;
    case "reports-parent-info":
      return <ReportsParentInfoPage />;
    case "reports-student-monthly-att":
      return <ReportsStudentMonthlyAttPage />;
    case "reports-staff-monthly-att":
      return <ReportsStaffMonthlyAttPage />;
    case "progressive-report-card":
      return <ProgressiveReportCardPage />;
    case "admin-profile":
      return <AdminProfilePage />;
    case "general-settings":
      return (
        <ComingSoonPage
          title="General Settings"
          description="Configure school name, logo, academic year, and other general settings."
        />
      );
    case "accounts":
      return (
        <ComingSoonPage
          title="Accounts"
          description="Manage income, expenses, and financial accounts."
        />
      );
    case "behaviour":
      return (
        <ComingSoonPage
          title="Behaviour & Skills"
          description="Track student behaviour and co-curricular skills."
        />
      );
    case "store":
      return (
        <ComingSoonPage
          title="Online Store & POS"
          description="Sell books, uniforms and materials online."
        />
      );
    case "whatsapp":
      return (
        <ComingSoonPage
          title="WhatsApp"
          description="Send WhatsApp messages to parents and students."
        />
      );
    case "messaging":
      return (
        <ComingSoonPage
          title="Messaging"
          description="Internal messaging between staff members."
        />
      );
    case "sms":
      return (
        <ComingSoonPage
          title="SMS Services"
          description="Send SMS notifications to parents."
        />
      );
    case "live-class":
      return (
        <ComingSoonPage
          title="Live Class"
          description="Conduct online live classes for students."
        />
      );
    case "question-paper":
      return (
        <ComingSoonPage
          title="Question Paper"
          description="Create and manage question papers for exams."
        />
      );
    case "certificates":
      return <CertificatesGeneratePage />;
    case "certificates-generate":
      return <CertificatesGeneratePage />;
    case "certificates-templates":
      return <CertificatesTemplatesPage />;
    case "print-list":
      return (
        <ComingSoonPage
          title="Print Basic List"
          description="Print a basic list of all students."
        />
      );
    case "manage-login-students":
      return <ManageLoginPage title="Manage Student Login" />;
    case "manage-login-employees":
      return <ManageLoginPage title="Manage Employee Login" />;
    default:
      return <DashboardPage onNavigate={(p) => onNavigate(p)} />;
  }
}

// ── App ────────────────────────────────────────────────────────────────────────

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [editStudentId, setEditStudentId] = useState<string | undefined>();
  const [staffSession, setStaffSession] = useState<StaffSession | null>(() => {
    try {
      const raw = window.localStorage.getItem("jmda_staff_session");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const { data: myTeacherId } = useMyTeacherId();
  const [editEmployeeId, setEditEmployeeId] = useState<string | undefined>();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { identity } = useInternetIdentity();

  const handleNavigate = (page: Page, params?: Record<string, string>) => {
    // Always update editStudentId when navigating to edit-student
    // Clear it if no id param so "Add New" works correctly
    if (page === "edit-student") {
      setEditStudentId(params?.id);
    }
    // Always update editEmployeeId when navigating to edit-employee
    // CRITICAL: Clear it if no id param so "Add Employee" always creates new
    if (page === "edit-employee") {
      setEditEmployeeId(params?.id ?? undefined);
    }
    setCurrentPage(page);
    setMobileMenuOpen(false);
  };

  // If staff session is active and no II identity, show staff views
  if (staffSession && !identity) {
    if (currentPage === "staff-login") {
      return (
        <>
          <StaffLoginPage
            onLogin={(session) => {
              setStaffSession(session);
              setCurrentPage("dashboard");
            }}
            onBack={() => setCurrentPage("dashboard")}
          />
          <Toaster richColors position="top-right" />
        </>
      );
    }
    return (
      <>
        <StaffDashboardPage
          session={staffSession}
          onLogout={() => {
            window.localStorage.removeItem("jmda_staff_session");
            setStaffSession(null);
            setCurrentPage("dashboard");
          }}
        />
        <Toaster richColors position="top-right" />
      </>
    );
  }

  // Show Staff Login page (no session yet)
  if (currentPage === "staff-login" && !identity) {
    return (
      <>
        <StaffLoginPage
          onLogin={(session) => {
            setStaffSession(session);
            setCurrentPage("dashboard");
          }}
          onBack={() => setCurrentPage("dashboard")}
        />
        <Toaster richColors position="top-right" />
      </>
    );
  }

  // Show Teacher Portal for teachers
  if (myTeacherId !== null && myTeacherId !== undefined) {
    return <TeacherPortalPage />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block sticky top-0 h-screen">
        <AppSidebar currentPage={currentPage} onNavigate={handleNavigate} />
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
            <AppSidebar currentPage={currentPage} onNavigate={handleNavigate} />
          </div>
        </>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9"
              onClick={() => setMobileMenuOpen((v) => !v)}
              data-ocid="sidebar.button"
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </Button>
            <span className="font-display font-bold text-foreground text-sm">
              JMDA ·{" "}
              <span className="text-primary">{PAGE_TITLES[currentPage]}</span>
            </span>
          </div>
        </div>

        {/* Page — key ensures fresh mount on every navigation so localStorage is re-read */}
        <div
          key={`${currentPage}-${editEmployeeId ?? "new"}-${editStudentId ?? "new"}`}
          className="flex-1 animate-fade-in"
        >
          <PageContent
            page={currentPage}
            onNavigate={handleNavigate}
            editStudentId={editStudentId}
            editEmployeeId={editEmployeeId}
          />
        </div>

        {/* Footer */}
        <footer className="px-6 lg:px-8 py-4 border-t border-border mt-auto no-print">
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </main>

      <Toaster richColors position="top-right" />
    </div>
  );
}
