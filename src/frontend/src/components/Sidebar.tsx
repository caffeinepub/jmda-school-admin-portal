import { GraduationCap, LayoutDashboard, Users, BookOpen, Megaphone, School, LogIn, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";
import { Badge } from "@/components/ui/badge";

type Page = "dashboard" | "students" | "teachers" | "classes" | "announcements";

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems = [
  { id: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
  { id: "students" as Page, label: "Students", icon: Users },
  { id: "teachers" as Page, label: "Teachers", icon: GraduationCap },
  { id: "classes" as Page, label: "Classes", icon: BookOpen },
  { id: "announcements" as Page, label: "Announcements", icon: Megaphone },
];

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();
  const isLoggedIn = loginStatus === "success" && !!identity;

  return (
    <aside className="sidebar-glow w-64 min-h-screen flex flex-col bg-sidebar shrink-0">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <School className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-sidebar-foreground leading-tight tracking-tight">
              JMDA
            </h1>
            <p className="text-xs text-muted-foreground font-medium">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Navigation
        </p>
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? "nav-item-active text-primary"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-sidebar-foreground"
                }`}
              />
              <span className="flex-1 text-left">{item.label}</span>
              {isActive && (
                <ChevronRight className="w-3 h-3 text-primary opacity-70" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Auth section */}
      <div className="px-4 py-4 border-t border-sidebar-border space-y-3">
        {isLoggedIn ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-2">
              <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-primary">
                  {identity.getPrincipal().toString().slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-sidebar-foreground truncate">
                  {identity.getPrincipal().toString().slice(0, 12)}…
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  {isAdmin ? (
                    <Badge className="text-[10px] h-4 px-1.5 bg-primary/20 text-primary border-primary/30 font-semibold">
                      Admin
                    </Badge>
                  ) : (
                    <Badge className="text-[10px] h-4 px-1.5 bg-muted text-muted-foreground border-border font-semibold">
                      Read-only
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clear}
              className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground px-1">
              Sign in to manage school data
            </p>
            <Button
              size="sm"
              onClick={login}
              disabled={loginStatus === "logging-in"}
              className="w-full bg-primary/90 hover:bg-primary text-primary-foreground gap-2 text-xs font-semibold"
            >
              <LogIn className="w-3.5 h-3.5" />
              {loginStatus === "logging-in" ? "Signing in…" : "Sign in"}
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
