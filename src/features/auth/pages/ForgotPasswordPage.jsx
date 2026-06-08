// import { useState } from "react";
// import AuthLayout from "../components/AuthLayout";
// import FormField from "@/shared/ui/FormField";
// import { Link } from "react-router-dom";
// import { useUser } from "../context/user.context";

// export default function ForgotPasswordPage() {
//   const [email, setEmail] = useState("");
//   const [error, setError] = useState(null);
//   const [submitted, setSubmitted] = useState(false);
//   const { loading, resetUserPassword } = useUser();

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setError(null);
//     try {
//       await resetUserPassword(email, `${window.location.origin}/auth/reset-password`);
//       setSubmitted(true);
//     } catch (e) {
//       setError(e.message || "Failed to send reset link. Please try again.");
//     }
//   }

//   if (submitted) {
//     return (
//       <AuthLayout
//         headline="Check your inbox"
//         subheading="We sent you a password reset link"
//       >
//         <div className="flex flex-col items-center text-center gap-6 py-4">
//           <div className="w-16 h-16 rounded-full flex items-center justify-center bg-dark-amethyst-100 border border-dark-amethyst-200">
//             <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
//               <path
//                 d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
//                 stroke="#8400ff"
//                 strokeWidth="1.5"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               />
//             </svg>
//           </div>

//           <div>
//             <p className="text-dark-amethyst-700 text-sm leading-7">
//               We sent a reset link to{" "}
//               <span className="text-dark-amethyst-600 font-semibold">
//                 {email}
//               </span>
//               . Check your inbox and follow the instructions.
//             </p>
//             <p className="text-dark-amethyst-400 text-xs mt-2">
//               Didn't get it? Check your spam folder.
//             </p>
//           </div>

//           <Link
//             to="/auth/sign-in"
//             className="w-full h-11 rounded-xl text-white text-sm font-semibold bg-dark-amethyst-600 hover:bg-dark-amethyst-700 transition-colors flex items-center justify-center"
//             style={{ boxShadow: "0 2px 12px rgba(132,0,255,0.2)" }}
//           >
//             Back to sign in
//           </Link>
//         </div>
//       </AuthLayout>
//     );
//   }

//   return (
//     <AuthLayout
//       headline="Forgot password?"
//       subheading="Enter your email and we'll send you a reset link"
//     >
//       <form onSubmit={handleSubmit} className="flex flex-col gap-5">
//         <FormField
//           label="Email"
//           type="email"
//           placeholder="you@gmail.com"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//         />

//         {error && (
//           <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs text-red-600 bg-red-50 border border-red-200">
//             <span>⚠</span>
//             {error}
//           </div>
//         )}

//         <button
//           type="submit"
//           className="w-full h-11 rounded-xl text-white text-sm font-semibold transition-all duration-200 cursor-pointer bg-dark-amethyst-600 hover:bg-dark-amethyst-700"
//           style={{ boxShadow: "0 2px 12px rgba(132,0,255,0.2)" }}
//         >
//           {loading ? "Loading...." : "Send reset link"}
//         </button>

//         <Link
//           to="/auth/sign-in"
//           className="text-center text-xs text-dark-amethyst-400 hover:text-dark-amethyst-600 hover:underline transition-colors"
//         >
//           Back to sign in
//         </Link>
//       </form>
//     </AuthLayout>
//   );
// }
import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import FormField from "@/shared/ui/FormField";
import { Link } from "react-router-dom";
import { useUser } from "../context/user.context";
import { useTranslation } from "react-i18next";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const { loading, resetUserPassword } = useUser();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    try {
      await resetUserPassword(
        email,
        `${window.location.origin}/auth/reset-password`
      );
      setSubmitted(true);
    } catch (e) {
      setError(e.message || t("forgot_password.errors.generic"));
    }
  }

  if (submitted) {
    return (
      <AuthLayout
        headline={t("forgot_password.success.headline")}
        subheading={t("forgot_password.success.subheading")}
      >
        <div className="flex flex-col items-center text-center gap-6 py-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-secondary border border-border">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                stroke="currentColor"
                className="text-accent"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div>
            <p className="text-sidebar text-sm leading-7">
              {t("forgot_password.success.message")}{" "}
              <span className="text-accent font-semibold">
                {email}
              </span>
              .
            </p>
            <p className="text-muted-foreground/80 text-xs mt-2">
              {t("forgot_password.success.spam_hint")}
            </p>
          </div>

          <Link
            to="/auth/sign-in"
            className="w-full h-11 rounded-xl text-white text-sm font-semibold bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center"
            style={{ boxShadow: "0 2px 12px rgba(1,73,124,0.15)" }}
          >
            {t("forgot_password.back_to_sign_in")}
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      headline={t("forgot_password.headline")}
      subheading={t("forgot_password.subheading")}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FormField
          label={t("forgot_password.labels.email")}
          type="email"
          placeholder={t("forgot_password.placeholders.email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {error && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs text-destructive bg-destructive/10 border border-destructive/20">
            <span>⚠</span>
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full h-11 rounded-xl text-white text-sm font-semibold transition-all duration-200 cursor-pointer bg-primary hover:bg-primary-hover"
          style={{ boxShadow: "0 2px 12px rgba(1,73,124,0.15)" }}
        >
          {loading
            ? t("forgot_password.loading")
            : t("forgot_password.send_link")}
        </button>

        <Link
          to="/auth/sign-in"
          className="text-center text-xs text-muted-foreground/80 hover:text-accent hover:underline"
        >
          {t("forgot_password.back_to_sign_in")}
        </Link>
      </form>
    </AuthLayout>
  );
}