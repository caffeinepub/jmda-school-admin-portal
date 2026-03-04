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
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  DollarSign,
  Loader2,
  Plus,
  Receipt,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { FeePayment, Student } from "../backend.d";
import {
  useCreateFeePayment,
  useDeleteFeePayment,
  useFeePayments,
  useIsAdmin,
  useStudents,
} from "../hooks/useQueries";

const FEES_TERMS = ["Yearly Fees", "Term 1", "Term 2", "Term 3"];

interface FeeFormData {
  studentId: string;
  feesTerm: string;
  date: string;
  termlyFee: string;
  admissionFee: string;
  registrationFee: string;
  artMaterial: string;
  transport: string;
  books: string;
  uniform: string;
  fine: string;
  others: string;
  previousBalance: string;
  discountInFee: string;
  deposit: string;
}

const emptyFeeForm: FeeFormData = {
  studentId: "",
  feesTerm: "",
  date: new Date().toLocaleDateString("en-GB").replace(/\//g, "/"),
  termlyFee: "0",
  admissionFee: "0",
  registrationFee: "0",
  artMaterial: "0",
  transport: "0",
  books: "0",
  uniform: "0",
  fine: "0",
  others: "0",
  previousBalance: "0",
  discountInFee: "0",
  deposit: "0",
};

function safeNum(val: string): number {
  const n = Number.parseFloat(val);
  return Number.isNaN(n) || n < 0 ? 0 : n;
}

function calcTotal(form: FeeFormData): number {
  const subtotal =
    safeNum(form.termlyFee) +
    safeNum(form.admissionFee) +
    safeNum(form.registrationFee) +
    safeNum(form.artMaterial) +
    safeNum(form.transport) +
    safeNum(form.books) +
    safeNum(form.uniform) +
    safeNum(form.fine) +
    safeNum(form.others) +
    safeNum(form.previousBalance);
  return Math.max(0, subtotal - safeNum(form.discountInFee));
}

function calcDueBalance(form: FeeFormData): number {
  return Math.max(0, calcTotal(form) - safeNum(form.deposit));
}

interface FeeRowProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  srNo: number;
  readOnly?: boolean;
  highlight?: "total" | "deposit" | "due";
}

function FeeRow({
  label,
  value,
  onChange,
  srNo,
  readOnly = false,
  highlight,
}: FeeRowProps) {
  const rowClass =
    highlight === "total"
      ? "bg-muted/50 font-semibold"
      : highlight === "deposit"
        ? "bg-amber-500/10"
        : highlight === "due"
          ? "bg-destructive/10"
          : "hover:bg-accent/10 transition-colors";

  return (
    <tr className={`border-b border-border ${rowClass}`}>
      <td className="px-3 py-2 text-center text-xs text-muted-foreground w-8">
        {srNo}
      </td>
      <td className="px-3 py-2 text-sm font-medium text-foreground">{label}</td>
      <td className="px-3 py-2 w-32">
        {readOnly ? (
          <div
            className={`text-right text-sm font-mono font-bold pr-1 ${
              highlight === "due" && safeNum(value) > 0
                ? "text-destructive"
                : highlight === "total"
                  ? "text-foreground"
                  : highlight === "deposit"
                    ? "text-amber-400"
                    : "text-foreground"
            }`}
          >
            {Number(value || 0).toLocaleString()}
          </div>
        ) : (
          <Input
            type="number"
            min={0}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 text-right text-sm font-mono bg-background border-border w-full"
          />
        )}
      </td>
    </tr>
  );
}

