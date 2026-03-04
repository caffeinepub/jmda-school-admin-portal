import { Badge } from "@/components/ui/badge";
import { Construction } from "lucide-react";

interface ComingSoonPageProps {
  title: string;
  description?: string;
}

export default function ComingSoonPage({
  title,
  description,
}: ComingSoonPageProps) {
  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-display font-bold">{title}</h1>
        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
          Coming Soon
        </Badge>
      </div>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-400/10 flex items-center justify-center mb-4">
          <Construction className="w-8 h-8 text-amber-400" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">
          This feature is coming soon
        </h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          {description ??
            "We're working hard to bring you this feature. Check back soon!"}
        </p>
      </div>
    </div>
  );
}
