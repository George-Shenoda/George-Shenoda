export type CvProfile = {
  name: string;
  headline: string;
  location: string;
  email: string;
};

export type CvLink = {
  label: string;
  href: string;
};

export type CvExperience = {
  role: string;
  company: string;
  period: string;
  highlights: string[];
};

export type CvEducation = {
  degree: string;
  school: string;
  period: string;
};

export type CvProject = {
  id: string;
  name: string;
  description: string;
  techstack: string[];
  link?: string;
};

export type CvSkillGroup = {
  label: string;
  items: string[];
};

export type CvCertification = {
  title: string;
  issuer: string;
  year: string;
};

export type CvLanguage = {
  name: string;
  level: string;
};

export type Cv = {
  profile: CvProfile;
  links: CvLink[];
  summary: string;
  experience: CvExperience[];
  education: CvEducation[];
  projects: CvProject[];
  skillGroups: CvSkillGroup[];
  certifications: CvCertification[];
  languages: CvLanguage[];
};

const cv: Cv = {
  profile: {
    name: "George Shenoda",
    headline: "Full-Stack Developer | Mechatronics Engineering Student",
    location: "Cairo, Egypt",
    email: "georgeshenoda@protonmail.com",
  },
  links: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/george-shenoda" },
    { label: "GitHub", href: "https://github.com/george-shenoda" },
  ],
  summary:
    "Full-stack developer bridging mechatronics and code. I build responsive web applications and automate business workflows end to end — from concept and architecture through deployment — with an engineer's discipline for data models, APIs, and clean handoffs.",
  experience: [
    {
      role: "Founder & Full-Stack Developer",
      company: "G-Stack",
      period: "Feb 2026 – May 2026",
      highlights: [
        "Designed, built, and shipped the Elevate Studio marketing website — responsive, animated, and conversion-focused.",
        "Built the G-Stack client portal: authentication, project tracking, and communication in one dashboard.",
        "Delivered a product landing page with lead capture wired into automated email workflows.",
      ],
    },
    {
      role: "IoT Intern",
      company: "Samsung Innovation Campus",
      period: "Aug 2025 – Oct 2025",
      highlights: [
        "Completed the intensive IoT track covering embedded systems, sensors, and connected devices.",
        "Built a smart office system linking hardware sensors to live dashboards over MQTT.",
        "Practiced structured prototyping: requirements, wiring, firmware, and cloud integration.",
      ],
    },
  ],
  education: [
    {
      degree: "B.Sc. Mechatronics Engineering",
      school: "Ain Shams University",
      period: "2024 – 2028 (expected)",
    },
  ],
  projects: [
    {
      id: "gvmt-marketplace",
      name: "GVMT Marketplace + Admin",
      description:
        "Full-stack marketplace with a dedicated admin dashboard: listings, moderation, and real-time order state.",
      techstack: ["Next.js", "TypeScript", "MongoDB", "Tailwind CSS"],
    },
    {
      id: "gstack-client-portal",
      name: "GStack Client Portal",
      description:
        "Client-facing portal for project tracking and communication, with role-based access and automated email notifications.",
      techstack: ["Next.js", "Node.js", "Nodemailer"],
    },
    {
      id: "elevate-studio",
      name: "Elevate Studio Website",
      description:
        "Marketing site for Elevate Studio — responsive layouts, scroll-driven reveals, and a lead-capture pipeline.",
      techstack: ["Next.js", "Tailwind CSS"],
    },
    {
      id: "iot-smart-office",
      name: "IoT Smart Office System",
      description:
        "Sensor network streaming environmental data over MQTT to a live monitoring dashboard.",
      techstack: ["ESP32", "MQTT", "React", "Node.js"],
    },
  ],
  skillGroups: [
    {
      label: "Frontend",
      items: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    },
    {
      label: "Backend",
      items: ["Node.js", "MongoDB", "REST APIs", "Nodemailer"],
    },
    {
      label: "Embedded & IoT",
      items: ["C/C++", "ESP32", "MQTT", "KNX"],
    },
    {
      label: "Tools & Platforms",
      items: ["Git / GitHub", "Vercel", "Expo / React Native", "Electron"],
    },
  ],
  certifications: [
    {
      title: "Embedded C: Hardware Essentials and Device Driver Development",
      issuer: "MaharaTech – ITIMooca",
      year: "2025",
    },
    {
      title: "Intro to IoT",
      issuer: "MaharaTech – ITIMooca",
      year: "2025",
    },
    {
      title: "C Programming",
      issuer: "MaharaTech – ITIMooca",
      year: "2025",
    },
    {
      title: "Basics of KNX",
      issuer: "Aviation – Ain Shams University",
      year: "2024",
    },
  ],
  languages: [
    { name: "Arabic", level: "Native" },
    { name: "English", level: "Professional working" },
    { name: "Italian", level: "Elementary" },
  ],
};

export { cv };
