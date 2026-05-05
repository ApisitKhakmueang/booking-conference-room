// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UserCard, { UserCardSkeleton } from './user-card';
import React from 'react';

// Mock useRouter
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('UserCard', () => {
  const mockUsers = [
    { id: '1', fullName: 'John Doe', email: 'john@example.com', status: 'active', role: 'ADMIN', avatarUrl: '' },
    { id: '2', fullName: 'Jane Smith', email: 'jane@example.com', status: 'inactive', role: 'MEMBER', avatarUrl: '' },
  ];

  const mockToggleStatus = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Should render all users', () => {
    render(<UserCard currentUsers={mockUsers} toggleStatus={mockToggleStatus} updatingIDs={[]} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('2. Should call router.push when eye icon is clicked', () => {
    render(<UserCard currentUsers={[mockUsers[0]]} toggleStatus={mockToggleStatus} updatingIDs={[]} />);
    // ปุ่ม Eye มักจะไม่มีข้อความ ต้องหาด้วย role หรือโครงสร้าง
    const eyeButton = screen.getByRole('button', { name: /View user details/i })
    
    fireEvent.click(eyeButton);
    expect(mockPush).toHaveBeenCalledWith('/user-management/1');
  });

  it('3. Should call toggleStatus when toggle button is clicked', () => {
    render(<UserCard currentUsers={[mockUsers[0]]} toggleStatus={mockToggleStatus} updatingIDs={[]} />);
    const toggleButton = screen.getByRole('button', { name: /Toggle user status/i })
    
    fireEvent.click(toggleButton);
    expect(mockToggleStatus).toHaveBeenCalledWith('1', 'active');
  });

  it('4. Should disable toggle button if user ID is in updatingIDs', () => {
    render(<UserCard currentUsers={mockUsers} toggleStatus={mockToggleStatus} updatingIDs={['1']} />);
    
    const buttons = screen.getAllByRole('button', { name: /toggle user status/i });
    const johnToggle = buttons[0]; // John
    const janeToggle = buttons[1]; // Jane 

    expect(johnToggle).toBeDisabled();
    expect(janeToggle).not.toBeDisabled();
  });
});

describe('UserCardSkeleton', () => {
  it('5. Should render 5 skeleton items', () => {
    const { container } = render(<UserCardSkeleton />);
    // หาจำนวนแถวที่มีคลาส animate-pulse[cite: 9]
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(5);
  });
});