import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Principal } from "@icp-sdk/core/principal";
import {
  AlertCircle,
  Info,
  Loader2,
  ShieldCheck,
  UserSquare,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../../backend.d";
import { useActor } from "../../hooks/useActor";
import { useIsAdmin } from "../../hooks/useQueries";

interface ManageLoginPageProps {
  title: string;
}

export default function ManageLoginPage({ title }: ManageLoginPageProps) {
  const { actor } = useActor();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const [principalId, setPrincipalId] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.user);
  const [isPending, setIsPending] = useState(false);

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!principalId.trim()) {
      toast.error("Please enter a Principal ID.");
      return;
    }

    if (!actor) {
      toast.error("Not connected. Please sign in first.");
      return;
    }

    let principal: Principal;
    try {
      principal = Principal.fromText(principalId.trim());
    } catch {
      toast.error("Invalid Principal ID format. Please check and try again.");
      return;
    }

    setIsPending(true);
    try {
      await actor.assignCallerUserRole(principal, role);
      toast.success("Access granted successfully!");
      setPrincipalId("");
      setRole(UserRole.user);
    } catch (err) {
      console.error(err);
      toast.error(
        "Failed to grant access. Make sure you have admin privileges.",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-2xl">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <UserSquare className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Grant portal access to teachers or students using their Principal
            ID.
          </p>
        </div>
      </div>

      {/* Info Card */}
      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm text-muted-foreground leading-relaxed">
          To give portal access to a teacher or student, ask them to log in with
          Internet Identity and share their{" "}
          <strong className="text-foreground">Principal ID</strong> with you.
          Their Principal ID appears at the top of their profile after signing
          in. Enter it below and assign their role.
        </AlertDescription>
      </Alert>

      {adminLoading ? (
        <Card className="border-border">
          <CardContent className="py-8 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : !isAdmin ? (
        /* Read-only notice */
        <Alert
          className="border-amber-500/30 bg-amber-500/5"
          data-ocid="manage-login.error_state"
        >
          <AlertCircle className="h-4 w-4 text-amber-400" />
          <AlertDescription className="text-sm text-amber-300">
            Only administrators can grant portal access. Please ask your school
            administrator to perform this action.
          </AlertDescription>
        </Alert>
      ) : (
        /* Grant Access Form */
        <Card className="border-border" data-ocid="manage-login.card">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Grant Portal Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGrantAccess} className="space-y-5">
              {/* Principal ID */}
              <div className="space-y-2">
                <Label
                  htmlFor="principal-id"
                  className="text-sm font-medium text-foreground"
                >
                  Principal ID <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="principal-id"
                  type="text"
                  value={principalId}
                  onChange={(e) => setPrincipalId(e.target.value)}
                  placeholder="e.g. xxxxx-xxxxx-xxxxx-xxxxx-cai"
                  autoComplete="off"
                  spellCheck={false}
                  className="font-mono text-sm"
                  data-ocid="manage-login.input"
                />
                <p className="text-xs text-muted-foreground">
                  The person's Internet Identity Principal ID. They can find it
                  by logging into the portal and checking their profile.
                </p>
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label
                  htmlFor="role-select"
                  className="text-sm font-medium text-foreground"
                >
                  Role <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={role}
                  onValueChange={(val) => setRole(val as UserRole)}
                >
                  <SelectTrigger
                    id="role-select"
                    data-ocid="manage-login.select"
                  >
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRole.admin}>
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                        Admin — Full access to manage all school data
                      </span>
                    </SelectItem>
                    <SelectItem value={UserRole.user}>
                      <span className="flex items-center gap-2">
                        <UserSquare className="w-3.5 h-3.5 text-muted-foreground" />
                        User / Viewer — Can view data, limited edit access
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {role === UserRole.admin
                    ? "Admin users can add, edit, and delete all records and manage other users."
                    : "User / Viewer can view school records but has limited ability to make changes."}
                </p>
              </div>

              {/* Submit */}
              <div className="flex items-center gap-3 pt-1">
                <Button
                  type="submit"
                  disabled={isPending || !principalId.trim()}
                  className="gap-2"
                  data-ocid="manage-login.submit_button"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Granting Access...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Grant Access
                    </>
                  )}
                </Button>
                {isPending && (
                  <span
                    className="text-xs text-muted-foreground"
                    data-ocid="manage-login.loading_state"
                  >
                    Processing on-chain...
                  </span>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Note */}
      <p className="text-xs text-muted-foreground flex items-start gap-1.5">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>
          <strong>Note:</strong> Only admins can grant access. Role changes take
          effect immediately after the user signs in again.
        </span>
      </p>
    </div>
  );
}
