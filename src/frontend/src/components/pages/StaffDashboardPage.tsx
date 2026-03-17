import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, LogOut, User } from "lucide-react";
import type { StaffSession } from "./StaffLoginPage";

interface StaffDashboardPageProps {
  session: StaffSession;
  onLogout: () => void;
}

export default function StaffDashboardPage({
  session,
  onLogout,
}: StaffDashboardPageProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-4 py-3 flex items-center justify-between bg-card">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-display font-bold">JMDA</p>
            <p className="text-[10px] text-muted-foreground">School Portal</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={onLogout}
          data-ocid="staff_dashboard.logout_button"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </Button>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-sm w-full">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
            <User className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">
              Welcome, {session.name}!
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              You are logged in as{" "}
              <span className="font-medium capitalize">
                {session.type === "employee" ? "Staff" : "Student"}
              </span>
            </p>
          </div>

          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Account Type
                  </span>
                  <span className="text-sm font-semibold capitalize">
                    {session.type === "employee"
                      ? "Staff / Teacher"
                      : "Student"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Username / ID
                  </span>
                  <span className="text-sm font-mono font-bold text-primary">
                    {session.username}
                  </span>
                </div>
                {session.type === "employee" && session.employeeId && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Employee ID
                    </span>
                    <span className="text-sm font-mono">
                      {session.employeeId}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">
            Contact the school admin for portal access and permissions.
          </p>
        </div>
      </main>

      <footer className="px-6 py-4 border-t border-border">
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
    </div>
  );
}
