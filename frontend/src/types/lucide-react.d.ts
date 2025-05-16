declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  export interface LucideProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    absoluteStrokeWidth?: boolean;
  }
  export type LucideIcon = FC<LucideProps>;
  export const ArrowLeftIcon: LucideIcon;
  export const CheckSquareIcon: LucideIcon;
  export const EyeOffIcon: LucideIcon;
  export const LockIcon: LucideIcon;
  export const MailIcon: LucideIcon;
  export const UserIcon: LucideIcon;
  export const EyeIcon: LucideIcon;
  export const PhoneIcon: LucideIcon;
  export const CheckCircleIcon: LucideIcon;
  export const CakeIcon: LucideIcon;
  export const UsersIcon: LucideIcon;
  export const CameraIcon: LucideIcon;
  export const HeartIcon: LucideIcon;
  export const UserCheckIcon: LucideIcon;
  export const CreditCardIcon: LucideIcon;
  export const BuildingIcon: LucideIcon;
  export const BellIcon: LucideIcon;
  export const ClockIcon: LucideIcon;
  export const CheckCircleIcon: LucideIcon;
  export const MicIcon, ContactIcon, FileIcon, ImageIcon, MenuIcon, PencilIcon, TrashIcon, SendIcon, Volume2Icon, MessageCircleIcon, ChevronLeftIcon, ChevronRightIcon, XIcon, ActivityIcon, MusicIcon, MapPinIcon, LogOutIcon, CalendarIcon, MessageSquareIcon, FileTextIcon, SettingsIcon, AlertCircleIcon, PillIcon, BrainIcon, Trash2Icon, BookIcon, MessageSquareIcon, MapIcon, PlusIcon, CalendarIcon, BrainIcon, BellIcon, SettingsIcon: LucideIcon;
} 