function FeeFormDialog({
  open,
  onClose,
  students,
}: {
  open: boolean;
  onClose: () => void;
  students: Student[];
}) {
  const createFeePayment = useCreateFeePayment();
  const [form, setForm] = useState<FeeFormData>(emptyFeeForm);
  const [formError, setFormError] = useState<string | null>(null);

  const selectedStudent = students.find(
    (s) => s.id.toString() === form.studentId,
  );
  const total = calcTotal(form);
  const dueBalance = calcDueBalance(form);

  const updateField = (field: keyof FeeFormData) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleStudentSelect = (studentId: string) => {
    setForm((prev) => ({ ...prev, studentId }));
  };

  const handleSubmit = async () => {
    if (!form.studentId) {
      setFormError("Please select a student.");
      return;
    }
    if (!form.feesTerm) {
      setFormError("Please select a fees term.");
      return;
    }
    if (!form.date.trim()) {
      setFormError("Please enter a date.");
      return;
    }
    setFormError(null);

    try {
      await createFeePayment.mutateAsync({
        studentId: BigInt(form.studentId),
        feesTerm: form.feesTerm,
        date: form.date.trim(),
        termlyFee: BigInt(Math.round(safeNum(form.termlyFee))),
        admissionFee: BigInt(Math.round(safeNum(form.admissionFee))),
        registrationFee: BigInt(Math.round(safeNum(form.registrationFee))),
        artMaterial: BigInt(Math.round(safeNum(form.artMaterial))),
        transport: BigInt(Math.round(safeNum(form.transport))),
        books: BigInt(Math.round(safeNum(form.books))),
        uniform: BigInt(Math.round(safeNum(form.uniform))),
        fine: BigInt(Math.round(safeNum(form.fine))),
        others: BigInt(Math.round(safeNum(form.others))),
        previousBalance: BigInt(Math.round(safeNum(form.previousBalance))),
        discountInFee: BigInt(Math.round(safeNum(form.discountInFee))),
        deposit: BigInt(Math.round(safeNum(form.deposit))),
      });
      toast.success("Fee payment recorded successfully.");
      setForm(emptyFeeForm);
      onClose();
    } catch {
      toast.error("Failed to record fee payment. Please try again.");
    }
  };

  const feeRows: { field: keyof FeeFormData; label: string }[] = [
    { field: "termlyFee", label: "TERMLY FEE" },
    { field: "admissionFee", label: "ADMISSION FEE" },
    { field: "registrationFee", label: "REGISTRATION FEE" },
    { field: "artMaterial", label: "ART MATERIAL" },
    { field: "transport", label: "TRANSPORT" },
    { field: "books", label: "BOOKS" },
    { field: "uniform", label: "UNIFORM" },
    { field: "fine", label: "FINE" },
    { field: "others", label: "OTHERS" },
    { field: "previousBalance", label: "PREVIOUS BALANCE" },
    { field: "discountInFee", label: "DISCOUNT IN FEE" },
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setForm(emptyFeeForm);
          setFormError(null);
          onClose();
        }
      }}
    >
      <DialogContent className="bg-card border-border max-w-xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border shrink-0">
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-400" />
            Collect Fees
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {formError && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {formError}
            </div>
          )}

          {/* Student & Info */}
          <div className="rounded-lg border border-border bg-background/50 p-3 space-y-3">
            <div className="space-y-1.5">
              <Label>Student *</Label>
              <Select
                value={form.studentId}
                onValueChange={handleStudentSelect}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select a student..." />
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-48">
                  {students.map((s) => (
                    <SelectItem key={s.id.toString()} value={s.id.toString()}>
                      {s.name} — {s.registrationNo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedStudent && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Reg No: </span>
                  <span className="font-mono font-medium text-foreground">
                    {selectedStudent.registrationNo}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Class: </span>
                  <span className="font-medium text-foreground">
                    {selectedStudent.className}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Guardian: </span>
                  <span className="font-medium text-foreground">
                    {selectedStudent.guardianName}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Grade: </span>
                  <span className="font-medium text-foreground">
                    {Number(selectedStudent.gradeLevel)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Term & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Fees Term *</Label>
              <Select
                value={form.feesTerm}
                onValueChange={updateField("feesTerm")}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select term..." />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {FEES_TERMS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fee-date">Date *</Label>
              <Input
                id="fee-date"
                type="date"
                value={
                  // Convert display date to input[type=date] format (YYYY-MM-DD)
                  (() => {
                    try {
                      const d = new Date(form.date);
                      if (!Number.isNaN(d.getTime())) {
                        return d.toISOString().split("T")[0];
                      }
                      return form.date;
                    } catch {
                      return form.date;
                    }
                  })()
                }
                onChange={(e) => {
                  const d = new Date(e.target.value);
                  if (!Number.isNaN(d.getTime())) {
                    const formatted = d
                      .toLocaleDateString("en-GB")
                      .replace(/\//g, "/");
                    updateField("date")(formatted);
                  } else {
                    updateField("date")(e.target.value);
                  }
                }}
                className="bg-background border-border"
              />
            </div>
          </div>

          {/* Fee breakdown table */}
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground w-8">
                    Sr.
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">
                    Particulars
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground w-32">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {feeRows.map((row, idx) => (
                  <FeeRow
                    key={row.field}
                    srNo={idx + 1}
                    label={row.label}
                    value={form[row.field]}
                    onChange={updateField(row.field)}
                  />
                ))}
                {/* Total row */}
                <tr className="border-b border-border bg-muted/50">
                  <td className="px-3 py-2" />
                  <td className="px-3 py-2 text-sm font-bold text-foreground uppercase tracking-wide">
                    TOTAL
                  </td>
                  <td className="px-3 py-2 text-right text-sm font-mono font-bold text-foreground">
                    {total.toLocaleString()}
                  </td>
                </tr>
                {/* Deposit row */}
                <tr className="border-b border-border bg-amber-500/10">
                  <td className="px-3 py-2" />
                  <td className="px-3 py-2 text-sm font-semibold text-amber-400 uppercase tracking-wide">
                    DEPOSIT
                  </td>
                  <td className="px-3 py-2 w-32">
                    <Input
                      type="number"
                      min={0}
                      value={form.deposit}
                      onChange={(e) => updateField("deposit")(e.target.value)}
                      className="h-8 text-right text-sm font-mono bg-background border-border w-full"
                    />
                  </td>
                </tr>
                {/* Due balance row */}
                <tr
                  className={
                    dueBalance > 0 ? "bg-destructive/10" : "bg-emerald-500/10"
                  }
                >
                  <td className="px-3 py-2" />
                  <td className="px-3 py-2 text-sm font-bold uppercase tracking-wide">
                    <span
                      className={
                        dueBalance > 0 ? "text-destructive" : "text-emerald-400"
                      }
                    >
                      DUE-ABLE BALANCE
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right text-sm font-mono font-bold">
                    <span
                      className={
                        dueBalance > 0 ? "text-destructive" : "text-emerald-400"
                      }
                    >
                      {dueBalance.toLocaleString()}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <DialogFooter className="px-5 pb-5 pt-3 border-t border-border shrink-0">
          <Button
            variant="ghost"
            onClick={() => {
              setForm(emptyFeeForm);
              setFormError(null);
              onClose();
            }}
            disabled={createFeePayment.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createFeePayment.isPending}
            className="bg-amber-500 hover:bg-amber-400 text-amber-950 font-semibold gap-2"
          >
            {createFeePayment.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Receipt className="w-4 h-4" />
                Submit Fees
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function FeesCollection() {
  const { data: feePayments, isLoading } = useFeePayments();
  const { data: students } = useStudents();
  const { data: isAdmin } = useIsAdmin();
  const deleteFeePayment = useDeleteFeePayment();

  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<FeePayment | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const studentMap = useMemo(() => {
    const map = new Map<string, Student>();
    for (const s of students ?? []) {
      map.set(s.id.toString(), s);
    }
    return map;
  }, [students]);

  const getStudent = (id: bigint) => studentMap.get(id.toString());

  const filtered = useMemo(() => {
    const payments = feePayments ?? [];
    if (!search)
      return [...payments].sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
    const q = search.toLowerCase();
    return [...payments]
      .filter((p) => {
        const s = studentMap.get(p.studentId.toString());
        return (
          s?.name.toLowerCase().includes(q) ||
          s?.registrationNo.toLowerCase().includes(q) ||
          s?.className.toLowerCase().includes(q) ||
          p.feesTerm.toLowerCase().includes(q) ||
          p.date.includes(q)
        );
      })
      .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
  }, [feePayments, search, studentMap]);

  const totalCollected = useMemo(() => {
    return (feePayments ?? []).reduce((sum, p) => sum + Number(p.deposit), 0);
  }, [feePayments]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteFeePayment.mutateAsync(deleteTarget.id);
      toast.success("Fee record deleted.");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete fee record.");
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Fees Collection
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {feePayments?.length ?? 0} payment records · Total collected:{" "}
            <span className="text-emerald-400 font-semibold font-mono">
              {totalCollected.toLocaleString()}
            </span>
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setFormOpen(true)}
            className="gap-2 bg-amber-500 hover:bg-amber-400 text-amber-950 font-semibold"
          >
            <Plus className="w-4 h-4" />
            Collect Fees
          </Button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-fade-in">
        <div className="rounded-xl border border-border bg-card p-4 shadow-card">
          <p className="text-xs text-muted-foreground font-medium mb-1">
            Total Records
          </p>
          <p className="font-display text-2xl font-bold text-foreground">
            {feePayments?.length ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 shadow-card">
          <p className="text-xs text-emerald-400 font-medium mb-1">
            Total Collected
          </p>
          <p className="font-display text-2xl font-bold text-emerald-400 font-mono">
            {totalCollected.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 shadow-card">
          <p className="text-xs text-destructive font-medium mb-1">
            Total Due Balances
          </p>
          <p className="font-display text-2xl font-bold text-destructive font-mono">
            {(feePayments ?? [])
              .reduce((sum, p) => sum + Number(p.dueableBalance), 0)
              .toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 shadow-card">
          <p className="text-xs text-amber-400 font-medium mb-1">
            Total Billed
          </p>
          <p className="font-display text-2xl font-bold text-amber-400 font-mono">
            {(feePayments ?? [])
              .reduce((sum, p) => sum + Number(p.total), 0)
              .toLocaleString()}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by student, class, term, date..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-card border-border"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-card animate-fade-in">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground font-semibold text-xs">
                  Student
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold text-xs hidden sm:table-cell">
                  Reg No
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold text-xs hidden md:table-cell">
                  Class
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold text-xs">
                  Term
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold text-xs hidden sm:table-cell">
                  Date
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold text-xs text-right hidden lg:table-cell">
                  Total
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold text-xs text-right">
                  Deposit
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold text-xs text-right">
                  Due Bal
                </TableHead>
                {isAdmin && (
                  <TableHead className="text-muted-foreground font-semibold text-xs text-right">
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                ["sk1", "sk2", "sk3", "sk4", "sk5"].map((sk) => (
                  <TableRow key={sk} className="border-border">
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    {isAdmin && <TableCell />}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={isAdmin ? 9 : 8}
                    className="text-center py-16"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <DollarSign className="w-10 h-10 text-muted-foreground opacity-40" />
                      <p className="text-muted-foreground text-sm">
                        {search
                          ? "No fee records match your search."
                          : "No fee payments recorded yet."}
                      </p>
                      {isAdmin && !search && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFormOpen(true)}
                          className="mt-2 gap-2 text-amber-400 hover:text-amber-300"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Collect first fee payment
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((payment) => {
                  const student = getStudent(payment.studentId);
                  const dueAmt = Number(payment.dueableBalance);
                  return (
                    <TableRow
                      key={payment.id.toString()}
                      className="border-border hover:bg-accent/20 transition-colors"
                    >
                      <TableCell className="font-medium text-foreground text-sm">
                        {student?.name ?? `ID: ${payment.studentId.toString()}`}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell font-mono text-xs text-muted-foreground">
                        {student?.registrationNo ?? "—"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                        {student?.className ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-primary/15 text-primary border-primary/30 text-xs font-medium">
                          {payment.feesTerm}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                        {payment.date}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-right font-mono text-sm text-foreground">
                        {Number(payment.total).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-emerald-400 font-semibold">
                        {Number(payment.deposit).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        <span
                          className={
                            dueAmt > 0
                              ? "text-destructive font-bold"
                              : "text-muted-foreground"
                          }
                        >
                          {dueAmt.toLocaleString()}
                        </span>
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(payment)}
                            className="w-8 h-8 hover:bg-destructive/15 hover:text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Form Dialog */}
      {formOpen && (
        <FeeFormDialog
          open={formOpen}
          onClose={() => setFormOpen(false)}
          students={students ?? []}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete Fee Record?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this fee payment record. This action
              cannot be undone.
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
              {deleteFeePayment.isPending ? (
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
