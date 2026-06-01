import { useState } from "react";
import { SENIORITY_LEVEL } from "@/shared/constants/enums";

const DUMMY_JD = {
  about: "You'll be joining a fast-growing team where your work will have real impact from day one. We believe in autonomy, clear ownership, and building things that last. If you're passionate about solving hard problems and collaborating with talented people, this role is for you.",
  responsibilities: [
    "Own end-to-end delivery of features from design to production",
    "Collaborate closely with product, design, and engineering teams",
    "Write clean, maintainable, and well-tested code",
  ],
  requirements: [
    "Excellent communication and collaboration skills",
    "Ability to work independently and manage your own time effectively",
    "Experience working in an agile environment",
  ],
  offer: [
    "Competitive salary and performance-based bonuses",
    "Health insurance and wellness benefits",
  ],
};

export default function JDGeneratorPage() {
  const [title, setTitle] = useState("");
  const [seniority, setSeniority] = useState("");
  const [location, setLocation] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [keyNotes, setKeyNotes] = useState("");
  const [generated, setGenerated] = useState(false);
  const [generatedResponsibilities, setGeneratedResponsibilities] = useState([]);


  const inputClass = "w-full h-11 rounded-xl px-4 text-sm text-dark-amethyst-900 bg-dark-amethyst-50 border border-dark-amethyst-100 outline-none transition-all duration-200 placeholder:text-dark-amethyst-300"
  const selectClass = "w-full h-11 rounded-xl px-4 text-sm text-dark-amethyst-900 bg-dark-amethyst-50 border border-dark-amethyst-100 outline-none transition-all duration-200"
  const labelClass = "text-xs font-semibold text-dark-amethyst-600 uppercase tracking-wide"

  const handleFocus = e => {
    e.target.style.borderColor = '#8400ff'
    e.target.style.boxShadow = '0 0 0 3px rgba(132,0,255,0.08)'
  }

  const handleBlur = e => {
    e.target.style.borderColor = ''
    e.target.style.boxShadow = 'none'
  }

  function handleGenerate(e) {
    e.preventDefault()
    if (!title) return

    if (keyNotes.trim()) {
      const parsed = keyNotes
        .split(/[.,\n]/)
        .map(s => s.trim())
        .filter(s => s.length > 10)

      setGeneratedResponsibilities(
        parsed.length > 0 ? [...parsed, ...DUMMY_JD.responsibilities] : DUMMY_JD.responsibilities
      )
    } else {
      setGeneratedResponsibilities(DUMMY_JD.responsibilities)
    }

    setGenerated(true)
  }

  const preview = {
    title: title || "Job Title",
    location: [location, workLocation].filter(Boolean).join(" · ") || "Location",
    seniority: seniority || "",
  };

  return (
    <div className="min-h-screen bg-dark-amethyst-50 p-6">
      <div className="max-w-7xl mx-auto mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-amethyst-950">JD Generator</h1>
          <p className="text-dark-amethyst-500 text-sm mt-1">
            Fill in the basics — AI handles the rest.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="px-4 py-2.5 rounded-xl text-sm font-medium border border-dark-amethyst-200 text-dark-amethyst-400 bg-white cursor-pointer"
          >
            Save draft
          </button>
          <button
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-dark-amethyst-400 flex items-center gap-2 cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 19V5M5 12l7-7 7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Publish JD
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-2xl border border-dark-amethyst-100 p-7">
          <h2 className="text-base font-bold text-dark-amethyst-950 mb-1">Role brief</h2>
          <p className="text-dark-amethyst-400 text-sm mb-6">Fill in the basics — AI handles the rest.</p>

          <form onSubmit={handleGenerate} className="flex flex-col gap-5">

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Role title</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                className={inputClass}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Seniority</label>
              <select
                value={seniority}
                onChange={e => setSeniority(e.target.value)}
                className={selectClass}
                onFocus={handleFocus}
                onBlur={handleBlur}
              >
                <option value="">Select seniority</option>
                {Object.values(SENIORITY_LEVEL).map(lvl => (
                  <option key={lvl} value={lvl} className="capitalize">{lvl}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>City</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Cairo"
                  className={inputClass}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Work type</label>
                <select
                  value={workLocation}
                  onChange={e => setWorkLocation(e.target.value)}
                  className={selectClass}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                >
                  <option value="">Select type</option>
                  <option value="On-site">On-site</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Key notes</label>
              <textarea
                rows={5}
                value={keyNotes}
                onChange={e => setKeyNotes(e.target.value)}
                placeholder="e.g. We need someone comfortable with distributed systems, Go or Node, and mentoring two junior engineers."
                className="w-full rounded-xl px-4 py-3 text-sm text-dark-amethyst-900 bg-dark-amethyst-50 border border-dark-amethyst-100 outline-none transition-all duration-200 placeholder:text-dark-amethyst-300 resize-none"
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-xl text-white text-sm font-semibold bg-dark-amethyst-600 hover:bg-dark-amethyst-700 transition flex items-center justify-center gap-2"
              style={{ boxShadow: '0 2px 12px rgba(132,0,255,0.2)' }}
            >
              Generate JD
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                  stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

          </form>
        </div>


        <div className="bg-white rounded-2xl border border-dark-amethyst-100 p-7">

          {!generated ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
              <div className="w-16 h-16 rounded-full bg-dark-amethyst-50 border border-dark-amethyst-100 flex items-center justify-center mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                    stroke="#8400ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-dark-amethyst-700 font-medium text-sm">Fill in the role brief</p>
              <p className="text-dark-amethyst-400 text-xs mt-1">and click Generate JD to see the preview</p>
            </div>
          ) : (
            <div className="space-y-6">

              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-dark-amethyst-500 flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                      stroke="#8400ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Generated preview
                </span>
                <span className="text-xs text-dark-amethyst-400 bg-dark-amethyst-50 px-2 py-1 rounded-full border border-dark-amethyst-100">
                  Live preview
                </span>
              </div>

              <div>
                <h2 className="text-xl font-bold text-dark-amethyst-950">{preview.title}</h2>
                <p className="text-dark-amethyst-500 text-sm mt-1">
                  {[preview.location, preview.seniority].filter(Boolean).join(' · ')}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-dark-amethyst-950 mb-2">About the role</h3>
                <p className="text-dark-amethyst-700 text-sm leading-relaxed">{DUMMY_JD.about}</p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-dark-amethyst-950 mb-2">What you'll do</h3>
                <ul className="space-y-1.5">
                  {generatedResponsibilities.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-dark-amethyst-700 text-sm">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-dark-amethyst-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold text-dark-amethyst-950 mb-2">What we're looking for</h3>
                <ul className="space-y-1.5">
                  {DUMMY_JD.requirements.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-dark-amethyst-700 text-sm">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-dark-amethyst-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold text-dark-amethyst-950 mb-2">What we offer</h3>
                <ul className="space-y-1.5">
                  {DUMMY_JD.offer.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-dark-amethyst-700 text-sm">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-dark-amethyst-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}