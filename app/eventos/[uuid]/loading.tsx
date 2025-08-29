'use client';

import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div>
            {/* Header */}
            <div className="space-y-4 mb-8">
              <Skeleton className="h-[400px] w-full rounded-lg" />
              <Skeleton className="h-10 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>

            {/* Info */}
            <div className="mb-8 grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-6 md:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-6 w-6" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>

        {/* Booking Card */}
        <div>
          <div className="sticky top-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>

            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-6 w-24" />
                  </div>
                </div>
              ))}
            </div>

            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
} 