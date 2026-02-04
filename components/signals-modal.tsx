"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { X } from "lucide-react";
import type { SignalText } from "@/lib/types";
import { ManageSignals } from "@/components/manage-signals";

type Props = {
  companyId: string;
  signals: SignalText[];
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
};

export function SignalsModal({ companyId, signals, open, onClose, onUpdate }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="signals-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card className="w-full max-w-4xl shadow-xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 shrink-0">
          <div>
            <h2 id="signals-modal-title" className="font-serif text-lg font-medium">
              Manage Signals
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Configure what to monitor for this company
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} type="button">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="shrink min-h-0 overflow-auto">
          <ManageSignals companyId={companyId} signals={signals} onUpdate={onUpdate} />
        </CardContent>
      </Card>
    </div>
  );
}
