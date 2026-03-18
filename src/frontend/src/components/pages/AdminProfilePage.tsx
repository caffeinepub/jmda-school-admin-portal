import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Save, Shield } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useAdminProfile } from "../../hooks/useSchoolData";

export default function AdminProfilePage() {
  const { identity } = useInternetIdentity();
  const [profile, setProfile] = useAdminProfile();
  const [form, setForm] = useState({ ...profile });
  const fileRef = useRef<HTMLInputElement>(null);

  const principalId = identity?.getPrincipal().toString() ?? "Not signed in";

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024) {
      toast.error("Photo must be under 100KB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setForm((prev) => ({ ...prev, picture: result }));
    };
    reader.readAsDataURL(file);
  }

  function handleSave() {
    setProfile(form);
    toast.success("Profile saved successfully");
  }

  const initials = (form.name || "A")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">
            Admin Profile
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your administrator account details
          </p>
        </div>
      </div>

      {/* Principal ID (read-only) */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-3 px-4">
          <div className="flex items-start gap-3">
            <Shield className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-primary mb-0.5">
                Internet Identity Principal ID
              </p>
              <p
                className="text-xs text-muted-foreground break-all font-mono"
                data-ocid="admin_profile.panel"
              >
                {principalId}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo + Basic */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile Photo</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="w-20 h-20">
              {form.picture ? (
                <AvatarImage src={form.picture} alt={form.name} />
              ) : null}
              <AvatarFallback className="text-xl bg-primary/20 text-primary font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow"
              data-ocid="admin_profile.upload_button"
            >
              <Camera className="w-3 h-3" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhoto}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {form.name || "Administrator"}
            </p>
            <p className="text-xs text-muted-foreground">{form.designation}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Max photo size: 100KB
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Fields */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="ap-name">Full Name</Label>
              <Input
                id="ap-name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Your full name"
                data-ocid="admin_profile.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ap-designation">Designation</Label>
              <Input
                id="ap-designation"
                value={form.designation}
                onChange={(e) => handleChange("designation", e.target.value)}
                placeholder="e.g. Administrator"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ap-school">School Name</Label>
              <Input
                id="ap-school"
                value={form.schoolName}
                onChange={(e) => handleChange("schoolName", e.target.value)}
                placeholder="JMDA School"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ap-phone">Phone Number</Label>
              <Input
                id="ap-phone"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+91 XXXXXXXXXX"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="ap-email">Email Address</Label>
              <Input
                id="ap-email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="admin@jmda.edu.in"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="ap-address">School Address</Label>
              <Textarea
                id="ap-address"
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Full school address"
                rows={3}
                data-ocid="admin_profile.textarea"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        className="w-full gap-2"
        data-ocid="admin_profile.save_button"
      >
        <Save className="w-4 h-4" />
        Save Profile
      </Button>
    </div>
  );
}
