export default function StatusBadge({ level = "LOW" }) {
  const styles = {
    LOW: "bg-green-500",
    MEDIUM: "bg-yellow-400",
    HIGH: "bg-red-500"
  };

  const color = styles[level] || styles.LOW;

  return (
    <span className="relative flex h-3 w-3">
      <span
        className={[
          "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
          color
        ].join(" ")}
      />

      <span
        className={[
          "relative inline-flex h-3 w-3 rounded-full",
          color
        ].join(" ")}
      />
    </span>
  );
}
