import { VerticalTabs, type VerticalTabItem } from "@/components/ui/custom";
import SliderList from "./slider/SliderList";

export default function PaginaInicialPage() {
  const items: VerticalTabItem[] = [
    {
      value: "slider",
      label: "Slider",
      icon: "Images",
      content: <SliderList />,
    },
    {
      value: "sobre",
      label: "Sobre",
      icon: "Info",
      content: "hello world",
    },
    {
      value: "banners",
      label: "Banners",
      icon: "Image",
      content: "hello world",
    },
    {
      value: "empresarial",
      label: "Empresarial",
      icon: "Briefcase",
      content: "hello world",
    },
  ];

  return <VerticalTabs items={items} />;
}

