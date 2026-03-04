import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Printer } from "lucide-react";
import { useState } from "react";
import { useStudents } from "../../hooks/useQueries";
import { useStudentExtended } from "../../hooks/useSchoolData";

export default function AdmissionLetterPage() {
  const { data: students = [] } = useStudents();
  const [extendedData] = useStudentExtended();
  const [selectedId, setSelectedId] = useState("");

  const student = students.find((s) => s.id.toString() === selectedId);
  const ext = selectedId ? extendedData[selectedId] : null;

  const handlePrint = () => window.print();

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between gap-4 no-print">
        <h1 className="text-2xl font-display font-bold">Admission Letter</h1>
        {student && (
          <Button
            onClick={handlePrint}
            className="gap-2"
            data-ocid="admission_letter.primary_button"
          >
            <Printer className="w-4 h-4" /> Print Letter
          </Button>
        )}
      </div>

      <div className="max-w-xs no-print">
        <Label>Select Student</Label>
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger data-ocid="admission_letter.select">
            <SelectValue placeholder="Select a student..." />
          </SelectTrigger>
          <SelectContent>
            {students.map((s) => (
              <SelectItem key={s.id.toString()} value={s.id.toString()}>
                {s.name} ({s.registrationNo || "No Reg"})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {student && (
        <div
          id="admission-letter"
          className="max-w-2xl mx-auto border border-border rounded-lg p-8 bg-card print:border-black print:text-black"
        >
          <div className="text-center border-b border-border pb-4 mb-6">
            <h2 className="text-2xl font-display font-bold text-primary">
              JMDA School
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Admission Confirmation Letter
            </p>
          </div>

          <div className="space-y-2 text-sm mb-6">
            <p>
              Date:{" "}
              {ext?.dateOfAdmission
                ? new Date(ext.dateOfAdmission).toLocaleDateString("en-IN")
                : new Date().toLocaleDateString("en-IN")}
            </p>
          </div>

          <p className="mb-4 text-sm">Dear Parent / Guardian,</p>
          <p className="mb-4 text-sm">
            We are pleased to inform you that your ward has been admitted to
            JMDA School. The details of admission are as follows:
          </p>

          <div className="border border-border rounded-lg overflow-hidden mb-6">
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["Student Name", student.name],
                  ["Registration No.", student.registrationNo || "-"],
                  ["Class", student.className],
                  [
                    "Date of Admission",
                    ext?.dateOfAdmission
                      ? new Date(ext.dateOfAdmission).toLocaleDateString(
                          "en-IN",
                        )
                      : "-",
                  ],
                  ["Father/Guardian Name", student.guardianName || "-"],
                  ["Contact Number", student.guardianContact || "-"],
                  [
                    "Date of Birth",
                    ext?.dateOfBirth
                      ? new Date(ext.dateOfBirth).toLocaleDateString("en-IN")
                      : "-",
                  ],
                  ["Gender", ext?.gender || "-"],
                  ["Blood Group", ext?.bloodGroup || "-"],
                  ["Address", ext?.address || "-"],
                ].map(([label, value]) => (
                  <tr
                    key={label}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-2 font-medium bg-muted/30 w-40">
                      {label}
                    </td>
                    <td className="px-4 py-2">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-sm mb-8">
            Please ensure that the student reports on the scheduled date with
            all required documents. We look forward to providing quality
            education to your ward.
          </p>

          <div className="flex justify-between text-sm mt-12">
            <div className="text-center">
              <div className="border-t border-foreground pt-1 w-32">
                Parent Signature
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-foreground pt-1 w-32">
                Principal Signature
              </div>
            </div>
          </div>
        </div>
      )}

      {!student && (
        <div className="py-16 text-center text-muted-foreground">
          Select a student to generate their admission letter.
        </div>
      )}
    </div>
  );
}
