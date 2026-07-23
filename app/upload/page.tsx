"use client";

import { useState } from "react";
import Link from "next/link";
import Papa from "papaparse";
import { TopNav } from "@/components/TopNav";
import type { ColumnMapping } from "@/lib/ai/mapColumns";

const FIELD_LABELS: Record<keyof ColumnMapping, string> = {
  customer_name: "Customer name",
  quote_number: "Quote number (optional)",
  value: "Quote value",
  sent_at: "Date sent",
  status: "Status (optional)",
};

type Stage = "select" | "mapping" | "done";

export default function UploadPage() {
  const [stage, setStage] = useState<Stage>("select");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setBusy(true);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (parsed) => {
        const parsedHeaders = parsed.meta.fields ?? [];
        setHeaders(parsedHeaders);
        setRows(parsed.data);

        const res = await fetch("/api/upload/map", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ headers: parsedHeaders }),
        });
        const { mapping: suggested } = await res.json();
        setMapping(suggested);
        setStage("mapping");
        setBusy(false);
      },
      error: (err) => {
        setError(err.message);
        setBusy(false);
      },
    });
  }

  async function handleImport() {
    if (!mapping) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows, mapping }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Import failed");
      return;
    }
    setResult({ imported: data.imported, skipped: data.skipped });
    setStage("done");
  }

  return (
    <>
      <TopNav />
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-10">
        <h1 className="text-xl font-semibold mb-1">Import quotes</h1>
        <p className="text-foreground-dim mb-8">
          Export your quote history as a CSV from Sage, Pastel, Excel, or your CRM, then upload it
          here.
        </p>

        {error && <p className="text-risk mb-4">{error}</p>}

        {stage === "select" && (
          <label className="block border-2 border-dashed border-border rounded-lg p-10 text-center cursor-pointer hover:border-accent transition-colors">
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            <p className="font-medium mb-1">{busy ? "Reading file…" : "Choose a CSV file"}</p>
            <p className="text-sm text-foreground-dim">
              Any column headers are fine — we&apos;ll suggest a mapping next.
            </p>
          </label>
        )}

        {stage === "mapping" && mapping && (
          <div>
            <p className="text-sm text-foreground-dim mb-4">
              {rows.length} rows found. Check the mapping below before importing.
            </p>
            <div className="space-y-4 mb-8">
              {(Object.keys(FIELD_LABELS) as Array<keyof ColumnMapping>).map((field) => (
                <label key={field} className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium">{FIELD_LABELS[field]}</span>
                  <select
                    value={mapping[field] ?? ""}
                    onChange={(e) =>
                      setMapping({ ...mapping, [field]: e.target.value || null })
                    }
                    className="border border-border rounded-md px-3 py-1.5 bg-background min-w-[200px]"
                  >
                    <option value="">— not mapped —</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            <button
              onClick={handleImport}
              disabled={busy || !mapping.customer_name || !mapping.value || !mapping.sent_at}
              className="bg-accent text-white px-5 py-2.5 rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {busy ? "Importing…" : `Import ${rows.length} rows`}
            </button>
            {(!mapping.customer_name || !mapping.value || !mapping.sent_at) && (
              <p className="text-sm text-foreground-dim mt-2">
                Customer name, value, and date sent are required before importing.
              </p>
            )}
          </div>
        )}

        {stage === "done" && result && (
          <div>
            <p className="text-lg font-medium mb-2">
              Imported {result.imported} quote{result.imported === 1 ? "" : "s"}
              {result.skipped > 0 ? `, skipped ${result.skipped}` : ""}.
            </p>
            <Link href="/dashboard" className="text-accent hover:underline">
              See your revenue-at-risk dashboard →
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
