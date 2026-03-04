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
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronUp, Loader2, Upload } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Page } from "../../App";
import {
  useClasses,
  useCreateStudent,
  useStudents,
  useUpdateStudent,
} from "../../hooks/useQueries";
import { useFamilies, useStudentExtended } from "../../hooks/useSchoolData";

interface AddStudentPageProps {
  onNavigate: (page: Page) => void;
  editId?: string;
}

function SectionHeader({
  number,
  title,
  open,
  onToggle,
}: { number: number; title: string; open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center gap-3 px-4 py-3 bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/15 transition-colors"
    >
      <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shrink-0">
        {number}
      </span>
      <span className="font-semibold text-foreground text-left flex-1">
        {title}
      </span>
      {open ? (
        <ChevronUp className="w-4 h-4 text-muted-foreground" />
      ) : (
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      )}
    </button>
  );
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

interface StudentFormData {
  // Section 1
  picture: string;
  name: string;
  registrationNo: string;
  dateOfAdmission: string;
  selectedClassId: string;
  discountInFee: number;
  mobileNo: string;
  // Section 2
  dateOfBirth: string;
  gender: string;
  identificationMark: string;
  bloodGroup: string;
  motherTongue: string;
  birthPlace: string;
  cast: string;
  previousSchool: string;
  previousId: string;
  aadhaarNumber: string;
  orphan: string;
  disease: string;
  religion: string;
  familyId: string;
  totalSiblings: number;
  address: string;
  // Section 3
  fatherName: string;
  fatherEducation: string;
  fatherMobile: string;
  fatherOccupation: string;
  fatherIncome: number;
  // Section 4
  motherName: string;
  motherEducation: string;
  motherMobile: string;
  motherOccupation: string;
  motherIncome: number;
}

const EMPTY_FORM: StudentFormData = {
  picture: "",
  name: "",
  registrationNo: "",
  dateOfAdmission: new Date().toISOString().split("T")[0],
  selectedClassId: "",
  discountInFee: 0,
  mobileNo: "",
  dateOfBirth: "",
  gender: "",
  identificationMark: "",
  bloodGroup: "",
  motherTongue: "",
  birthPlace: "",
  cast: "",
  previousSchool: "",
  previousId: "",
  aadhaarNumber: "",
  orphan: "",
  disease: "",
  religion: "",
  familyId: "",
  totalSiblings: 0,
  address: "",
  fatherName: "",
  fatherEducation: "",
  fatherMobile: "",
  fatherOccupation: "",
  fatherIncome: 0,
  motherName: "",
  motherEducation: "",
  motherMobile: "",
  motherOccupation: "",
  motherIncome: 0,
};

export default function AddStudentPage({
  onNavigate,
  editId,
}: AddStudentPageProps) {
  const { data: classes = [] } = useClasses();
  const { data: students = [] } = useStudents();
  const [families] = useFamilies();
  const [extendedData, setExtendedData] = useStudentExtended();

  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();

  const [form, setForm] = useState<StudentFormData>(EMPTY_FORM);
  const [sections, setSections] = useState({
    s1: true,
    s2: false,
    s3: false,
    s4: false,
  });

  const isEdit = Boolean(editId);

  useEffect(() => {
    if (editId) {
      const student = students.find((s) => s.id.toString() === editId);
      if (student) {
        const ext = extendedData[editId] ?? {};
        const cls = classes.find((c) => c.name === student.className);
        setForm({
          picture: (ext as { picture?: string }).picture ?? "",
          name: student.name,
          registrationNo: student.registrationNo,
          dateOfAdmission:
            (ext as { dateOfAdmission?: string }).dateOfAdmission ??
            new Date().toISOString().split("T")[0],
          selectedClassId: cls ? cls.id.toString() : "",
          discountInFee: (ext as { discountInFee?: number }).discountInFee ?? 0,
          mobileNo: student.guardianContact,
          dateOfBirth: (ext as { dateOfBirth?: string }).dateOfBirth ?? "",
          gender: (ext as { gender?: string }).gender ?? "",
          identificationMark:
            (ext as { identificationMark?: string }).identificationMark ?? "",
          bloodGroup: (ext as { bloodGroup?: string }).bloodGroup ?? "",
          motherTongue: (ext as { motherTongue?: string }).motherTongue ?? "",
          birthPlace: (ext as { birthPlace?: string }).birthPlace ?? "",
          cast: (ext as { cast?: string }).cast ?? "",
          previousSchool:
            (ext as { previousSchool?: string }).previousSchool ?? "",
          previousId: (ext as { previousId?: string }).previousId ?? "",
          aadhaarNumber:
            (ext as { aadhaarNumber?: string }).aadhaarNumber ?? "",
          orphan: (ext as { orphan?: string }).orphan ?? "",
          disease: (ext as { disease?: string }).disease ?? "",
          religion: (ext as { religion?: string }).religion ?? "",
          familyId: (ext as { familyId?: string }).familyId ?? "",
          totalSiblings: (ext as { totalSiblings?: number }).totalSiblings ?? 0,
          address: (ext as { address?: string }).address ?? "",
          fatherName: student.guardianName,
          fatherEducation:
            (ext as { fatherEducation?: string }).fatherEducation ?? "",
          fatherMobile: (ext as { fatherMobile?: string }).fatherMobile ?? "",
          fatherOccupation:
            (ext as { fatherOccupation?: string }).fatherOccupation ?? "",
          fatherIncome: (ext as { fatherIncome?: number }).fatherIncome ?? 0,
          motherName: (ext as { motherName?: string }).motherName ?? "",
          motherEducation:
            (ext as { motherEducation?: string }).motherEducation ?? "",
          motherMobile: (ext as { motherMobile?: string }).motherMobile ?? "",
          motherOccupation:
            (ext as { motherOccupation?: string }).motherOccupation ?? "",
          motherIncome: (ext as { motherIncome?: number }).motherIncome ?? 0,
        });
      }
    }
  }, [editId, students, classes, extendedData]);

  const setField = useCallback(
    <K extends keyof StudentFormData>(key: K, value: StudentFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handlePicture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024) {
      toast.error("Picture must be less than 100KB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setField("picture", ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Student name is required.");
      setSections((s) => ({ ...s, s1: true }));
      return;
    }
    if (!form.dateOfAdmission) {
      toast.error("Date of admission is required.");
      setSections((s) => ({ ...s, s1: true }));
      return;
    }

    const selectedClass = classes.find(
      (c) => c.id.toString() === form.selectedClassId,
    );
    const className = selectedClass?.name ?? form.selectedClassId;
    const gradeLevel = selectedClass?.gradeLevel ?? 1n;
    const guardianContact = form.fatherMobile || form.mobileNo;
    const guardianName = form.fatherName || "Guardian";

    try {
      let studentId: bigint;
      if (isEdit && editId) {
        await updateStudent.mutateAsync({
          id: BigInt(editId),
          registrationNo: form.registrationNo,
          name: form.name,
          gradeLevel,
          guardianContact,
          guardianName,
          className,
        });
        studentId = BigInt(editId);
        toast.success("Student updated successfully!");
      } else {
        studentId = await createStudent.mutateAsync({
          registrationNo: form.registrationNo,
          name: form.name,
          gradeLevel,
          guardianContact,
          guardianName,
          className,
        });
        toast.success("Student added successfully!");
      }

      // Save extended data
      const ext = {
        studentId: studentId.toString(),
        picture: form.picture,
        dateOfAdmission: form.dateOfAdmission,
        discountInFee: form.discountInFee,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        identificationMark: form.identificationMark,
        bloodGroup: form.bloodGroup,
        motherTongue: form.motherTongue,
        birthPlace: form.birthPlace,
        cast: form.cast,
        previousSchool: form.previousSchool,
        previousId: form.previousId,
        aadhaarNumber: form.aadhaarNumber,
        orphan: form.orphan,
        disease: form.disease,
        religion: form.religion,
        familyId: form.familyId,
        totalSiblings: form.totalSiblings,
        address: form.address,
        fatherName: form.fatherName,
        fatherEducation: form.fatherEducation,
        fatherMobile: form.fatherMobile,
        fatherOccupation: form.fatherOccupation,
        fatherIncome: form.fatherIncome,
        motherName: form.motherName,
        motherEducation: form.motherEducation,
        motherMobile: form.motherMobile,
        motherOccupation: form.motherOccupation,
        motherIncome: form.motherIncome,
        active: true,
      };
      setExtendedData((prev) => ({ ...prev, [studentId.toString()]: ext }));

      onNavigate("students");
    } catch {
      toast.error("Failed to save student.");
    }
  };

  const isPending = createStudent.isPending || updateStudent.isPending;

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate("students")}
          className="text-muted-foreground"
        >
          ← Back
        </Button>
        <div>
          <h1 className="text-2xl font-display font-bold">
            {isEdit ? "Edit Student" : "Add New Student"}
          </h1>
          <p className="text-xs text-muted-foreground">Required* | Optional</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
        data-ocid="student_form.section_1_panel"
      >
        {/* Section 1 */}
        <Card className="border-border">
          <CardContent className="p-0">
            <SectionHeader
              number={1}
              title="Student Information"
              open={sections.s1}
              onToggle={() => setSections((s) => ({ ...s, s1: !s.s1 }))}
            />
            {sections.s1 && (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Picture */}
                <div className="sm:col-span-2">
                  <Label className="text-xs text-muted-foreground">
                    Picture - Optional (Max 100KB)
                  </Label>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg border border-border bg-muted flex items-center justify-center overflow-hidden">
                      {form.picture ? (
                        <img
                          src={form.picture}
                          alt="Student"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Upload className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <label className="cursor-pointer">
                      <span className="text-xs text-primary hover:underline">
                        Upload Photo
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePicture}
                        data-ocid="student_form.upload_button"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="name">Student Name *</Label>
                  <Input
                    id="name"
                    required
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                    placeholder="Full name"
                    data-ocid="student_form.name_input"
                  />
                </div>

                <div>
                  <Label htmlFor="regNo">Registration No</Label>
                  <Input
                    id="regNo"
                    value={form.registrationNo}
                    onChange={(e) => setField("registrationNo", e.target.value)}
                    placeholder="e.g. N1"
                    data-ocid="student_form.input"
                  />
                </div>

                <div>
                  <Label htmlFor="admDate">Date of Admission *</Label>
                  <Input
                    id="admDate"
                    type="date"
                    required
                    value={form.dateOfAdmission}
                    onChange={(e) =>
                      setField("dateOfAdmission", e.target.value)
                    }
                    data-ocid="student_form.input"
                  />
                </div>

                <div>
                  <Label>Select Class *</Label>
                  <Select
                    value={form.selectedClassId}
                    onValueChange={(v) => setField("selectedClassId", v)}
                  >
                    <SelectTrigger data-ocid="student_form.select">
                      <SelectValue placeholder="Select class..." />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem
                          key={cls.id.toString()}
                          value={cls.id.toString()}
                        >
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="discount">Discount In Fee *</Label>
                  <Input
                    id="discount"
                    type="number"
                    min={0}
                    value={form.discountInFee}
                    onChange={(e) =>
                      setField("discountInFee", Number(e.target.value))
                    }
                    data-ocid="student_form.input"
                  />
                </div>

                <div>
                  <Label htmlFor="mobile">Mobile No. for SMS/WhatsApp</Label>
                  <Input
                    id="mobile"
                    value={form.mobileNo}
                    onChange={(e) => setField("mobileNo", e.target.value)}
                    placeholder="10-digit mobile"
                    data-ocid="student_form.input"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 2 */}
        <Card
          className="border-border"
          data-ocid="student_form.section_2_panel"
        >
          <CardContent className="p-0">
            <SectionHeader
              number={2}
              title="Other Information"
              open={sections.s2}
              onToggle={() => setSections((s) => ({ ...s, s2: !s.s2 }))}
            />
            {sections.s2 && (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => setField("dateOfBirth", e.target.value)}
                    data-ocid="student_form.input"
                  />
                </div>

                <div>
                  <Label>Gender</Label>
                  <Select
                    value={form.gender}
                    onValueChange={(v) => setField("gender", v)}
                  >
                    <SelectTrigger data-ocid="student_form.select">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="idMark">Any Identification Mark</Label>
                  <Input
                    id="idMark"
                    value={form.identificationMark}
                    onChange={(e) =>
                      setField("identificationMark", e.target.value)
                    }
                    data-ocid="student_form.input"
                  />
                </div>

                <div>
                  <Label>Blood Group</Label>
                  <Select
                    value={form.bloodGroup}
                    onValueChange={(v) => setField("bloodGroup", v)}
                  >
                    <SelectTrigger data-ocid="student_form.select">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOOD_GROUPS.map((bg) => (
                        <SelectItem key={bg} value={bg}>
                          {bg}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="motherTongue">Mother Tongue</Label>
                  <Input
                    id="motherTongue"
                    value={form.motherTongue}
                    onChange={(e) => setField("motherTongue", e.target.value)}
                    data-ocid="student_form.input"
                  />
                </div>

                <div>
                  <Label htmlFor="birthPlace">Student Birth Place</Label>
                  <Input
                    id="birthPlace"
                    value={form.birthPlace}
                    onChange={(e) => setField("birthPlace", e.target.value)}
                    data-ocid="student_form.input"
                  />
                </div>

                <div>
                  <Label htmlFor="cast">Cast</Label>
                  <Input
                    id="cast"
                    value={form.cast}
                    onChange={(e) => setField("cast", e.target.value)}
                    data-ocid="student_form.input"
                  />
                </div>

                <div>
                  <Label htmlFor="prevSchool">Previous School</Label>
                  <Input
                    id="prevSchool"
                    value={form.previousSchool}
                    onChange={(e) => setField("previousSchool", e.target.value)}
                    data-ocid="student_form.input"
                  />
                </div>

                <div>
                  <Label htmlFor="prevId">Previous ID / Board Roll No</Label>
                  <Input
                    id="prevId"
                    value={form.previousId}
                    onChange={(e) => setField("previousId", e.target.value)}
                    data-ocid="student_form.input"
                  />
                </div>

                <div>
                  <Label htmlFor="aadhaar">Student Aadhaar Number</Label>
                  <Input
                    id="aadhaar"
                    value={form.aadhaarNumber}
                    onChange={(e) => setField("aadhaarNumber", e.target.value)}
                    data-ocid="student_form.input"
                  />
                </div>

                <div>
                  <Label>Orphan Student</Label>
                  <Select
                    value={form.orphan}
                    onValueChange={(v) => setField("orphan", v)}
                  >
                    <SelectTrigger data-ocid="student_form.select">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="Yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="disease">If Any Disease</Label>
                  <Input
                    id="disease"
                    value={form.disease}
                    onChange={(e) => setField("disease", e.target.value)}
                    data-ocid="student_form.input"
                  />
                </div>

                <div>
                  <Label htmlFor="religion">Religion</Label>
                  <Input
                    id="religion"
                    value={form.religion}
                    onChange={(e) => setField("religion", e.target.value)}
                    data-ocid="student_form.input"
                  />
                </div>

                <div>
                  <Label>Select Family</Label>
                  <Select
                    value={form.familyId}
                    onValueChange={(v) => setField("familyId", v)}
                  >
                    <SelectTrigger data-ocid="student_form.select">
                      <SelectValue placeholder="Select family..." />
                    </SelectTrigger>
                    <SelectContent>
                      {families.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="siblings">Total Siblings</Label>
                  <Input
                    id="siblings"
                    type="number"
                    min={0}
                    value={form.totalSiblings}
                    onChange={(e) =>
                      setField("totalSiblings", Number(e.target.value))
                    }
                    data-ocid="student_form.input"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={form.address}
                    onChange={(e) => setField("address", e.target.value)}
                    rows={3}
                    data-ocid="student_form.textarea"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 3 */}
        <Card
          className="border-border"
          data-ocid="student_form.section_3_panel"
        >
          <CardContent className="p-0">
            <SectionHeader
              number={3}
              title="Father/Guardian Information"
              open={sections.s3}
              onToggle={() => setSections((s) => ({ ...s, s3: !s.s3 }))}
            />
            {sections.s3 && (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fName">Father Name</Label>
                  <Input
                    id="fName"
                    value={form.fatherName}
                    onChange={(e) => setField("fatherName", e.target.value)}
                    data-ocid="student_form.input"
                  />
                </div>
                <div>
                  <Label htmlFor="fEdu">Education</Label>
                  <Input
                    id="fEdu"
                    value={form.fatherEducation}
                    onChange={(e) =>
                      setField("fatherEducation", e.target.value)
                    }
                    data-ocid="student_form.input"
                  />
                </div>
                <div>
                  <Label htmlFor="fMobile">Mobile No</Label>
                  <Input
                    id="fMobile"
                    value={form.fatherMobile}
                    onChange={(e) => setField("fatherMobile", e.target.value)}
                    data-ocid="student_form.input"
                  />
                </div>
                <div>
                  <Label htmlFor="fOcc">Occupation</Label>
                  <Input
                    id="fOcc"
                    value={form.fatherOccupation}
                    onChange={(e) =>
                      setField("fatherOccupation", e.target.value)
                    }
                    data-ocid="student_form.input"
                  />
                </div>
                <div>
                  <Label htmlFor="fIncome">Income</Label>
                  <Input
                    id="fIncome"
                    type="number"
                    min={0}
                    value={form.fatherIncome}
                    onChange={(e) =>
                      setField("fatherIncome", Number(e.target.value))
                    }
                    data-ocid="student_form.input"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 4 */}
        <Card
          className="border-border"
          data-ocid="student_form.section_4_panel"
        >
          <CardContent className="p-0">
            <SectionHeader
              number={4}
              title="Mother Information"
              open={sections.s4}
              onToggle={() => setSections((s) => ({ ...s, s4: !s.s4 }))}
            />
            {sections.s4 && (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mName">Mother Name</Label>
                  <Input
                    id="mName"
                    value={form.motherName}
                    onChange={(e) => setField("motherName", e.target.value)}
                    data-ocid="student_form.input"
                  />
                </div>
                <div>
                  <Label htmlFor="mEdu">Education</Label>
                  <Input
                    id="mEdu"
                    value={form.motherEducation}
                    onChange={(e) =>
                      setField("motherEducation", e.target.value)
                    }
                    data-ocid="student_form.input"
                  />
                </div>
                <div>
                  <Label htmlFor="mMobile">Mobile No</Label>
                  <Input
                    id="mMobile"
                    value={form.motherMobile}
                    onChange={(e) => setField("motherMobile", e.target.value)}
                    data-ocid="student_form.input"
                  />
                </div>
                <div>
                  <Label htmlFor="mOcc">Occupation</Label>
                  <Input
                    id="mOcc"
                    value={form.motherOccupation}
                    onChange={(e) =>
                      setField("motherOccupation", e.target.value)
                    }
                    data-ocid="student_form.input"
                  />
                </div>
                <div>
                  <Label htmlFor="mIncome">Income</Label>
                  <Input
                    id="mIncome"
                    type="number"
                    min={0}
                    value={form.motherIncome}
                    onChange={(e) =>
                      setField("motherIncome", Number(e.target.value))
                    }
                    data-ocid="student_form.input"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onNavigate("students")}
            data-ocid="student_form.cancel_button"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            data-ocid="student_form.submit_button"
          >
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEdit ? "Update Student" : "Save Student"}
          </Button>
        </div>
      </form>
    </div>
  );
}
