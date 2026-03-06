import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "../../hooks/useLocalStorage";

interface CertificateTemplate {
  id: string;
  name: string;
  body: string;
}

const DEFAULT_TEMPLATES: CertificateTemplate[] = [
  {
    id: "bonafide",
    name: "Bonafide Certificate",
    body: "This is to certify that {studentName}, son/daughter of {guardianName}, bearing Registration No. {registrationNo}, is a bonafide student of {className} in this institution during the academic year 2025-26. This certificate is issued on the request of the student for the purpose stated.",
  },
  {
    id: "character",
    name: "Character Certificate",
    body: "This is to certify that {studentName}, Registration No. {registrationNo}, was a student of {className} in this institution. During their tenure, they have been found to be of good character and conduct. They have maintained exemplary discipline and academic performance.",
  },
  {
    id: "transfer",
    name: "Transfer Certificate",
    body: "This is to certify that {studentName}, son/daughter of {guardianName}, Registration No. {registrationNo}, was a student of {className} in this institution. They are hereby granted a Transfer Certificate as they are leaving this institution. Their conduct and character during their stay have been satisfactory.",
  },
];

const PLACEHOLDERS = [
  "{studentName}",
  "{guardianName}",
  "{registrationNo}",
  "{className}",
];

export default function CertificatesTemplatesPage() {
  const [templates, setTemplates] = useLocalStorage<CertificateTemplate[]>(
    "jmda_cert_templates",
    DEFAULT_TEMPLATES,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", body: "" });

  const openAdd = () => {
    setEditId(null);
    setForm({ name: "", body: "" });
    setDialogOpen(true);
  };

  const openEdit = (t: CertificateTemplate) => {
    setEditId(t.id);
    setForm({ name: t.name, body: t.body });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error("Template name is required.");
      return;
    }
    if (!form.body.trim()) {
      toast.error("Template body is required.");
      return;
    }
    if (editId) {
      setTemplates((prev) =>
        prev.map((t) => (t.id === editId ? { ...t, ...form } : t)),
      );
      toast.success("Template updated.");
    } else {
      setTemplates((prev) => [...prev, { id: `tmpl_${Date.now()}`, ...form }]);
      toast.success("Template created.");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    toast.success("Template deleted.");
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">
            Certificate Templates
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage reusable certificate templates with placeholders
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="gap-2"
          data-ocid="cert-templates.primary_button"
        >
          <Plus className="w-4 h-4" /> New Template
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span>Available placeholders:</span>
        {PLACEHOLDERS.map((p) => (
          <Badge key={p} variant="secondary" className="font-mono text-xs">
            {p}
          </Badge>
        ))}
      </div>

      {templates.length === 0 ? (
        <div
          className="py-12 text-center text-muted-foreground"
          data-ocid="cert-templates.empty_state"
        >
          No templates yet. Create your first template.
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Template Name</TableHead>
                <TableHead>Preview</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((t, idx) => (
                <TableRow
                  key={t.id}
                  data-ocid={`cert-templates.row.${idx + 1}`}
                >
                  <TableCell className="text-muted-foreground text-xs">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[400px]">
                    <p className="truncate">{t.body}</p>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7"
                        onClick={() => openEdit(t)}
                        data-ocid={`cert-templates.edit_button.${idx + 1}`}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(t.id)}
                        data-ocid={`cert-templates.delete_button.${idx + 1}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" data-ocid="cert-templates.dialog">
          <DialogHeader>
            <DialogTitle>
              {editId ? "Edit Template" : "New Template"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Template Name *</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Bonafide Certificate"
                data-ocid="cert-templates.input"
              />
            </div>
            <div>
              <Label>Certificate Body *</Label>
              <Textarea
                value={form.body}
                onChange={(e) =>
                  setForm((f) => ({ ...f, body: e.target.value }))
                }
                rows={6}
                placeholder="Use {studentName}, {guardianName}, {registrationNo}, {className} as placeholders..."
                data-ocid="cert-templates.textarea"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use placeholders: {PLACEHOLDERS.join(", ")}
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                data-ocid="cert-templates.cancel_button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                data-ocid="cert-templates.save_button"
              >
                {editId ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
