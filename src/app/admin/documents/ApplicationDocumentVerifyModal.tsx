"use client";

import { useEffect, useState } from "react";
import { X, ShieldCheck, XCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  verifyApplicationDocument,
  type ApplicationDocument,
} from "@/lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  document: ApplicationDocument | null;
}

export default function ApplicationDocumentVerifyModal({
  open,
  onClose,
  onSaved,
  document: doc,
}: Props) {
  const [decision, setDecision] = useState<"verify" | "reject" | null>(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDecision(null);
    setVerificationNotes("");
    setRejectionReason("");
    setError(null);
  }, [open]);

  async function submit() {
    if (!doc || !decision) return;
    if (decision === "reject" && !rejectionReason.trim()) {
      setError("Rejection reason is required");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await verifyApplicationDocument(doc.id, {
        verified: decision === "verify",
        verificationNotes: verificationNotes || undefined,
        rejectionReason: decision === "reject" ? rejectionReason : undefined,
      });
      if (res.success) onSaved();
      else setError(res.message || "Failed to save verification");
    } catch (e: any) {
      setError(e?.message || "Network error");
    } finally {
      setSaving(false);
    }
  }

  if (!open || !doc) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-lg my-8">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Verify Document</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {doc.documentName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={saving}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Decision toggles */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDecision("verify")}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                decision === "verify"
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 text-gray-600 hover:border-green-300"
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Verify
            </button>
            <button
              type="button"
              onClick={() => setDecision("reject")}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                decision === "reject"
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-gray-200 text-gray-600 hover:border-red-300"
              }`}
            >
              <XCircle className="w-4 h-4" /> Reject
            </button>
          </div>

          {/* Verification notes (always visible) */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700">
              Verification Notes <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              placeholder="Internal notes for the record..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
            />
          </div>

          {/* Rejection reason (conditional) */}
          {decision === "reject" && (
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why the document is rejected..."
                className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
              />
            </div>
          )}

          {/* Current status summary */}
          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1 border border-gray-100">
            <div className="flex justify-between">
              <span>Current status</span>
              <span className="font-semibold capitalize">
                {(doc.status || "—").replace(/_/g, " ")}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Version</span>
              <span className="font-semibold">v{doc.version || 1}</span>
            </div>
            {doc.fileName && (
              <div className="flex justify-between">
                <span>File</span>
                <span className="font-semibold truncate max-w-[180px]">{doc.fileName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={saving || !decision}
            className={`min-w-[140px] text-white ${
              decision === "reject"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
              </>
            ) : decision === "reject" ? (
              <>
                <XCircle className="w-4 h-4 mr-2" /> Reject
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 mr-2" /> Verify
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}