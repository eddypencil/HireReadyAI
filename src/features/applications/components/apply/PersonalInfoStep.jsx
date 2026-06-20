export default function PersonalInfoStep({ form, errors, onChange, clearFieldError }) {
  const fields = [
    {
      name: "fullName",
      label: "Full Name *",
      type: "text",
      value: form.fullName || "",
      error: errors.fullName,
    },
    {
      name: "email",
      label: "Email *",
      type: "email",
      value: form.email || "",
      error: errors.email,
    },
    {
      name: "phone",
      label: "Phone *",
      type: "tel",
      value: form.phone || "",
      error: errors.phone,
    },
  ];

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.name}>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            {field.label}
          </label>
          <input
            type={field.type}
            value={field.value}
            className={`w-full h-10 rounded-lg px-3 text-sm bg-card font-medium text-accent border outline-none transition-all focus:ring-2 focus:ring-primary/10 focus:border-primary ${
              field.error
                ? "border-destructive focus:ring-destructive/10 focus:border-destructive"
                : "border-border"
            }`}
            onChange={(e) => {
              onChange(field.name, e.target.value);
              if (field.error) clearFieldError(field.name);
            }}
          />
          {field.error && (
            <p className="text-xs text-destructive font-medium mt-1 pl-0.5">
              {field.error}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
