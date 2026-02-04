"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Search, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import type { Signal } from "@/lib/types";

type EventData =
  | { type: "start"; companyId: string; companyName: string }
  | { type: "cached"; lastChecked: string; signalsGenerated: number; urlsChecked: number }
  | { type: "discovery"; message: string; urls?: Array<{ url: string; label: string }> }
  | { type: "checking"; url: string; status: "fetching" | "changed" | "unchanged" | "initial_check" | "error"; error?: string }
  | { type: "analyzing"; url: string; message: string }
  | { type: "signal_created"; signal: { id: string; summary: string; source: string; url: string } }
  | { type: "news_search"; message: string }
  | { type: "complete"; signalsAdded: number; urlsChecked?: number }
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
  onComplete: () => void;
  onSignalsFound?: (count: number) => void;
  onStreamingSignal?: (signal: Signal) => void;
};

export function SignalCollectionPanel({ companyId, companyName, onComplete, onSignalsFound, onStreamingSignal }: Props) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [signalsAdded, setSignalsAdded] = useState(0);
  const [currentStatus, setCurrentStatus] = useState<string>("Checking for recent activity…");
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [checkedUrls, setCheckedUrls] = useState<Array<{ url: string; status: string }>>([]);
  const [showDetails, setShowDetails] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const logIdRef = useRef(0);

  const addLog = (type: EventData["type"], message: string, data?: unknown) => {
    setLogs((prev) => [...prev, { id: `log-${logIdRef.current++}`, type, message, timestamp: new Date(), data }]);
  };

  useEffect(() => {
    const url = `/api/companies/${companyId}/check-signals?force=true`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener("start", () => {
      setCurrentStatus("Checking for recent activity…");
    });

    es.addEventListener("cached", (e: MessageEvent) => {
      const data = JSON.parse(e.data) as Extract<EventData, { type: "cached" }>;
      setIsComplete(true);
      setSignalsAdded(data.signalsGenerated);
      if (data.signalsGenerated === 0) {
        setCurrentStatus("No material changes detected in the last 30 days");
      } else {
        setCurrentStatus(`New activity detected`);
      }
      setTimeout(() => onComplete(), 1000);
    });

    es.addEventListener("discovery", () => {
      setCurrentStatus("Checking hiring, product updates, and news…");
    });

    es.addEventListener("checking", (e: MessageEvent) => {
      const data = JSON.parse(e.data) as Extract<EventData, { type: "checking" }>;
      try {
        const urlObj = new URL(data.url);
        const urlPath = urlObj.pathname || urlObj.hostname;
        setCurrentUrl(urlPath);
        addLog("checking", `Checking ${urlPath}...`, data);
        
        // Track checked URLs
        setCheckedUrls((prev) => {
          const existing = prev.findIndex((u) => u.url === data.url);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = { url: data.url, status: data.status };
            return updated;
          }
          return [...prev, { url: data.url, status: data.status }];
        });
        
        if (data.status === "unchanged") {
          // Show which URL was checked
          setCurrentStatus(`Checked ${urlPath} — no changes`);
        } else if (data.status === "changed") {
          setCurrentStatus(`New activity detected on ${urlPath}`);
        } else if (data.status === "fetching") {
          setCurrentStatus(`Checking ${urlPath}...`);
        }
      } catch {
        setCurrentUrl(data.url);
        addLog("checking", `Checking ${data.url}...`, data);
      }
    });

    es.addEventListener("signal_created", (e: MessageEvent) => {
      const data = JSON.parse(e.data) as Extract<EventData, { type: "signal_created" }>;
      const signalData = data.signal;
      // Construct a full Signal object for the parent
      const fullSignal: Signal = {
        id: signalData.id,
        companyId: companyId,
        source: signalData.source as Signal["source"],
        timestamp: new Date().toISOString(),
        summary: signalData.summary,
        externalUrl: signalData.url,
      };
      setSignals((prev) => [...prev, fullSignal]);
      setSignalsAdded((prev) => prev + 1);
      setCurrentStatus("New activity detected");
      addLog("signal_created", signalData.summary);
      // Pass streaming signal to parent
      onStreamingSignal?.(fullSignal);
    });

    es.addEventListener("news_search", () => {
      setCurrentStatus("Searching recent news…");
      addLog("news_search", "Searching for recent news articles");
    });

    es.addEventListener("complete", (e: MessageEvent) => {
      const data = JSON.parse(e.data) as Extract<EventData, { type: "complete" }>;
      setSignalsAdded(data.signalsAdded);
      setIsComplete(true);
      setCurrentUrl(null);
      
      if (data.signalsAdded === 0) {
        setCurrentStatus(`Checked ${data.urlsChecked || checkedUrls.length} sources — no material changes detected`);
      } else {
        setCurrentStatus(`Found ${data.signalsAdded} new ${data.signalsAdded === 1 ? "signal" : "signals"}`);
      }
      
      es.close();
      
      // Notify parent if signals were found
      if (data.signalsAdded > 0) {
        onSignalsFound?.(data.signalsAdded);
      }
      
      setTimeout(() => {
        onComplete();
      }, data.signalsAdded > 0 ? 3000 : 1500);
    });

    es.addEventListener("error", (e: MessageEvent) => {
      const data = JSON.parse(e.data) as Extract<EventData, { type: "error" }>;
      addLog("error", `Error: ${data.error}`);
      setIsComplete(true);
      setCurrentStatus("Error checking for changes");
      es.close();
    });

    es.onerror = () => {
      addLog("error", "Connection error");
      setIsComplete(true);
      setCurrentStatus("Error checking for changes");
      es.close();
    };

    return () => {
      es.close();
    };
  }, [companyId, companyName, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="mb-4"
    >
      <Card className="rounded-lg border-border/80 overflow-hidden bg-muted/30">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* High-level status - outcome focused */}
            <div className="flex items-start gap-3">
              {!isComplete ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Search className="h-4 w-4 text-muted-foreground mt-0.5" />
                </motion.div>
              ) : signalsAdded > 0 ? (
                <Sparkles className="h-4 w-4 text-accent-highlight mt-0.5" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {currentStatus}
                </p>
                {!isComplete && currentUrl && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Currently checking: {currentUrl}
                  </p>
                )}
                {!isComplete && !currentUrl && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Monitoring {companyName}'s site, hiring pages, and public news
                  </p>
                )}
                {isComplete && signalsAdded === 0 && checkedUrls.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Checked {checkedUrls.length} {checkedUrls.length === 1 ? "source" : "sources"} — all up to date
                  </p>
                )}
                {isComplete && signalsAdded === 0 && checkedUrls.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    No changes detected
                  </p>
                )}
              </div>
            </div>

            {/* Signals found - show prominently if found */}
            <AnimatePresence mode="popLayout">
              {signals.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5 pl-7 border-l-2 border-accent-highlight/30"
                >
                  <AnimatePresence>
                    {signals.map((signal, index) => (
                      <motion.div
                        key={signal.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="text-sm text-foreground"
                      >
                        • {signal.summary}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Show checked URLs summary */}
            {checkedUrls.length > 0 && (
              <div className="pt-2 border-t border-border/40">
                <p className="text-xs text-muted-foreground mb-1.5">
                  Checked {checkedUrls.length} {checkedUrls.length === 1 ? "source" : "sources"}:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {checkedUrls.map((item, idx) => {
                    try {
                      const urlObj = new URL(item.url);
                      const displayName = urlObj.pathname || urlObj.hostname.replace("www.", "");
                      return (
                        <span
                          key={idx}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                            item.status === "changed"
                              ? "bg-accent-highlight/20 text-accent-highlight"
                              : item.status === "unchanged"
                              ? "bg-muted/50 text-muted-foreground"
                              : "bg-muted/30 text-muted-foreground"
                          }`}
                        >
                          {item.status === "changed" && "●"}
                          {displayName}
                        </span>
                      );
                    } catch {
                      return (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-muted/30 text-muted-foreground"
                        >
                          {item.url}
                        </span>
                      );
                    }
                  })}
                </div>
              </div>
            )}

            {/* Technical trace - collapsed by default */}
            {logs.length > 0 && (
              <div className="pt-2 border-t border-border/60">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                >
                  {showDetails ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1" />
                      Hide collection log
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      View collection log
                    </>
                  )}
                </Button>
                {showDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 space-y-1 max-h-64 overflow-y-auto text-xs text-muted-foreground bg-muted/50 rounded p-2"
                  >
                    {logs.map((log) => (
                      <div key={log.id} className="flex items-start gap-2 py-0.5">
                        <span className="text-[10px] shrink-0 w-12">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                        <span className="flex-1">{log.message}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
