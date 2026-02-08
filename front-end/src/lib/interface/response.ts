export interface Holiday {
  id?: number;              // int64 ใน Go มักจะใช้ number ใน TS
  updatedAt?: string | null; // *time.Time เป็น pointer และเป็น format ISO string
  date: string;            // DateRes (gorm:"type:date") มักส่งมาเป็น "YYYY-MM-DD"
  name: string;
  isDayOff: boolean | null; // *bool ใน Go สามารถเป็น true, false หรือ null ได้
  source?: string;
}