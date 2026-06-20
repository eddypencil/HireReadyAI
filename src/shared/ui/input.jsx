export default function Input(props) {
  return (
    <input
      {...props}

      className={`w-full p-2 rounded-lg border border-border bg-background text-sidebar placeholder:text-muted-foreground/50 outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 ${props.className || ""}`}
    />
  );
}