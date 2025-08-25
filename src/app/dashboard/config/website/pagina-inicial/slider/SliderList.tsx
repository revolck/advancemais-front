"use client";

import React from "react";
import { useState, useEffect, useCallback } from "react";
import { ButtonCustom, Icon, InputCustom } from "@/components/ui/custom";
import {
  ModalCustom,
  ModalContentWrapper,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from "@/components/ui/custom/modal";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";

// Tipo de banner retornado pela API
interface Banner {
  id: string;
  imagemUrl: string;
  imagemTitulo?: string;
  link?: string;
  ordem: number;
  criadoEm: string;
  atualizadoEm: string;
}

// Seletor de formato exibido na modal
const FormatSelector = ({
  value,
  onChange,
}: {
  value: "web" | "mobile";
  onChange: (value: "web" | "mobile") => void;
}) => {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Escolha o formato:</Label>
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onChange("web")}
          className={`relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all w-full ${
            value === "web"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          {value === "web" && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <Icon name="Check" className="w-3 h-3 text-white" />
            </div>
          )}
          <div
            className={`w-16 h-10 rounded border-2 ${
              value === "web" ? "border-blue-400" : "border-gray-300"
            }`}
          />
          <span
            className={`text-sm font-medium ${
              value === "web" ? "text-blue-600" : "text-gray-600"
            }`}
          >
            Web
          </span>
          <span className="text-xs text-gray-500">16:9</span>
        </button>

        <button
          type="button"
          onClick={() => onChange("mobile")}
          className={`relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all w-full ${
            value === "mobile"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          {value === "mobile" && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <Icon name="Check" className="w-3 h-3 text-white" />
            </div>
          )}
          <div
            className={`w-10 h-16 rounded border-2 ${
              value === "mobile" ? "border-blue-400" : "border-gray-300"
            }`}
          />
          <span
            className={`text-sm font-medium ${
              value === "mobile" ? "text-blue-600" : "text-gray-600"
            }`}
          >
            Mobile
          </span>
          <span className="text-xs text-gray-500">9:16</span>
        </button>
      </div>
    </div>
  );
};

interface SliderListProps {
  initialFormat?: "web" | "mobile";
}

export default function SliderList({ initialFormat = "web" }: SliderListProps) {
  const [format, setFormat] = useState<"web" | "mobile">(initialFormat);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [modalFormat, setModalFormat] = useState<"web" | "mobile">(initialFormat);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [link, setLink] = useState("");

  const fetchBanners = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/website/banner?formato=${format}`);
      if (!res.ok) return;
      const data: Banner[] = await res.json();
      setBanners(data.sort((a, b) => a.ordem - b.ordem));
    } catch (err) {
      console.error(err);
    }
  }, [format]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const openAddModal = () => {
    setEditingBanner(null);
    setModalFormat(initialFormat);
    setImageFile(null);
    setLink("");
    setIsModalOpen(true);
  };

  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setModalFormat(format);
    setLink(banner.link || "");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (banners.length <= 1) return;
    await fetch(`/api/v1/website/banner/${id}`, { method: "DELETE" });
    fetchBanners();
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    if (imageFile) formData.append("imagem", imageFile);
    if (link) formData.append("link", link);
    formData.append(
      "ordem",
      String(editingBanner ? editingBanner.ordem : banners.length + 1)
    );
    formData.append("formato", modalFormat);

    const url = editingBanner
      ? `/api/v1/website/banner/${editingBanner.id}`
      : `/api/v1/website/banner`;
    const method = editingBanner ? "PUT" : "POST";
    await fetch(url, { method, body: formData });
    setIsModalOpen(false);
    fetchBanners();
  };

  const moveBanner = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= banners.length) return;
    const updated = [...banners];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);
    const reordered = updated.map((b, idx) => ({ ...b, ordem: idx + 1 }));
    setBanners(reordered);
  };

  const saveOrder = async () => {
    await Promise.all(
      banners.map((banner, idx) => {
        const fd = new FormData();
        fd.append("ordem", String(idx + 1));
        return fetch(`/api/v1/website/banner/${banner.id}`, {
          method: "PUT",
          body: fd,
        });
      })
    );
  };

  const publishBanner = async (id: string) => {
    const fd = new FormData();
    fd.append("publicado", "true");
    await fetch(`/api/v1/website/banner/${id}`, { method: "PUT", body: fd });
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("pt-BR");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as "web" | "mobile")}
          className="border rounded p-2"
        >
          <option value="web">Web</option>
          <option value="mobile">Mobile</option>
        </select>
        <div className="flex gap-2">
          <ButtonCustom
            onClick={openAddModal}
            disabled={banners.length >= 5}
          >
            Adicionar Slider
          </ButtonCustom>
          <ButtonCustom onClick={saveOrder} variant="secondary">
            Salvar Configurações
          </ButtonCustom>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Ordem</TableHead>
            <TableHead>Thumbnail</TableHead>
            <TableHead>Data de Upload</TableHead>
            <TableHead>Data da Modificação</TableHead>
            <TableHead>URL</TableHead>
            <TableHead className="w-40">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {banners.map((banner, index) => (
            <TableRow key={banner.id}>
              <TableCell>
                <div className="flex flex-col items-center">
                  <Icon
                    name="ChevronUp"
                    className="h-4 w-4 cursor-pointer"
                    onClick={() => moveBanner(index, "up")}
                  />
                  <Icon
                    name="ChevronDown"
                    className="h-4 w-4 cursor-pointer"
                    onClick={() => moveBanner(index, "down")}
                  />
                </div>
              </TableCell>
              <TableCell>
                <Image
                  src={banner.imagemUrl}
                  alt={banner.imagemTitulo || "banner"}
                  width={96}
                  height={48}
                  className="object-cover rounded"
                />
              </TableCell>
              <TableCell>{formatDate(banner.criadoEm)}</TableCell>
              <TableCell>{formatDate(banner.atualizadoEm)}</TableCell>
              <TableCell>
                {banner.link ? (
                  <a
                    href={banner.link}
                    target="_blank"
                    className="text-blue-600 underline"
                    rel="noreferrer"
                  >
                    {banner.link}
                  </a>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <ButtonCustom
                    size="sm"
                    variant="outline"
                    onClick={() => publishBanner(banner.id)}
                  >
                    Publicar
                  </ButtonCustom>
                  <ButtonCustom
                    size="sm"
                    variant="outline"
                    onClick={() => openEditModal(banner)}
                  >
                    Editar
                  </ButtonCustom>
                  <ButtonCustom
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(banner.id)}
                    disabled={banners.length <= 1}
                  >
                    Deletar
                  </ButtonCustom>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ModalCustom
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <ModalContentWrapper className="sm:max-w-lg">
          <ModalHeader>
            <ModalTitle>
              {editingBanner ? "Editar Slider" : "Adicionar Slider"}
            </ModalTitle>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <FormatSelector value={modalFormat} onChange={setModalFormat} />
            <div className="space-y-2">
              <InputCustom
                label="Upload do banner"
                id="imagem"
                type="file"
                onChange={(e) =>
                  setImageFile(e.target.files ? e.target.files[0] : null)
                }
              />
            </div>
            <div className="space-y-2">
              <InputCustom
                label="Link do banner (opcional)"
                id="link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <ButtonCustom
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </ButtonCustom>
            <ButtonCustom onClick={handleSubmit}>
              {editingBanner ? "Salvar" : "Adicionar"}
            </ButtonCustom>
          </ModalFooter>
        </ModalContentWrapper>
      </ModalCustom>
    </div>
  );
}

