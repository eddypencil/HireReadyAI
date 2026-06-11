import Navbar from "../Components/Navbar";
import HeroSection from "../Components/HeroSection";
import TrustedBySection from "../Components/TrustedBySection";
import FeaturesSection from "../Components/FeaturesSection";
import AnimatedSection from "../Components/AnimatedSection";
import LandingLayout from "../LandingLayout";
import HowItWorks from "../Components/HowItWorks";
import Customers from "../Components/Customers";
import ContactUs from "../Components/ContactUs";
import Footer from "../Components/Footer";

import BuiltForJobs from "../Components/Builtforjobs";
import TopFeaturedJobs from "../Components/Topfeaturedjobs";
import FAQ from "../Components/Faq";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Testimonials", href: "#testimonials" },
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
      <ContactUs />
      <BuiltForJobs />
      <TopFeaturedJobs />
      <FAQ />
      <Footer />
    </LandingLayout>
  );
}
