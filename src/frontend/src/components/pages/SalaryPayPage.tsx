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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { IndianRupee, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTeachers } from "../../hooks/useQueries";
import { useEmployees, useSalaryRecords } from "../../hooks/useSchoolData";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const YEARS = ["2024", "2025", "2026", "2027"];

export default function SalaryPayPage() {
  const [salaryRecords, setSalaryRecords] = useSalaryRecords();
  const { data: teachers = [] } = useTeachers();
  const [employees] = useEmployees();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    employeeId: "",
    month: "",
    year: "2026",
    amount: 0,
    remarks: "",
  });

  const allStaff = [
    ...teachers.map((t) => ({
      id: `teacher_${t.id}`,
      name: `${t.name} (Teacher)`,
    })),
    ...employees.map((e) => ({ id: `emp_${e.id}`, name: `${e.name} (Staff)` })),
  ];

  const handleSave = () => {
    if (!form.employeeId || !form.month) {
      toast.error("Please fill required fields.");
      return;
    }
    setSalaryRecords((prev) => [...prev, { id: `sal_${Date.now()}`, ...form }]);
    toast.success("Salary paid successfully.");
    setDialogOpen(false);
    setForm({
      employeeId: "",
      month: "",
      year: "2026",
      amount: 0,
      remarks: "",
    });
  };

  const handleDelete = (id: string) => {
    setSalaryRecords((prev) => prev.filter((r) => r.id !== id));
    toast.success("Record deleted.");
  };

  const getName = (id: string) => allStaff.find((s) => s.id === id)?.name ?? id;

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Pay Salary</h1>
          <p className="text-sm text-muted-foreground">
            {salaryRecords.length} salary records
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="gap-2"
          data-ocid="salary_pay.add_button"
        >
          <Plus className="w-4 h-4" /> Pay Salary
        </Button>
      </div>

      {salaryRecords.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16"
          data-ocid="salary_pay.empty_state"
        >
          <IndianRupee className="w-12 h-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            No salary records yet. Click "Pay Salary" to add one.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Year</TableHead>
                <TableHead className="text-right">Amount (₹)</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salaryRecords.map((r, idx) => (
                <TableRow key={r.id} data-ocid={`salary_pay.row.${idx + 1}`}>
                  <TableCell className="font-medium">
                    {getName(r.employeeId)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {r.month}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {r.year}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {r.amount.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {r.remarks || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 text-destructive hover:text-destructive"
                          data-ocid={`salary_pay.delete_button.${idx + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Record?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This salary record will be permanently deleted.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel data-ocid="salary_pay.cancel_button">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(r.id)}
                            className="bg-destructive"
                            data-ocid="salary_pay.confirm_button"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-ocid="salary_pay.dialog">
          <DialogHeader>
            <DialogTitle>Pay Salary</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Employee / Teacher *</Label>
              <Select
                value={form.employeeId}
                onValueChange={(v) => setForm((f) => ({ ...f, employeeId: v }))}
              >
                <SelectTrigger data-ocid="salary_pay.select">
                  <SelectValue placeholder="Select staff..." />
                </SelectTrigger>
                <SelectContent>
                  {allStaff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Month *</Label>
                <Select
                  value={form.month}
                  onValueChange={(v) => setForm((f) => ({ ...f, month: v }))}
                >
                  <SelectTrigger data-ocid="salary_pay.select">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Year</Label>
                <Select
                  value={form.year}
                  onValueChange={(v) => setForm((f) => ({ ...f, year: v }))}
                >
                  <SelectTrigger data-ocid="salary_pay.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Amount (₹) *</Label>
              <Input
                type="number"
                min={0}
                value={form.amount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, amount: Number(e.target.value) }))
                }
                data-ocid="salary_pay.input"
              />
            </div>
            <div>
              <Label>Remarks</Label>
              <Textarea
                value={form.remarks}
                onChange={(e) =>
                  setForm((f) => ({ ...f, remarks: e.target.value }))
                }
                rows={2}
                data-ocid="salary_pay.textarea"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                data-ocid="salary_pay.cancel_button"
              >
                Cancel
              </Button>
              <Button onClick={handleSave} data-ocid="salary_pay.save_button">
                Pay Salary
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
