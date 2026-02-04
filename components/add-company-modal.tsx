"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { HealthStatus } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { Link2, PenLine, Loader2 } from "lucide-react";

const HEALTH_OPTIONS: { value: HealthStatus; label: string }[] = [
  { value: "green", label: "Green" },
  { value: "yellow", label: "Yellow" },
  { value: "red", label: "Red" },
];

type Props = {
  fundId: string;
  fundName: string;
  onClose: () => void;
  onSuccess: () => void;
};

export function AddCompanyModal({ fundId, fundName, onClose, onSuccess }: Props) {
  const [tab, setTab] = useState<"url" | "manual">("url");
  const [urlInput, setUrlInput] = useState("");
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [health, setHealth] = useState<HealthStatus>("green");
  const [attentionReason, setAttentionReason] = useState("");
  const [highlightChipsText, setHighlightChipsText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  const fillFromUrl = async () => {
    const raw = urlInput.trim();
    if (!raw) {
      setUrlError("Enter a company website URL");
      return;
    }
    setUrlError(null);
    setUrlLoading(true);
    try {
      const res = await fetch("/api/companies/from-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: raw }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setUrlError(data.error ?? "Failed to extract company info");
        return;
      }
      setName(data.name ?? "");
      setDomain(data.domain ?? "");
      setAttentionReason(data.attentionReason ?? "");
      setHighlightChipsText(Array.isArray(data.highlightChips) ? data.highlightChips.join(", ") : "");
      setTab("manual");
    } finally {
      setUrlLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fundId,
          name: name.trim(),
          domain: domain.trim(),
          health,
          attentionReason: attentionReason.trim() || undefined,
          highlightChips: highlightChipsText
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to add company");
        return;
      }
      onSuccess();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const supabaseConfigured = isSupabaseConfigured();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-company-title"
    >
      <Card className="w-full max-w-md shadow-xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 shrink-0">
          <h2 id="add-company-title" className="font-serif text-lg font-medium">
            Add company
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} type="button">
            Cancel
          </Button>
        </CardHeader>
        <CardContent className="shrink min-h-0 overflow-auto">
          {!supabaseConfigured && (
            <div className="mb-4 p-3 rounded-md bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                Supabase configuration check failed
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                If you've configured Supabase in <code className="rounded bg-yellow-100 dark:bg-yellow-900/50 px-1">.env.local</code>, 
                try restarting your dev server. The form will still attempt to submit and show a specific error if configuration is missing.
              </p>
            </div>
          )}
          <>
              <p className="text-xs text-muted-foreground mb-3">
                Adding to <strong>{fundName}</strong>
              </p>
              <Tabs value={tab} onValueChange={(v) => setTab(v as "url" | "manual")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="url" className="flex items-center gap-2">
                    <Link2 className="h-3.5 w-3.5" />
                    By URL
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="flex items-center gap-2">
                    <PenLine className="h-3.5 w-3.5" />
                    Manual
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="url" className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-url">Company website URL</Label>
                    <Input
                      id="company-url"
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://acme.com or acme.com"
                      disabled={urlLoading}
                      className="rounded-md"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      AI will read the page and fill in company name, domain, and optional highlights.
                    </p>
                  </div>
                  {urlError && (
                    <p className="text-sm text-destructive" role="alert">
                      {urlError}
                    </p>
                  )}
                  <Button
                    type="button"
                    onClick={fillFromUrl}
                    disabled={urlLoading}
                    className="w-full rounded-md"
                  >
                    {urlLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Filling form…
                      </>
                    ) : (
                      "Fill form with AI"
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="manual" className="mt-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Company name</Label>
                      <Input
                        id="company-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Acme Inc"
                        required
                        disabled={submitting}
                        className="rounded-md"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-domain">Domain</Label>
                      <Input
                        id="company-domain"
                        type="text"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        placeholder="acme.com"
                        required
                        disabled={submitting}
                        className="rounded-md"
                      />
                      <p className="text-[10px] text-muted-foreground">Without https://</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-health">Health</Label>
                      <select
                        id="company-health"
                        value={health}
                        onChange={(e) => setHealth(e.target.value as HealthStatus)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        disabled={submitting}
                      >
                        {HEALTH_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="attention-reason">Attention reason (optional)</Label>
                      <Input
                        id="attention-reason"
                        value={attentionReason}
                        onChange={(e) => setAttentionReason(e.target.value)}
                        placeholder="e.g. No activity for 3 weeks"
                        disabled={submitting}
                        className="rounded-md"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="highlight-chips">Highlight chips (optional, comma-separated)</Label>
                      <Input
                        id="highlight-chips"
                        value={highlightChipsText}
                        onChange={(e) => setHighlightChipsText(e.target.value)}
                        placeholder="e.g. Hiring pause, New CTO"
                        disabled={submitting}
                        className="rounded-md"
                      />
                    </div>
                    {error && (
                      <p className="text-sm text-destructive" role="alert">
                        {error}
                      </p>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button type="submit" disabled={submitting}>
                        {submitting ? "Adding…" : "Add company"}
                      </Button>
                      <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
          </>
        </CardContent>
      </Card>
    </div>
  );
}
