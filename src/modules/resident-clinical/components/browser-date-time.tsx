"use client";

import { useSyncExternalStore } from "react";

const dateTimeFormatter = new Intl.DateTimeFormat("pt-PT", {
  dateStyle: "medium",
  timeStyle: "short",
});
const subscribe = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function BrowserDateTime({ className, value }: { className?: string; value: string }) {
  const isClient = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  return <time className={className} dateTime={value}>{isClient ? dateTimeFormatter.format(new Date(value)) : null}</time>;
}
