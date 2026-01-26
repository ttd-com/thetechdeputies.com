/**
 * @file courses.ts
 * @description Course data types, sample data, and utility functions.
 * In production, this would be replaced with database queries or CMS integration.
 */

export interface Course {
  /** Unique identifier / URL slug */
  slug: string;
  /** Course title */
  title: string;
  /** Short description for cards */
  shortDescription: string;
  /** Full description for course page */
  fullDescription: string;
  /** Course category */
  category: CourseCategory;
  /** Difficulty level */
  level: CourseLevel;
  /** Duration in minutes */
  durationMinutes: number;
  /** Price in cents (0 for free) */
  priceInCents: number;
  /** Course image URL */
  imageUrl?: string;
  /** Whether course is featured on homepage */
  featured: boolean;
  /** Course topics/modules */
  topics: string[];
  /** What students will learn */
  learningOutcomes: string[];
  /** Prerequisites (if any) */
  prerequisites?: string[];
  /** Instructor name */
  instructor?: string;
  /** Publication date */
  publishedAt: string;
}

export type CourseCategory =
  | "basics"
  | "devices"
  | "internet"
  | "security"
  | "productivity"
  | "advanced";

export type CourseLevel = "beginner" | "intermediate" | "advanced";

export const categoryLabels: Record<CourseCategory, string> = {
  basics: "Tech Basics",
  devices: "Devices & Hardware",
  internet: "Internet & Email",
  security: "Security & Privacy",
  productivity: "Productivity",
  advanced: "Advanced Topics",
};

export const levelLabels: Record<CourseLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

/**
 * Sample course data - replace with database/CMS in production
 */
