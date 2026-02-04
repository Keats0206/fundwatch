"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, X, Edit2, Trash2, Radio, Link2, FileText } from "lucide-react";
import type { SignalText } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  companyId: string;
  signals: SignalText[];
  onUpdate: () => void;
};

export function ManageSignals({ companyId, signals, onUpdate }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [newSignalText, setNewSignalText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const standardSignals = signals.filter((s) => s.type === "standard");
  const customSignals = signals.filter((s) => s.type === "custom");

  const handleAdd = async () => {
    if (!newSignalText.trim()) return;

    try {
      const res = await fetch("/api/signal-texts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, text: newSignalText.trim() }),
      });

      if (res.ok) {
        setNewSignalText("");
        setIsAdding(false);
        onUpdate();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to add signal");
      }
    } catch (err) {
      alert("Failed to add signal");
    }
  };

  const handleEdit = async (id: string) => {
    if (!editingText.trim()) {
      setEditingId(null);
      return;
    }

    // Auto-detect format: URL if starts with http, otherwise text
    const format = editingText.trim().startsWith("http") ? "url" : "text";

    try {
      const res = await fetch(`/api/signal-texts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editingText.trim(), format }),
      });

      if (res.ok) {
        setEditingId(null);
        setEditingText("");
        onUpdate();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update signal");
      }
    } catch (err) {
      alert("Failed to update signal");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this custom signal?")) return;

    try {
      const res = await fetch(`/api/signal-texts/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        onUpdate();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete signal");
      }
    } catch (err) {
      alert("Failed to delete signal");
    }
  };

  // Group signals by category
  const signalsByCategory = standardSignals.reduce((acc, signal) => {
    const category = signal.category || "General";
    if (!acc[category]) acc[category] = [];
    acc[category].push(signal);
    return acc;
  }, {} as Record<string, typeof standardSignals>);

  return (
    <div className="space-y-4">
      {/* Standard Signals - Grid Layout */}
      {standardSignals.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Standard Signals</h3>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{standardSignals.length}</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {standardSignals.map((signal) => {
                const category = signal.category || "General";
                const categoryColors: Record<string, string> = {
                  Funding: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900",
                  Leadership: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900",
                  Hiring: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900",
                  Product: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900",
                  Business: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-900",
                  Risk: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900",
                  General: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/20 dark:text-gray-400 dark:border-gray-900",
                };
                const colorClass = categoryColors[category] || categoryColors.General;
                
                return (
                  <motion.div
                    key={signal.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-medium ${colorClass} hover:opacity-80 transition-opacity`}
                  >
                    {signal.format === "url" ? (
                      <Link2 className="h-3 w-3 shrink-0" />
                    ) : (
                      <Radio className="h-3 w-3 shrink-0" />
                    )}
                    <span className="max-w-[200px] truncate">
                      {signal.format === "url" ? (
                        <a
                          href={signal.text}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {signal.text}
                        </a>
                      ) : (
                        signal.text
                      )}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Custom Signals */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Custom Signals</h3>
            {customSignals.length > 0 && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">{customSignals.length}</Badge>
            )}
          </div>
          {!isAdding && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAdding(true)}
              className="h-7 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          )}
        </div>

        {isAdding && (
          <Card className="mb-2">
            <CardContent className="p-3">
              <Input
                value={newSignalText}
                onChange={(e) => setNewSignalText(e.target.value)}
                placeholder="Enter signal text or URL to monitor..."
                className="mb-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd();
                  if (e.key === "Escape") {
                    setIsAdding(false);
                    setNewSignalText("");
                  }
                }}
                autoFocus
              />
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleAdd} className="h-7 text-xs">
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAdding(false);
                    setNewSignalText("");
                  }}
                  className="h-7 text-xs"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {customSignals.length === 0 && !isAdding && (
          <p className="text-xs text-muted-foreground py-2">No custom signals yet.</p>
        )}

        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {customSignals.map((signal) => {
              const category = signal.category || "General";
              const categoryColors: Record<string, string> = {
                Funding: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900",
                Leadership: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900",
                Hiring: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900",
                Product: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900",
                Business: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-900",
                Risk: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900",
                General: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/20 dark:text-gray-400 dark:border-gray-900",
              };
              const colorClass = categoryColors[category] || categoryColors.General;
              
              return (
                <motion.div
                  key={signal.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`group relative inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-medium ${colorClass} hover:opacity-80 transition-opacity`}
                >
                  {signal.format === "url" ? (
                    <Link2 className="h-3 w-3 shrink-0" />
                  ) : (
                    <Radio className="h-3 w-3 shrink-0" />
                  )}
                  {editingId === signal.id ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="h-6 text-xs w-32"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleEdit(signal.id);
                          if (e.key === "Escape") {
                            setEditingId(null);
                            setEditingText("");
                          }
                        }}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(signal.id)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="max-w-[200px] truncate">
                        {signal.format === "url" ? (
                          <a
                            href={signal.text}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {signal.text}
                          </a>
                        ) : (
                          signal.text
                        )}
                      </span>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingId(signal.id);
                            setEditingText(signal.text);
                          }}
                          className="h-5 w-5 p-0"
                        >
                          <Edit2 className="h-2.5 w-2.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(signal.id)}
                          className="h-5 w-5 p-0 text-destructive"
                        >
                          <Trash2 className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
