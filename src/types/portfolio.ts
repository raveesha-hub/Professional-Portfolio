export interface SkillCategory {
  n: string;
  p?: number;
  i: string[];
}

export interface ProjectItem {
  id?: string;
  t: string;
  d: string;
  fullDesc?: string;
  link?: string;
  github?: string;
  demo?: string;
  tech?: string[];
  features?: string[];
  video?: string;
  videos?: string[];
  pics?: string[];
  order?: number;
  updatedAt?: string;
}

export interface AchievementItem {
  id?: string;
  t: string;
  d: string;
  date?: string;
  issuer?: string;
  link?: string;
  video?: string;
  videos?: string[];
  pics?: string[];
  order?: number;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  period: string;
  status?: string;
  description: string;
  highlights?: string[];
}

export interface JourneyMilestone {
  id: string;
  date: string;
  title: string;
  category: 'Education' | 'Project' | 'Achievement' | 'Skill';
  summary: string;
}

export interface ContactPhone {
  l?: string;
  v: string;
}

export interface ContactLink {
  l?: string;
  u: string;
}

export interface ContactQR {
  l?: string;
  src: string;
}

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read?: boolean;
}

export interface PortfolioData {
  name: string;
  role: string;
  uni: string;
  wel: string;
  about: string;
  pic: string;
  email: string;
  link: string;
  github?: string;
  linkedin?: string;
  careerGoals?: string;
  interests?: string[];
  skills: SkillCategory[];
  projects: ProjectItem[];
  achievements: AchievementItem[];
  education: EducationItem[];
  journey?: JourneyMilestone[];
  reflection: string;
  phones: ContactPhone[];
  links: ContactLink[];
  qrs: ContactQR[];
}
