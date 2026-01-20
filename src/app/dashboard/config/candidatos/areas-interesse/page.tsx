"use client";

import React from "react";
import { AreasInteresseForm } from "./AreasInteresseForm";

export default function AreasInteressePage() {
  return (
    <div className="bg-white rounded-3xl p-5 h-full min-h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex-1 min-h-0">
        <AreasInteresseForm />
      </div>
    </div>
  );
}

