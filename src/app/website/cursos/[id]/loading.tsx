import React from "react";

export default function LoadingCourseDetails() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="space-y-6 border-b border-gray-100 pb-8">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 animate-pulse" />
              <div className="space-y-2">
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-5 w-64 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-36 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-10 w-28 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-[minmax(0,7fr)_3fr] lg:gap-10 space-y-10 lg:space-y-0">
          <div className="space-y-4">
            <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-4/6 bg-gray-100 rounded animate-pulse" />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-100 animate-pulse" />
                <div className="space-y-2 w-full">
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

