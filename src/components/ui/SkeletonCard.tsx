'use client';

import React from 'react';

export function SkeletonCard({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4 w-full animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-5 rounded-2xl bg-st-surface/60 border border-st-border/40 space-y-3"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="h-4 bg-st-surface-2 rounded-md w-1/3" />
            <div className="h-4 bg-st-surface-2 rounded-md w-1/6" />
          </div>
          <div className="h-3 bg-st-surface-2/60 rounded-md w-3/4" />
          <div className="flex items-center gap-2 pt-2">
            <div className="h-8 bg-st-surface-2 rounded-xl w-24" />
            <div className="h-8 bg-st-surface-2 rounded-xl w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
