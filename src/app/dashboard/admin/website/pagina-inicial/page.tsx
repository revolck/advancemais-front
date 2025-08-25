import { DashboardHeader } from '@/components/layout';
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
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Seção Sobre</h3>
            <p className="text-muted-foreground">
              Configure o conteúdo da seção sobre da página inicial.
            </p>
          </div>
          {/* Aqui você pode adicionar formulários para configurar a seção sobre */}
        </div>
      ),
    },
    {
      value: "banners",
      label: "Banners",
      icon: "Image",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Banners Promocionais</h3>
            <p className="text-muted-foreground">
              Gerencie os banners promocionais da página inicial.
            </p>
          </div>
          {/* Aqui você pode adicionar formulários para configurar banners */}
        </div>
      ),
    },
    {
      value: "empresarial",
      label: "Empresarial",
      icon: "Briefcase",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Seção Empresarial</h3>
            <p className="text-muted-foreground">
              Configure o conteúdo da seção empresarial.
            </p>
          </div>
          {/* Aqui você pode adicionar formulários para configurar a seção empresarial */}
        </div>
      ),
    },
  ];

  return (
    <div className='bg-white rounded-3xl p-5'>
      {/* Conteúdo principal com VerticalTabs */}
      <main className="flex-1">
        <VerticalTabs 
          items={items} 
          defaultValue="slider"
        />
      </main>
    </div>
  );
}