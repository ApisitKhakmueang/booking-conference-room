import { DropBgProps } from "@/src/lib/interface/interface"

export default function DropBackground({ isOpen, isMobile, setIsOpen }: DropBgProps) {
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