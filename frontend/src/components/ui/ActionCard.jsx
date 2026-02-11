export default function ActionCard({ text, type }) {
  const styles = {
    danger: "bg-red-50 border-red-500",
    warning: "bg-yellow-50 border-yellow-500",
    info: "bg-blue-50 border-blue-500",
  }

  return (
    <div className={`border-l-4 p-4 rounded ${styles[type]}`}>
      {text}
    </div>
  )
}
