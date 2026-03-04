import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  Calendar,
  Loader2,
  Megaphone,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Announcement } from "../backend.d";
import {
  useAnnouncements,
  useCreateAnnouncement,
  useDeleteAnnouncement,
  useIsAdmin,
} from "../hooks/useQueries";
import { formatNanoDate } from "../utils/formatDate";

interface AnnouncementFormData {
  title: string;
  message: string;
}

const emptyForm: AnnouncementFormData = { title: "", message: "" };

function validateForm(data: AnnouncementFormData): string | null {
  if (!data.title.trim()) return "Title is required.";
  if (!data.message.trim()) return "Message is required.";
  return null;
}

export default function Announcements() {
  const { data: announcements, isLoading } = useAnnouncements();
  const { data: isAdmin } = useIsAdmin();
  const createAnnouncement = useCreateAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();

  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  const [form, setForm] = useState<AnnouncementFormData>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  const sortedAnnouncements = [...(announcements ?? [])].sort((a, b) =>
    b.date > a.date ? 1 : -1,
  );

  const openAdd = () => {
    setForm(emptyForm);
    setFormError(null);
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    const err = validateForm(form);
    if (err) {
      setFormError(err);
      return;
    }
    try {
      await createAnnouncement.mutateAsync({
        title: form.title.trim(),
        message: form.message.trim(),
      });
      toast.success("Announcement posted.");
      setFormOpen(false);
    } catch {
      toast.error("Failed to post announcement.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAnnouncement.mutateAsync(deleteTarget.id);
      toast.success("Announcement deleted.");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete announcement.");
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Announcements
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {announcements?.length ?? 0} posted announcements
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={openAdd}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            <Plus className="w-4 h-4" />
            Post Announcement
          </Button>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {["sk1", "sk2", "sk3"].map((sk) => (
            <div
              key={sk}
              className="rounded-xl p-4 bg-card border border-border shadow-card"
            >
              <Skeleton className="h-5 w-48 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-3/4 mb-3" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      ) : sortedAnnouncements.length === 0 ? (
        <div className="rounded-xl p-16 bg-card border border-border text-center shadow-card animate-fade-in">
          <Megaphone className="w-12 h-12 text-muted-foreground opacity-40 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No announcements yet.</p>
          {isAdmin && (
            <Button
              onClick={openAdd}
              variant="ghost"
              size="sm"
              className="mt-3 gap-2 text-primary hover:text-primary/80"
            >
              <Plus className="w-3.5 h-3.5" />
              Post your first announcement
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3 animate-fade-in">
          {sortedAnnouncements.map((ann) => (
            <div
              key={ann.id.toString()}
              className="group rounded-xl p-5 bg-card border border-border hover:border-primary/30 transition-colors shadow-card"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0 mt-0.5">
                    <Megaphone className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-foreground mb-1">
                      {ann.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {ann.message}
                    </p>
                    <div className="flex items-center gap-1.5 mt-3">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {formatNanoDate(ann.date)}
                      </span>
                    </div>
                  </div>
                </div>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTarget(ann)}
                    className="w-8 h-8 opacity-0 group-hover:opacity-100 hover:bg-destructive/15 hover:text-destructive transition-opacity shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Post Announcement
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {formError && (
              <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {formError}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="atitle">Title</Label>
              <Input
                id="atitle"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="e.g. End-of-Term Assembly Schedule"
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="amessage">Message</Label>
              <Textarea
                id="amessage"
                value={form.message}
                onChange={(e) =>
                  setForm((p) => ({ ...p, message: e.target.value }))
                }
                placeholder="Write your announcement here..."
                className="bg-background border-border min-h-[100px] resize-none"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setFormOpen(false)}
              disabled={createAnnouncement.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createAnnouncement.isPending}
              className="bg-primary text-primary-foreground"
            >
              {createAnnouncement.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Post Announcement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete Announcement?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the announcement{" "}
              <strong className="text-foreground">
                "{deleteTarget?.title}"
              </strong>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {deleteAnnouncement.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
