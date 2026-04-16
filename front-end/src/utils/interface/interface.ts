import { BookingEventResponse, ConfigResponse, Holiday, RoomResp, User } from "./response";

export interface EachPageLayoutProps {
  pageName: string;
  children: React.ReactNode;
  className?: string;
}

export interface UserProfile {
  id: string
  email: string
  name?: string
  avatar?: string
  role: string,
  isGoogleData?: boolean
}

export interface UseProfileImageReturn {
  profileFile: File | null
  previewProfile: string
  error: string | null
  changeProfile: (e: React.ChangeEvent<HTMLInputElement>) => void
  setPreviewProfile: (url: string) => void
  cancelImage: () => void
}

export interface UseUsernameProps {
  username: string
  changeUsername: (username: string) => void
  cancelUsername: () => void
}

export interface UseEditProfileProps {
  username: string
  profileFile: File | null
  originalUsername?: string
  originalAvatar?: string
}

export interface SignInProps {
  isSignIn: boolean
}

export interface SignIn_SignUpProps {
  isSignIn: boolean
  title: string
  subTitle: string
}

export interface ShowPasswordProps {
  isShowPassword: boolean
  setIsShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface UserButtonProps {
  name: string
  onClick: () => void
  variant: 'purple' | 'danger'
}

export interface PasswordValidation {
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumber: boolean
  hasSpecial: boolean
  hasLength: boolean
}

export interface ValidateDetailProps {
  text: string,
  name: keyof PasswordValidation
}

export interface DisplayStrongPasswordProps {
  password: PasswordValidation
}

export type typeOperate = 'add' | 'update';

export interface BookingModalProps {
  isAddModalOpen: boolean
  setIsAddModalOpen: (status: boolean) => void
  typeOperate: 'add' | 'update'
  currentDate: Date
  setCurrentDate: (date: Date) => void
  selectedEvent?: BookingEvent
  onSuccess?: () => void // 🌟 เพิ่มบรรทัดนี้
  preselectedRoomNumber?: number | null;
}

export interface FormModalProps {
  setIsAddModalOpen: (status: boolean) => void
  typeOperate: 'add' | 'update'
  rooms: ArrangeRoom[]
  currentDate: Date
  setCurrentDate: (date: Date) => void
  selectedEvent?: BookingEvent
  onSuccess?: () => void // 🌟 เพิ่มบรรทัดนี้
  preselectedRoomNumber?: number | null;
}

export interface ArrangeRoom {
  id: string
  name: string
  roomNumber: number
}

export interface RoomSelectorProps {
  selectedRoom: ArrangeRoom | undefined;
  setSelectedRoom: (room: ArrangeRoom) => void;
  rooms: ArrangeRoom[];
  className?: string;
}

export type BookingStatus = 'Confirmed' | 'Completed' | 'Cancelled' | 'No Show';

export interface BookingEvent {
  id: string;
  title: string;
  passcode: string
  date: string
  startTime: string; // เก็บแค่เวลาเพื่อความง่ายในการโชว์
  endTime: string
  duration: string; // นาที
  room: ArrangeRoom | undefined;
  status: BookingStatus;
  user: User
}

export interface RenderEventGroupProps { 
  title: string;
  groupEvents: BookingEvent[];
  titleColor: string;
  handleEditClick: (event: BookingEvent) => void;
  setIsAddModalOpen: (status: boolean) => void;
  setCurrentDate: (date: Date) => void;
  fetchUserBookings: () => void;
}

export interface EventCardScheduleProps { 
  event: BookingEvent 
  setIsAddModalOpen: (status: boolean) => void
  setCurrentDate: (date: Date) => void
  onDeleteSuccess: () => void
}

export interface DesktopSidebarScheduleProps {
  currentDate: Date,
  setCurrentDate: (date: Date) => void 
  currentMonth: Date
  setCurrentMonth: (date: Date) => void
  events: BookingEvent[] | undefined
  className?: string
  selectedRooms: number[]
  setSelectedRooms: React.Dispatch<React.SetStateAction<number[]>>
}

export interface EventCardHistoryProps { 
  event: BookingEvent 
}

export interface DesktopSidebarHistoryProps {
  currentDate: Date,
  setCurrentDate: (date: Date) => void 
  events: BookingEvent[] | undefined
  className?: string
  selectedRooms: number[]
  setSelectedRooms: React.Dispatch<React.SetStateAction<number[]>>
}

type ViewType = 'month' | 'week' | 'day';
export interface MonthProps { 
  currentDate: Date, 
  bookings: BookingEventResponse[] | null, 
  holiday: Holiday[] | null 
  isSyncing: boolean
  setView: (view:ViewType) => void
  setCurrentDate: (date:Date) => void
  currentUser: UserProfile | null
}

export interface TimeGridViewProps { 
  setCurrentDate: (date: Date) => void
  currentDate: Date, 
  bookings: BookingEventResponse[] | null, 
  view: 'week' | 'day', 
  holiday: Holiday[] | null,
  isSyncing: boolean
  currentUser: UserProfile | null
}

export interface OccupyModalProps { 
  setIsOccupyModalOpen: (val: boolean) => void, 
  selectedBooking: BookingEventResponse
}

export interface ConfigProps {
  config: ConfigResponse
  setConfig: (config: ConfigResponse) => void
  isOpenEdit: boolean
}

export interface RoomListProps {
  rooms: RoomResp[]
  setRooms: React.Dispatch<React.SetStateAction<RoomResp[]>>
}

export interface RoomCardProps {
  room: RoomResp;
  onDelete: (id: string) => void;
}

export interface StatusSectionProps {
  rooms: RoomResp[]
}

export interface PaginationProps {
  rooms: RoomResp[],
  currentRooms: RoomResp[]
  currentPage: number
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>
}