import { Button } from "@/components/ui/button";
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
  BarChart2,
  IndianRupee,
  Printer,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMemo } from "react";
import { useFeePayments } from "../../hooks/useQueries";

interface TermSummary {
  term: string;
  count: number;
  totalBilled: number;
  totalCollected: number;
  totalDue: number;
}

export default function FeesReportPage() {
  const { data: payments = [], isLoading } = useFeePayments();

  const termSummaries = useMemo((): TermSummary[] => {
    const map = new Map<string, TermSummary>();
    for (const p of payments) {
      const existing = map.get(p.feesTerm);
      if (existing) {
        existing.count += 1;
        existing.totalBilled += Number(p.total);
        existing.totalCollected += Number(p.deposit);
        existing.totalDue += Number(p.dueableBalance);
      } else {
        map.set(p.feesTerm, {
          term: p.feesTerm,
          count: 1,
          totalBilled: Number(p.total),
          totalCollected: Number(p.deposit),
          totalDue: Number(p.dueableBalance),
        });
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      a.term.localeCompare(b.term),
    );
  }, [payments]);

  const grandTotal = useMemo((): TermSummary => {
    return termSummaries.reduce(
      (acc, ts) => ({
        term: "Grand Total",
        count: acc.count + ts.count,
        totalBilled: acc.totalBilled + ts.totalBilled,
        totalCollected: acc.totalCollected + ts.totalCollected,
        totalDue: acc.totalDue + ts.totalDue,
      }),
      {
        term: "Grand Total",
        count: 0,
        totalBilled: 0,
        totalCollected: 0,
        totalDue: 0,
      },
    );
  }, [termSummaries]);

  const collectionRate =
    grandTotal.totalBilled > 0
      ? Math.round((grandTotal.totalCollected / grandTotal.totalBilled) * 100)
      : 0;

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="no-print">
          <h1 className="text-2xl font-display font-bold">Fees Report</h1>
          <p className="text-sm text-muted-foreground">
            Summary of all fee collections by term
          </p>
        </div>
        <Button
          onClick={() => window.print()}
          variant="outline"
          className="gap-2 no-print"
          data-ocid="fees_report.print_button"
        >
          <Printer className="w-4 h-4" />
          Print Report
        </Button>
      </div>

      {/* Print title (only shows in print) */}
      <div className="hidden print:block text-center pb-4 border-b border-border">
        <h1 className="text-2xl font-bold">JMDA School Admin Portal</h1>
        <p className="text-lg mt-1">Fees Collection Report</p>
        <p className="text-sm text-muted-foreground mt-0.5">
          Generated on {new Date().toLocaleDateString("en-IN")}
        </p>
      </div>

      {/* Summary Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="border border-border rounded-lg p-4 bg-card">
            <div className="flex items-center gap-2 mb-1">
              <BarChart2 className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Total Records</p>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {grandTotal.count}
            </p>
          </div>
          <div className="border border-border rounded-lg p-4 bg-card">
            <div className="flex items-center gap-2 mb-1">
              <IndianRupee className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Total Billed</p>
            </div>
            <p className="text-2xl font-bold text-foreground font-mono">
              ₹{grandTotal.totalBilled.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="border border-border rounded-lg p-4 bg-card">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <p className="text-xs text-muted-foreground">Total Collected</p>
            </div>
            <p className="text-2xl font-bold text-emerald-500 font-mono">
              ₹{grandTotal.totalCollected.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {collectionRate}% collection rate
            </p>
          </div>
          <div className="border border-border rounded-lg p-4 bg-card">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-rose-500" />
              <p className="text-xs text-muted-foreground">Total Due</p>
            </div>
            <p className="text-2xl font-bold text-rose-500 font-mono">
              ₹{grandTotal.totalDue.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      )}

      {/* Term-wise Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : termSummaries.length === 0 ? (
        <div
          className="py-16 text-center text-muted-foreground"
          data-ocid="fees_report.empty_state"
        >
          <BarChart2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No fee records to report</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Term</TableHead>
                <TableHead className="text-center">No. of Payments</TableHead>
                <TableHead className="text-right">Total Billed (₹)</TableHead>
                <TableHead className="text-right">
                  Total Collected (₹)
                </TableHead>
                <TableHead className="text-right">Total Due (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {termSummaries.map((ts, idx) => (
                <TableRow
                  key={ts.term}
                  data-ocid={`fees_report.row.${idx + 1}`}
                >
                  <TableCell className="font-medium text-sm">
                    {ts.term}
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {ts.count}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {ts.totalBilled.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-emerald-500">
                    {ts.totalCollected.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-rose-500">
                    {ts.totalDue.toLocaleString("en-IN")}
                  </TableCell>
                </TableRow>
              ))}
              {/* Grand Total Row */}
              <TableRow className="bg-muted/30 font-bold border-t-2 border-border">
                <TableCell className="font-bold text-sm">Grand Total</TableCell>
                <TableCell className="text-center text-sm font-bold">
                  {grandTotal.count}
                </TableCell>
                <TableCell className="text-right font-mono text-sm font-bold">
                  {grandTotal.totalBilled.toLocaleString("en-IN")}
                </TableCell>
                <TableCell className="text-right font-mono text-sm font-bold text-emerald-500">
                  {grandTotal.totalCollected.toLocaleString("en-IN")}
                </TableCell>
                <TableCell className="text-right font-mono text-sm font-bold text-rose-500">
                  {grandTotal.totalDue.toLocaleString("en-IN")}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
