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
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  KeyRound,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Page } from "../../App";
import {
  type Employee,
  getEmployeeDisplayId,
  useEmployeeCredentials,
  useEmployees,
} from "../../hooks/useSchoolData";

interface EditEmployeePageProps {
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
      data-ocid={`edit_employee.section_${number}.toggle`}
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
const GENDERS = ["Male", "Female", "Other"];
const RELIGIONS = [
  "Islam",
  "Christianity",
  "Hinduism",
  "Buddhism",
  "Sikhism",
  "Judaism",
  "Other",
];
const EMPLOYEE_ROLES = [
  "Teacher",
  "Principal",
  "Vice Principal",
  "Admin Staff",
  "Peon",
  "Guard",
  "Accountant",
  "Librarian",
  "Lab Assistant",
  "Other",
];

const EMPTY_FORM: Omit<Employee, "id"> = {
  picture: "",
  name: "",
  mobile: "",
  dateOfJoining: "",
  role: "",
  salary: 0,
  department: "",
  fatherHusbandName: "",
  nationalId: "",
  education: "",
  gender: "",
  religion: "",
  bloodGroup: "",
  experience: "",
  email: "",
  dateOfBirth: "",
  homeAddress: "",
};

export default function EditEmployeePage({
  onNavigate,
  editId,
}: EditEmployeePageProps) {
  const [employees, setEmployees] = useEmployees();
  const [credentials, setCredentials] = useEmployeeCredentials();
  const [form, setForm] = useState<Omit<Employee, "id">>(EMPTY_FORM);
  const [section1Open, setSection1Open] = useState(true);
  const [section2Open, setSection2Open] = useState(true);
  const [section3Open, setSection3Open] = useState(true);
  const [saving, setSaving] = useState(false);
  const [credPassword, setCredPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editId) {
      const emp = employees.find((e) => e.id === editId);
      if (emp) {
        const { id: _id, ...rest } = emp;
        setForm({ ...EMPTY_FORM, ...rest });
        // Pre-fill password if credentials exist
        const cred = credentials.find((c) => c.employeeId === editId);
        if (cred) setCredPassword(cred.password);
      }
    }
  }, [editId, employees, credentials]);

  const handlePictureChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 100 * 1024) {
        toast.error("Image must be smaller than 100KB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setForm((f) => ({ ...f, picture: reader.result as string }));
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  const set = (key: keyof Omit<Employee, "id">, value: string | number) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Employee Name is required.");
      return;
    }
    if (!form.dateOfJoining) {
      toast.error("Date of Joining is required.");
      return;
    }
    if (!form.role) {
      toast.error("Employee Role is required.");
      return;
    }
    if (!form.salary || form.salary <= 0) {
      toast.error("Monthly Salary is required.");
      return;
    }

    setSaving(true);
    try {
      const newEmployees = editId
        ? employees.map((e) => (e.id === editId ? { ...e, ...form } : e))
        : [...employees, { id: `emp_${Date.now()}`, ...form }];

      // Write directly to localStorage FIRST so EmployeesPage reads fresh data on mount
      try {
        window.localStorage.setItem(
          "jmda_employees",
          JSON.stringify(newEmployees),
        );
      } catch {}

      setEmployees(newEmployees);
      toast.success(
        editId
          ? "Employee updated successfully."
          : "Employee added successfully.",
      );
      onNavigate("employees");
    } finally {
      setSaving(false);
    }
  };

  const handleSetCredentials = () => {
    if (!editId) {
      toast.error("Save the employee first before setting credentials.");
      return;
    }
    if (!credPassword.trim()) {
      toast.error("Please enter a password.");
      return;
    }
    const emp = employees.find((e) => e.id === editId);
    if (!emp) return;
    const username = getEmployeeDisplayId(employees, emp);
    const newCredentials = credentials.filter((c) => c.employeeId !== editId);
    newCredentials.push({
      employeeId: editId,
      username,
      password: credPassword,
      active: true,
    });
    setCredentials(newCredentials);
    toast.success(`Credentials set! Username: ${username}`);
  };

  const isEdit = !!editId;
  const currentCred = editId
    ? credentials.find((c) => c.employeeId === editId)
    : null;
  const currentEmp = editId ? employees.find((e) => e.id === editId) : null;
  const displayId = currentEmp
    ? getEmployeeDisplayId(employees, currentEmp)
    : "(save first)";

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">
            {isEdit ? "Edit Employee" : "Add Employee"}
          </h1>
          <p className="text-sm text-muted-foreground">
            <span className="text-destructive font-medium">Required*</span>{" "}
            Optional
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => onNavigate("employees")}
          data-ocid="edit_employee.cancel_button"
        >
          Cancel
        </Button>
      </div>

      {/* Section 1 - Basic Information */}
      <div className="space-y-3">
        <SectionHeader
          number={1}
          title="Basic Information"
          open={section1Open}
          onToggle={() => setSection1Open((v) => !v)}
        />
        {section1Open && (
          <Card>
            <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Picture */}
              <div className="sm:col-span-2">
                <Label className="text-muted-foreground text-xs mb-1 block">
                  Picture{" "}
                  <span className="text-muted-foreground/60">
                    -- Optional (Max 100KB)
                  </span>
                </Label>
                <div className="flex items-center gap-4">
                  {form.picture ? (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border shrink-0">
                      <img
                        src={form.picture}
                        alt="Employee"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center"
                        onClick={() => set("picture", "")}
                        data-ocid="edit_employee.picture.delete_button"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center shrink-0 text-muted-foreground">
                      <Upload className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePictureChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileRef.current?.click()}
                      data-ocid="edit_employee.picture.upload_button"
                    >
                      <Upload className="w-3.5 h-3.5 mr-1.5" />
                      Upload Photo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      Max size 100KB
                    </p>
                  </div>
                </div>
              </div>

              {/* Employee Name */}
              <div className="sm:col-span-2">
                <Label htmlFor="emp-name">
                  Employee Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="emp-name"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Full name"
                  data-ocid="edit_employee.name.input"
                />
              </div>

              {/* Mobile */}
              <div>
                <Label htmlFor="emp-mobile">Mobile No. for SMS/WhatsApp</Label>
                <Input
                  id="emp-mobile"
                  value={form.mobile}
                  onChange={(e) => set("mobile", e.target.value)}
                  placeholder="Mobile number"
                  data-ocid="edit_employee.mobile.input"
                />
              </div>

              {/* Date of Joining */}
              <div>
                <Label htmlFor="emp-doj">
                  Date of Joining <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="emp-doj"
                  type="date"
                  value={form.dateOfJoining}
                  onChange={(e) => set("dateOfJoining", e.target.value)}
                  data-ocid="edit_employee.date_of_joining.input"
                />
              </div>

              {/* Employee Role */}
              <div>
                <Label>
                  Employee Role <span className="text-destructive">*</span>
                </Label>
                <Select value={form.role} onValueChange={(v) => set("role", v)}>
                  <SelectTrigger data-ocid="edit_employee.role.select">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYEE_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Monthly Salary */}
              <div>
                <Label htmlFor="emp-salary">
                  Monthly Salary (₹) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="emp-salary"
                  type="number"
                  min={0}
                  value={form.salary || ""}
                  onChange={(e) => set("salary", Number(e.target.value))}
                  placeholder="Monthly salary"
                  data-ocid="edit_employee.salary.input"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Section 2 - Other Information */}
      <div className="space-y-3">
        <SectionHeader
          number={2}
          title="Other Information"
          open={section2Open}
          onToggle={() => setSection2Open((v) => !v)}
        />
        {section2Open && (
          <Card>
            <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emp-father">Father / Husband Name</Label>
                <Input
                  id="emp-father"
                  value={form.fatherHusbandName}
                  onChange={(e) => set("fatherHusbandName", e.target.value)}
                  placeholder="Father or husband name"
                  data-ocid="edit_employee.father.input"
                />
              </div>
              <div>
                <Label htmlFor="emp-nid">National ID</Label>
                <Input
                  id="emp-nid"
                  value={form.nationalId}
                  onChange={(e) => set("nationalId", e.target.value)}
                  placeholder="National ID number"
                  data-ocid="edit_employee.national_id.input"
                />
              </div>
              <div>
                <Label htmlFor="emp-edu">Education</Label>
                <Input
                  id="emp-edu"
                  value={form.education}
                  onChange={(e) => set("education", e.target.value)}
                  placeholder="e.g. B.Ed, M.A."
                  data-ocid="edit_employee.education.input"
                />
              </div>
              <div>
                <Label>Gender</Label>
                <Select
                  value={form.gender}
                  onValueChange={(v) => set("gender", v)}
                >
                  <SelectTrigger data-ocid="edit_employee.gender.select">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDERS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Religion</Label>
                <Select
                  value={form.religion}
                  onValueChange={(v) => set("religion", v)}
                >
                  <SelectTrigger data-ocid="edit_employee.religion.select">
                    <SelectValue placeholder="Select religion" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELIGIONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Blood Group</Label>
                <Select
                  value={form.bloodGroup}
                  onValueChange={(v) => set("bloodGroup", v)}
                >
                  <SelectTrigger data-ocid="edit_employee.blood_group.select">
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_GROUPS.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="emp-exp">Experience</Label>
                <Input
                  id="emp-exp"
                  value={form.experience}
                  onChange={(e) => set("experience", e.target.value)}
                  placeholder="e.g. 5 years"
                  data-ocid="edit_employee.experience.input"
                />
              </div>
              <div>
                <Label htmlFor="emp-email">Email Address</Label>
                <Input
                  id="emp-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="Email address"
                  data-ocid="edit_employee.email.input"
                />
              </div>
              <div>
                <Label htmlFor="emp-dob">Date of Birth</Label>
                <Input
                  id="emp-dob"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => set("dateOfBirth", e.target.value)}
                  data-ocid="edit_employee.dob.input"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="emp-address">Home Address</Label>
                <Textarea
                  id="emp-address"
                  value={form.homeAddress}
                  onChange={(e) => set("homeAddress", e.target.value)}
                  placeholder="Home address"
                  rows={2}
                  data-ocid="edit_employee.address.textarea"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Section 3 - Login Credentials */}
      <div className="space-y-3">
        <SectionHeader
          number={3}
          title="Login Credentials"
          open={section3Open}
          onToggle={() => setSection3Open((v) => !v)}
        />
        {section3Open && (
          <Card>
            <CardContent className="pt-4 space-y-4">
              {!isEdit && (
                <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                  <KeyRound className="inline w-4 h-4 mr-1.5 text-primary" />
                  Save the employee first, then come back to set login
                  credentials.
                </p>
              )}
              {isEdit && (
                <>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border">
                    <KeyRound className="w-4 h-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">
                        Auto-generated Username
                      </p>
                      <p className="font-mono font-bold text-lg text-primary">
                        {displayId}
                      </p>
                    </div>
                    <div>
                      {currentCred ? (
                        <span className="text-xs text-emerald-500 font-medium bg-emerald-500/10 px-2 py-1 rounded-full">
                          ✓ Credentials set
                        </span>
                      ) : (
                        <span className="text-xs text-amber-500 font-medium bg-amber-500/10 px-2 py-1 rounded-full">
                          No credentials
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="cred-password">Set Password</Label>
                    <div className="relative mt-1">
                      <Input
                        id="cred-password"
                        type={showPassword ? "text" : "password"}
                        value={credPassword}
                        onChange={(e) => setCredPassword(e.target.value)}
                        placeholder="Enter password for this employee"
                        className="pr-10"
                        data-ocid="edit_employee.password.input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSetCredentials}
                    className="gap-2"
                    data-ocid="edit_employee.set_credentials.button"
                  >
                    <KeyRound className="w-4 h-4" />
                    Set Credentials
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Save */}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          variant="outline"
          onClick={() => onNavigate("employees")}
          data-ocid="edit_employee.cancel_button"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          data-ocid="edit_employee.save_button"
        >
          {saving ? "Saving..." : isEdit ? "Update Employee" : "Add Employee"}
        </Button>
      </div>
    </div>
  );
}
