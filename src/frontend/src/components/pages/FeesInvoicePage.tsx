import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Printer } from "lucide-react";
import { useMemo, useState } from "react";
import type { FeePayment } from "../../backend.d";
import { useFeePaymentsByStudent, useStudents } from "../../hooks/useQueries";

const FEE_PARTICULARS: Array<{ key: keyof FeePayment; label: string }> = [
  { key: "termlyFee", label: "Termly Fee" },
  { key: "admissionFee", label: "Admission Fee" },
  { key: "registrationFee", label: "Registration Fee" },
  { key: "artMaterial", label: "Art Material" },
  { key: "transport", label: "Transport" },
  { key: "books", label: "Books" },
  { key: "uniform", label: "Uniform" },
  { key: "fine", label: "Fine" },
  { key: "others", label: "Others" },
  { key: "previousBalance", label: "Previous Balance" },
  { key: "discountInFee", label: "Discount in Fee" },
];

export default function FeesInvoicePage() {
  const { data: students = [], isLoading: studentsLoading } = useStudents();
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>("");

  const studentIdBigInt = selectedStudentId ? BigInt(selectedStudentId) : null;
  const { data: payments = [], isLoading: paymentsLoading } =
    useFeePaymentsByStudent(studentIdBigInt);

  const selectedStudent = useMemo(
    () => students.find((s) => s.id.toString() === selectedStudentId),
    [students, selectedStudentId],
  );

  const selectedPayment = useMemo(
    () => payments.find((p) => p.id.toString() === selectedPaymentId),
    [payments, selectedPaymentId],
  );

  const handleStudentChange = (val: string) => {
    setSelectedStudentId(val);
    setSelectedPaymentId("");
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-3xl">
      <div className="no-print">
        <h1 className="text-2xl font-display font-bold">
          Generate Fees Invoice
        </h1>
        <p className="text-sm text-muted-foreground">
          Select a student and payment record to generate a printable invoice
        </p>
      </div>

      {/* Selectors */}
      <div className="no-print grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-foreground">Select Student</p>
          {studentsLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select
              value={selectedStudentId}
              onValueChange={handleStudentChange}
            >
              <SelectTrigger data-ocid="fees_invoice.student_select">
                <SelectValue placeholder="Choose a student..." />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id.toString()} value={s.id.toString()}>
                    {s.name} ({s.registrationNo || "No Reg"}) — {s.className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-1.5">
          <p className="text-sm font-medium text-foreground">
            Select Payment Record
          </p>
          {paymentsLoading && selectedStudentId ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select
              value={selectedPaymentId}
              onValueChange={setSelectedPaymentId}
              disabled={!selectedStudentId || payments.length === 0}
            >
              <SelectTrigger data-ocid="fees_invoice.payment_select">
                <SelectValue
                  placeholder={
                    !selectedStudentId
                      ? "Select student first"
                      : payments.length === 0
                        ? "No payments found"
                        : "Choose a payment..."
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {payments.map((p) => (
                  <SelectItem key={p.id.toString()} value={p.id.toString()}>
                    {p.feesTerm} — {p.date} — ₹
                    {Number(p.total).toLocaleString("en-IN")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Invoice Preview */}
      {selectedPayment && selectedStudent ? (
        <>
          <div className="no-print flex justify-end">
            <Button
              onClick={() => window.print()}
              className="gap-2"
              data-ocid="fees_invoice.print_button"
            >
              <Printer className="w-4 h-4" />
              Print Invoice
            </Button>
          </div>

          {/* Invoice Document */}
          <div
            id="invoice-print-area"
            className="border border-border rounded-xl overflow-hidden bg-card print-area"
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground px-6 py-5 text-center">
              <h2 className="text-2xl font-display font-bold tracking-wide">
                JMDA
              </h2>
              <p className="text-sm opacity-80 font-medium tracking-wider uppercase mt-0.5">
                School Admin Portal
              </p>
              <div className="mt-3 inline-block bg-primary-foreground/20 rounded-md px-4 py-1">
                <p className="text-sm font-semibold">FEES INVOICE</p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Student Details */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm border border-border rounded-lg p-4 bg-muted/20">
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Student Name
                  </span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {selectedStudent.name}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Registration No
                  </span>
                  <p className="font-mono font-semibold text-foreground mt-0.5">
                    {selectedStudent.registrationNo || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Guardian Name
                  </span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {selectedStudent.guardianName || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Class
                  </span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {selectedStudent.className}
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

              {/* Fee Breakdown Table */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Fee Particulars
                </p>
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/40">
                        <th className="text-left px-4 py-2 font-semibold text-foreground">
                          Particular
                        </th>
                        <th className="text-right px-4 py-2 font-semibold text-foreground">
                          Amount (₹)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {FEE_PARTICULARS.map((fp) => {
                        const amount = Number(
                          selectedPayment[fp.key] as bigint,
                        );
                        return (
                          <tr
                            key={fp.key}
                            className={amount === 0 ? "opacity-40" : ""}
                          >
                            <td className="px-4 py-2 text-foreground">
                              {fp.label}
                            </td>
                            <td className="px-4 py-2 text-right font-mono text-foreground">
                              {amount.toLocaleString("en-IN")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="flex justify-between px-4 py-2.5 border-b border-border bg-muted/20">
                  <span className="text-sm font-bold text-foreground">
                    Total Billed
                  </span>
                  <span className="text-sm font-bold font-mono text-foreground">
                    ₹{Number(selectedPayment.total).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between px-4 py-2.5 border-b border-border">
                  <span className="text-sm font-semibold text-emerald-600">
                    Amount Deposited
                  </span>
                  <span className="text-sm font-bold font-mono text-emerald-600">
                    ₹{Number(selectedPayment.deposit).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between px-4 py-2.5 bg-rose-500/10">
                  <span className="text-sm font-bold text-rose-600">
                    Due Balance
                  </span>
                  <span className="text-sm font-bold font-mono text-rose-600">
                    ₹
                    {Number(selectedPayment.dueableBalance).toLocaleString(
                      "en-IN",
                    )}
                  </span>
                </div>
              </div>

              <div className="pt-4 text-center text-xs text-muted-foreground border-t border-dashed border-border">
                This is a computer-generated invoice. — JMDA School Admin Portal
              </div>
            </div>
          </div>
        </>
      ) : (
        <div
          className="no-print py-16 text-center text-muted-foreground"
          data-ocid="fees_invoice.empty_state"
        >
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            Select a student and payment record to preview the invoice
          </p>
        </div>
      )}
    </div>
  );
}
