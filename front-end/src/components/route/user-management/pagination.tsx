import { User } from "@/utils/interface/response";
import { ArrowLeft, ArrowRight } from "lucide-react";

const ITEMS_PER_PAGE = 5

interface PaginationProps {
  users: User[]
  currentPage: number
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>
}

export default function Pagination({ users, currentPage, setCurrentPage }: PaginationProps) {
  const totalUsers = users.length;
  const totalPages = Math.ceil(totalUsers / ITEMS_PER_PAGE);

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;

  // ฟังก์ชันเปลี่ยนหน้า
  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToPage = (page: number) => setCurrentPage(page);

  return (
    <div className="flex md:flex-row flex-col justify-between items-center gap-2 px-2 text-xs text-light-secondary dark:text-secondary font-bold uppercase tracking-widest border-t border-gray-100 dark:border-hover pt-3">
      <span>Displaying {users.length > 0 ? indexOfFirstItem + 1 : 0}-{Math.min(indexOfLastItem, users.length)} of {totalUsers} users</span>
      
      <div className="flex items-center md:gap-8 gap-2">
        <button 
          onClick={goToPrevPage}
          disabled={currentPage === 1}
          className="flex items-center gap-2 hover:text-light-main dark:hover:text-main transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Previous
        </button>
        
        <div className="flex items-center gap-2 text-sm font-semibold">
          {/* แสดงหมายเลขหน้า */}
          {Array.from({ length: totalPages }).map((_, index) => {
            const pageNum = index + 1;
            return (
                <button 
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                      currentPage === pageNum 
                        ? 'bg-dark-purple text-white' 
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
          Next <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}