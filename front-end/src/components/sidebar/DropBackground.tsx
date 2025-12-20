import { useRef } from "react";

type Props = {
  isOpen: boolean;
  isMobile: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function DropBackground({ isOpen, isMobile, setIsOpen }: Props) {
  return (
    <div>
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black opacity-50 z-10"
          onClick={() => setIsOpen(false)}>
        </div>
      )}
    </div>
  )
}