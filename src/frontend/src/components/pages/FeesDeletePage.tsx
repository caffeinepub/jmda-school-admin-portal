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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Student } from "../../backend.d";
import {
  useDeleteFeePayment,
  useFeePayments,
  useStudents,
} from "../../hooks/useQueries";

export default function FeesDeletePage() {
  const { data: payments = [], isLoading: paymentsLoading } = useFeePayments();
  const { data: students = [], isLoading: studentsLoading } = useStudents();
  const deleteFeePayment = useDeleteFeePayment();

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);

  const studentMap = useMemo(() => {
    const m = new Map<string, Student>();
    for (const s of students) m.set(s.id.toString(), s);
    return m;
  }, [students]);

  const enriched = useMemo(() => {
    return payments.map((p) => ({
      ...p,
      student: studentMap.get(p.studentId.toString()),
    }));
  }, [payments, studentMap]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return enriched;
    return enriched.filter((p) => {
      const name = p.student?.name?.toLowerCase() ?? "";
      const regNo = p.student?.registrationNo?.toLowerCase() ?? "";
      return name.includes(q) || regNo.includes(q);
    });
  }, [enriched, search]);

  const allFilteredIds = useMemo(
    () => filtered.map((p) => p.id.toString()),
    [filtered],
  );

  const allSelected =
    allFilteredIds.length > 0 && allFilteredIds.every((id) => selected.has(id));
  const someSelected = allFilteredIds.some((id) => selected.has(id));
  const selectedCount = allFilteredIds.filter((id) => selected.has(id)).length;

  const toggleSelectAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        for (const id of allFilteredIds) next.delete(id);
      } else {
        for (const id of allFilteredIds) next.add(id);
      }
      return next;
    });
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteOne = async (id: bigint) => {
    try {
      await deleteFeePayment.mutateAsync(id);
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id.toString());
        return next;
      });
      toast.success("Payment record deleted.");
    } catch {
      toast.error("Failed to delete payment record.");
    }
  };

  const handleDeleteSelected = async () => {
    const idsToDelete = allFilteredIds.filter((id) => selected.has(id));
    setBulkDialogOpen(false);
    let successCount = 0;
    let failCount = 0;
    for (const idStr of idsToDelete) {
      try {
        await deleteFeePayment.mutateAsync(BigInt(idStr));
        successCount++;
      } catch {
        failCount++;
      }
    }
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of idsToDelete) next.delete(id);
      return next;
    });
    if (successCount > 0)
      toast.success(`${successCount} record(s) deleted successfully.`);
    if (failCount > 0) toast.error(`${failCount} record(s) failed to delete.`);
  };

  const isLoading = paymentsLoading || studentsLoading;

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-display font-bold">Delete Fees</h1>
          <p className="text-sm text-muted-foreground">
            Select and delete fee payment records
          </p>
        </div>
        {someSelected && selectedCount > 0 && (
          <AlertDialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="gap-2"
                data-ocid="fees_delete.delete_button"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected ({selectedCount})
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent data-ocid="fees_delete.dialog">
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Delete {selectedCount} Record(s)?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete {selectedCount} fee payment{" "}
                  {selectedCount === 1 ? "record" : "records"}. This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-ocid="fees_delete.cancel_button">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteSelected}
                  className="bg-destructive hover:bg-destructive/90"
                  data-ocid="fees_delete.confirm_button"
                >
                  {deleteFeePayment.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Delete Records
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by student name or reg no..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          data-ocid="fees_delete.search_input"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2" data-ocid="fees_delete.loading_state">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="py-16 text-center text-muted-foreground"
          data-ocid="fees_delete.empty_state"
        >
          <Trash2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No fee records found</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleSelectAll}
                    data-ocid="fees_delete.select_all_checkbox"
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Reg No</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount (₹)</TableHead>
                <TableHead className="text-right w-20">Delete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p, idx) => (
                <TableRow
                  key={p.id.toString()}
                  data-ocid={`fees_delete.row.${idx + 1}`}
                  className={
                    selected.has(p.id.toString()) ? "bg-destructive/5" : ""
                  }
                >
                  <TableCell>
                    <Checkbox
                      checked={selected.has(p.id.toString())}
                      onCheckedChange={() => toggleOne(p.id.toString())}
                      aria-label={`Select payment ${idx + 1}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {p.student?.name ?? "Unknown"}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {p.student?.registrationNo || "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {p.student?.className || "—"}
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
                    ₹{Number(p.total).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                          data-ocid={`fees_delete.delete_button.${idx + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Payment?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Permanently delete this fee payment record for{" "}
                            <strong>{p.student?.name ?? "this student"}</strong>
                            ? This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel data-ocid="fees_delete.cancel_button">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteOne(p.id)}
                            className="bg-destructive hover:bg-destructive/90"
                            data-ocid="fees_delete.confirm_button"
                          >
                            {deleteFeePayment.isPending ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : null}
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
