import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  GraduationCap,
  Megaphone,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Page } from "../../App";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import {
  useAnnouncements,
  useClaimAdmin,
  useCreateAnnouncement,
  useDeleteAnnouncement,
  useForceClaimAdmin,
  useIsAdmin,
  useSchoolStats,
} from "../../hooks/useQueries";

interface DashboardPageProps {
  onNavigate: (page: Page) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { identity } = useInternetIdentity();
  const { data: stats, isLoading: statsLoading } = useSchoolStats();
  const { data: isAdmin } = useIsAdmin();
  const { data: announcements, isLoading: annLoading } = useAnnouncements();
  const claimAdmin = useClaimAdmin();
  const forceClaimAdmin = useForceClaimAdmin();
  const createAnnouncement = useCreateAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();
  const [annDialogOpen, setAnnDialogOpen] = useState(false);
  const [annTitle, setAnnTitle] = useState("");
  const [annMessage, setAnnMessage] = useState("");

  const handleClaimAdmin = async () => {
    try {
      const result = await claimAdmin.mutateAsync();
      if (result) {
        toast.success("Admin access claimed successfully!");
      } else {
        try {
          const forced = await forceClaimAdmin.mutateAsync();
          if (forced) {
            toast.success("Admin access claimed successfully!");
          } else {
            toast.error("Could not claim admin access.");
          }
        } catch {
          toast.error("Could not claim admin access.");
        }
      }
    } catch {
      toast.error("An error occurred while claiming admin access.");
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!annTitle.trim() || !annMessage.trim()) {
      toast.error("Please fill in title and message.");
      return;
    }
    try {
      await createAnnouncement.mutateAsync({
        title: annTitle,
        message: annMessage,
      });
      toast.success("Announcement created!");
      setAnnTitle("");
      setAnnMessage("");
      setAnnDialogOpen(false);
    } catch {
      toast.error("Failed to create announcement.");
    }
  };

  const statCards = [
    {
      label: "Total Students",
      value: stats?.studentCount?.toString() ?? "0",
      icon: GraduationCap,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Total Teachers",
      value: stats?.teacherCount?.toString() ?? "0",
      icon: Users,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      label: "Active Classes",
      value: stats?.classCount?.toString() ?? "0",
      icon: BookOpen,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
    {
      label: "Announcements",
      value: stats?.announcementCount?.toString() ?? "0",
      icon: Megaphone,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
    {
      label: "Total Fees Collected",
      value: stats
        ? `₹${Number(stats.totalFeeCollected).toLocaleString("en-IN")}`
        : "₹0",
      icon: TrendingUp,
      color: "text-rose-400",
      bg: "bg-rose-400/10",
    },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Welcome to JMDA
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {identity
              ? `Logged in as ${identity.getPrincipal().toString().slice(0, 12)}...`
              : "Sign in to manage school data."}
          </p>
        </div>
        {identity && !isAdmin && (
          <div className="flex flex-col items-end gap-2">
            <Badge
              variant="secondary"
              className="text-amber-400 bg-amber-400/10 border-amber-400/30"
            >
              Read-Only Access
            </Badge>
            <Button
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-white text-xs"
              onClick={handleClaimAdmin}
              disabled={claimAdmin.isPending || forceClaimAdmin.isPending}
              data-ocid="dashboard.primary_button"
            >
              <ShieldCheck className="w-3 h-3 mr-1" />
              Claim Admin Access
            </Button>
          </div>
        )}
        {isAdmin && (
          <Badge className="bg-primary/20 text-primary border-primary/30">
            <ShieldCheck className="w-3 h-3 mr-1" />
            Administrator
          </Badge>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map((card) => (
          <Card key={card.label} className="stat-card border-border">
            <CardContent className="p-4">
              {statsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-12" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div
                    className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}
                  >
                    <card.icon className={`w-4 h-4 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-xl font-display font-bold text-foreground">
                      {card.value}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {card.label}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onNavigate("add-student")}
            data-ocid="dashboard.secondary_button"
          >
            + Add Student
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onNavigate("classes")}
            data-ocid="dashboard.secondary_button"
          >
            Manage Classes
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onNavigate("fees-collect")}
            data-ocid="dashboard.secondary_button"
          >
            Collect Fees
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onNavigate("attendance")}
            data-ocid="dashboard.secondary_button"
          >
            Take Attendance
          </Button>
          {isAdmin && (
            <Dialog open={annDialogOpen} onOpenChange={setAnnDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  data-ocid="announcements.open_modal_button"
                >
                  + New Announcement
                </Button>
              </DialogTrigger>
              <DialogContent data-ocid="announcements.dialog">
                <DialogHeader>
                  <DialogTitle>New Announcement</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div>
                    <Label htmlFor="ann-title">Title *</Label>
                    <Input
                      id="ann-title"
                      value={annTitle}
                      onChange={(e) => setAnnTitle(e.target.value)}
                      placeholder="Announcement title"
                      data-ocid="announcements.input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ann-message">Message *</Label>
                    <Textarea
                      id="ann-message"
                      value={annMessage}
                      onChange={(e) => setAnnMessage(e.target.value)}
                      placeholder="Announcement message"
                      rows={4}
                      data-ocid="announcements.textarea"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setAnnDialogOpen(false)}
                      data-ocid="announcements.cancel_button"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateAnnouncement}
                      disabled={createAnnouncement.isPending}
                      data-ocid="announcements.submit_button"
                    >
                      Post Announcement
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Recent Announcements */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Recent Announcements
          </h2>
          <span className="text-xs text-muted-foreground">
            {announcements?.length ?? 0} total
          </span>
        </div>
        {annLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : !announcements?.length ? (
          <Card
            className="border-dashed border-border"
            data-ocid="announcements.empty_state"
          >
            <CardContent className="py-8 text-center">
              <Megaphone className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No announcements yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {[...(announcements ?? [])]
              .sort((a, b) => Number(b.date) - Number(a.date))
              .slice(0, 5)
              .map((ann, idx) => (
                <Card
                  key={ann.id.toString()}
                  className="border-border"
                  data-ocid={`announcements.item.${idx + 1}`}
                >
                  <CardContent className="px-4 py-3 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {ann.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {ann.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(
                          Number(ann.date) / 1_000_000,
                        ).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive shrink-0 w-7 h-7"
                        onClick={() => deleteAnnouncement.mutate(ann.id)}
                        data-ocid={`announcements.delete_button.${idx + 1}`}
                      >
                        ×
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
