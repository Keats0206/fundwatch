"use client";

import { useState } from "react";
import { useFund } from "@/lib/fund-context";
import { useStandardSignalTexts } from "@/lib/hooks/use-data";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DollarSign,
  UserPlus,
  TrendingUp,
  Rocket,
  Handshake,
  Users,
  PauseCircle,
  AlertTriangle,
  Link2,
  LucideIcon,
  Plus,
  X,
} from "lucide-react";
import type { SignalText } from "@/lib/types";

type SignalMetadata = {
  tag: string;
  icon: LucideIcon;
  color: string;
};

const CATEGORIES = [
  { value: "Funding", label: "Funding", icon: DollarSign, color: "text-green-500" },
  { value: "Leadership", label: "Leadership", icon: UserPlus, color: "text-purple-500" },
  { value: "Hiring", label: "Hiring", icon: TrendingUp, color: "text-blue-500" },
  { value: "Product", label: "Product", icon: Rocket, color: "text-indigo-500" },
  { value: "Business", label: "Business", icon: Handshake, color: "text-teal-500" },
  { value: "Risk", label: "Risk", icon: AlertTriangle, color: "text-red-500" },
  { value: "General", label: "General", icon: DollarSign, color: "text-gray-500" },
];

const ICON_MAP: Record<string, LucideIcon> = {
  DollarSign,
  UserPlus,
  TrendingUp,
  Rocket,
  Handshake,
  Users,
  PauseCircle,
  AlertTriangle,
  Link2,
};

function getSignalMetadata(signal: SignalText): SignalMetadata {
  // Use stored category and icon if available
  if (signal.category && signal.iconName) {
    const category = CATEGORIES.find((c) => c.value === signal.category);
    const Icon = ICON_MAP[signal.iconName];
    if (category && Icon) {
      return { tag: category.label, icon: Icon, color: category.color };
    }
  }
  
  const text = signal.text.toLowerCase();
  
  if (signal.format === "url") {
    return { tag: "URL", icon: Link2, color: "text-blue-500" };
  }
  
  // Map signal text to metadata (fallback)
  if (text.includes("funding") || text.includes("raised") || text.includes("capital")) {
    return { tag: "Funding", icon: DollarSign, color: "text-green-500" };
  }
  if (text.includes("executive") || text.includes("hire")) {
    return { tag: "Leadership", icon: UserPlus, color: "text-purple-500" };
  }
  if (text.includes("hiring") && (text.includes("increase") || text.includes("activity"))) {
    return { tag: "Hiring", icon: TrendingUp, color: "text-blue-500" };
  }
  if (text.includes("hiring") && (text.includes("pause") || text.includes("slowdown"))) {
    return { tag: "Hiring", icon: PauseCircle, color: "text-orange-500" };
  }
  if (text.includes("product") || text.includes("launch") || text.includes("update")) {
    return { tag: "Product", icon: Rocket, color: "text-indigo-500" };
  }
  if (text.includes("partnership") || text.includes("customer")) {
    return { tag: "Business", icon: Handshake, color: "text-teal-500" };
  }
  if (text.includes("leadership") || text.includes("organizational")) {
    return { tag: "Leadership", icon: Users, color: "text-purple-500" };
  }
  if (text.includes("negative") || text.includes("controversy")) {
    return { tag: "Risk", icon: AlertTriangle, color: "text-red-500" };
  }
  
  // Default
  return { tag: "General", icon: DollarSign, color: "text-gray-500" };
}

function getIconNameFromCategory(category: string): string {
  const iconMap: Record<string, string> = {
    General: "DollarSign",
    Hiring: "TrendingUp",
    Risk: "AlertTriangle",
    Business: "Handshake",
    Product: "Rocket",
    Leadership: "UserPlus",
    Funding: "DollarSign",
  };
  return iconMap[category] || "DollarSign";
}

function AddSignalModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [signalText, setSignalText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const handleAdd = async () => {
    if (!signalText.trim()) return;
    if (!selectedCategory) {
      alert("Please select a category");
      return;
    }

    try {
      const iconName = getIconNameFromCategory(selectedCategory);
      const res = await fetch("/api/signal-texts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: signalText.trim(),
          format: signalText.trim().startsWith("http") ? "url" : "text",
          category: selectedCategory,
          iconName,
          isStandard: true,
        }),
      });

      if (res.ok) {
        setSignalText("");
        setSelectedCategory("");
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to add signal");
      }
    } catch (err) {
      alert("Failed to add signal");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-signal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h2 id="add-signal-title" className="font-serif text-lg font-medium">
            Add Alert
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} type="button">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Signal Text</label>
            <Input
              value={signalText}
              onChange={(e) => setSignalText(e.target.value)}
              placeholder="e.g., Company recently raised funding"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAdd();
                }
                if (e.key === "Escape") {
                  onClose();
                }
              }}
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.value;
                return (
                  <Button
                    key={cat.value}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.value)}
                    className="h-8"
                  >
                    <Icon className={`h-3 w-3 mr-1.5 ${isSelected ? "text-white" : cat.color}`} />
                    {cat.label}
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Button onClick={handleAdd} size="sm" className="flex-1">
              Add Alert
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SignalsPage() {
  const { fundId } = useFund();
  const { data: standardSignals, isLoading, refetch } = useStandardSignalTexts();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Watch Patterns</h1>
          <p className="text-base text-muted-foreground mt-2">
            Configure what the system looks for across all companies (funding, hiring, leadership, etc.)
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Alert
        </Button>
      </div>

      {isModalOpen && (
        <AddSignalModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => refetch()}
        />
      )}

      {isLoading ? (
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Loading signals...</p>
          </CardContent>
        </Card>
      ) : standardSignals && standardSignals.length > 0 ? (
        <Card>
          <CardContent className="p-5">
            <div className="space-y-2">
              {standardSignals.map((signal) => {
                const metadata = getSignalMetadata(signal);
                const Icon = metadata.icon;
                const tag = signal.category || metadata.tag;
                
                return (
                  <div
                    key={signal.id}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors group"
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${metadata.color}`} />
                    <Badge variant="outline" className="text-xs px-2 py-0.5 h-5 font-medium">
                      {tag}
                    </Badge>
                    {signal.format === "url" ? (
                      <a
                        href={signal.text}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-accent-highlight hover:underline leading-relaxed break-all flex-1 min-w-0"
                      >
                        {signal.text}
                      </a>
                    ) : (
                      <p className="text-sm text-foreground leading-relaxed flex-1 min-w-0">
                        {signal.text}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">No standard signals found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
