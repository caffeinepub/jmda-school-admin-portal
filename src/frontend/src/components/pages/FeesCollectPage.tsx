import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useCreateFeePayment, useStudents } from "../../hooks/useQueries";

interface FeeFields {
  termlyFee: number;
  admissionFee: number;
  registrationFee: number;
  artMaterial: number;
  transport: number;
  books: number;
  uniform: number;
  fine: number;
  others: number;
  previousBalance: number;
  discountInFee: number;
  deposit: number;
}

const EMPTY_FEES: FeeFields = {
  termlyFee: 0,
  admissionFee: 0,
  registrationFee: 0,
  artMaterial: 0,
  transport: 0,
  books: 0,
  uniform: 0,
  fine: 0,
  others: 0,
  previousBalance: 0,
  discountInFee: 0,
  deposit: 0,
};

const FEE_PARTICULARS: Array<{ key: keyof FeeFields; label: string }> = [
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

const FEE_TERMS = ["Yearly Fees", "Term 1", "Term 2", "Term 3"];

export default function FeesCollectPage() {
  const { data: students = [] } = useStudents();
  const createFeePayment = useCreateFeePayment();

  const [studentId, setStudentId] = useState("");
  const [feesTerm, setFeesTerm] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [fees, setFees] = useState<FeeFields>(EMPTY_FEES);
  const [search, setSearch] = useState("");

  const selectedStudent = students.find((s) => s.id.toString() === studentId);

  const filteredStudents = useMemo(() => {
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.registrationNo.toLowerCase().includes(q),
    );
  }, [students, search]);

  const total = useMemo(() => {
    const sum = Object.entries(fees).reduce((acc, [key, val]) => {
      if (key === "discountInFee" || key === "deposit") return acc;
      return acc + (Number(val) || 0);
    }, 0);
    return Math.max(0, sum - (fees.discountInFee || 0));
  }, [fees]);

  const dueableBalance = useMemo(() => {
    return Math.max(0, total - (fees.deposit || 0));
  }, [total, fees.deposit]);

  const setFee = (key: keyof FeeFields, value: number) => {
    setFees((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) {
      toast.error("Please select a student.");
      return;
    }
    if (!feesTerm) {
      toast.error("Please select a fee term.");
      return;
    }
    if (!date) {
      toast.error("Please enter a date.");
      return;
    }

    try {
      await createFeePayment.mutateAsync({
        studentId: BigInt(studentId),
        feesTerm,
        date,
        termlyFee: BigInt(fees.termlyFee),
        admissionFee: BigInt(fees.admissionFee),
        registrationFee: BigInt(fees.registrationFee),
        artMaterial: BigInt(fees.artMaterial),
        transport: BigInt(fees.transport),
        books: BigInt(fees.books),
        uniform: BigInt(fees.uniform),
        fine: BigInt(fees.fine),
        others: BigInt(fees.others),
        previousBalance: BigInt(fees.previousBalance),
        discountInFee: BigInt(fees.discountInFee),
        deposit: BigInt(fees.deposit),
      });
      toast.success("Fee payment recorded successfully!");
      setFees(EMPTY_FEES);
      setStudentId("");
      setFeesTerm("");
      setSearch("");
    } catch {
      toast.error("Failed to record fee payment.");
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-2xl">
      <div>
        <h1 className="text-2xl font-display font-bold">Collect Fees</h1>
        <p className="text-sm text-muted-foreground">
          Record fee payment for a student
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Student Selector */}
        <Card className="border-border">
          <CardContent className="p-4 space-y-3">
            <div>
              <Label>Search Student</Label>
              <Input
                placeholder="Search by name or reg no..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-ocid="fees.search_input"
              />
            </div>
            <div>
              <Label>Select Student *</Label>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger data-ocid="fees.student_select">
                  <SelectValue placeholder="Select a student..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredStudents.map((s) => (
                    <SelectItem key={s.id.toString()} value={s.id.toString()}>
                      {s.name} ({s.registrationNo || "No Reg"}) - {s.className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedStudent && (
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border text-sm">
                <div>
                  <span className="text-muted-foreground text-xs">
                    Registration No
                  </span>
                  <p className="font-mono font-medium">
                    {selectedStudent.registrationNo || "-"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">
                    Student Name
                  </span>
                  <p className="font-medium">{selectedStudent.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">
                    Guardian Name
                  </span>
                  <p className="font-medium">
                    {selectedStudent.guardianName || "-"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Class</span>
                  <p className="font-medium">{selectedStudent.className}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Term & Date */}
        <Card className="border-border">
          <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Fees Term *</Label>
              <Select value={feesTerm} onValueChange={setFeesTerm}>
                <SelectTrigger data-ocid="fees.term_select">
                  <SelectValue placeholder="Select term..." />
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
            <div>
              <Label>Date *</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                data-ocid="fees.input"
              />
            </div>
          </CardContent>
        </Card>

        {/* Fee Breakdown Table */}
        <Card className="border-border">
          <CardContent className="p-0 overflow-hidden rounded-lg">
            <div className="bg-muted/30 px-4 py-2 border-b border-border">
              <p className="text-sm font-semibold">Fee Breakdown</p>
            </div>
            <div className="divide-y divide-border">
              {FEE_PARTICULARS.map((fp) => (
                <div key={fp.key} className="flex items-center px-4 py-2 gap-4">
                  <span className="text-sm text-foreground flex-1">
                    {fp.label}
                  </span>
                  <div className="w-32">
                    <Input
                      type="number"
                      min={0}
                      value={fees[fp.key]}
                      onChange={(e) => setFee(fp.key, Number(e.target.value))}
                      className="text-right h-8 text-sm"
                      data-ocid="fees.input"
                    />
                  </div>
                </div>
              ))}

              {/* Total (calculated) */}
              <div className="flex items-center px-4 py-3 gap-4 bg-muted/20">
                <span className="text-sm font-bold text-foreground flex-1">
                  Total
                </span>
                <div className="w-32 text-right">
                  <span className="font-bold text-primary text-sm font-mono">
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Deposit */}
              <div className="flex items-center px-4 py-2 gap-4">
                <span className="text-sm font-semibold text-foreground flex-1">
                  Deposit (Amount Paid)
                </span>
                <div className="w-32">
                  <Input
                    type="number"
                    min={0}
                    value={fees.deposit}
                    onChange={(e) => setFee("deposit", Number(e.target.value))}
                    className="text-right h-8 text-sm font-bold"
                    data-ocid="fees.input"
                  />
                </div>
              </div>

              {/* Due Balance (calculated) */}
              <div className="flex items-center px-4 py-3 gap-4 bg-rose-500/10">
                <span className="text-sm font-bold text-foreground flex-1">
                  Due-able Balance
                </span>
                <div className="w-32 text-right">
                  <span className="font-bold text-rose-400 text-sm font-mono">
                    ₹{dueableBalance.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFees(EMPTY_FEES);
              setStudentId("");
              setFeesTerm("");
              setSearch("");
            }}
            data-ocid="fees.cancel_button"
          >
            Clear
          </Button>
          <Button
            type="submit"
            disabled={createFeePayment.isPending}
            data-ocid="fees.submit_button"
          >
            {createFeePayment.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Submit Fee Payment
          </Button>
        </div>
      </form>
    </div>
  );
}
