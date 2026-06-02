import type { Metadata } from "next";
import Dashboard from "./Dashboard";

export const metadata: Metadata = {
  title: "QuietWorld — Your dashboard",
  description:
    "Track your lifestyle and manage your QuietWorld subscription. Saved privately on your device.",
};

export default function AppPage() {
  return <Dashboard />;
}
