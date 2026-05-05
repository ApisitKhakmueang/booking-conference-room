// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UserManagement from './user-management';

// ─── 1. Mock Dependencies ───────────────────────────────────────────────────

import { usePaginatedUsers } from '@/hooks/data/usePaginatedUsers';
import { adminService } from '@/service/booking.service';
import Swal from 'sweetalert2';

// Mock Custom Hook
vi.mock('@/hooks/data/usePaginatedUsers', () => ({
  usePaginatedUsers: vi.fn(),
}));

// Mock Service API
vi.mock('@/service/booking.service', () => ({
  adminService: { updateUserStatus: vi.fn() },
}));

// Mock SweetAlert2
vi.mock('sweetalert2', () => ({
  default: { fire: vi.fn() },
}));

// Mock Next Router (เผื่อ Component ลูกอย่าง UserCard เรียกใช้)
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('UserManagement Component', () => {
  const mockReloadUsers = vi.fn();

  // ข้อมูลจำลองสำหรับเทส (Mock Data)
  const mockUsersData = {
    data: [
      { id: '1', fullName: 'Apisit Dev', email: 'apisit@test.com', status: 'active', role: 'ADMIN', avatarUrl: '' },
      { id: '2', fullName: 'John Smith', email: 'john@test.com', status: 'inactive', role: 'MEMBER', avatarUrl: '' }
    ],
    meta: { totalPages: 2, totalItems: 10, indexOfFirstItem: 1, indexOfLastItem: 5 },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── 2. Rendering States ──────────────────────────────────────────────────

  it('1. Should render UserCardSkeleton when isLoadingUsers is true', () => {
    // จำลองสถานะกำลังโหลด
    (usePaginatedUsers as any).mockReturnValue({
      usersData: null,
      reloadUsers: mockReloadUsers,
      isLoadingUsers: true,
    });

    const { container } = render(<UserManagement />);
    // ตรวจสอบคลาส animate-pulse ที่เราเขียนไว้ใน Skeleton
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('2. Should display "No users available" when user list is empty', () => {
    // จำลองสถานะโหลดเสร็จ แต่ไม่มีข้อมูล
    (usePaginatedUsers as any).mockReturnValue({
      usersData: { data: [], meta: { totalPages: 1, totalItems: 0 } },
      reloadUsers: mockReloadUsers,
      isLoadingUsers: false,
    });

    render(<UserManagement />);
    expect(screen.getByText(/no users available/i)).toBeInTheDocument();
  });

  it('3. Should render UserCards when data is available', () => {
    // จำลองสถานะมีข้อมูลปกติ
    (usePaginatedUsers as any).mockReturnValue({
      usersData: mockUsersData,
      reloadUsers: mockReloadUsers,
      isLoadingUsers: false,
    });

    render(<UserManagement />);
    expect(screen.getByText('Apisit Dev')).toBeInTheDocument();
    expect(screen.getByText('John Smith')).toBeInTheDocument();
  });

  // ─── 3. Interactions ──────────────────────────────────────────────────────

  it('4. Should pass search term to the custom hook when typing in search input', async () => {
    (usePaginatedUsers as any).mockReturnValue({
      usersData: mockUsersData,
      reloadUsers: mockReloadUsers,
      isLoadingUsers: false,
    });

    render(<UserManagement />);
    
    const searchInput = screen.getByPlaceholderText(/search members.../i);
    await userEvent.type(searchInput, 'Apisit');

    // ตรวจสอบว่า hook ถูกเรียกใหม่ด้วยคำค้นหา "Apisit"
    expect(usePaginatedUsers).toHaveBeenCalledWith(1, 5, 'Apisit');
  });

  it('5. Should render UserPagination when totalPages > 1', () => {
    (usePaginatedUsers as any).mockReturnValue({
      usersData: mockUsersData, // มี 2 หน้า
      reloadUsers: mockReloadUsers,
      isLoadingUsers: false,
    });

    render(<UserManagement />);
    // เช็คว่ามีข้อความของ Pagination ปรากฏขึ้นมา
    expect(screen.getByText(/Displaying 1-5 of 10 users/i)).toBeInTheDocument();
  });

  // ─── 4. Async Actions & Error Handling ────────────────────────────────────

  it('6. Should call adminService and reloadUsers on successful status toggle', async () => {
    (usePaginatedUsers as any).mockReturnValue({
      usersData: mockUsersData,
      reloadUsers: mockReloadUsers,
      isLoadingUsers: false,
    });
    
    // จำลองการยิง API สำเร็จ
    (adminService.updateUserStatus as any).mockResolvedValue({});

    render(<UserManagement />);
    
    // ดึงปุ่ม Toggle ของ User คนแรก (Apisit Dev - 'active')
    const toggleButtons = screen.getAllByRole('button');
    // สมมติว่าปุ่มแรกสุดคือ Toggle ของคนแรก (ต้องระวังลำดับถ้าใน UserCard มีปุ่มอื่นแทรก)
    await userEvent.click(toggleButtons[0]);

    await waitFor(() => {
      // ตรวจสอบว่า API ถูกเรียกด้วย ID '1' และต้องการเปลี่ยนเป็น 'inactive'
      expect(adminService.updateUserStatus).toHaveBeenCalledWith('1', 'inactive');
      
      // ตรวจสอบว่าโหลดข้อมูลใหม่สำเร็จ
      expect(mockReloadUsers).toHaveBeenCalled();
    });
  });

  it('7. Should show SweetAlert error when status toggle API fails', async () => {
    (usePaginatedUsers as any).mockReturnValue({
      usersData: mockUsersData,
      reloadUsers: mockReloadUsers,
      isLoadingUsers: false,
    });
    
    // จำลองการยิง API พัง
    (adminService.updateUserStatus as any).mockRejectedValue(new Error('Network Error'));

    render(<UserManagement />);
    
    const toggleButtons = screen.getAllByRole('button');
    await userEvent.click(toggleButtons[0]);

    await waitFor(() => {
      // ตรวจสอบว่า Swal ถูกเรียกใช้เพื่อแจ้งเตือน Error
      expect(Swal.fire).toHaveBeenCalledWith('Error', 'Failed to update status', 'error');
    });
  });
});