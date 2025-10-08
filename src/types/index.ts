// Database Models
export interface Appointment {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  practice_area: PracticeAreaSlug;
  preferred_date: string;
  preferred_time: string;
  consultation_type: ConsultationType;
  case_description: string;
  status: AppointmentStatus;
  created_at: string;
  updated_at: string;
}

export interface PracticeArea {
  id: number;
  slug: PracticeAreaSlug;
  name: string;
  description: string;
  icon: string;
  active: boolean;
  created_at: string;
}

export interface Testimonial {
  id: number;
  name: string;
  image_url: string;
  rating: number;
  review: string;
  active: boolean;
  created_at: string;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'staff';
  active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

// Enums
export type PracticeAreaSlug = 
  | 'corporate-law'
  | 'litigation'
  | 'estate-planning'
  | 'real-estate'
  | 'family-law'
  | 'criminal-defense'
  | 'other';

export type ConsultationType = 'in-person' | 'video-call' | 'phone-call';

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

// Form Data Types
export interface AppointmentFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  practiceArea: PracticeAreaSlug;
  preferredDate: string;
  preferredTime: string;
  consultationType: ConsultationType;
  caseDescription: string;
  agreement: boolean;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AppointmentResponse extends ApiResponse {
  data?: {
    appointment: Appointment;
    appointmentId: number;
  };
}

export interface PracticeAreasResponse extends ApiResponse {
  data?: PracticeArea[];
}

export interface TestimonialsResponse extends ApiResponse {
  data?: Testimonial[];
}

// Component Props Types
export interface NavbarProps {
  className?: string;
}

export interface HeroProps {
  className?: string;
}

export interface PracticeAreaCardProps {
  practiceArea: PracticeArea;
  className?: string;
}

export interface TestimonialCardProps {
  testimonial: Testimonial;
  className?: string;
}

export interface ContactSectionProps {
  className?: string;
}

export interface AppointmentFormProps {
  onSubmit?: (data: AppointmentFormData) => void;
  loading?: boolean;
  className?: string;
}

// Utility Types
export interface ContactInfo {
  address: string;
  email: string;
  phone: string;
  businessHours: {
    weekdays: string;
    weekend: string;
  };
}

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  contact: ContactInfo;
}

// Error Types
export interface FormErrors {
  [key: string]: string | undefined;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Email Types
export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface AppointmentEmailData {
  appointment: Appointment;
  type: 'confirmation' | 'reminder' | 'cancellation';
}