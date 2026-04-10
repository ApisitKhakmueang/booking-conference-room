import { useControlLayoutStore } from "@/stores/control-layout.store"
import { useShallow } from "zustand/shallow"

export default function DropBackground() {
  const { isOpenNav, isHideNav, setIsOpenNav } = useControlLayoutStore(
    useShallow(((state) => ({
      isOpenNav: state.isOpenNav,
      isHideNav: state.isHideNav,
      setIsOpenNav: state.setIsOpenNav
    })))
  )

  return (
    <div>
      {isOpenNav && isHideNav && (
        <div 
          className="fixed inset-0 bg-black opacity-50 z-80"
          onClick={() => setIsOpenNav(false)}>
        </div>
      )}
    </div>
  )
}