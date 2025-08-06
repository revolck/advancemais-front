import { Suspense } from "react";
import { getAboutData } from "@/api/websites/components/about";
import AboutImage from "./components/AboutImage";
import AboutContent from "./components/AboutContent";

// Loading component
function AboutSkeleton() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image skeleton */}
          <div className="w-full h-96 bg-gray-200 rounded-lg animate-pulse" />

          {/* Content skeleton */}
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Main About component
async function AboutSection() {
  try {
    const aboutData = await getAboutData();

    return (
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AboutImage
              src={aboutData.src}
              alt={aboutData.title}
              width={600}
              height={400}
            />
            <AboutContent
              title={aboutData.title}
              description={aboutData.description}
            />
          </div>
        </div>
      </section>
    );
  } catch (error) {
    // Error boundary ou fallback
    return (
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-red-500">
            Erro ao carregar informações. Tente novamente mais tarde.
          </p>
        </div>
      </section>
    );
  }
}

// Export with Suspense wrapper
export default function About() {
  return (
    <Suspense fallback={<AboutSkeleton />}>
      <AboutSection />
    </Suspense>
  );
}
