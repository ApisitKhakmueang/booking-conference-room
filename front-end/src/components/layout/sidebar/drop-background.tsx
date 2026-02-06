import { DropBgProps } from "@/lib/interface/interface"

export default function DropBackground({ isOpen, isSmallDisplay, setIsOpen }: DropBgProps) {
  return (
    <div>
      {isOpen && isSmallDisplay && (
        <div 
          className="fixed inset-0 bg-black opacity-50 z-10"
          onClick={() => setIsOpen(false)}>
        </div>
      )}
    </div>
  )
}