// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StatusPicker from './status-picker';

describe('StatusPicker Component', () => {
  const mockSetCurrentStatus = vi.fn();

  it('1. Should render current status label correctly', () => {
    render(<StatusPicker currentStatus="confirm" setCurrentStatus={mockSetCurrentStatus} />);
    // ต้องโชว์คำว่า Confirmed เพราะ currentStatus คือ 'confirm'[cite: 17]
    expect(screen.getByText('Confirmed')).toBeInTheDocument();
  });

  it('2. Should open dropdown when clicked and call setCurrentStatus on selection', () => {
    render(<StatusPicker currentStatus="all" setCurrentStatus={mockSetCurrentStatus} />);
    
    // กดปุ่มเพื่อเปิด Dropdown
    const triggerBtn = screen.getByRole('button', { name: /All Statuses/i });
    fireEvent.click(triggerBtn);
    
    // หาตัวเลือก 'Completed' แล้วกดคลิก
    const completeOption = screen.getByText('Completed');
    fireEvent.click(completeOption);

    // ตรวจสอบว่าฟังก์ชันถูกเรียกด้วยค่า 'complete'[cite: 17]
    expect(mockSetCurrentStatus).toHaveBeenCalledWith('complete');
  });

  it('3. Should close dropdown when clicking outside', () => {
    render(<StatusPicker currentStatus="all" setCurrentStatus={mockSetCurrentStatus} />);
    
    const triggerBtn = screen.getByRole('button', { name: /All Statuses/i });
    fireEvent.click(triggerBtn);
    
    // ตอนนี้ Dropdown ต้องเปิดอยู่ (มีคำว่า Completed โผล่มา)
    expect(screen.getByText('Completed')).toBeInTheDocument();

    // จำลองการคลิกพื้นที่ว่าง (Document)
    fireEvent.mouseDown(document);

    // Dropdown ต้องถูกปิดไปแล้ว (คำว่า Completed หายไป)[cite: 17]
    expect(screen.queryByText('Completed')).not.toBeInTheDocument();
  });
});