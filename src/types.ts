export interface ResumeData {
  fullName: string;
  location: string;
  phone: string;
  email: string;
  linkedin: string;
  github: string;
  professionalSummary: string[];
  technicalSkills: {
    programming: string[];
    visualization: string[];
    machineLearning: string[];
    dataManagement: string[];
    statisticalAnalysis: string[];
  };
  experience: {
    company: string;
    role: string;
    location: string;
    period: string;
    bullets: string[];
  }[];
  education: {
    degree: string;
    university: string;
    location: string;
    graduationYear: string;
    coursework: string[];
  }[];
  projects: {
    title: string;
    bullets: string[];
  }[];
  certifications: {
    name: string;
    organization: string;
    year: string;
  }[];
}

export const initialResumeData: ResumeData = {
  fullName: "Your Full Name",
  location: "City, State",
  phone: "(Your Phone Number)",
  email: "your.email@example.com",
  linkedin: "linkedin.com/in/yourprofile",
  github: "github.com/yourprofile",
  professionalSummary: [],
  technicalSkills: {
    programming: [],
    visualization: [],
    machineLearning: [],
    dataManagement: [],
    statisticalAnalysis: [],
  },
  experience: [],
  education: [],
  projects: [],
  certifications: [],
};
