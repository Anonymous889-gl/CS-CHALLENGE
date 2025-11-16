// Comprehensive Interview Question Bank
// Organized by type and difficulty level

export interface Question {
  id: number
  text: string
  type: 'technical' | 'behavioral' | 'general'
  difficulty: 'easy' | 'medium' | 'hard'
  tips: string
  category?: string
}

export const interviewQuestions: Question[] = [
  // ==================== TECHNICAL QUESTIONS ====================
  
  // EASY Technical Questions
  {
    id: 1,
    text: "What is the difference between '==' and '===' in JavaScript?",
    type: "technical",
    difficulty: "easy",
    category: "JavaScript Fundamentals",
    tips: "Explain type coercion vs strict equality. Give examples with different data types."
  },
  {
    id: 2,
    text: "Explain what CSS Box Model is and its components.",
    type: "technical",
    difficulty: "easy",
    category: "CSS/Frontend",
    tips: "Describe content, padding, border, and margin. Draw or visualize if possible."
  },
  {
    id: 3,
    text: "What is the purpose of the 'git status' command?",
    type: "technical",
    difficulty: "easy",
    category: "Version Control",
    tips: "Explain how it shows tracked, untracked, and modified files in your repository."
  },
  {
    id: 4,
    text: "What is a REST API and what makes it RESTful?",
    type: "technical",
    difficulty: "easy",
    category: "Web Development",
    tips: "Cover HTTP methods, stateless nature, and resource-based URLs."
  },
  {
    id: 5,
    text: "Explain the difference between frontend and backend development.",
    type: "technical",
    difficulty: "easy",
    category: "General Programming",
    tips: "Discuss client vs server-side, technologies used, and responsibilities."
  },

  // MEDIUM Technical Questions
  {
    id: 6,
    text: "How would you optimize a slow-performing database query?",
    type: "technical",
    difficulty: "medium",
    category: "Database",
    tips: "Discuss indexing, query optimization, EXPLAIN plans, and N+1 problems."
  },
  {
    id: 7,
    text: "Explain the concept of closures in JavaScript with an example.",
    type: "technical",
    difficulty: "medium",
    category: "JavaScript Advanced",
    tips: "Show how inner functions access outer variables. Mention practical use cases."
  },
  {
    id: 8,
    text: "What is the difference between SQL and NoSQL databases?",
    type: "technical",
    difficulty: "medium",
    category: "Database",
    tips: "Compare structure, scalability, ACID properties, and use cases for each."
  },
  {
    id: 9,
    text: "How do you handle state management in a React application?",
    type: "technical",
    difficulty: "medium",
    category: "React/Frontend",
    tips: "Discuss useState, useReducer, Context API, and external libraries like Redux."
  },
  {
    id: 10,
    text: "Explain the concept of 'Promise' in JavaScript and how it differs from callbacks.",
    type: "technical",
    difficulty: "medium",
    category: "JavaScript Advanced",
    tips: "Cover async/await, promise chaining, and how it solves callback hell."
  },

  // HARD Technical Questions
  {
    id: 11,
    text: "Design a scalable system for handling millions of concurrent users.",
    type: "technical",
    difficulty: "hard",
    category: "System Design",
    tips: "Consider load balancing, caching, database sharding, CDNs, and microservices."
  },
  {
    id: 12,
    text: "How would you implement a real-time chat application with typing indicators?",
    type: "technical",
    difficulty: "hard",
    category: "System Design",
    tips: "Discuss WebSockets, event handling, message queuing, and state synchronization."
  },
  {
    id: 13,
    text: "Explain how you would handle a memory leak in a production application.",
    type: "technical",
    difficulty: "hard",
    category: "Performance",
    tips: "Cover profiling tools, common causes, monitoring, and prevention strategies."
  },
  {
    id: 14,
    text: "Design a caching strategy for a high-traffic e-commerce website.",
    type: "technical",
    difficulty: "hard",
    category: "System Design",
    tips: "Discuss cache layers, invalidation strategies, CDN, database caching, and consistency."
  },
  {
    id: 15,
    text: "How would you handle auth in microservices?",
    type: "technical",
    difficulty: "hard",
    category: "Security/Architecture",
    tips: "Cover JWT tokens, OAuth, API gateways, and service-to-service authentication."
  },

  // ==================== BEHAVIORAL QUESTIONS ====================
  
  // EASY Behavioral Questions
  {
    id: 16,
    text: "Tell me about yourself and your background in technology.",
    type: "behavioral",
    difficulty: "easy",
    category: "Introduction",
    tips: "Keep it professional, relevant, and concise. Focus on your journey and motivations."
  },
  {
    id: 17,
    text: "Why are you interested in working for our company?",
    type: "behavioral",
    difficulty: "easy",
    category: "Motivation",
    tips: "Research the company values, products, and culture. Show genuine interest."
  },
  {
    id: 18,
    text: "Describe your ideal work environment.",
    type: "behavioral",
    difficulty: "easy",
    category: "Work Style",
    tips: "Be honest but align with the company culture. Mention collaboration and growth."
  },
  {
    id: 19,
    text: "What motivates you in your work?",
    type: "behavioral",
    difficulty: "easy",
    category: "Motivation",
    tips: "Connect personal drivers to professional growth and impact."
  },
  {
    id: 20,
    text: "How do you stay updated with new technologies and industry trends?",
    type: "behavioral",
    difficulty: "easy",
    category: "Learning",
    tips: "Mention specific resources, communities, courses, or conferences you follow."
  },

  // MEDIUM Behavioral Questions
  {
    id: 21,
    text: "Tell me about a time when you had to work with a difficult team member.",
    type: "behavioral",
    difficulty: "medium",
    category: "Teamwork",
    tips: "Use STAR method. Focus on communication, understanding, and positive resolution."
  },
  {
    id: 22,
    text: "Describe a project where you had to learn a new technology quickly.",
    type: "behavioral",
    difficulty: "medium",
    category: "Learning",
    tips: "Highlight your learning process, resources used, and successful implementation."
  },
  {
    id: 23,
    text: "Tell me about a time when you made a mistake in your code. How did you handle it?",
    type: "behavioral",
    difficulty: "medium",
    category: "Problem Solving",
    tips: "Show accountability, learning, and prevention measures you put in place."
  },
  {
    id: 24,
    text: "How do you explain technical concepts to non-technical people?",
    type: "behavioral",
    difficulty: "medium",
    category: "Communication",
    tips: "Demonstrate simplification skills, patience, and effective communication strategies."
  },
  {
    id: 25,
    text: "Tell me about a time when you disagreed with your manager or team lead.",
    type: "behavioral",
    difficulty: "medium",
    category: "Conflict Resolution",
    tips: "Show respectful disagreement, presenting alternatives, and collaborative solutions."
  },

  // HARD Behavioral Questions
  {
    id: 26,
    text: "How do you handle competing priorities and tight deadlines?",
    type: "behavioral",
    difficulty: "hard",
    category: "Time Management",
    tips: "Discuss prioritization frameworks, communication with stakeholders, and stress management."
  },
  {
    id: 27,
    text: "How do you make technical decisions with incomplete info?",
    type: "behavioral",
    difficulty: "hard",
    category: "Decision Making",
    tips: "Show analytical thinking, risk assessment, and contingency planning."
  },
  {
    id: 28,
    text: "How do you convince your team to adopt new technology?",
    type: "behavioral",
    difficulty: "hard",
    category: "Leadership",
    tips: "Demonstrate influence skills, building consensus, and managing resistance to change."
  },
  {
    id: 29,
    text: "Describe the most challenging bug you've ever debugged. How did you solve it?",
    type: "behavioral",
    difficulty: "hard",
    category: "Problem Solving",
    tips: "Show systematic approach, persistence, and problem-solving methodology."
  },
  {
    id: 30,
    text: "How do you balance technical debt with deadlines?",
    type: "behavioral",
    difficulty: "hard",
    category: "Technical Leadership",
    tips: "Balance business needs with code quality, communication with stakeholders."
  },

  // ==================== GENERAL QUESTIONS ====================
  
  // EASY General Questions
  {
    id: 31,
    text: "What are your greatest strengths as a developer?",
    type: "general",
    difficulty: "easy",
    category: "Self Assessment",
    tips: "Pick 2-3 relevant strengths and provide specific examples of how they benefit your work."
  },
  {
    id: 32,
    text: "Where do you see yourself in 5 years?",
    type: "general",
    difficulty: "easy",
    category: "Career Goals",
    tips: "Show ambition while staying relevant to the role and company growth path."
  },
  {
    id: 33,
    text: "What type of projects do you enjoy working on the most?",
    type: "general",
    difficulty: "easy",
    category: "Interests",
    tips: "Align your interests with the company's projects and demonstrate passion."
  },
  {
    id: 34,
    text: "How do you handle feedback and criticism?",
    type: "general",
    difficulty: "easy",
    category: "Growth Mindset",
    tips: "Show openness to learning, professionalism, and using feedback for improvement."
  },
  {
    id: 35,
    text: "What questions do you have about this role or our company?",
    type: "general",
    difficulty: "easy",
    category: "Engagement",
    tips: "Ask thoughtful questions about growth, team dynamics, challenges, and company culture."
  },

  // MEDIUM General Questions
  {
    id: 36,
    text: "What's your greatest weakness?",
    type: "general",
    difficulty: "medium",
    category: "Self Assessment",
    tips: "Be honest but show self-awareness and active improvement efforts."
  },
  {
    id: 37,
    text: "How do you balance speed of delivery with code quality?",
    type: "general",
    difficulty: "medium",
    category: "Work Philosophy",
    tips: "Show understanding of business needs while maintaining professional standards."
  },
  {
    id: 38,
    text: "Describe your experience working in an Agile environment.",
    type: "general",
    difficulty: "medium",
    category: "Methodology",
    tips: "Discuss sprints, standups, retrospectives, and how Agile benefits development."
  },
  {
    id: 39,
    text: "How do you approach mentoring junior developers?",
    type: "general",
    difficulty: "medium",
    category: "Leadership",
    tips: "Show patience, teaching ability, and investment in team growth."
  },
  {
    id: 40,
    text: "What would you do if you were assigned to a project using technologies you've never used?",
    type: "general",
    difficulty: "medium",
    category: "Adaptability",
    tips: "Demonstrate learning agility, research skills, and proactive approach."
  },

  // HARD General Questions
  {
    id: 41,
    text: "How do you evaluate and choose between different technical solutions?",
    type: "general",
    difficulty: "hard",
    category: "Technical Decision Making",
    tips: "Show systematic evaluation: performance, maintainability, team skills, and business impact."
  },
  {
    id: 42,
    text: "Describe your approach to code reviews. What do you look for?",
    type: "general",
    difficulty: "hard",
    category: "Code Quality",
    tips: "Cover functionality, readability, performance, security, and providing constructive feedback."
  },
  {
    id: 43,
    text: "How do you handle disagreements about technical architecture decisions?",
    type: "general",
    difficulty: "hard",
    category: "Technical Leadership",
    tips: "Show diplomatic conflict resolution, evidence-based arguments, and team consensus building."
  },
  {
    id: 44,
    text: "What's your philosophy on testing? How much is enough?",
    type: "general",
    difficulty: "hard",
    category: "Quality Assurance",
    tips: "Balance thorough testing with development speed, risk assessment, and different testing types."
  },
  {
    id: 45,
    text: "How would you onboard and integrate a new team member effectively?",
    type: "general",
    difficulty: "hard",
    category: "Team Leadership",
    tips: "Show structured approach: documentation, mentoring, gradual responsibility increase, and cultural integration."
  },
  
  // More EASY Technical Questions
  {
    id: 46,
    text: "What is the difference between let, const, and var in JavaScript?",
    type: "technical",
    difficulty: "easy",
    category: "JavaScript Fundamentals",
    tips: "Explain scope differences, hoisting behavior, and when to use each."
  },
  {
    id: 47,
    text: "What is the purpose of package.json in a Node.js project?",
    type: "technical",
    difficulty: "easy",
    category: "Node.js/Backend",
    tips: "Discuss dependencies, scripts, versioning, and project metadata."
  },
  {
    id: 48,
    text: "Explain what responsive design means in web development.",
    type: "technical",
    difficulty: "easy",
    category: "CSS/Frontend",
    tips: "Cover media queries, flexible layouts, mobile-first approach."
  },
  {
    id: 49,
    text: "What is the difference between GET and POST HTTP methods?",
    type: "technical",
    difficulty: "easy",
    category: "Web Development",
    tips: "Explain data transmission, security, caching, and use cases."
  },
  {
    id: 50,
    text: "What is a callback function in JavaScript?",
    type: "technical",
    difficulty: "easy",
    category: "JavaScript Fundamentals",
    tips: "Explain asynchronous operations, event handling, and provide examples."
  },

  // More MEDIUM Technical Questions
  {
    id: 51,
    text: "Explain the concept of middleware in Express.js.",
    type: "technical",
    difficulty: "medium",
    category: "Node.js/Backend",
    tips: "Discuss request-response cycle, next(), and common middleware uses like authentication."
  },
  {
    id: 52,
    text: "What are the differences between SQL and NoSQL databases?",
    type: "technical",
    difficulty: "medium",
    category: "Databases",
    tips: "Compare structure, scalability, use cases, ACID vs BASE properties."
  },
  {
    id: 53,
    text: "How would you optimize a slow-loading web page?",
    type: "technical",
    difficulty: "medium",
    category: "Performance",
    tips: "Discuss lazy loading, code splitting, caching, image optimization, CDN."
  },
  {
    id: 54,
    text: "Explain the concept of Docker containers and their benefits.",
    type: "technical",
    difficulty: "medium",
    category: "DevOps",
    tips: "Cover isolation, portability, consistency across environments, microservices."
  },
  {
    id: 55,
    text: "What is the difference between authentication and authorization?",
    type: "technical",
    difficulty: "medium",
    category: "Security",
    tips: "Explain identity verification vs access control, JWT, OAuth, role-based access."
  },

  // More HARD Technical Questions
  {
    id: 56,
    text: "Design a scalable URL shortening service like bit.ly.",
    type: "technical",
    difficulty: "hard",
    category: "System Design",
    tips: "Discuss hashing algorithms, database design, caching, load balancing, analytics."
  },
  {
    id: 57,
    text: "How would you implement real-time features in a web application?",
    type: "technical",
    difficulty: "hard",
    category: "Architecture",
    tips: "Compare WebSockets, Server-Sent Events, polling, scaling considerations."
  },
  {
    id: 58,
    text: "Explain how you would handle database migrations in a production system.",
    type: "technical",
    difficulty: "hard",
    category: "Database Management",
    tips: "Discuss zero-downtime deployment, rollback strategies, version control, testing."
  },
  {
    id: 59,
    text: "Design a rate limiting system for an API.",
    type: "technical",
    difficulty: "hard",
    category: "System Design",
    tips: "Cover algorithms (token bucket, sliding window), distributed systems, Redis implementation."
  },
  {
    id: 60,
    text: "How would you debug a memory leak in a Node.js application?",
    type: "technical",
    difficulty: "hard",
    category: "Debugging/Performance",
    tips: "Discuss heap snapshots, profiling tools, common causes, garbage collection."
  },

  // ==================== ADDITIONAL BEHAVIORAL QUESTIONS ====================
  
  // More EASY Behavioral Questions
  {
    id: 61,
    text: "Tell me about a time when you had to learn something quickly.",
    type: "behavioral",
    difficulty: "easy",
    category: "Learning Agility",
    tips: "Use STAR method, show resourcefulness and effective learning strategies."
  },
  {
    id: 62,
    text: "Describe a situation where you helped a teammate.",
    type: "behavioral",
    difficulty: "easy",
    category: "Collaboration",
    tips: "Demonstrate teamwork, empathy, and positive impact on team dynamics."
  },
  {
    id: 63,
    text: "Tell me about a project you're particularly proud of.",
    type: "behavioral",
    difficulty: "easy",
    category: "Achievement",
    tips: "Show passion, technical skills, problem-solving, and measurable outcomes."
  },
  {
    id: 64,
    text: "How do you prioritize tasks when you have multiple deadlines?",
    type: "behavioral",
    difficulty: "easy",
    category: "Time Management",
    tips: "Discuss prioritization frameworks, communication with stakeholders, adaptability."
  },
  {
    id: 65,
    text: "Describe your typical day or week as a developer.",
    type: "behavioral",
    difficulty: "easy",
    category: "Work Style",
    tips: "Show balance of coding, meetings, planning, learning, and team collaboration."
  },

  // More MEDIUM Behavioral Questions
  {
    id: 66,
    text: "Tell me about a time when you had to give difficult feedback to a colleague.",
    type: "behavioral",
    difficulty: "medium",
    category: "Communication",
    tips: "Show empathy, constructive approach, positive outcome, relationship maintenance."
  },
  {
    id: 67,
    text: "Describe a situation where you had to work with unclear requirements.",
    type: "behavioral",
    difficulty: "medium",
    category: "Problem Solving",
    tips: "Demonstrate initiative in seeking clarity, iterative approach, stakeholder management."
  },
  {
    id: 68,
    text: "Tell me about a time when you missed a deadline. How did you handle it?",
    type: "behavioral",
    difficulty: "medium",
    category: "Accountability",
    tips: "Show ownership, communication, learning, and preventive measures taken."
  },
  {
    id: 69,
    text: "Describe a situation where you had to advocate for a technical decision.",
    type: "behavioral",
    difficulty: "medium",
    category: "Influence",
    tips: "Show data-driven arguments, stakeholder alignment, business impact consideration."
  },
  {
    id: 70,
    text: "Tell me about a time when you received criticism about your work.",
    type: "behavioral",
    difficulty: "medium",
    category: "Growth Mindset",
    tips: "Demonstrate receptiveness, reflection, improvement actions, positive attitude."
  },

  // More HARD Behavioral Questions
  {
    id: 71,
    text: "Tell me about a time when you had to make a trade-off between technical excellence and business needs.",
    type: "behavioral",
    difficulty: "hard",
    category: "Strategic Thinking",
    tips: "Show balanced judgment, stakeholder communication, long-term thinking, pragmatism."
  },
  {
    id: 72,
    text: "Describe a situation where you led a technical initiative without formal authority.",
    type: "behavioral",
    difficulty: "hard",
    category: "Leadership",
    tips: "Demonstrate influence, vision, team mobilization, measuring success."
  },
  {
    id: 73,
    text: "Tell me about a time when you had to deal with a major production incident.",
    type: "behavioral",
    difficulty: "hard",
    category: "Crisis Management",
    tips: "Show calm under pressure, systematic debugging, communication, post-mortem learning."
  },
  {
    id: 74,
    text: "Describe a situation where you had to balance multiple stakeholders with conflicting priorities.",
    type: "behavioral",
    difficulty: "hard",
    category: "Stakeholder Management",
    tips: "Show negotiation skills, data-driven decisions, transparent communication, win-win solutions."
  },
  {
    id: 75,
    text: "Tell me about a time when you identified and drove a major process improvement.",
    type: "behavioral",
    difficulty: "hard",
    category: "Process Improvement",
    tips: "Demonstrate initiative, change management, measuring impact, team buy-in."
  },

  
  // More General Questions (mixed difficulty)
  {
    id: 76,
    text: "Why did you choose software development as a career?",
    type: "general",
    difficulty: "easy",
    category: "Motivation",
    tips: "Show genuine passion, specific experiences that led you here, long-term commitment."
  },
  {
    id: 77,
    text: "How do you handle work-life balance in a demanding role?",
    type: "general",
    difficulty: "medium",
    category: "Work-Life Balance",
    tips: "Show healthy boundaries, productivity strategies, self-care, sustainable work habits."
  },
  {
    id: 78,
    text: "Where do you see the tech industry heading in the next 5 years?",
    type: "general",
    difficulty: "medium",
    category: "Industry Awareness",
    tips: "Show awareness of trends, thoughtful analysis, how you're preparing for changes."
  },
  {
    id: 79,
    text: "What factors are most important to you when evaluating a new job opportunity?",
    type: "general",
    difficulty: "easy",
    category: "Career Goals",
    tips: "Be honest about priorities: growth, culture, technology, compensation, mission."
  },
  {
    id: 80,
    text: "How do you define success in your role?",
    type: "general",
    difficulty: "medium",
    category: "Self Assessment",
    tips: "Show balance of technical excellence, business impact, team contribution, personal growth."
  }
]

