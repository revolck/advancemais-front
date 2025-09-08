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
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-red-600" />
          <span className="font-semibold text-white text-sm">
            Horário de atendimento:
          </span>
        </div>
        <p className="text-gray-400 text-sm ml-6">
          {contact.hours}
        </p>
      </div>

      {/* Contatos */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Phone className="w-4 h-4 text-red-600" />
          <span className="font-semibold text-white text-sm">Contato:</span>
        </div>
        <div className="text-gray-400 text-sm ml-6 space-y-1">
          {contact.phones.map((phone, index) => (
            <div key={index}>
              <a
                href={`tel:${phone.replace(/\D/g, "")}`}
                className="hover:text-white transition-colors"
              >
                {phone}
              </a>
            </div>
          ))}
          {contact.email && (
            <div>
              <a
                href={`mailto:${contact.email}`}
                className="hover:text-white transition-colors"
              >
                {contact.email}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
