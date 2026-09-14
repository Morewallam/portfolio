export interface Project {
  title: string;
  description: string;
  tech: string[];
  image: ImageMetadata;
  liveUrl?: string;
  codeUrl?: string;
  featured?: boolean;
}

export interface ExperienceItem {
  header: string;
  subheader: string;
  dates: string
  description: string;
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface SocialLink {
  label: string;
  url: string;
  icon: string;
}
