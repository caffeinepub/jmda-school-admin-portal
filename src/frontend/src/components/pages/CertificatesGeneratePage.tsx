import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Printer } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { useClasses, useStudents } from "../../hooks/useQueries";

interface CertificateTemplate {
  id: string;
  name: string;
  body: string;
}

const DEFAULT_TEMPLATES: CertificateTemplate[] = [
  {
    id: "bonafide",
    name: "Bonafide Certificate",
    body: "This is to certify that {studentName}, son/daughter of {guardianName}, bearing Registration No. {registrationNo}, is a bonafide student of {className} in this institution during the academic year 2025-26. This certificate is issued on the request of the student for the purpose stated.",
  },
  {
    id: "character",
    name: "Character Certificate",
    body: "This is to certify that {studentName}, Registration No. {registrationNo}, was a student of {className} in this institution. During their tenure, they have been found to be of good character and conduct. They have maintained exemplary discipline and academic performance.",
  },
  {
    id: "transfer",
    name: "Transfer Certificate",
    body: "This is to certify that {studentName}, son/daughter of {guardianName}, Registration No. {registrationNo}, was a student of {className} in this institution. They are hereby granted a Transfer Certificate as they are leaving this institution. Their conduct and character during their stay have been satisfactory.",
  },
];

export default function CertificatesGeneratePage() {
  const { data: students = [] } = useStudents();
  const { data: classes = [] } = useClasses();
  const [templates] = useLocalStorage<CertificateTemplate[]>(
    "jmda_cert_templates",
    DEFAULT_TEMPLATES,
  );
  const [classFilter, setClassFilter] = useState("");
  const [studentId, setStudentId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [showCertificate, setShowCertificate] = useState(false);

  const studentsInClass = useMemo(() => {
    if (!classFilter) return students;
    const cls = classes.find((c) => c.id.toString() === classFilter);
    return students.filter((s) => s.className === cls?.name);
  }, [students, classes, classFilter]);

  const selectedStudent = students.find((s) => s.id.toString() === studentId);
  const selectedTemplate = templates.find((t) => t.id === templateId);

  const certificateText = useMemo(() => {
    if (!selectedStudent || !selectedTemplate) return "";
    return selectedTemplate.body
      .replace(/{studentName}/g, selectedStudent.name)
      .replace(/{guardianName}/g, selectedStudent.guardianName || "")
      .replace(/{registrationNo}/g, selectedStudent.registrationNo || "")
      .replace(/{className}/g, selectedStudent.className);
  }, [selectedStudent, selectedTemplate]);

  const handleGenerate = () => {
    if (!studentId || !templateId) return;
    setShowCertificate(true);
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">
            Generate Certificate
          </h1>
          <p className="text-sm text-muted-foreground">
            Generate bonafide, character, or transfer certificates
          </p>
        </div>
        {showCertificate && (
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="gap-2 no-print"
            data-ocid="certificates-generate.primary_button"
          >
            <Printer className="w-4 h-4" /> Print Certificate
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-4 no-print">
        <div>
          <Label className="text-xs">Class</Label>
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger
              className="w-40"
              data-ocid="certificates-generate.select"
            >
              <SelectValue placeholder="All classes..." />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c.id.toString()} value={c.id.toString()}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Student</Label>
          <Select value={studentId} onValueChange={setStudentId}>
            <SelectTrigger
              className="w-52"
              data-ocid="certificates-generate.select"
            >
              <SelectValue placeholder="Select student..." />
            </SelectTrigger>
            <SelectContent>
              {studentsInClass.map((s) => (
                <SelectItem key={s.id.toString()} value={s.id.toString()}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Certificate Type</Label>
          <Select value={templateId} onValueChange={setTemplateId}>
            <SelectTrigger
              className="w-52"
              data-ocid="certificates-generate.select"
            >
              <SelectValue placeholder="Select type..." />
            </SelectTrigger>
            <SelectContent>
              {templates.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button
            onClick={handleGenerate}
            disabled={!studentId || !templateId}
            data-ocid="certificates-generate.submit_button"
          >
            Generate
          </Button>
        </div>
      </div>

      {showCertificate && selectedStudent && selectedTemplate && (
        <Card className="border-border max-w-2xl">
          <CardHeader className="pb-3 border-b border-border">
            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                JMDA School Admin Portal
              </p>
              <h2 className="text-xl font-display font-bold">
                {selectedTemplate.name}
              </h2>
            </div>
          </CardHeader>
          <CardContent className="pt-6 pb-8 px-8">
            <p className="text-sm leading-relaxed text-foreground">
              {certificateText}
            </p>

            <div className="mt-12 grid grid-cols-2 gap-8 text-sm">
              <div>
                <div className="h-10 border-b border-dashed border-border mb-1" />
                <p className="text-muted-foreground text-center">
                  Date: {new Date().toLocaleDateString("en-IN")}
                </p>
              </div>
              <div>
                <div className="h-10 border-b border-dashed border-border mb-1" />
                <p className="text-muted-foreground text-center">
                  Principal's Signature
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!showCertificate && (
        <div
          className="py-12 text-center text-muted-foreground"
          data-ocid="certificates-generate.empty_state"
        >
          Select a student and certificate type, then click Generate.
        </div>
      )}
    </div>
  );
}
