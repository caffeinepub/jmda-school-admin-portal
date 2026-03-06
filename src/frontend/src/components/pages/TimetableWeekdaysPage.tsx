import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "../../hooks/useLocalStorage";

const ALL_DAYS = [
  { id: "monday", name: "Monday", shortName: "Mon" },
  { id: "tuesday", name: "Tuesday", shortName: "Tue" },
  { id: "wednesday", name: "Wednesday", shortName: "Wed" },
  { id: "thursday", name: "Thursday", shortName: "Thu" },
  { id: "friday", name: "Friday", shortName: "Fri" },
  { id: "saturday", name: "Saturday", shortName: "Sat" },
  { id: "sunday", name: "Sunday", shortName: "Sun" },
];

const DEFAULT_ENABLED = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
];

export default function TimetableWeekdaysPage() {
  const [enabledDays, setEnabledDays] = useLocalStorage<string[]>(
    "jmda_enabled_days",
    DEFAULT_ENABLED,
  );
  const [localEnabled, setLocalEnabled] = useState<string[]>(enabledDays);

  const toggleDay = (dayId: string) => {
    setLocalEnabled((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId],
    );
  };

  const handleSave = () => {
    setEnabledDays(localEnabled);
    toast.success("Weekday settings saved!");
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-display font-bold">Weekdays</h1>
        <p className="text-sm text-muted-foreground">
          Enable or disable school days for the timetable
        </p>
      </div>

      <Card className="border-border max-w-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Short Name</TableHead>
                <TableHead className="text-center">Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ALL_DAYS.map((day, idx) => (
                <TableRow
                  key={day.id}
                  data-ocid={`timetable-weekdays.row.${idx + 1}`}
                >
                  <TableCell className="text-muted-foreground text-xs">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="font-medium">{day.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {day.shortName}
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={localEnabled.includes(day.id)}
                      onCheckedChange={() => toggleDay(day.id)}
                      data-ocid={`timetable-weekdays.switch.${idx + 1}`}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          className="gap-2"
          data-ocid="timetable-weekdays.save_button"
        >
          <Save className="w-4 h-4" /> Save Settings
        </Button>
        <p className="text-xs text-muted-foreground">
          {localEnabled.length} days enabled
        </p>
      </div>
    </div>
  );
}
