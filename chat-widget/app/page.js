import { Suspense } from "react";
import { MianaLandingPage } from "../components/Landing/landing";

function HomeContent() {
  return <MianaLandingPage />;
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
