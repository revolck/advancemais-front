export const preloadImages = (imageUrls: string[]): Promise<void[]> => {
  return Promise.all(
    imageUrls.map((url) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
      });
    })
  );
};

export const getOptimizedImageUrl = (
  baseUrl: string,
  isMobile: boolean,
  quality: number = 80
): string => {
  // Aqui você pode implementar lógica para otimização de imagens
  // Por exemplo, usando um CDN como Cloudinary ou similar
  const size = isMobile ? "w_768" : "w_1920";

  // Exemplo com Cloudinary (adapte conforme seu setup)
  // return `https://res.cloudinary.com/your-cloud/image/fetch/f_auto,q_${quality},${size}/${baseUrl}`;

  // Por enquanto, retorna a URL original
  return baseUrl;
};
