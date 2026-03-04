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
import { IndianRupee, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useDeleteFeePayment,
  useFeePayments,
  useStudents,
} from "../../hooks/useQueries";

const FEE_TERMS = ["All", "Yearly Fees", "Term 1", "Term 2", "Term 3"];

export default function FeeHistoryPage() {
  const { data: payments = [], isLoading } = useFeePayments();
  const { data: students = [] } = useStudents();
  const deleteFeePayment = useDeleteFeePayment();
  const [search, setSearch] = useState("");
  const [termFilter, setTermFilter] = useState("All");

  const studentMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of students) m.set(s.id.toString(), s.name);
    return m;
  }, [students]);

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      const studentName = studentMap.get(p.studentId.toString()) ?? "";
      const q = search.toLowerCase();
      const matchesSearch = !q || studentName.toLowerCase().includes(q);
      const matchesTerm = termFilter === "All" || p.feesTerm === termFilter;
      return matchesSearch && matchesTerm;
    });
  }, [payments, search, termFilter, studentMap]);

  const totalCollected = useMemo(
    () => filtered.reduce((acc, p) => acc + Number(p.deposit), 0),
    [filtered],
  );

  const handleDelete = async (id: bigint) => {
    try {
      await deleteFeePayment.mutateAsync(id);
      toast.success("Payment record deleted.");
    } catch {
      toast.error("Failed to delete payment.");
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-display font-bold">Fee History</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} records
          </p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-3 py-1.5">
          <IndianRupee className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-primary">
            ₹{totalCollected.toLocaleString("en-IN")} collected
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-ocid="fee_history.search_input"
          />
        </div>
        <div className="w-40">
          <Select value={termFilter} onValueChange={setTermFilter}>
            <SelectTrigger data-ocid="fee_history.select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FEE_TERMS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="py-16 text-center text-muted-foreground"
          data-ocid="fee_history.empty_state"
        >
          <IndianRupee className="w-12 h-12 mx-auto mb-3 opacity-30" />
          No fee payment records found.
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total (₹)</TableHead>
                <TableHead className="text-right">Paid (₹)</TableHead>
                <TableHead className="text-right">Due (₹)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p, idx) => (
                <TableRow
                  key={p.id.toString()}
                  data-ocid={`fee_history.row.${idx + 1}`}
                >
                  <TableCell className="font-medium">
                    {studentMap.get(p.studentId.toString()) ?? "Unknown"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {p.feesTerm}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {p.date}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {Number(p.total).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-emerald-400">
                    {Number(p.deposit).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-rose-400">
                    {Number(p.dueableBalance).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 text-destructive hover:text-destructive"
                          data-ocid={`fee_history.delete_button.${idx + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete Payment Record?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this payment record.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel data-ocid="fee_history.cancel_button">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(p.id)}
                            className="bg-destructive"
                            data-ocid="fee_history.confirm_button"
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
    </div>
  );
}
