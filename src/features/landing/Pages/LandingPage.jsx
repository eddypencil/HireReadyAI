import Navbar from "../Components/Navbar";
import HeroSection from "../Components/HeroSection";
import TrustedBySection from "../Components/TrustedBySection";
import FeaturesSection from "../Components/FeaturesSection";
import AnimatedSection from "../Components/AnimatedSection";
import LandingLayout from "../LandingLayout";
import HowItWorks from "../components/HowItWorks";
import Customers from "../components/Customers";
import ContactUs from "../components/ContactUs";
import Footer from "../components/Footer";

import BuiltForJobs from "../Components/Builtforjobs";
import TopFeaturedJobs from "../Components/Topfeaturedjobs";
import FAQ from "../Components/Faq";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Testimonials", href: "#customers" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export default function LandingPage() {
  return (
    <LandingLayout>
      <Navbar links={NAV_LINKS} />
      <AnimatedSection>
        <HeroSection />
      </AnimatedSection>
      <AnimatedSection delay={0.1}>
        <TrustedBySection />
      </AnimatedSection>
      <FeaturesSection />
      <HowItWorks />
      <Customers />
      <BuiltForJobs />
      <TopFeaturedJobs />
      <ContactUs />
      <FAQ />
      <Footer />
    </LandingLayout>
  );
}
