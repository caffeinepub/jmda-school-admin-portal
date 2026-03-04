import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Printer, Receipt, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { FeePayment, Student } from "../../backend.d";
import { useFeePayments, useStudents } from "../../hooks/useQueries";

interface EnrichedPayment extends FeePayment {
  student: Student | undefined;
}

export default function FeesPaidSlipPage() {
  const { data: payments = [], isLoading: paymentsLoading } = useFeePayments();
  const { data: students = [], isLoading: studentsLoading } = useStudents();
  const [search, setSearch] = useState("");
  const [selectedPayment, setSelectedPayment] =
    useState<EnrichedPayment | null>(null);

  const studentMap = useMemo(() => {
    const m = new Map<string, Student>();
    for (const s of students) m.set(s.id.toString(), s);
    return m;
  }, [students]);

  const enrichedPayments = useMemo((): EnrichedPayment[] => {
    return payments.map((p) => ({
      ...p,
      student: studentMap.get(p.studentId.toString()),
    }));
  }, [payments, studentMap]);

  const filteredPayments = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return enrichedPayments;
    return enrichedPayments.filter((p) => {
      const name = p.student?.name?.toLowerCase() ?? "";
      const regNo = p.student?.registrationNo?.toLowerCase() ?? "";
      return name.includes(q) || regNo.includes(q);
    });
  }, [enrichedPayments, search]);

  const isLoading = paymentsLoading || studentsLoading;

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-3xl">
      {/* Header — hidden when printing */}
      <div className="no-print">
        <h1 className="text-2xl font-display font-bold">Fees Paid Slip</h1>
        <p className="text-sm text-muted-foreground">
          Search for a payment record and generate a receipt
        </p>
      </div>

      {/* Search Bar */}
      {!selectedPayment && (
        <div className="no-print">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by student name or reg no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-ocid="fees_paid_slip.search_input"
            />
          </div>
        </div>
      )}

      {/* Payment list */}
      {!selectedPayment && (
        <div className="no-print space-y-2">
          {isLoading ? (
            [1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)
          ) : filteredPayments.length === 0 ? (
            <div
              className="py-12 text-center text-muted-foreground"
              data-ocid="fees_paid_slip.empty_state"
            >
              <Receipt className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No payment records found</p>
            </div>
          ) : (
            filteredPayments.map((p, idx) => (
              <button
                key={p.id.toString()}
                type="button"
                onClick={() => setSelectedPayment(p)}
                className="w-full text-left border border-border rounded-lg px-4 py-3 hover:bg-muted/40 transition-colors flex items-center justify-between gap-4"
                data-ocid={`fees_paid_slip.item.${idx + 1}`}
              >
                <div className="space-y-0.5">
                  <p className="font-semibold text-sm text-foreground">
                    {p.student?.name ?? "Unknown Student"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Reg: {p.student?.registrationNo || "N/A"} · Class:{" "}
                    {p.student?.className || "N/A"}
                  </p>
                </div>
                <div className="text-right shrink-0 space-y-1">
                  <Badge variant="secondary" className="text-xs">
                    {p.feesTerm}
                  </Badge>
                  <p className="text-sm font-bold text-emerald-600 font-mono">
                    ₹{Number(p.deposit).toLocaleString("en-IN")} paid
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Receipt View */}
      {selectedPayment && (
        <>
          <div className="no-print flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setSelectedPayment(null)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              ← Back to list
            </button>
            <Button
              onClick={() => window.print()}
              className="gap-2"
              data-ocid="fees_paid_slip.print_button"
            >
              <Printer className="w-4 h-4" />
              Print Receipt
            </Button>
          </div>

          {/* Receipt Document */}
          <div className="border border-border rounded-xl overflow-hidden bg-card print-area">
            {/* Header */}
            <div className="bg-primary text-primary-foreground px-6 py-5 text-center">
              <h2 className="text-2xl font-display font-bold tracking-wide">
                JMDA
              </h2>
              <p className="text-sm opacity-80 font-medium tracking-wider uppercase mt-0.5">
                School Admin Portal
              </p>
              <div className="mt-3 inline-block bg-primary-foreground/20 rounded-md px-4 py-1">
                <p className="text-sm font-semibold">FEES PAID RECEIPT</p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Student Info */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm border border-border rounded-lg p-4 bg-muted/20">
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Student Name
                  </span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {selectedPayment.student?.name ?? "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Registration No
                  </span>
                  <p className="font-mono font-semibold text-foreground mt-0.5">
                    {selectedPayment.student?.registrationNo || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Class
                  </span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {selectedPayment.student?.className || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Guardian Name
                  </span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {selectedPayment.student?.guardianName || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Fee Term
                  </span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {selectedPayment.feesTerm}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Date
                  </span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {selectedPayment.date}
                  </p>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="flex justify-between px-4 py-3 border-b border-border bg-muted/20">
                  <span className="text-sm font-semibold text-foreground">
                    Total Billed
                  </span>
                  <span className="text-sm font-bold font-mono text-foreground">
                    ₹{Number(selectedPayment.total).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between px-4 py-4 border-b border-border bg-emerald-500/10">
                  <div>
                    <p className="text-sm font-bold text-emerald-600">
                      Amount Paid
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Payment received
                    </p>
                  </div>
                  <span className="text-xl font-bold font-mono text-emerald-600">
                    ₹{Number(selectedPayment.deposit).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between px-4 py-3 bg-rose-500/10">
                  <span className="text-sm font-bold text-rose-600">
                    Balance Due
                  </span>
                  <span className="text-sm font-bold font-mono text-rose-600">
                    ₹
                    {Number(selectedPayment.dueableBalance).toLocaleString(
                      "en-IN",
                    )}
                  </span>
                </div>
              </div>

              {/* Official Stamp Area */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="border border-dashed border-border rounded-lg p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-6">
                    Authorised Signature
                  </p>
                  <div className="border-t border-border" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Signature
                  </p>
                </div>
                <div className="border border-dashed border-border rounded-lg p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-6">
                    Official Stamp
                  </p>
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-border mx-auto flex items-center justify-center">
                    <span className="text-[9px] text-muted-foreground text-center leading-tight">
                      SCHOOL
                      <br />
                      STAMP
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 text-center text-xs text-muted-foreground border-t border-dashed border-border">
                This is a computer-generated receipt. — JMDA School Admin Portal
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
