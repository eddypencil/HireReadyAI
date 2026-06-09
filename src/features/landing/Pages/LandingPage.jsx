// src/features/landing-page/pages/LandingPage.jsx
import HowItWorks from "../components/HowItWorks";
import Customers from "../components/Customers";
import Footer from "../components/Footer";

export default function LandingPage() {
  return (
    <div className="bg-background min-h-screen flex flex-col font-sans">
      <main className="flex-1">
        <HowItWorks />
        <Customers />
      </main>
      <Footer />
    </div>
  );
}