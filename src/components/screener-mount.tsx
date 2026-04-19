"use client";

import { InitialScreener } from "./initial-screener";

type ScreenerMountProps = {
  initialData?: Record<string, unknown>;
};

export function ScreenerMount({ initialData }: ScreenerMountProps) {
  return <InitialScreener initialData={initialData} />;
}
