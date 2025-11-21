import { Metadata } from "next";
import { CourseCatalog } from "@/theme/website/components/course";

export const metadata: Metadata = {
  title: "Cursos | Advance+",
  description:
    "Explore nossa seleção de cursos profissionalizantes e de capacitação",
};

export default function CursosPage() {
  return <CourseCatalog />;
}
