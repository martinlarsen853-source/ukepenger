import type { Metadata } from "next";
import LandingClient from "./_components/LandingClient";

export const metadata: Metadata = {
  title: "Ukepenger | Full kontroll paa ukepenger",
  description:
    "Barn registrerer oppgaver. Du godkjenner og betaler. En enkel familie-app for ukepenger.",
};

export default function Page() {
  return <LandingClient />;
}

