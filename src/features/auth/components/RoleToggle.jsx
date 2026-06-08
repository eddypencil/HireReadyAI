// import { USER_ROLE } from "@/shared/constants/enums";

// const roles = [
//   { label: "Applicant", value: USER_ROLE.applicant },
//   { label: "Recruiter", value: USER_ROLE.recruiter },
// ];

// export default function RoleToggle({ value, onChange }) {
//   return (
//     <div className="flex gap-2 p-1 rounded-xl mb-6 bg-white border border-dark-amethyst-100">
//       {roles.map(({ label, value: roleValue }) => (
//         <button
//           key={roleValue}
//           type="button"
//           onClick={() => onChange(roleValue)}
//           className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
//             ${
//               value === roleValue
//                 ? "bg-dark-amethyst-600 text-white shadow-sm"
//                 : "text-dark-amethyst-400 hover:text-dark-amethyst-600"
//             }`}
//         >
//           {label}
//         </button>
//       ))}
//     </div>
//   );
// }

//src\features\auth\components\RoleToggle.jsx
import { USER_ROLE } from "@/shared/constants/enums";
import { useTranslation } from "react-i18next";

export default function RoleToggle({ value, onChange }) {
  const { t } = useTranslation();

  const roles = [
    { label: t("roles.applicant"), value: USER_ROLE.applicant },
    { label: t("roles.recruiter"), value: USER_ROLE.recruiter },
  ];

  return (
    <div className="flex gap-2 p-1 rounded-xl mb-6 bg-background border border-border">
      {roles.map(({ label, value: roleValue }) => (
        <button
          key={roleValue}
          type="button"
          onClick={() => onChange(roleValue)}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
            ${value === roleValue
              ? "bg-primary text-white shadow-xs"
              : "text-muted-foreground/70 hover:text-sidebar hover:bg-secondary/50"
            }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}