import { AdminModerationDashboard } from "@/components/AdminModerationDashboard";

export const metadata = {
  title: "Moderation Queue | Ameenly",
  description: "Review guest public-wall submissions flagged for moderation.",
};

export default function AdminModerationPage() {
  return <AdminModerationDashboard />;
}
