import type { Metadata } from "next";
import Dashboard from "./Dashboard";

export const metadata: Metadata = {
  title: "Finally Peace — Your dashboard",
  description:
    "Track your lifestyle and manage your Finally Peace subscription. Saved privately on your device.",
};

export default function AppPage() {
  return <Dashboard />;
}
