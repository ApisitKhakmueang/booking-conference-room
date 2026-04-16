import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StatusSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function StatusSelector({ value, onChange }: StatusSelectorProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="status" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
        Status
      </label>
      <Select 
        value={value || undefined} 
        onValueChange={onChange} // 🌟 เรียกใช้ฟังก์ชันที่แม่ส่งมาให้เมื่อมีการเปลี่ยนค่า
      >
        <SelectTrigger 
          id="status"
          className="w-full h-[42px] px-3 py-2 border border-gray-200 dark:border-sidebar rounded-lg dark:bg-sidebar dark:text-white text-gray-800 focus:ring-1 focus:ring-dark-purple focus:border-dark-purple outline-none shadow-sm transition-all"
        >
          <SelectValue placeholder="Select status..." />
        </SelectTrigger>
        
        <SelectContent className="z-110 bg-white dark:bg-sidebar border-gray-200 dark:border-sidebar text-gray-800 dark:text-white rounded-lg shadow-lg">
          <SelectItem value="available" className="cursor-pointer focus:bg-light-purple focus:text-dark-purple dark:focus:bg-hover dark:focus:text-white transition-colors">
            Available
          </SelectItem>
          <SelectItem value="maintenance" className="cursor-pointer focus:bg-light-purple focus:text-dark-purple dark:focus:bg-hover dark:focus:text-white transition-colors">
            Maintenance
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}