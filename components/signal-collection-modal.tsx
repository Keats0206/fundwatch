"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2, AlertCircle, Search, Link2, FileText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type EventData =
  | { type: "start"; companyId: string; companyName: string }
  | { type: "cached"; lastChecked: string; signalsGenerated: number; urlsChecked: number }
  | { type: "discovery"; message: string; urls?: Array<{ url: string; label: string }> }
  | { type: "checking"; url: string; status: "fetching" | "changed" | "unchanged" | "error"; error?: string }
  | { type: "analyzing"; url: string; message: string }
  | { type: "signal_created"; signal: { id: string; summary: string; source: string; url: string } }
  | { type: "news_search"; message: string }
  | { type: "complete"; signalsAdded: number; urlsChecked: number }
  | { type: "error"; error: string };

type LogEntry = {
  id: string;
  type: EventData["type"];
  message: string;
  timestamp: Date;
  data?: unknown;
};

type Props = {
  companyId: string;
  companyName: string;
  onClose: () => void;
  onComplete: () => void;
};

export function SignalCollectionModal({ companyId, companyName, onClose, onComplete }: Props) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [digest, setDigest] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [signalsAdded, setSignalsAdded] = useState(0);
  const [urlsChecked, setUrlsChecked] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const logIdRef = useRef(0);

  const addLog = (type: EventData["type"], message: string, data?: unknown) => {
    setLogs((prev) => [...prev, { id: `log-${logIdRef.current++}`, type, message, timestamp: new Date(), data }]);
  };

  useEffect(() => {
    const url = `/api/companies/${companyId}/check-signals?force=true`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener("start", (e) => {
      const data = JSON.parse(e.data) as Extract<EventData, { type: "start" }>;
      addLog("start", `Starting signal collection for ${data.companyName}`);
    });

    es.addEventListener("cached", (e) => {
      const data = JSON.parse(e.data) as Extract<EventData, { type: "cached" }>;
      addLog("cached", `Using cached data from ${new Date(data.lastChecked).toLocaleString()}`);
      setIsComplete(true);
      setSignalsAdded(data.signalsGenerated);
      setUrlsChecked(data.urlsChecked);
    });

    es.addEventListener("discovery", (e) => {
      const data = JSON.parse(e.data) as Extract<EventData, { type: "discovery" }>;
      addLog("discovery", data.message, data.urls);
    });

    es.addEventListener("checking", (e) => {
      const data = JSON.parse(e.data) as Extract<EventData, { type: "checking" }>;
      if (data.status === "fetching") {
        addLog("checking", `Checking ${data.url}...`);
      } else if (data.status === "changed") {
        addLog("checking", `✓ Change detected on ${data.url}`);
      } else if (data.status === "unchanged") {
        addLog("checking", `No changes on ${data.url}`);
      } else {
        addLog("checking", `✗ Error checking ${data.url}: ${data.error}`);
      }
    });

    es.addEventListener("analyzing", (e) => {
      const data = JSON.parse(e.data) as Extract<EventData, { type: "analyzing" }>;
      addLog("analyzing", data.message);
    });

    es.addEventListener("signal_created", (e) => {
      const data = JSON.parse(e.data) as Extract<EventData, { type: "signal_created" }>;
      addLog("signal_created", `New signal: ${data.signal.summary}`);
      setSignalsAdded((prev) => prev + 1);
      setDigest((prev) => {
        const newSignal = `• ${data.signal.summary}`;
        return prev ? `${prev}\n${newSignal}` : `Latest updates:\n${newSignal}`;
      });
    });

    es.addEventListener("news_search", (e) => {
      const data = JSON.parse(e.data) as Extract<EventData, { type: "news_search" }>;
      addLog("news_search", data.message);
    });

    es.addEventListener("complete", (e) => {
      const data = JSON.parse(e.data) as Extract<EventData, { type: "complete" }>;
      addLog("complete", `Complete! ${data.signalsAdded} signals added from ${data.urlsChecked} URLs`);
      setSignalsAdded(data.signalsAdded);
      setUrlsChecked(data.urlsChecked);
      setIsComplete(true);
      es.close();
      onComplete();
    });

    es.addEventListener("error", (e) => {
      // Check if this is a MessageEvent (custom SSE error event) or a connection error
      if (e instanceof MessageEvent && e.data) {
        try {
          const data = JSON.parse(e.data) as Extract<EventData, { type: "error" }>;
          addLog("error", `Error: ${data.error}`);
          setIsComplete(true);
          es.close();
        } catch (parseErr) {
          addLog("error", "Error parsing error event");
          setIsComplete(true);
          es.close();
        }
      }
      // If it's a connection error (not MessageEvent), it will be handled by es.onerror below
    });

    es.onerror = () => {
      addLog("error", "Connection error");
      setIsComplete(true);
      es.close();
    };

    return () => {
      es.close();
    };
  }, [companyId, companyName, onComplete]);

  const getIcon = (type: LogEntry["type"]) => {
    switch (type) {
      case "start":
        return <Sparkles className="h-4 w-4 text-accent-highlight" />;
      case "discovery":
        return <Search className="h-4 w-4 text-blue-500" />;
      case "checking":
        return <Link2 className="h-4 w-4 text-muted-foreground" />;
      case "analyzing":
        return <Loader2 className="h-4 w-4 animate-spin text-purple-500" />;
      case "signal_created":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "news_search":
        return <FileText className="h-4 w-4 text-orange-500" />;
      case "complete":
        return <CheckCircle2 className="h-4 w-4 text-accent-highlight" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="signal-collection-title"
    >
      <Card className="w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 shrink-0">
          <div>
            <h2 id="signal-collection-title" className="font-serif text-lg font-medium">
              Collecting signals
            </h2>
            <p className="text-xs text-muted-foreground mt-1">{companyName}</p>
          </div>
          {isComplete && (
            <Button variant="ghost" size="sm" onClick={onClose} type="button">
              Close
            </Button>
          )}
        </CardHeader>
        <CardContent className="shrink min-h-0 overflow-auto space-y-4">
          {digest && (
            <Card className="bg-accent/30 border-accent-highlight/20">
              <CardContent className="py-3">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-accent-highlight mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Live digest</p>
                    <p className="text-sm text-foreground whitespace-pre-line">{digest}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Progress</p>
              {isComplete && (
                <Badge variant="secondary" className="text-xs">
                  {signalsAdded} signal{signalsAdded !== 1 ? "s" : ""} added
                </Badge>
              )}
            </div>
            <div className="space-y-1.5 max-h-64 overflow-y-auto border rounded-md p-3 bg-muted/30">
              {logs.length === 0 ? (
                <p className="text-sm text-muted-foreground">Starting...</p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 text-sm">
                    {getIcon(log.type)}
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-foreground", log.type === "error" && "text-destructive")}>{log.message}</p>
                      {log.type === "discovery" && (() => {
                        const discoveryData = log.data as { urls?: Array<{ url: string; label: string }> } | undefined;
                        if (discoveryData && Array.isArray(discoveryData.urls) && discoveryData.urls.length > 0) {
                          return (
                            <ul className="mt-1 ml-4 list-disc text-xs text-muted-foreground">
                              {discoveryData.urls.map((u, i) => (
                                <li key={i}>
                                  {u.label}: {u.url}
                                </li>
                              ))}
                            </ul>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {!isComplete && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Collecting signals...</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
