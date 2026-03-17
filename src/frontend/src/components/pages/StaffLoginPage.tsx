import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, GraduationCap, LogIn } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export interface StaffSession {
  type: "employee" | "student";
  employeeId?: string;
  studentId?: string;
  username: string;
  name: string;
}

interface StaffLoginPageProps {
  onLogin: (session: StaffSession) => void;
  onBack: () => void;
}

export default function StaffLoginPage({
  onLogin,
  onBack,
}: StaffLoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Please enter username and password.");
      return;
    }
    setLoading(true);
    try {
      // Check employee credentials
      const empCredsRaw = window.localStorage.getItem(
        "jmda_employee_credentials",
      );
      const empCreds = empCredsRaw ? JSON.parse(empCredsRaw) : [];
      const empMatch = empCreds.find(
        (c: {
          username: string;
          password: string;
          active: boolean;
          employeeId: string;
        }) =>
          c.username.toLowerCase() === username.trim().toLowerCase() &&
          c.password === password &&
          c.active,
      );
      if (empMatch) {
        // Get employee name
        const empsRaw = window.localStorage.getItem("jmda_employees");
        const emps = empsRaw ? JSON.parse(empsRaw) : [];
        const emp = emps.find(
          (e: { id: string; name: string }) => e.id === empMatch.employeeId,
        );
        const session: StaffSession = {
          type: "employee",
          employeeId: empMatch.employeeId,
          username: empMatch.username,
          name: emp?.name || empMatch.username,
        };
        window.localStorage.setItem(
          "jmda_staff_session",
          JSON.stringify(session),
        );
        onLogin(session);
        return;
      }

      // Check student credentials
      const stuCredsRaw = window.localStorage.getItem(
        "jmda_student_credentials",
      );
      const stuCreds = stuCredsRaw ? JSON.parse(stuCredsRaw) : [];
      const stuMatch = stuCreds.find(
        (c: {
          username: string;
          password: string;
          active: boolean;
          studentId: string;
        }) =>
          c.username.toLowerCase() === username.trim().toLowerCase() &&
          c.password === password &&
          c.active,
      );
      if (stuMatch) {
        const session: StaffSession = {
          type: "student",
          studentId: stuMatch.studentId,
          username: stuMatch.username,
          name: stuMatch.username,
        };
        window.localStorage.setItem(
          "jmda_staff_session",
          JSON.stringify(session),
        );
        onLogin(session);
        return;
      }

      toast.error("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto">
            <GraduationCap className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-display font-bold">JMDA Portal</h1>
          <p className="text-muted-foreground text-sm">Staff & Student Login</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sign in to your account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="staff-username">Username</Label>
                <Input
                  id="staff-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. T001 or STU001"
                  autoComplete="username"
                  data-ocid="staff_login.username.input"
                />
              </div>
              <div>
                <Label htmlFor="staff-password">Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="staff-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    autoComplete="current-password"
                    className="pr-10"
                    data-ocid="staff_login.password.input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full gap-2"
                disabled={loading}
                data-ocid="staff_login.submit_button"
              >
                <LogIn className="w-4 h-4" />
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Button
          variant="ghost"
          className="w-full text-sm text-muted-foreground"
          onClick={onBack}
          data-ocid="staff_login.back_button"
        >
          ← Back to Admin Login
        </Button>
      </div>
    </div>
  );
}
