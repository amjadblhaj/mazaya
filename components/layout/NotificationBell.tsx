"use client";

import { useTransition } from "react";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { markNotificationReadAction, markAllNotificationsReadAction } from "@/lib/notifications/actions";
import type { Notification } from "@/types";

export function NotificationBell({ notifications }: { notifications: Notification[] }) {
  const [isPending, startTransition] = useTransition();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted">
        <Bell className="size-5" style={{ color: "var(--brand-primary)" }} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>الإشعارات</span>
            {unreadCount > 0 && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => startTransition(async () => await markAllNotificationsReadAction())}
                className="text-xs font-normal text-muted-foreground hover:underline"
              >
                تعليم الكل كمقروء
              </button>
            )}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {notifications.length === 0 && (
          <p className="px-2 py-4 text-center text-sm text-muted-foreground">لا توجد إشعارات</p>
        )}
        <DropdownMenuGroup>
          {notifications.map((n) => (
            <DropdownMenuItem
              key={n.id}
              className="flex flex-col items-start gap-0.5 whitespace-normal"
              onClick={() => {
                if (!n.read) startTransition(async () => await markNotificationReadAction(n.id));
              }}
            >
              <span className={n.read ? "text-sm text-muted-foreground" : "text-sm font-semibold"}>{n.title}</span>
              <span className="text-xs text-muted-foreground">{n.message}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
