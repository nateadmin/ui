import changelog from "../CHANGELOG.md?raw"

export function Changelog() {
  const lines = changelog.split("\n").filter((l) => l.trim() && !l.startsWith("# "))
  return (
    <div className="space-y-1 text-sm">
      {lines.map((line, i) =>
        line.startsWith("## ") ? (
          <h3 key={`${i}-${line}`} className="pt-4 text-base font-semibold first:pt-0">
            v{line.slice(3)}
          </h3>
        ) : line.startsWith("### ") ? (
          <h4 key={`${i}-${line}`} className="text-muted-foreground pt-2 font-medium">
            {line.slice(4)}
          </h4>
        ) : (
          <p key={`${i}-${line}`} className="text-muted-foreground pl-4">
            {line.replace(/^[-*]\s*/, "")}
          </p>
        ),
      )}
    </div>
  )
}
