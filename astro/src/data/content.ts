import type { Project, ExperienceItem, SkillGroup, SocialLink } from "./types";

export const about = {
  intro: "Hi, I'm Sean Wallace",
  passage: "I glad you came to check out my website. I am a software developer that enjoys developing projects, playing games and learning japanese."
};

export const projects: Project[] = [
  {
    title: "Handmade By Claire",
    description: "A website for beautiful handmade works of art",
    tech: ["Astro", "TypeScript", "Sanity","Vercel"],
    image: "/images/HandmadeByClaire.png",
    liveUrl: "https://www.handmadebyclaire.com/",
    codeUrl: "https://github.com/Morewallam/HandmadebyClaire",
  },
  {
    title: "Plane Segmentation",
    description: "Find planes from aerial images",
    tech: ["Python", "Pytorch"],
    image: "/images/planeImage.jpg",
    codeUrl: "https://github.com/Morewallam/PlaneSegmentation",
  },
  {
    title: "Emotion Defender",
    description: "Use your expressions to hold off enemies",
    tech: ["Python","Pygame", "TensorFlow"],
    image: "/images/EmotionDefender.png",
    codeUrl: "https://github.com/Morewallam/EmotionDefender",
  },
];

export const experience: ExperienceItem[] = [
  {
    dates: "2019-2021",
    header:"British Columbia Institute of Technology",
    subheader:"CST Program",
    description:"Graduated from the Computer Systems Technoology Program at BCIT. Focusing on functional programming and web developemnt I learned about different ways of programming and how to worm with others to build real world projects."
  },
  {
    dates: "2022 May-Dec",
    header:"Fortinet",
    subheader:"Web Developer Intern",
    description:"I worked as a CO-OP for 8 months at Fortinet. I learned how to work in a real production envirnoment. This included working with git and managing pull requests and having to work with different teams to all come together to create something that is great for the customer. "
  },
  {
    dates: "2021-2024",
    header:"Simon Fraser University",
    subheader:"Computing Science, Math Minor",
    description:"Graduated from SFU at the end of 2024, focusing on machine learning, computer graphics and mathematics."
  }
];

export const skills: SkillGroup[] = [
  { category: "Languages", items: ["Python", "TypeScript", "C++", "C","Node.js", ] },
  { category: "Frameworks", items: ["Astro", "React", "Angular"] },
  { category: "Machine Learning", items: ["Pytorch", "TensorFlow", "sckit-learn", "pandas", "apache-spark"] },
  { category: "Tools", items: ["Git", "Figma", "Unity"] }
];


export const socials: SocialLink[] = [
  { label: "swallace987@gmail.com", url: "mailto:swallace987@gmail.com", icon: "envelope-solid-full" },
  { label: "seancwallace30", url: "https://www.linkedin.com/in/seancwallace30", icon: "linkedin-brands-solid" },
  { label: "Morewallam", url: "https://github.com/Morewallam", icon: "github-brands-solid" },
];
