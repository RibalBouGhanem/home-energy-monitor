export function exportRowsToCsv(filename, rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    console.warn("exportRowsToCsv: no rows to export");
    return false;
  }

  const headers = Array.from(
    rows.reduce((set, r) => {
      Object.keys(r || {}).forEach((k) => set.add(k));
      return set;
    }, new Set())
  );

  const esc = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`;

  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => esc(r?.[h])).join(",")),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });

  // IE/old Edge fallback
  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(blob, filename);
    return true;
  }

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";

  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
  return true;
}
