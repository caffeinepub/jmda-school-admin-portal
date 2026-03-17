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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import type { Page } from "../../App";
import { getEmployeeDisplayId, useEmployees } from "../../hooks/useSchoolData";

interface EmployeesPageProps {
  onNavigate: (page: Page, params?: Record<string, string>) => void;
}

export default function EmployeesPage({ onNavigate }: EmployeesPageProps) {
  const [employees, setEmployees] = useEmployees();

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
          onClick={() => onNavigate("edit-employee")}
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
                <TableHead>Mobile</TableHead>
                <TableHead>Joining Date</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Salary (₹)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp, idx) => (
                <TableRow key={emp.id} data-ocid={`employees.row.${idx + 1}`}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {emp.picture ? (
                        <img
                          src={emp.picture}
                          alt={emp.name}
                          className="w-7 h-7 rounded-full object-cover border border-border shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary text-xs font-bold">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {emp.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {emp.role || "-"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {emp.mobile || "-"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {emp.dateOfJoining || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {getEmployeeDisplayId(employees, emp)}
                    </Badge>
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
                        onClick={() =>
                          onNavigate("edit-employee", { id: emp.id })
                        }
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
    </div>
  );
}
