import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useStudents } from "../../hooks/useQueries";
import { useStudentExtended } from "../../hooks/useSchoolData";

export default function ActiveInactivePage() {
  const { data: students = [] } = useStudents();
  const [extendedData, setExtendedData] = useStudentExtended();

  const toggleActive = (id: string, current: boolean) => {
    setExtendedData((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? {}),
        active: !current,
      } as (typeof prev)[typeof id],
    }));
    toast.success(
      current ? "Student marked inactive." : "Student marked active.",
    );
  };

  const activeStudents = students.filter((s) => {
    const ext = extendedData[s.id.toString()];
    return !ext || ext.active !== false;
  });

  const inactiveStudents = students.filter((s) => {
    const ext = extendedData[s.id.toString()];
    return ext?.active === false;
  });

  const renderTable = (list: typeof students, isActive: boolean) =>
    list.length === 0 ? (
      <div
        className="py-12 text-center text-muted-foreground"
        data-ocid="active_inactive.empty_state"
      >
        No {isActive ? "active" : "inactive"} students.
      </div>
    ) : (
      <div className="rounded-lg border border-border overflow-hidden mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reg No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((s, idx) => (
              <TableRow
                key={s.id.toString()}
                data-ocid={`active_inactive.row.${idx + 1}`}
              >
                <TableCell className="font-mono text-xs">
                  {s.registrationNo || "-"}
                </TableCell>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {s.className}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      isActive
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                    }
                  >
                    {isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(s.id.toString(), isActive)}
                    data-ocid={`active_inactive.toggle.${idx + 1}`}
                  >
                    Mark {isActive ? "Inactive" : "Active"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-display font-bold">
          Active / Inactive Students
        </h1>
        <p className="text-sm text-muted-foreground">
          {activeStudents.length} active · {inactiveStudents.length} inactive
        </p>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active" data-ocid="active_inactive.tab">
            Active Students ({activeStudents.length})
          </TabsTrigger>
          <TabsTrigger value="inactive" data-ocid="active_inactive.tab">
            Inactive Students ({inactiveStudents.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          {renderTable(activeStudents, true)}
        </TabsContent>
        <TabsContent value="inactive">
          {renderTable(inactiveStudents, false)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
