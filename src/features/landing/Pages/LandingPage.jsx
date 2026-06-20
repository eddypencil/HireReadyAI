import Navbar from "../Components/Navbar";
import HeroSection from "../Components/HeroSection";
import TrustedBySection from "../Components/TrustedBySection";
import FeaturesSection from "../Components/FeaturesSection";
import AnimatedSection from "../Components/AnimatedSection";
import LandingLayout from "../LandingLayout";
import HowItWorks from "../components/HowItWorks";
import ContactUs from "../components/ContactUs";
import Footer from "../components/Footer";

import BuiltForJobs from "../Components/Builtforjobs";
import TopFeaturedJobs from "../Components/Topfeaturedjobs";
import FAQ from "../Components/Faq";

import { useTranslation } from "react-i18next";

export default function LandingPage() {
  const { t } = useTranslation();

  const NAV_LINKS = [
    { label: t("landing_navbar.nav.features"), href: "#features" },
    { label: t("landing_navbar.nav.how_it_works"), href: "#how-it-works" },
    { label: t("landing_navbar.nav.faq"), href: "#faq" },
    { label: t("landing_navbar.nav.contact"), href: "#contact" },
  ];

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
      <BuiltForJobs />
      <TopFeaturedJobs />
      <ContactUs />
      <FAQ />
      <Footer />
    </LandingLayout>
  );
}
