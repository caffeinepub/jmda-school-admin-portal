import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  BookOpen,
  DollarSign,
  GraduationCap,
  Loader2,
  Megaphone,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAnnouncements,
  useClaimAdmin,
  useForceClaimAdmin,
  useIsAdmin,
  useSchoolStats,
} from "../hooks/useQueries";
import { formatNanoDate } from "../utils/formatDate";

interface StatCardProps {
  label: string;
  value: bigint | undefined;
  icon: React.ElementType;
  color: string;
  format?: "number" | "currency";
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  format = "number",
}: StatCardProps) {
  const displayValue =
    value !== undefined
      ? format === "currency"
        ? Number(value).toLocaleString()
        : value.toString()
      : undefined;

  return (
    <div className="stat-card rounded-xl p-5 shadow-card animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <TrendingUp className="w-4 h-4 text-muted-foreground" />
      </div>
      <div>
        {displayValue !== undefined ? (
          <p className="font-display text-2xl lg:text-3xl font-bold text-foreground tracking-tight truncate">
            {displayValue}
          </p>
        ) : (
          <Skeleton className="h-9 w-16 mb-1" />
        )}
        <p className="text-sm text-muted-foreground mt-1 font-medium">
          {label}
        </p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useSchoolStats();
  const { data: announcements, isLoading: announcementsLoading } =
    useAnnouncements();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const { identity } = useInternetIdentity();
  const claimAdmin = useClaimAdmin();
  const forceClaimAdmin = useForceClaimAdmin();

  const handleClaimAdmin = async () => {
    try {
      const result = await claimAdmin.mutateAsync();
      if (result) {
        toast.success("Admin access granted! You now have full access.");
        return;
      }
      // claimAdmin returned false — an admin was already assigned; force-claim instead
      const forceResult = await forceClaimAdmin.mutateAsync();
      if (forceResult) {
        toast.success("Admin access granted! You now have full access.");
      } else {
        toast.error("Could not claim admin access. Please try again.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const statCards = [
    {
      label: "Total Students",
      value: stats?.studentCount,
      icon: Users,
      color: "bg-primary/20 border border-primary/30 text-primary",
    },
    {
      label: "Total Teachers",
      value: stats?.teacherCount,
      icon: GraduationCap,
      color: "bg-blue-500/20 border border-blue-500/30 text-blue-400",
    },
    {
      label: "Active Classes",
      value: stats?.classCount,
      icon: BookOpen,
      color: "bg-amber-500/20 border border-amber-500/30 text-amber-400",
    },
    {
      label: "Announcements",
      value: stats?.announcementCount,
      icon: Megaphone,
      color: "bg-purple-500/20 border border-purple-500/30 text-purple-400",
    },
    {
      label: "Total Fee Collected",
      value: stats?.totalFeeCollected,
      icon: DollarSign,
      color: "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400",
      format: "currency" as const,
    },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Welcome to <span className="gradient-text">JMDA</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              {identity
                ? isAdmin
                  ? "You have full administrator access."
                  : "You have read-only access."
                : "Sign in to manage school data."}
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-muted-foreground font-medium">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Claim Admin Banner */}
      {identity && !isAdminLoading && isAdmin === false && (
        <div className="animate-fade-in rounded-xl border border-amber-500/40 bg-amber-500/10 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">
                  Read-Only Access
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  You currently have read-only access. If you are the school
                  administrator, click below to claim full admin access.
                </p>
              </div>
            </div>
            <Button
              onClick={handleClaimAdmin}
              disabled={claimAdmin.isPending || forceClaimAdmin.isPending}
              className="bg-amber-500 hover:bg-amber-400 text-amber-950 font-semibold shrink-0 cursor-pointer"
            >
              {claimAdmin.isPending || forceClaimAdmin.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Claiming...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Claim Admin Access
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Stats grid */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {["s1", "s2", "s3", "s4", "s5"].map((k) => (
            <div key={k} className="stat-card rounded-xl p-5">
              <Skeleton className="h-10 w-10 rounded-lg mb-4" />
              <Skeleton className="h-9 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>
      )}

      {/* Recent Announcements */}
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-foreground">
            Recent Announcements
          </h2>
          <span className="text-xs text-muted-foreground">
            {announcements?.length ?? 0} total
          </span>
        </div>

        {announcementsLoading ? (
          <div className="space-y-3">
            {["a1", "a2", "a3"].map((k) => (
              <div
                key={k}
                className="rounded-xl p-4 bg-card border border-border"
              >
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-20 mt-2" />
              </div>
            ))}
          </div>
        ) : announcements && announcements.length > 0 ? (
          <div className="space-y-3">
            {[...announcements]
              .sort((a, b) => (b.date > a.date ? 1 : -1))
              .slice(0, 5)
              .map((ann) => (
                <div
                  key={ann.id.toString()}
                  className="rounded-xl p-4 bg-card border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm truncate">
                        {ann.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {ann.message}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
                      {formatNanoDate(ann.date)}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="rounded-xl p-10 bg-card border border-border text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">
              No announcements yet.
            </p>
            {isAdmin && (
              <p className="text-xs text-muted-foreground mt-1">
                Go to Announcements to post one.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
