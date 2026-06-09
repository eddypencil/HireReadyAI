import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

const COMPANIES = [
  { name: "Google", file: "/Google_Favicon_2025.svg" },
  { name: "Stripe", file: "/Stripe_Logo,_revised_2016.svg" },
  { name: "Figma", file: "/Figma-logo.svg" },
  { name: "Dropbox", file: "/Dropbox_Icon.svg" },
  { name: "Zoom", file: "/Zoom_Logo_2022.svg" },
  { name: "Airbnb", file: "/Airbnb_Logo_Bélo.svg" },
  { name: "Adobe", file: "/Adobe_logo_and_wordmark_(2017).svg" },
  { name: "Atlassian", file: "/Atlassian-logo.svg" },
  { name: "GitHub", file: "/Github_logo_svg.svg" },
  { name: "Discord", file: "/Discord_Color_Text_Logo_No_Padding.svg" },
  { name: "Netflix", file: "/Netflix_2015_logo.svg" },
  { name: "Trello", file: "/Trello-logo-blue.svg" },
  { name: "Vercel", file: "/Vercel_logo_black.svg" },
];

function CompanyCard({ name, file }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4 mx-6 shrink-0">
      {failed ? (
        <div className="w-40 h-40 rounded-3xl bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl shrink-0">
          {name.charAt(0)}
        </div>
      ) : (
        <div className="w-40 h-40 rounded-3xl bg-white flex items-center justify-center p-5 shrink-0 shadow-sm">
          <img
            src={file}
            alt={`${name} logo`}
            className={`w-full h-full object-contain transition-opacity duration-300 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
        </div>
      )}
      <span className="text-base font-semibold text-foreground text-center whitespace-nowrap">
        {name}
      </span>
    </div>
  );
}

export default function TrustedBySection() {
  const { t } = useTranslation();
  const trackRef = useRef(null);
  const animRef = useRef(null);
  const posRef = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const halfWidth = track.scrollWidth / 2;

    function tick() {
      posRef.current -= 0.4;

      if (posRef.current <= -halfWidth) {
        posRef.current += halfWidth;
      }

      track.style.transform = `translate3d(${Math.round(posRef.current)}px, 0, 0)`;
      animRef.current = requestAnimationFrame(tick);
    }

    animRef.current = requestAnimationFrame(tick);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <section className="py-16 md:py-20 overflow-hidden bg-background">
      <div className="text-center mb-10 px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          {t("landing.trusted_by.heading")}
        </h2>
      </div>

      <div className="relative overflow-hidden">
        <div
          ref={trackRef}
          className="flex gap-2 w-max will-change-transform"
        >
          {[...Array(4)].flatMap((_, setIdx) =>
            COMPANIES.map((company, cIdx) => (
              <CompanyCard key={`${setIdx}-${cIdx}`} {...company} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