// Helper function to get questions by criteria
export const getQuestionsByType = (type: 'technical' | 'behavioral' | 'general', difficulty?: 'easy' | 'medium' | 'hard') => {
  return interviewQuestions.filter(q => 
    q.type === type && (difficulty ? q.difficulty === difficulty : true)
  )
}

// Helper function to get random questions
export const getRandomQuestions = (type: 'technical' | 'behavioral' | 'general', difficulty: 'easy' | 'medium' | 'hard', count: number) => {
  const filtered = getQuestionsByType(type, difficulty)
  const shuffled = [...filtered].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

// Structured interview progressions for each type and difficulty
// Questions follow logical interview flow from introductory to advanced
export const getStructuredQuestions = (type: 'technical' | 'behavioral' | 'general', difficulty: 'easy' | 'medium' | 'hard', count: number = 5) => {
  
  const structuredFlow = {
    technical: {
      easy: [
        // Foundation knowledge first
        { ...interviewQuestions.find(q => q.id === 5)! }, // Frontend vs Backend (intro)
        { ...interviewQuestions.find(q => q.id === 1)! }, // JS == vs === (fundamentals)
        { ...interviewQuestions.find(q => q.id === 4)! }, // REST API basics
        { ...interviewQuestions.find(q => q.id === 3)! }, // Version control (git)
        { ...interviewQuestions.find(q => q.id === 2)! }, // CSS Box Model
      ],
      medium: [
        // Building on fundamentals
        { ...interviewQuestions.find(q => q.id === 7)! }, // JS Closures (advanced concepts)
        { ...interviewQuestions.find(q => q.id === 10)! }, // Promises vs Callbacks 
        { ...interviewQuestions.find(q => q.id === 9)! }, // React state management
        { ...interviewQuestions.find(q => q.id === 6)! }, // Database optimization
        { ...interviewQuestions.find(q => q.id === 8)! }, // SQL vs NoSQL
      ],
      hard: [
        // Architecture and system design
        { ...interviewQuestions.find(q => q.id === 11)! }, // Scalable systems
        { ...interviewQuestions.find(q => q.id === 15)! }, // Microservices auth
        { ...interviewQuestions.find(q => q.id === 14)! }, // Caching strategy
        { ...interviewQuestions.find(q => q.id === 12)! }, // Real-time chat
        { ...interviewQuestions.find(q => q.id === 13)! }, // Memory leaks
      ]
    },
    behavioral: {
      easy: [
        // Getting to know the candidate
        { ...interviewQuestions.find(q => q.id === 16)! }, // Tell me about yourself
        { ...interviewQuestions.find(q => q.id === 17)! }, // Why our company
        { ...interviewQuestions.find(q => q.id === 19)! }, // What motivates you
        { ...interviewQuestions.find(q => q.id === 20)! }, // How you stay updated
        { ...interviewQuestions.find(q => q.id === 18)! }, // Ideal work environment
      ],
      medium: [
        // Situational and teamwork
        { ...interviewQuestions.find(q => q.id === 22)! }, // Learning new technology
        { ...interviewQuestions.find(q => q.id === 21)! }, // Difficult team member
        { ...interviewQuestions.find(q => q.id === 23)! }, // Code mistake handling
        { ...interviewQuestions.find(q => q.id === 24)! }, // Explaining technical concepts
        { ...interviewQuestions.find(q => q.id === 25)! }, // Disagreeing with manager
      ],
      hard: [
        // Leadership and complex situations
        { ...interviewQuestions.find(q => q.id === 26)! }, // Competing priorities
        { ...interviewQuestions.find(q => q.id === 27)! }, // Decisions with incomplete info
        { ...interviewQuestions.find(q => q.id === 29)! }, // Most challenging bug
        { ...interviewQuestions.find(q => q.id === 28)! }, // Convincing team on new tech
        { ...interviewQuestions.find(q => q.id === 30)! }, // Technical debt vs deadlines
      ]
    },
    general: {
      easy: [
        // Self-awareness and goals
        { ...interviewQuestions.find(q => q.id === 31)! }, // Greatest strengths
        { ...interviewQuestions.find(q => q.id === 33)! }, // Projects you enjoy
        { ...interviewQuestions.find(q => q.id === 34)! }, // Handling feedback
        { ...interviewQuestions.find(q => q.id === 32)! }, // 5-year goals
        { ...interviewQuestions.find(q => q.id === 35)! }, // Questions about role
      ],
      medium: [
        // Work style and experience
        { ...interviewQuestions.find(q => q.id === 36)! }, // Greatest weakness
        { ...interviewQuestions.find(q => q.id === 37)! }, // Speed vs quality balance
        { ...interviewQuestions.find(q => q.id === 38)! }, // Agile experience
        { ...interviewQuestions.find(q => q.id === 40)! }, // Unknown technologies
        { ...interviewQuestions.find(q => q.id === 39)! }, // Mentoring juniors
      ],
      hard: [
        // Leadership and decision-making
        { ...interviewQuestions.find(q => q.id === 41)! }, // Evaluating solutions
        { ...interviewQuestions.find(q => q.id === 42)! }, // Code review approach
        { ...interviewQuestions.find(q => q.id === 44)! }, // Testing philosophy
        { ...interviewQuestions.find(q => q.id === 43)! }, // Architecture disagreements
        { ...interviewQuestions.find(q => q.id === 45)! }, // Onboarding new members
      ]
    }
  }

  const questionFlow = structuredFlow[type]?.[difficulty] || []
  return questionFlow.slice(0, count).filter(Boolean)
}

// Seeded Fisher-Yates shuffle for reproducibility
const seededShuffle = <T>(array: T[], seed: number): T[] => {
  const shuffled = [...array]
  let random = seed
  
  // Simple seeded random generator (LCG)
  const seededRandom = () => {
    random = (random * 9301 + 49297) % 233280
    return random / 233280
  }
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  return shuffled
}

// Strategy 1: Fixed difficulty with seeded shuffle (reproducible)
export const getSeededShuffledQuestions = (
  type: 'technical' | 'behavioral' | 'general',
  difficulty: 'easy' | 'medium' | 'hard',
  count: number,
  seed: number, // userId + sessionTimestamp
  excludeIds: number[] = []
): Question[] => {
  const filtered = interviewQuestions.filter(q =>
    q.type === type &&
    q.difficulty === difficulty &&
    !excludeIds.includes(q.id)
  )
  
  const shuffled = seededShuffle(filtered, seed)
  return shuffled.slice(0, count)
}

// Strategy 2: Mixed mode with stratified picking (enforces quotas)
export const getStratifiedQuestions = (
  type: 'technical' | 'behavioral' | 'general',
  quotas: { easy: number; medium: number; hard: number },
  seed: number,
  excludeIds: number[] = []
): Question[] => {
  const result: Question[] = []
  
  // Pick from each difficulty bucket
  const difficulties: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard']
  
  difficulties.forEach(diff => {
    const filtered = interviewQuestions.filter(q =>
      q.type === type &&
      q.difficulty === diff &&
      !excludeIds.includes(q.id)
    )
    
    const shuffled = seededShuffle(filtered, seed + diff.charCodeAt(0))
    result.push(...shuffled.slice(0, quotas[diff]))
  })
  
  // Final shuffle to mix difficulties
  return seededShuffle(result, seed)
}

// Strategy 3: Structured with anchor + shuffle middle
export const getAnchoredQuestions = (
  type: 'technical' | 'behavioral' | 'general',
  difficulty: 'easy' | 'medium' | 'hard',
  count: number,
  seed: number,
  excludeIds: number[] = []
): Question[] => {
  const filtered = interviewQuestions.filter(q =>
    q.type === type &&
    q.difficulty === difficulty &&
    !excludeIds.includes(q.id)
  )
  
  if (filtered.length < count) return filtered
  
  // Keep first (warm-up) and last (wrap-up) fixed
  const first = filtered[0]
  const last = filtered[filtered.length - 1]
  const middle = filtered.slice(1, filtered.length - 1)
  
  // Shuffle only the middle section
  const shuffledMiddle = seededShuffle(middle, seed)
  
  return [
    first,
    ...shuffledMiddle.slice(0, count - 2),
    last
  ]
}

// Strategy 4: Weighted sampling (for long sessions, bias toward medium)
export const getWeightedQuestions = (
  type: 'technical' | 'behavioral' | 'general',
  count: number,
  seed: number,
  weights: { easy: number; medium: number; hard: number } = { easy: 1, medium: 3, hard: 1.5 },
  excludeIds: number[] = []
): Question[] => {
  const allQuestions = interviewQuestions.filter(q =>
    q.type === type && !excludeIds.includes(q.id)
  )
  
  // Create weighted pool
  const weightedPool: Question[] = []
  allQuestions.forEach(q => {
    const weight = weights[q.difficulty]
    for (let i = 0; i < weight; i++) {
      weightedPool.push(q)
    }
  })
  
  // Shuffle and deduplicate
  const shuffled = seededShuffle(weightedPool, seed)
  const seen = new Set<number>()
  const result: Question[] = []
  
  for (const q of shuffled) {
    if (!seen.has(q.id)) {
      seen.add(q.id)
      result.push(q)
      if (result.length >= count) break
    }
  }
  
  return result
}

// Strategy 5: De-duplication layer (for repeat users)
export const getQuestionsWithDedup = (
  type: 'technical' | 'behavioral' | 'general',
  difficulty: 'easy' | 'medium' | 'hard',
  count: number,
  seenQuestionIds: number[], // From localStorage or database
  seed: number
): Question[] => {
  // Try fresh questions first
  const freshFiltered = interviewQuestions.filter(q =>
    q.type === type &&
    q.difficulty === difficulty &&
    !seenQuestionIds.includes(q.id)
  )
  
  if (freshFiltered.length >= count) {
    // Enough fresh questions
    return seededShuffle(freshFiltered, seed).slice(0, count)
  }
  
  // Not enough fresh - add some seen questions
  const seenFiltered = interviewQuestions.filter(q =>
    q.type === type &&
    q.difficulty === difficulty &&
    seenQuestionIds.includes(q.id)
  )
  
  const allAvailable = [
    ...seededShuffle(freshFiltered, seed),
    ...seededShuffle(seenFiltered, seed + 1000)
  ]
  
  return allAvailable.slice(0, count)
}

// Legacy: Simple shuffle for backward compatibility
export const getShuffledQuestions = (
  type: 'technical' | 'behavioral' | 'general',
  difficulty: 'easy' | 'medium' | 'hard',
  count: number = 5,
  excludeIds: number[] = []
) => {
  const seed = Date.now() // Use current timestamp as seed
  return getSeededShuffledQuestions(type, difficulty, count, seed, excludeIds)
}

// Get next adaptive question based on performance
export const getAdaptiveQuestion = (
  type: 'technical' | 'behavioral' | 'general',
  currentDifficulty: 'easy' | 'medium' | 'hard',
  lastScore: number,
  usedQuestionIds: number[]
): Question | null => {
  // Adaptive logic: adjust difficulty based on score
  let nextDifficulty: 'easy' | 'medium' | 'hard' = currentDifficulty
  
  if (lastScore >= 75) {
    // Strong performance - increase difficulty
    if (currentDifficulty === 'easy') nextDifficulty = 'medium'
    else if (currentDifficulty === 'medium') nextDifficulty = 'hard'
  } else if (lastScore < 50) {
    // Weak performance - decrease difficulty
    if (currentDifficulty === 'hard') nextDifficulty = 'medium'
    else if (currentDifficulty === 'medium') nextDifficulty = 'easy'
  }
  // Score 50-74: keep same difficulty
  
  console.log(`📊 Adaptive: Score ${lastScore} → ${currentDifficulty} to ${nextDifficulty}`)
  
  // Get a random question at the determined difficulty level
  const availableQuestions = interviewQuestions.filter(q =>
    q.type === type &&
    q.difficulty === nextDifficulty &&
    !usedQuestionIds.includes(q.id)
  )
  
  if (availableQuestions.length === 0) {
    // Fallback: try any difficulty if no questions available at target difficulty
    const anyQuestions = interviewQuestions.filter(q =>
      q.type === type && !usedQuestionIds.includes(q.id)
    )
    return anyQuestions.length > 0 ? anyQuestions[Math.floor(Math.random() * anyQuestions.length)] : null
  }
  
  // Return random question from available pool
  return availableQuestions[Math.floor(Math.random() * availableQuestions.length)]
}