export const sampleCourses: Course[] = [
  {
    slug: "computer-basics-101",
    title: "Computer Basics 101",
    shortDescription:
      "Learn the fundamentals of using a computer, from turning it on to managing files.",
    fullDescription:
      "This comprehensive beginner course covers everything you need to know to confidently use a computer. We'll start with the basics - turning on your computer, using a mouse and keyboard, and understanding the desktop. Then we'll move on to managing files and folders, using basic applications, and keeping your computer running smoothly.",
    category: "basics",
    level: "beginner",
    durationMinutes: 120,
    priceInCents: 4900,
    featured: true,
    topics: [
      "Getting Started with Your Computer",
      "Mouse and Keyboard Basics",
      "Understanding the Desktop",
      "Files and Folders",
      "Basic Troubleshooting",
    ],
    learningOutcomes: [
      "Confidently turn on, use, and shut down your computer",
      "Navigate the desktop and find applications",
      "Create, save, and organize files and folders",
      "Perform basic troubleshooting when things go wrong",
    ],
    instructor: "Sarah Tech",
    publishedAt: "2024-01-15",
  },
  {
    slug: "smartphone-mastery",
    title: "Smartphone Mastery",
    shortDescription:
      "Get the most out of your iPhone or Android device with this hands-on course.",
    fullDescription:
      "Your smartphone is a powerful tool - learn how to use it to its full potential! This course covers both iPhone and Android devices, teaching you how to customize settings, use essential apps, take great photos, and stay connected with friends and family.",
    category: "devices",
    level: "beginner",
    durationMinutes: 90,
    priceInCents: 3900,
    featured: true,
    topics: [
      "Phone Settings & Customization",
      "Essential Apps Everyone Needs",
      "Taking & Sharing Photos",
      "Texting, Calling & Video Chats",
      "Keeping Your Phone Secure",
    ],
    learningOutcomes: [
      "Customize your phone settings for comfort and accessibility",
      "Download and use essential apps confidently",
      "Take better photos and share them with loved ones",
      "Make video calls to stay connected",
    ],
    instructor: "Mike Mobile",
    publishedAt: "2024-02-01",
  },
  {
    slug: "email-essentials",
    title: "Email Essentials",
    shortDescription:
      "Master email communication - from setting up accounts to avoiding scams.",
    fullDescription:
      "Email is essential for modern communication. This course teaches you everything from setting up your first email account to organizing your inbox, writing professional emails, and most importantly - recognizing and avoiding email scams and phishing attempts.",
    category: "internet",
    level: "beginner",
    durationMinutes: 60,
    priceInCents: 2900,
    featured: false,
    topics: [
      "Setting Up Email Accounts",
      "Reading & Writing Emails",
      "Organizing Your Inbox",
      "Attachments & Photos",
      "Spotting Scams & Phishing",
    ],
    learningOutcomes: [
      "Set up and manage email accounts",
      "Write clear, professional emails",
      "Organize your inbox to find messages easily",
      "Identify and avoid email scams",
    ],
    instructor: "Sarah Tech",
    publishedAt: "2024-02-15",
  },
  {
    slug: "online-safety-security",
    title: "Online Safety & Security",
    shortDescription:
      "Protect yourself online with essential security practices and scam awareness.",
    fullDescription:
      "Stay safe in the digital world! This crucial course covers password management, recognizing scams, safe browsing habits, and protecting your personal information. Learn practical strategies to keep yourself and your family safe online.",
    category: "security",
    level: "beginner",
    durationMinutes: 90,
    priceInCents: 4900,
    featured: true,
    topics: [
      "Creating Strong Passwords",
      "Recognizing Online Scams",
      "Safe Browsing Habits",
      "Protecting Personal Information",
      "What To Do If Something Goes Wrong",
    ],
    learningOutcomes: [
      "Create and manage strong, unique passwords",
      "Recognize common online scams and phishing attempts",
      "Browse the internet safely and privately",
      "Know what to do if you suspect fraud",
    ],
    instructor: "Security Sam",
    publishedAt: "2024-03-01",
  },
  {
    slug: "video-calling-101",
    title: "Video Calling 101",
    shortDescription:
      "Connect with loved ones using Zoom, FaceTime, and other video calling apps.",
    fullDescription:
      "Video calls are a wonderful way to stay connected with family and friends. This course covers all the popular video calling platforms - Zoom, FaceTime, Google Meet, and more. Learn how to set up calls, troubleshoot common issues, and look your best on camera.",
    category: "internet",
    level: "beginner",
    durationMinutes: 60,
    priceInCents: 2900,
    featured: false,
    topics: [
      "Choosing a Video Platform",
      "Setting Up Your First Call",
      "Camera & Microphone Tips",
      "Troubleshooting Common Issues",
      "Group Calls & Virtual Gatherings",
    ],
    learningOutcomes: [
      "Choose the right video calling platform for your needs",
      "Set up and join video calls confidently",
      "Troubleshoot audio and video issues",
      "Host group calls with multiple participants",
    ],
    instructor: "Mike Mobile",
    publishedAt: "2024-03-15",
  },
  {
    slug: "social-media-basics",
    title: "Social Media Basics",
    shortDescription:
      "Navigate Facebook, Instagram, and more safely and confidently.",
    fullDescription:
      "Social media can help you stay connected, but it can also be overwhelming. This course teaches you the basics of popular platforms like Facebook and Instagram, with a strong focus on privacy settings and staying safe while enjoying social connections.",
    category: "internet",
    level: "beginner",
    durationMinutes: 90,
    priceInCents: 3900,
    featured: false,
    topics: [
      "Facebook Basics",
      "Instagram for Beginners",
      "Privacy Settings That Matter",
      "Sharing Photos Safely",
      "Avoiding Social Media Scams",
    ],
    learningOutcomes: [
      "Set up and use Facebook and Instagram accounts",
      "Adjust privacy settings to control who sees your posts",
      "Share photos and updates with friends and family",
      "Recognize and avoid social media scams",
    ],
    instructor: "Sarah Tech",
    publishedAt: "2024-04-01",
  },
];

/**
 * Get all courses
 */
export function getAllCourses(): Course[] {
  return sampleCourses;
}

/**
 * Get featured courses
 */
export function getFeaturedCourses(): Course[] {
  return sampleCourses.filter((course) => course.featured);
}

/**
 * Get course by slug
 */
export function getCourseBySlug(slug: string): Course | undefined {
  return sampleCourses.find((course) => course.slug === slug);
}

/**
 * Get courses by category
 */
export function getCoursesByCategory(category: CourseCategory): Course[] {
  return sampleCourses.filter((course) => course.category === category);
}

/**
 * Get all unique categories from courses
 */
export function getAllCategories(): CourseCategory[] {
  const categories = new Set(sampleCourses.map((course) => course.category));
  return Array.from(categories);
}

/**
 * Format price for display
 */
export function formatPrice(priceInCents: number): string {
  if (priceInCents === 0) return "Free";
  return `$${(priceInCents / 100).toFixed(2)}`;
}

/**
 * Format duration for display
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `${hours} hr`;
  return `${hours} hr ${remainingMinutes} min`;
}
