import { useEffect, useState } from 'react';

interface MockupImage {
  src: string;
  alt: string;
}

interface PhoneMockupCarouselProps {
  images: MockupImage[];
  autoplayMs?: number;
}

export default function PhoneMockupCarousel({
  images,
  autoplayMs = 3500,
}: PhoneMockupCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hasError, setHasError] = useState<Record<number, boolean>>({});

  // Pré-carrega todas as imagens no mount para não ter delay ao trocar
  useEffect(() => {
    images.forEach((img) => {
      const el = new Image();
      el.src = img.src;
    });
  }, [images]);

  // Auto-play
  useEffect(() => {
    if (isPaused || images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, autoplayMs);

    return () => clearInterval(timer);
  }, [isPaused, images.length, autoplayMs]);

  const goTo = (index: number) => {
    setCurrentIndex(index);
    setIsPaused(false);
  };

  return (
    <div className="relative w-full max-w-[240px] sm:max-w-[260px] md:max-w-[280px]">
      {/* Moldura do celular */}
      <div className="relative rounded-[2.5rem] bg-gray-900 p-3 shadow-2xl">
        {/* Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-4 md:w-24 md:h-5 bg-gray-900 rounded-b-2xl z-20" />

        {/* Tela */}
        <div
          className="relative rounded-[2rem] overflow-hidden bg-white aspect-[9/19.5]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {images.map((img, index) => (
            <div
              key={img.src}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {hasError[index] ? (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-50 to-gray-100 text-gray-400 text-xs text-center px-6">
                  <div>
                    <svg
                      className="w-10 h-10 mx-auto mb-3 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="M21 15l-3.086-3.086a2 2 0 00-2.828 0L6 21" />
                    </svg>
                    <p className="font-medium text-gray-500">Imagem não encontrada</p>
                    <p className="text-[10px] mt-1 break-all">{img.src}</p>
                  </div>
                </div>
              ) : (
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover"
                  onError={() =>
                    setHasError((prev) => ({ ...prev, [index]: true }))
                  }
                />
              )}
            </div>
          ))}

          {/* Dots de navegação */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-30 bg-black/20 backdrop-blur-sm rounded-full px-2 py-1.5">
              {images.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`Ver imagem ${index + 1}`}
                  className={`rounded-full transition-all ${
                    index === currentIndex
                      ? 'w-4 h-1.5 bg-white'
                      : 'w-1.5 h-1.5 bg-white/60 hover:bg-white/90'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sombra abaixo */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-gray-900/20 rounded-full blur-xl" />
    </div>
  );
}