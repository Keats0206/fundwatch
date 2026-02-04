"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useFund } from "@/lib/fund-context";
import { useTasks } from "@/lib/hooks/use-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/lib/types";
import { CheckCircle2, Circle, Clock } from "lucide-react";

const statusLabels: Record<TaskStatus, string> = {
  pending: "Pending",
  completed: "Completed",
  snoozed: "Snoozed",
};

export default function TasksPage() {
  const { fundId } = useFund();
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("pending");
  const [taskStatuses, setTaskStatuses] = useState<Record<string, TaskStatus>>({});
  const { data: allTasksData, isLoading: tasksLoading, error: tasksError } = useTasks(fundId);
  const allTasks = allTasksData ?? [];

  const filteredTasks = useMemo(() => {
    if (statusFilter === "all") return allTasks;
    return allTasks.filter((t) => {
      const currentStatus = taskStatuses[t.id] ?? t.status;
      return currentStatus === statusFilter;
    });
  }, [allTasks, statusFilter, taskStatuses]);

  const toggleTaskStatus = (taskId: string, currentStatus: TaskStatus) => {
    setTaskStatuses((prev) => {
      const nextStatus: TaskStatus =
        currentStatus === "pending"
          ? "completed"
          : currentStatus === "completed"
            ? "snoozed"
            : "pending";
      return { ...prev, [taskId]: nextStatus };
    });
  };

  const pendingCount = allTasks.filter((t) => {
    const status = taskStatuses[t.id] ?? t.status;
    return status === "pending";
  }).length;

  const completedCount = allTasks.filter((t) => {
    const status = taskStatuses[t.id] ?? t.status;
    return status === "completed";
  }).length;

  if (tasksError) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive">Failed to load tasks.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] mb-1">
          Tasks
        </p>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground">
          Tasks
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-xl">
          Actionable items and questions across your portfolio. Check them off as you go.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3">
          <Label className="text-sm">Status</Label>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value === "all" ? "all" : (e.target.value as TaskStatus)
              )
            }
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-w-[140px]"
          >
            <option value="all">All</option>
            <option value="pending">Pending ({pendingCount})</option>
            <option value="completed">Completed ({completedCount})</option>
            <option value="snoozed">Snoozed</option>
          </select>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Circle className="h-3.5 w-3.5" />
            Action
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Question
          </span>
        </div>
      </div>

      {tasksLoading ? (
        <p className="text-muted-foreground">Loading tasks…</p>
      ) : filteredTasks.length === 0 ? (
        <Card className="rounded-lg border-border/80">
          <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <CheckCircle2 className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-serif text-lg font-medium text-foreground mb-1">
              {allTasks.length === 0
                ? "No tasks yet"
                : statusFilter === "pending"
                  ? "No pending tasks"
                  : "No tasks match your filter"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {allTasks.length === 0
                ? "Tasks are generated from company briefs. Add companies to your portfolio to see actionable items and questions for calls."
                : statusFilter === "pending"
                  ? "Great work! All your tasks are done or snoozed."
                  : "Try changing the status filter above to see more tasks."}
            </p>
            {allTasks.length === 0 && (
              <Link
                href="/"
                className="mt-6 text-sm font-medium text-accent-highlight hover:underline"
              >
                Go to Portfolio →
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const currentStatus = taskStatuses[task.id] ?? task.status;
            const isCompleted = currentStatus === "completed";
            const isSnoozed = currentStatus === "snoozed";

            return (
              <Card
                key={task.id}
                className={cn(
                  "rounded-lg border-border/80 transition-colors",
                  isCompleted && "opacity-60",
                  isSnoozed && "opacity-75"
                )}
              >
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    <button
                      type="button"
                      onClick={() => toggleTaskStatus(task.id, currentStatus)}
                      className="mt-0.5 shrink-0"
                    >
                      {currentStatus === "completed" ? (
                        <CheckCircle2 className="h-5 w-5 text-accent-highlight" />
                      ) : currentStatus === "snoozed" ? (
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground hover:text-accent-highlight transition-colors" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "text-sm leading-relaxed text-foreground",
                              isCompleted && "line-through text-muted-foreground"
                            )}
                          >
                            {task.text}
                          </p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Link
                              href={`/company/${task.companyId}`}
                              className="text-xs font-medium text-foreground hover:text-accent-highlight hover:underline"
                            >
                              {task.company.name} →
                            </Link>
                            <Badge
                              variant={task.type === "action" ? "default" : "secondary"}
                              className="text-xs rounded-md"
                            >
                              {task.type === "action" ? "Action" : "Question"}
                            </Badge>
                            {currentStatus !== "pending" && (
                              <Badge variant="outline" className="text-xs rounded-md">
                                {statusLabels[currentStatus]}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
