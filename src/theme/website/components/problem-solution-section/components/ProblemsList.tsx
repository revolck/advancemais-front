"use client";

import React from "react";
import { ProblemCard } from "./ProblemCard";
import type { ProblemSolutionData } from "../types";

interface ProblemsListProps {
  problems: ProblemSolutionData[];
}

export const ProblemsList: React.FC<ProblemsListProps> = ({ problems }) => {
  return (
    <div className="flex flex-col gap-6">
      {problems.map((problem, index) => (
        <ProblemCard key={problem.id} data={problem} index={index} />
      ))}
    </div>
  );
};
