import type { Metadata } from "next";
import LandingClient from "@/app/_components/LandingClient";

export const metadata: Metadata = {
  title: "Ukepenger - full kontroll paa ukepenger",
  description: "Barn registrerer oppgaver. Du godkjenner og betaler.",
};

export default function HomePage() {
  return <LandingClient />;
}

