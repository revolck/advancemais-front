"use client";

import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { TeamMember } from "./TeamMember";
import type { TeamMemberData } from "../types";

interface TeamSliderProps {
  members: TeamMemberData[];
}

const AUTOPLAY_OPTIONS = { delay: 4000, stopOnInteraction: true };

export const TeamSlider: React.FC<TeamSliderProps> = ({ members }) => {
  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      dragFree: false,
    },
    [Autoplay(AUTOPLAY_OPTIONS)]
  );

  return (
    <div className="relative">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex gap-4 px-4">
          {members.map((member, index) => (
            <div key={member.id} className="flex-none w-[85vw] max-w-[320px]">
              <TeamMember data={member} index={index} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
