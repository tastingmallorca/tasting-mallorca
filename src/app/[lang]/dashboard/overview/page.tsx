import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmailTestButton } from "@/components/dashboard/email-test-button";

export default function DashboardOverviewPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Overview</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-start">
        <p>Welcome to your dashboard!</p>
        <EmailTestButton />
      </CardContent>
    </Card>
  );
}
