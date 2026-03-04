import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { Edit, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { type Family, useFamilies } from "../../hooks/useSchoolData";

export default function FamiliesPage() {
  const [families, setFamilies] = useFamilies();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", address: "", phone: "" });

  const openAdd = () => {
    setEditId(null);
    setForm({ name: "", address: "", phone: "" });
    setDialogOpen(true);
  };

  const openEdit = (f: Family) => {
    setEditId(f.id);
    setForm({ name: f.name, address: f.address, phone: f.phone });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error("Family name is required.");
      return;
    }
    if (editId) {
      setFamilies((prev) =>
        prev.map((f) => (f.id === editId ? { ...f, ...form } : f)),
      );
      toast.success("Family updated.");
    } else {
      setFamilies((prev) => [...prev, { id: `fam_${Date.now()}`, ...form }]);
      toast.success("Family added.");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setFamilies((prev) => prev.filter((f) => f.id !== id));
    toast.success("Family deleted.");
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Manage Families</h1>
          <p className="text-sm text-muted-foreground">
            {families.length} families
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="gap-2"
          data-ocid="families.add_button"
        >
          <Plus className="w-4 h-4" /> Add Family
        </Button>
      </div>

      {families.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16"
          data-ocid="families.empty_state"
        >
          <Users className="w-12 h-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No families added yet.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Family Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {families.map((f, idx) => (
                <TableRow key={f.id} data-ocid={`families.row.${idx + 1}`}>
                  <TableCell className="font-medium">{f.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {f.address || "-"}
                  </TableCell>
                  <TableCell className="text-sm font-mono">
                    {f.phone || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7"
                        onClick={() => openEdit(f)}
                        data-ocid={`families.edit_button.${idx + 1}`}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-7 h-7 text-destructive hover:text-destructive"
                            data-ocid={`families.delete_button.${idx + 1}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Family?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Delete {f.name}?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel data-ocid="families.cancel_button">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(f.id)}
                              className="bg-destructive"
                              data-ocid="families.confirm_button"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-ocid="families.dialog">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Family" : "Add Family"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Family Name *</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                data-ocid="families.input"
              />
            </div>
            <div>
              <Label>Address</Label>
              <Input
                value={form.address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: e.target.value }))
                }
                data-ocid="families.input"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                data-ocid="families.input"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                data-ocid="families.cancel_button"
              >
                Cancel
              </Button>
              <Button onClick={handleSave} data-ocid="families.save_button">
                {editId ? "Update" : "Add"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
