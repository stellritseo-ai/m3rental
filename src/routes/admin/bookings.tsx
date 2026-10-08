import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/bookings")({
  head: () => ({
    meta: [
      { title: "Redirecting to Dashboard — M3 Rental Houston" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminBookingsPage,
});

function AdminBookingsPage() {
  return <Navigate to="/dashboard/bookings" replace />;
}
