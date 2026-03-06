import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { useClasses } from "../../hooks/useQueries";
import { useExams, useSubjects } from "../../hooks/useSchoolData";

export default function ExamsCreatePage() {
  const [, setExams] = useExams();
  const { data: classes = [] } = useClasses();
  const [subjects] = useSubjects();

  const [form, setForm] = useState({
    name: "",
    type: "exam" as "exam" | "class_test",
    className: "",
    subject: "",
    date: "",
    maxMarks: 100,
  });

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error("Exam name is required.");
      return;
    }
    setExams((prev) => [
      ...prev,
      { id: `ex_${Date.now()}`, ...form, marks: {} },
    ]);
    toast.success("Exam created successfully!");
    setForm({
      name: "",
      type: "exam",
      className: "",
      subject: "",
      date: "",
      maxMarks: 100,
    });
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-display font-bold">Create New Exam</h1>
        <p className="text-sm text-muted-foreground">
          Create a new exam or test for a class
        </p>
      </div>

      <Card className="border-border max-w-xl">
        <CardHeader>
          <CardTitle className="text-base">Exam Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Exam Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Mid-Term Examination 2026"
              data-ocid="exams-create.input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, type: v as "exam" | "class_test" }))
                }
              >
                <SelectTrigger data-ocid="exams-create.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="class_test">Class Test</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Max Marks</Label>
              <Input
                type="number"
                min={1}
                value={form.maxMarks}
                onChange={(e) =>
                  setForm((f) => ({ ...f, maxMarks: Number(e.target.value) }))
                }
                data-ocid="exams-create.input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Class</Label>
              <Select
                value={form.className}
                onValueChange={(v) => setForm((f) => ({ ...f, className: v }))}
              >
                <SelectTrigger data-ocid="exams-create.select">
                  <SelectValue placeholder="Select class..." />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id.toString()} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subject</Label>
              <Select
                value={form.subject}
                onValueChange={(v) => setForm((f) => ({ ...f, subject: v }))}
              >
                <SelectTrigger data-ocid="exams-create.select">
                  <SelectValue placeholder="Select subject..." />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.name}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              data-ocid="exams-create.input"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSubmit}
              data-ocid="exams-create.submit_button"
            >
              Create Exam
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
