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
  role: string
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
  variant: 'dark-purple' | 'danger'
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

type typeOperate = 'add' | 'update'

export interface ModalProps {
  isAddModalOpen: boolean
  setIsAddModalOpen: (status:boolean) => void
  typeOperate: typeOperate
  currentDate: Date
}

export interface FormModalProps {
  setIsAddModalOpen: (status:boolean) => void
  typeOperate: typeOperate
  rooms: ArrangeRoom[]
  currentDate: Date
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

export interface BookingEvent {
  id: string;
  title: string;
  date: string
  description: string;
  startTime: string; // เก็บแค่เวลาเพื่อความง่ายในการโชว์
  startAmpm: string;
  endTime: string,
  endAmpm: string
  room: string;
  status: 'Confirmed' | 'Pending';
  duration: number; // นาที
  // ข้อมูลเกี่ยวกับ guests อาจจะต้องปรับ structure ตามความเหมาะสม
  guestsCount?: number; 
}

export interface EventCardProps { 
  event: BookingEvent 
  setIsAddModalOpen: (status: boolean) => void
  setCurrentDate: (date: Date) => void
}