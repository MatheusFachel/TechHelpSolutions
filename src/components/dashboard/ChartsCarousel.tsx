import { ReactNode } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ChartsCarouselProps {
  children: ReactNode[];
}

export const ChartsCarousel = ({ children }: ChartsCarouselProps) => {
  return (
    <>
      {/* Desktop: Grid normal */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-6">
        {children}
      </div>

      {/* Mobile/Tablet: Carousel */}
      <div className="lg:hidden">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {children.map((child, index) => (
              <CarouselItem key={index}>
                {child}
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center gap-2 mt-4">
            <CarouselPrevious className="static translate-y-0" />
            <CarouselNext className="static translate-y-0" />
          </div>
        </Carousel>
      </div>
    </>
  );
};
