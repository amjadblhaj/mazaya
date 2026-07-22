"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { uploadExcelAction, type ExcelUploadResult } from "@/app/(tenant)/excel/actions";

export function ExcelUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ExcelUploadResult | null>(null);

  async function handleUpload() {
    const file = inputRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    setResult(null);
    const formData = new FormData();
    formData.set("file", file);
    const res = await uploadExcelAction(formData);
    setResult(res);
    setUploading(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
          اختر ملف Excel
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            setFileName(e.target.files?.[0]?.name ?? null);
            setResult(null);
          }}
        />
        {fileName && <span className="text-sm text-muted-foreground">{fileName}</span>}
      </div>

      <p className="text-sm text-muted-foreground">
        الأعمدة: A) رقم الهاتف — B) النقاط — C) السبب. الحد الأقصى 5 ميجابايت.
      </p>

      <Button
        type="button"
        disabled={!fileName || uploading}
        onClick={handleUpload}
        style={{ background: "var(--brand-accent)" }}
      >
        {uploading ? "جارٍ المعالجة..." : "معالجة الملف"}
      </Button>

      {result?.error && <p className="text-sm text-destructive">{result.error}</p>}

      {result?.summary && (
        <div className="flex flex-col gap-3">
          <p className="text-sm">
            الإجمالي: {result.summary.total} — نجح:{" "}
            <span className="font-semibold text-green-600">{result.summary.succeeded}</span> — فشل:{" "}
            <span className="font-semibold text-destructive">{result.summary.failed}</span>
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الصف</TableHead>
                <TableHead>الهاتف</TableHead>
                <TableHead>النتيجة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.results?.map((r, i) => (
                <TableRow key={i}>
                  <TableCell>{r.row}</TableCell>
                  <TableCell dir="ltr" className="text-right">
                    {r.phone || "—"}
                  </TableCell>
                  <TableCell className={r.status === "success" ? "text-green-600" : "text-destructive"}>
                    {r.message}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
