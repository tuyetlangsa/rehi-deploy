
// Extract data to separate file or constants
export const PRICING_DATA = {
  monthly: [
    {
      id:"3fa85f64-5717-4562-b3fc-2c963f66afa6",
      title: "Freemium",
      subtitle: "Perfect for new users",
      price: "Free",
      features: [
        "Basic note taking",
        "Save up to 10 articles per day",
        "Manual flashcard creation",
        "Unlimited access",
        "Cross device access",
      ],
    },
    {
      id:"3fa85f64-5717-4562-b3fc-2c963f66afa5",
      title: "Premium Individual",
      subtitle: "Ideal for university students or researchers",
      price: "$2.9/mth",
      features: [
        "Smart notes powered by AI",
        "Automatically generate flashcards with custom review questions",
        "Quick note formatting and PDF export",
        "Intelligent spaced repetition reminders",
        "Unlimited notes and learning materials",
      ],
    },
    {
      id:"3fa85f64-5717-4562-b3fc-2c963f66afa4",
      title: "Group Plan",
      subtitle: "Designed for study groups, academic teams, or collaborators",
      price: "$10/mth",
      features: [
        "All features of the Premium Individual",
        "Shared group note library",
        "Group flashcards and quizzes",
        "Personalized learning suggestions for each member",
        "Group learning performance dashboard",
      ],
    },
  ],
  yearly: [
    {
      id:"3fa85f64-5717-4562-b3fc-2c963f66afa3",
      title: "Premium Individual",
      subtitle: "Ideal for university students or researchers",
      price: "$29.9/year",
      features: [
        "Smart notes powered by AI",
        "Automatically generate flashcards, mind maps, and custom review questions",
        "Quick note translation and PDF export",
        "Intelligent spaced repetition reminders",
        "Unlimited notes and learning materials",
      ],
    },
    {
      id:"3fa85f64-5717-4562-b3fc-2c963f66afa2",
      title: "Business Plan",
      subtitle: "Tailored for schools, training centers, or organizations",
      price: "$18 - $24 per user/year",
      features: [
        "Centralized learning management system",
        "Admin dashboard to monitor team or department progress",
        "Role-based permission and access control",
        "Comprehensive customization for training goals",
        "Full onboarding and technical support for the entire organization",
      ],
    },
  ],
} as const;

// Admin emails are now loaded from the environment variable ADMIN_EMAILS (comma-separated)
export const ADMIN = (process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map(email => email.trim()) : []);