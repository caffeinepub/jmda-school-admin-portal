import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Students from "./components/Students";
import Teachers from "./components/Teachers";
import Classes from "./components/Classes";
import Announcements from "./components/Announcements";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Page = "dashboard" | "students" | "teachers" | "classes" | "announcements";

const PAGE_TITLES: Record<Page, string> = {
  dashboard: "Dashboard",
  students: "Students",
  teachers: "Teachers",
  classes: "Classes",
  announcements: "Announcements",
};

function PageContent({ page }: { page: Page }) {
  const pages: Record<Page, React.ReactNode> = {
    dashboard: <Dashboard />,
    students: <Students />,
    teachers: <Teachers />,
    classes: <Classes />,
    announcements: <Announcements />,
  };
  return <>{pages[page]}</>;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <div className="sticky top-0 h-screen">
          <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
        </div>
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
          <div className="fixed left-0 top-0 h-full z-50 lg:hidden animate-slide-in-left">
            <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
          </div>
        </>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9"
              onClick={() => setMobileMenuOpen((v) => !v)}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
            <span className="font-display font-bold text-foreground">
              JMDA · <span className="text-primary">{PAGE_TITLES[currentPage]}</span>
            </span>
          </div>
        </div>

        {/* Page with fade-in transition */}
        <div key={currentPage} className="flex-1 animate-fade-in">
          <PageContent page={currentPage} />
        </div>

        {/* Footer */}
        <footer className="px-6 lg:px-8 py-4 border-t border-border mt-auto">
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()}.{" "}
            Built with ❤️ using{" "}
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
