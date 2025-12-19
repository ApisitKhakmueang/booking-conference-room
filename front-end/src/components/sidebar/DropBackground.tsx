import { useRef } from "react";

type Props = {
  isOpen: boolean;
  isMobile: boolean;
}

export default function DropBackground({ isOpen, isMobile }: Props) {
  const backgroundRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      {isOpen && isMobile && (
        <div 
          ref={backgroundRef}
          className="fixed inset-0 bg-black opacity-50 z-10"></div>
      )}
    </div>
  )
}