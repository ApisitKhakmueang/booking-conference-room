// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RoomsGrid from './room-grid';
import { RoomResponse, BookingEventResponse } from '@/utils/interface/response';

// Mock Modals
vi.mock('@/components/utils/booking-modal', () => ({
  // 🌟 1. แก้ any เป็นระบุ Type ให้ชัดเจน
  default: ({ isAddModalOpen }: { isAddModalOpen: boolean }) => isAddModalOpen ? <div data-testid="mock-booking-modal" /> : null
}));
vi.mock('./occupy-modal', () => ({
  default: () => <div data-testid="mock-occupy-modal" />
}));

describe('RoomsGrid Component', () => {
  const mockRooms = [
    { id: '1', name: 'Room A', roomNumber: 101, capacity: 10, status: 'available' },
    { id: '2', name: 'Room B', roomNumber: 102, capacity: 20, status: 'occupied' },
    { id: '3', name: 'Room C', roomNumber: 103, capacity: 5, status: 'maintenance' }
  ] as unknown as RoomResponse[]; // 🌟 2. แก้ any เป็น Type จริง

  const mockBookings = [
    { id: 'b1', status: 'confirm', Room: { id: '2' } }
  ] as unknown as BookingEventResponse[]; // 🌟 3. แก้ any เป็น Type จริง

  beforeEach(() => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('1. Should render all rooms with their statuses', () => {
    render(<RoomsGrid displayRooms={mockRooms} bookings={mockBookings} />);
    
    expect(screen.getByText('Room A')).toBeInTheDocument();
    expect(screen.getByText('available')).toBeInTheDocument();
    expect(screen.getByText('Room B')).toBeInTheDocument();
    expect(screen.getByText('occupied')).toBeInTheDocument();
  });

  it('2. Should open BookingModal when an available room is clicked', () => {
    render(<RoomsGrid displayRooms={mockRooms} bookings={mockBookings} />);
    
    const availableRoom = screen.getByText('Room A');
    fireEvent.click(availableRoom);
    
    expect(screen.getByTestId('mock-booking-modal')).toBeInTheDocument();
  });

  it('3. Should open OccupyModal when an occupied room is clicked', () => {
    render(<RoomsGrid displayRooms={mockRooms} bookings={mockBookings} />);
    
    const occupiedRoom = screen.getByText('Room B');
    fireEvent.click(occupiedRoom);
    
    expect(screen.getByTestId('mock-occupy-modal')).toBeInTheDocument();
  });

  it('4. Should show alert when a maintenance room is clicked', () => {
    render(<RoomsGrid displayRooms={mockRooms} bookings={mockBookings} />);
    
    const maintenanceRoom = screen.getByText('Room C');
    fireEvent.click(maintenanceRoom);
    
    expect(window.alert).toHaveBeenCalledWith('This room is currently under maintenance.');
  });
});