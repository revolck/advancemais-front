"use client";

import React from "react";
import { Clock, Phone } from "lucide-react";
import type { ContactInfo as ContactInfoType } from "../types";

interface ContactInfoProps {
  contact: ContactInfoType;
  isMobile?: boolean;
}

export const ContactInfo: React.FC<ContactInfoProps> = ({ contact }) => {
  return (
    <div className="flex-1">
      {/* Horário de Atendimento */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock
            className="w-5 h-5 text-red-600 shrink-0"
            aria-hidden="true"
            focusable="false"
          />
          <h4 className="text-sm! font-semibold! uppercase! text-white! leading-none! mb-0!">
            Horário de Atendimento
          </h4>
        </div>
        <ul className="space-y-2">
          <li>
            <p className="text-gray-400! text-sm! mb-0!">
              {contact.hours}
            </p>
          </li>
        </ul>
      </div>

      {/* Contatos */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Phone
            className="w-5 h-5 text-red-600 shrink-0"
            aria-hidden="true"
            focusable="false"
          />
          <h4 className="text-sm! font-semibold! uppercase! text-white! leading-none! mb-0!">
            Contato
          </h4>
        </div>
        <ul className="space-y-2">
          {contact.phones.map((phone, index) => (
            <li key={index}>
              <a
                href={`tel:${phone.replace(/\D/g, "")}`}
                className="text-gray-400! hover:text-white! transition-colors! duration-200! text-sm! mb-0!"
              >
                {phone}
              </a>
            </li>
          ))}
          {contact.email && (
            <li>
              <a
                href={`mailto:${contact.email}`}
                className="text-gray-400! hover:text-white! transition-colors! duration-200! text-sm! mb-0!"
              >
                {contact.email}
              </a>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};
