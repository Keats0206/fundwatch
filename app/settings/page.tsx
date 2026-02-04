"use client";

import { useState } from "react";
import { useFund } from "@/lib/fund-context";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { RoleType } from "@/lib/types";

const ROLE_TYPES: RoleType[] = ["Engineering", "GTM", "Leadership", "Other"];
const SOURCES = ["Careers", "LinkedIn", "News", "Blog"] as const;

export default function SettingsPage() {
  const { fund } = useFund();
  const [fundName, setFundName] = useState(fund?.name ?? "");
  const [cadence, setCadence] = useState<"weekly" | "daily">("weekly");
  const [sources, setSources] = useState<Record<string, boolean>>({
    Careers: true,
    LinkedIn: true,
    News: true,
    Blog: true,
  });
  const [roleTypes, setRoleTypes] = useState<Record<RoleType, boolean>>({
    Engineering: true,
    GTM: true,
    Leadership: true,
    Other: true,
  });

  const toggleSource = (key: string) => {
    setSources((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleRoleType = (key: RoleType) => {
    setRoleTypes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    // Mock save - no persistence
    setFundName(fundName);
  };

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] mb-1">
          Settings
        </p>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-xl">
          Configure monitoring for this fund (UI only; changes are not persisted).
        </p>
      </header>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold">Fund</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fund-name">Fund name</Label>
            <Input
              id="fund-name"
              value={fundName}
              onChange={(e) => setFundName(e.target.value)}
              placeholder="e.g. Acme Ventures"
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold">Monitoring cadence</h2>
          <p className="text-sm text-muted-foreground">
            How often to run external signal checks.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="cadence"
                checked={cadence === "weekly"}
                onChange={() => setCadence("weekly")}
                className="h-4 w-4 border-input"
              />
              <span className="text-sm font-medium">Weekly</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="cadence"
                checked={cadence === "daily"}
                onChange={() => setCadence("daily")}
                className="h-4 w-4 border-input"
              />
              <span className="text-sm font-medium">Daily</span>
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold">Enabled sources</h2>
          <p className="text-sm text-muted-foreground">
            Which public sources to monitor (mock toggles).
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            {SOURCES.map((source) => (
              <div key={source} className="flex items-center space-x-2">
                <Switch
                  checked={sources[source]}
                  onCheckedChange={() => toggleSource(source)}
                />
                <Label className="text-sm font-normal cursor-pointer">{source}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold">Role types to watch</h2>
          <p className="text-sm text-muted-foreground">
            Highlight hiring activity for these role categories.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            {ROLE_TYPES.map((roleType) => (
              <div key={roleType} className="flex items-center space-x-2">
                <Checkbox
                  id={`role-${roleType}`}
                  checked={roleTypes[roleType]}
                  onCheckedChange={() => toggleRoleType(roleType)}
                />
                <Label
                  htmlFor={`role-${roleType}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {roleType}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
        Save (mock)
      </Button>
    </div>
  );
}
