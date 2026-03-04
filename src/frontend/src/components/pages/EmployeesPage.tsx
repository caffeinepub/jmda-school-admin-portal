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
import { Edit, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { type Employee, useEmployees } from "../../hooks/useSchoolData";

export default function EmployeesPage() {
  const [employees, setEmployees] = useEmployees();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    role: "",
    department: "",
    mobile: "",
    salary: 0,
  });

  const openAdd = () => {
    setEditId(null);
    setForm({ name: "", role: "", department: "", mobile: "", salary: 0 });
    setDialogOpen(true);
  };
  const openEdit = (e: Employee) => {
    setEditId(e.id);
    setForm({
      name: e.name,
      role: e.role,
      department: e.department,
      mobile: e.mobile,
      salary: e.salary,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error("Name is required.");
      return;
    }
    if (editId) {
      setEmployees((prev) =>
        prev.map((e) => (e.id === editId ? { ...e, ...form } : e)),
      );
      toast.success("Employee updated.");
    } else {
      setEmployees((prev) => [...prev, { id: `emp_${Date.now()}`, ...form }]);
      toast.success("Employee added.");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    toast.success("Employee deleted.");
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Employees</h1>
          <p className="text-sm text-muted-foreground">
            {employees.length} staff members
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="gap-2"
          data-ocid="employees.add_button"
        >
          <Plus className="w-4 h-4" /> Add Employee
        </Button>
      </div>

      {employees.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16"
          data-ocid="employees.empty_state"
        >
          <Users className="w-12 h-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No employees added yet.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Salary (₹)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp, idx) => (
                <TableRow key={emp.id} data-ocid={`employees.row.${idx + 1}`}>
                  <TableCell className="font-medium">{emp.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {emp.role || "-"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {emp.department || "-"}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {emp.mobile || "-"}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {emp.salary ? emp.salary.toLocaleString("en-IN") : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7"
                        onClick={() => openEdit(emp)}
                        data-ocid={`employees.edit_button.${idx + 1}`}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-7 h-7 text-destructive hover:text-destructive"
                            data-ocid={`employees.delete_button.${idx + 1}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Employee?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Delete {emp.name}?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel data-ocid="employees.cancel_button">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(emp.id)}
                              className="bg-destructive"
                              data-ocid="employees.confirm_button"
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
        <DialogContent data-ocid="employees.dialog">
          <DialogHeader>
            <DialogTitle>
              {editId ? "Edit Employee" : "Add Employee"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                data-ocid="employees.input"
              />
            </div>
            <div>
              <Label>Role</Label>
              <Input
                value={form.role}
                onChange={(e) =>
                  setForm((f) => ({ ...f, role: e.target.value }))
                }
                placeholder="Teacher, Admin..."
                data-ocid="employees.input"
              />
            </div>
            <div>
              <Label>Department</Label>
              <Input
                value={form.department}
                onChange={(e) =>
                  setForm((f) => ({ ...f, department: e.target.value }))
                }
                data-ocid="employees.input"
              />
            </div>
            <div>
              <Label>Mobile</Label>
              <Input
                value={form.mobile}
                onChange={(e) =>
                  setForm((f) => ({ ...f, mobile: e.target.value }))
                }
                data-ocid="employees.input"
              />
            </div>
            <div>
              <Label>Monthly Salary (₹)</Label>
              <Input
                type="number"
                min={0}
                value={form.salary}
                onChange={(e) =>
                  setForm((f) => ({ ...f, salary: Number(e.target.value) }))
                }
                data-ocid="employees.input"
              />
            </div>
            <div className="sm:col-span-2 flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                data-ocid="employees.cancel_button"
              >
                Cancel
              </Button>
              <Button onClick={handleSave} data-ocid="employees.save_button">
                {editId ? "Update" : "Add"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
