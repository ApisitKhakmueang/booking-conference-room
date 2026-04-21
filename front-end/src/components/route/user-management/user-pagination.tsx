import { UserPaginationProps } from "@/utils/interface/interface"; // แก้ path ให้ตรงกับของคุณ
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function UserPagination({ 
  currentPage, setCurrentPage, totalPages, totalUsers, indexOfFirstItem, indexOfLastItem 
}: UserPaginationProps) {

  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToPage = (page: number) => setCurrentPage(page);

  return (
    <div className="flex md:flex-row flex-col justify-between items-center gap-4 px-2 text-xs text-light-secondary dark:text-secondary font-bold uppercase tracking-widest pt-2">
      {/* 🌟 แสดงตัวเลขจาก Backend ได้เลย */}
      <span>Displaying {totalUsers > 0 ? indexOfFirstItem : 0}-{Math.min(indexOfLastItem, totalUsers)} of {totalUsers} users</span>
      
      <div className="flex items-center md:gap-8 gap-4">
        <button 
          onClick={goToPrevPage}
          disabled={currentPage === 1}
          className="flex items-center gap-2 hover:text-light-main dark:hover:text-main transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Previous
        </button>
        
        <div className="flex items-center gap-2 text-sm font-semibold">
          {Array.from({ length: totalPages }).map((_, index) => {
            const pageNum = index + 1;
            return (
                <button 
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                      currentPage === pageNum 
                        ? 'bg-dark-purple text-white shadow-md' 
                        : 'text-light-secondary dark:text-secondary hover:bg-light-purple dark:hover:bg-hover hover:text-light-main dark:hover:text-main'
                  }`}
                >
                  {pageNum}
                </button>
            );
          })}
        </div>
        
        <button 
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className="flex items-center gap-2 hover:text-light-main dark:hover:text-main transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          Next <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}