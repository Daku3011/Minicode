"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
    Github, Terminal, Code2, User, Calendar, Trophy, 
    BookOpen, GraduationCap, Users, Settings, Search,
    ChevronRight, ChevronDown, Rocket, Zap, ArrowRight,
    CheckCircle, MessageCircle, HelpCircle, Sparkles,
    LucideIcon, LogIn
} from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/Logo";
import FeedbackModal from "@/components/FeedbackModal";

interface FAQStep {
    text: string;
    icon: LucideIcon;
}

interface FAQItem {
    question: string;
    answer: string;
    steps?: FAQStep[];
}

interface FAQTopic {
    title: string;
    icon: LucideIcon;
    color: string;
    bg: string;
    border: string;
    items: FAQItem[];
}

const studentTopics: FAQTopic[] = [
    {
        title: "Getting Started",
        icon: Rocket,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        items: [
            {
                question: "How do I create a GitHub account?",
                answer: "Visit github.com and click 'Sign up'. Enter your email, create a password, and username. Verify your email address. That's it! You now have your own code repository.",
                steps: [
                    { text: "Go to github.com", icon: Github },
                    { text: "Click 'Sign up for GitHub'", icon: Zap },
                    { text: "Enter your email and create a username", icon: User },
                    { text: "Verify your email address", icon: CheckCircle },
                ]
            },
            {
                question: "How do I login to MiniCode?",
                answer: "Click 'Continue with GitHub' on the login page. You'll be redirected to GitHub to authorize MiniCode. Once authorized, you'll be taken to your dashboard.",
                steps: [
                    { text: "Go to the login page", icon: ArrowRight },
                    { text: "Click 'Continue with GitHub'", icon: Github },
                    { text: "Authorize MiniCode", icon: CheckCircle },
                    { text: "You're in! Welcome to your dashboard", icon: Sparkles },
                ]
            }
        ]
    },
    {
        title: "Solving Problems",
        icon: Code2,
        color: "text-violet-600",
        bg: "bg-violet-50",
        border: "border-violet-200",
        items: [
            {
                question: "How do I start solving a problem?",
                answer: "Go to Problems page, find a problem that matches your level, click on it to view details, then click 'Start Problem'. MiniCode will automatically create a private GitHub repository for you.",
                steps: [
                    { text: "Navigate to /problems", icon: Search },
                    { text: "Choose a problem (check difficulty & your level)", icon: Code2 },
                    { text: "Click 'Start Problem'", icon: Rocket },
                    { text: "MiniCode creates your private repo automatically", icon: CheckCircle },
                ]
            },
            {
                question: "How do I submit my solution?",
                answer: "After solving the problem in your GitHub repo, commit your code and push it. Then go to the problem page on MiniCode and click 'Submit'. The AI will judge your solution and provide feedback.",
                steps: [
                    { text: "Code your solution in your private repo", icon: Terminal },
                    { text: "Commit your changes", icon: CheckCircle },
                    { text: "Push to GitHub", icon: Zap },
                    { text: "Click 'Submit' on MiniCode", icon: ArrowRight },
                    { text: "Get AI feedback & XP if correct!", icon: Trophy },
                ]
            },
            {
                question: "How does the AI judge work?",
                answer: "Our AI judge analyzes your code for correctness, efficiency, and quality. It checks test cases, provides feedback, and awards XP based on your performance.",
                steps: [
                    { text: "AI analyzes your code structure", icon: Search },
                    { text: "Tests against sample test cases", icon: CheckCircle },
                    { text: "Evaluates code quality & efficiency", icon: Code2 },
                    { text: "Provides detailed feedback", icon: MessageCircle },
                    { text: "Awards XP if all tests pass!", icon: Trophy },
                ]
            }
        ]
    },
    {
        title: "Your Profile",
        icon: User,
        color: "text-cyan-600",
        bg: "bg-cyan-50",
        border: "border-cyan-200",
        items: [
            {
                question: "What do the stats on my profile mean?",
                answer: "Your profile shows Total XP (points earned), Level (based on XP), and Rank (your position on the leaderboard). Higher XP means more problems solved!",
                steps: [
                    { text: "Total XP: Points earned from solving problems", icon: Zap },
                    { text: "Level: Unlocked based on your XP total", icon: ArrowRight },
                    { text: "Rank: Your position on the leaderboard", icon: Trophy },
                ]
            },
            {
                question: "How do I increase my XP and level?",
                answer: "Solve problems correctly! Each problem has an XP reward. The harder the problem, the more XP you earn. Faculty can also award bonus XP.",
                steps: [
                    { text: "Solve problems correctly", icon: Code2 },
                    { text: "Earn XP rewards", icon: Zap },
                    { text: "Level up as you earn more XP", icon: ArrowRight },
                    { text: "Faculty can award bonus XP too!", icon: GraduationCap },
                ]
            }
        ]
    },
    {
        title: "Events",
        icon: Calendar,
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200",
        items: [
            {
                question: "How do I join an event?",
                answer: "Go to the Events page, browse upcoming events, click on an event you like, and click 'Join'. Some events have team projects where you can invite friends!",
                steps: [
                    { text: "Go to /events", icon: Calendar },
                    { text: "Browse upcoming events", icon: Search },
                    { text: "Click 'Join' on an event", icon: ArrowRight },
                    { text: "For team events, invite friends or accept invites", icon: Users },
                ]
            },
            {
                question: "What types of events are there?",
                answer: "We have Weekly Challenges (individual coding contests), Team Projects (collaborate with friends), and Announcements (important updates from faculty).",
                steps: [
                    { text: "Weekly Challenge: Compete individually", icon: Zap },
                    { text: "Team Project: Work with a team", icon: Users },
                    { text: "Announcement: Stay updated", icon: Calendar },
                ]
            }
        ]
    }
];

const facultyTopics: FAQTopic[] = [
    {
        title: "Getting Started",
        icon: GraduationCap,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        items: [
            {
                question: "How do I login as faculty?",
                answer: "Click 'Staff Login' on the login page. You can use Google OAuth (use your @scet.ac.in email) or your username/password credentials.",
                steps: [
                    { text: "Go to login page", icon: ArrowRight },
                    { text: "Click 'Staff Login'", icon: User },
                    { text: "Use Google (@scet.ac.in) or credentials", icon: Settings },
                    { text: "Access faculty dashboard", icon: Sparkles },
                ]
            },
            {
                question: "What can I do as faculty?",
                answer: "Create problems, manage cohorts/labs, create events, view student progress, and award XP to students. You have full control over your students' learning journey!",
                steps: [
                    { text: "Create problems for students", icon: Code2 },
                    { text: "Manage cohorts & labs", icon: Users },
                    { text: "Create events & challenges", icon: Calendar },
                    { text: "Monitor student progress", icon: Search },
                    { text: "Award XP to students", icon: Zap },
                ]
            }
        ]
    },
    {
        title: "Problem Management",
        icon: Code2,
        color: "text-violet-600",
        bg: "bg-violet-50",
        border: "border-violet-200",
        items: [
            {
                question: "How do I create a new problem?",
                answer: "Go to Faculty Problems page, click 'Create Problem', fill in the title, description, difficulty, example test cases, constraints, and XP reward. Set visibility to Public or Private.",
                steps: [
                    { text: "Go to /faculty/problems", icon: Code2 },
                    { text: "Click 'Create Problem'", icon: ArrowRight },
                    { text: "Fill problem details", icon: Settings },
                    { text: "Add test cases", icon: CheckCircle },
                    { text: "Set visibility & publish", icon: Zap },
                ]
            },
            {
                question: "What is problem visibility?",
                answer: "Public problems are visible to all students. Private problems are only accessible to students in specific labs you assign. Use private for cohort-specific assignments.",
                steps: [
                    { text: "Public: All students can see", icon: Users },
                    { text: "Private: Only assigned lab students", icon: Settings },
                    { text: "Assign to labs in Cohort settings", icon: ArrowRight },
                ]
            },
            {
                question: "How does AI problem generation work?",
                answer: "Upload a PDF or document with your problem idea. Our AI will generate a complete problem statement with test cases. You can then edit and refine it!",
                steps: [
                    { text: "Go to create problem page", icon: Code2 },
                    { text: "Click 'Generate with AI'", icon: Sparkles },
                    { text: "Upload your document", icon: ArrowRight },
                    { text: "AI generates problem draft", icon: Zap },
                    { text: "Review & edit", icon: Settings },
                ]
            }
        ]
    },
    {
        title: "Cohort & Lab Management",
        icon: Users,
        color: "text-sky-600",
        bg: "bg-sky-50",
        border: "border-sky-200",
        items: [
            {
                question: "How do I create a cohort?",
                answer: "Go to Faculty Cohorts, click 'Create Cohort', name it, add a description. Then create labs within the cohort and assign problems to those labs.",
                steps: [
                    { text: "Go to /faculty/cohorts", icon: Users },
                    { text: "Click 'Create Cohort'", icon: ArrowRight },
                    { text: "Name your cohort & add description", icon: Settings },
                    { text: "Create labs inside the cohort", icon: Code2 },
                    { text: "Assign problems to labs", icon: CheckCircle },
                ]
            },
            {
                question: "What are labs?",
                answer: "Labs are sub-groups within a cohort. You can assign specific problems to specific labs. This lets you create differentiated assignments for different groups of students.",
                steps: [
                    { text: "Cohort: A class or batch of students", icon: Users },
                    { text: "Lab: A sub-group (e.g., beginner track)", icon: Code2 },
                    { text: "Problems assigned to specific labs", icon: ArrowRight },
                ]
            }
        ]
    },
    {
        title: "Event Management",
        icon: Calendar,
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200",
        items: [
            {
                question: "How do I create an event?",
                answer: "Go to Faculty Events, click 'Create Event', set the type (weekly challenge, team project, or announcement), dates, rules, and prizes. Students can then join and participate.",
                steps: [
                    { text: "Go to /faculty/events", icon: Calendar },
                    { text: "Click 'Create Event'", icon: ArrowRight },
                    { text: "Set event type & details", icon: Settings },
                    { text: "Add rules, dates, prizes", icon: Trophy },
                    { text: "Publish for students to join", icon: Zap },
                ]
            },
            {
                question: "How do I award XP for events?",
                answer: "After the event ends, go to the event page, view submissions, provide feedback to participants, and manually award XP. You can also set automatic XP rewards when creating the event.",
                steps: [
                    { text: "View event submissions", icon: Search },
                    { text: "Review each submission", icon: Code2 },
                    { text: "Provide feedback", icon: MessageCircle },
                    { text: "Award XP to participants", icon: Zap },
                ]
            }
        ]
    },
    {
        title: "Student Management",
        icon: User,
        color: "text-cyan-600",
        bg: "bg-cyan-50",
        border: "border-cyan-200",
        items: [
            {
                question: "How do I view a student's profile?",
                answer: "Go to Faculty Students page, find the student, click on their name. You can see their XP, level, submissions, and progress.",
                steps: [
                    { text: "Go to /faculty/students", icon: Users },
                    { text: "Find your student", icon: Search },
                    { text: "Click their name", icon: ArrowRight },
                    { text: "View full profile & submissions", icon: User },
                ]
            },
            {
                question: "How do I award XP to students?",
                answer: "Go to a student's profile, click 'Award XP', enter the amount and reason. They'll receive a notification. This is great for bonus points or recognizing effort!",
                steps: [
                    { text: "Open student profile", icon: User },
                    { text: "Click 'Award XP'", icon: Zap },
                    { text: "Enter amount & reason", icon: Settings },
                    { text: "Student gets notification", icon: MessageCircle },
                ]
            }
        ]
    }
];

function AccordionItem({ item, index, isOpen, onToggle }: { item: FAQItem; index: number; isOpen: boolean; onToggle: () => void }) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border border-slate-200 rounded-xl overflow-hidden"
        >
            <button 
                onClick={onToggle}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className={clsx(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        isOpen ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
                    )}>
                        <HelpCircle className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-slate-900">{item.question}</span>
                </div>
                <ChevronDown className={clsx(
                    "w-5 h-5 text-slate-400 transition-transform",
                    isOpen && "rotate-180"
                )} />
            </button>
            
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-6">
                            <p className="text-slate-600 mb-6 leading-relaxed">{item.answer}</p>
                            
                            {item.steps && item.steps.length > 0 && (
                                <div className="space-y-3">
                                    {item.steps.map((step, stepIdx) => (
                                        <motion.div
                                            key={stepIdx}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: stepIdx * 0.08 }}
                                            className="flex items-center gap-3"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                                                <step.icon className="w-4 h-4 text-slate-600" />
                                            </div>
                                            <span className="text-sm text-slate-700 font-medium">{step.text}</span>
                                            {stepIdx < (item.steps?.length ?? 0) - 1 && (
                                                <ChevronRight className="w-4 h-4 text-slate-300" />
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function TopicSection({ topic, index }: { topic: FAQTopic; index: number }) {
    const [isOpen, setIsOpen] = useState(false);
    const [expandedItem, setExpandedItem] = useState<number | null>(null);
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={clsx(
                "rounded-2xl border overflow-hidden",
                topic.border
            )}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "w-full flex items-center justify-between p-6",
                    topic.bg
                )}
            >
                <div className="flex items-center gap-4">
                    <div className={clsx(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        topic.bg
                    )}>
                        <topic.icon className={clsx("w-6 h-6", topic.color)} />
                    </div>
                    <div className="text-left">
                        <h3 className="text-xl font-bold text-slate-900">{topic.title}</h3>
                        <p className="text-sm text-slate-500">{topic.items.length} articles</p>
                    </div>
                </div>
                <ChevronDown className={clsx(
                    "w-6 h-6 text-slate-400 transition-transform",
                    isOpen && "rotate-180"
                )} />
            </button>
            
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="p-6 pt-2 space-y-3 bg-white">
                            {topic.items.map((item, itemIdx) => (
                                <AccordionItem 
                                    key={itemIdx} 
                                    item={item} 
                                    index={itemIdx}
                                    isOpen={expandedItem === itemIdx}
                                    onToggle={() => setExpandedItem(expandedItem === itemIdx ? null : itemIdx)}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function FAQPage() {
    const [activeRole, setActiveRole] = useState<"student" | "faculty">("student");
    const [searchQuery, setSearchQuery] = useState("");
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    
    const { user, loading } = useAuth();
    const router = useRouter();
    
    useEffect(() => {
        if (user?.role === "faculty" || user?.role === "admin") {
            setActiveRole("faculty");
        } else if (user?.role === "student") {
            setActiveRole("student");
        }
    }, [user]);
    
    const topics = activeRole === "student" ? studentTopics : facultyTopics;
    
    const filteredTopics = topics.map(topic => ({
        ...topic,
        items: topic.items.filter(item => 
            item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(topic => topic.items.length > 0);

    const handleRoleChange = (role: "student" | "faculty") => {
        setActiveRole(role);
        setSearchQuery("");
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Background Effects */}
            <div className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute -top-32 left-1/4 h-[500px] w-[500px] rounded-full bg-violet-100 blur-3xl opacity-60" />
                <div className="absolute top-40 right-0 h-[400px] w-[400px] rounded-full bg-blue-100 blur-3xl opacity-50" />
                <div className="absolute bottom-20 left-20 h-[350px] w-[350px] rounded-full bg-cyan-100 blur-3xl opacity-40" />
            </div>

            <main className="max-w-5xl mx-auto px-4 md:px-8 py-12 md:py-20">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    {/* <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-50 border border-violet-200 rounded-full mb-6">
                        <HelpCircle className="w-4 h-4 text-violet-600" />
                        <span className="text-sm font-semibold text-violet-700">Help Center</span>
                    </div> */}
                    
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight mb-4">
                        How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-500">help you?</span>
                    </h1>
                    
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
                        Everything you need to know about MiniCode, from getting started to advanced features.
                    </p>

                    {/* Search */}
                    <div className="relative max-w-xl mx-auto">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search for answers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-2xl pl-14 pr-6 py-4 text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-violet-100 shadow-sm"
                        />
                    </div>
                </motion.div>

                {/* Role Selector - show only for logged in users */}
                {user && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex justify-center mb-12"
                    >
                        <div className="inline-flex bg-slate-100 p-1.5 rounded-2xl">
                            <button
                                onClick={() => handleRoleChange("student")}
                                className={clsx(
                                    "flex items-center gap-3 px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                                    activeRole === "student" 
                                        ? "bg-white text-slate-900 shadow-sm" 
                                        : "text-slate-600 hover:text-slate-900"
                                )}
                            >
                                <GraduationCap className="w-5 h-5" />
                                I'm a Student
                            </button>
                            <button
                                onClick={() => handleRoleChange("faculty")}
                                className={clsx(
                                    "flex items-center gap-3 px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                                    activeRole === "faculty" 
                                        ? "bg-white text-slate-900 shadow-sm" 
                                        : "text-slate-600 hover:text-slate-900"
                                )}
                            >
                                <BookOpen className="w-5 h-5" />
                                I'm Faculty
                            </button>
                        </div>
                    </motion.div>
                )}

{/* Quick Links */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
                >
                    {user ? (
                        <>
                            {activeRole === "student" ? (
                                <>
                                    <Link href="/problems" className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-primary hover:shadow-md transition-all group">
                                        <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center">
                                            <Code2 className="w-6 h-6 text-violet-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 group-hover:text-primary">Explore Problems</h4>
                                            <p className="text-sm text-slate-500">Start coding challenges</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300 ml-auto group-hover:text-primary" />
                                    </Link>
                                    <Link href="/events" className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-primary hover:shadow-md transition-all group">
                                        <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                                            <Calendar className="w-6 h-6 text-amber-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 group-hover:text-primary">View Events</h4>
                                            <p className="text-sm text-slate-500">Join coding events</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300 ml-auto group-hover:text-primary" />
                                    </Link>
                                    <Link href="/leaderboard" className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-primary hover:shadow-md transition-all group">
                                        <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center">
                                            <Trophy className="w-6 h-6 text-cyan-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 group-hover:text-primary">Leaderboard</h4>
                                            <p className="text-sm text-slate-500">See rankings</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300 ml-auto group-hover:text-primary" />
                                    </Link>
                                    <Link href="/profile" className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-primary hover:shadow-md transition-all group">
                                        <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                                            <User className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 group-hover:text-primary">My Profile</h4>
                                            <p className="text-sm text-slate-500">View your stats</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300 ml-auto group-hover:text-primary" />
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link href="/faculty/problems" className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-primary hover:shadow-md transition-all group">
                                        <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center">
                                            <Code2 className="w-6 h-6 text-violet-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 group-hover:text-primary">Create Problems</h4>
                                            <p className="text-sm text-slate-500">Add new problems</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300 ml-auto group-hover:text-primary" />
                                    </Link>
                                    <Link href="/faculty/cohorts" className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-primary hover:shadow-md transition-all group">
                                        <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center">
                                            <Users className="w-6 h-6 text-sky-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 group-hover:text-primary">Manage Cohorts</h4>
                                            <p className="text-sm text-slate-500">Organize students</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300 ml-auto group-hover:text-primary" />
                                    </Link>
                                    <Link href="/faculty/events" className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-primary hover:shadow-md transition-all group">
                                        <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                                            <Calendar className="w-6 h-6 text-amber-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 group-hover:text-primary">Create Events</h4>
                                            <p className="text-sm text-slate-500">Host coding events</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300 ml-auto group-hover:text-primary" />
                                    </Link>
                                    <Link href="/faculty/profile" className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-primary hover:shadow-md transition-all group">
                                        <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                                            <User className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 group-hover:text-primary">My Profile</h4>
                                            <p className="text-sm text-slate-500">View dashboard</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300 ml-auto group-hover:text-primary" />
                                    </Link>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-primary hover:shadow-md transition-all group">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <LogIn className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900 group-hover:text-primary">Log In</h4>
                                    <p className="text-sm text-slate-500">Sign in to account</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-300 ml-auto group-hover:text-primary" />
                            </Link>
                            <Link href="/faq" className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-primary hover:shadow-md transition-all group">
                                <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center">
                                    <HelpCircle className="w-6 h-6 text-violet-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900 group-hover:text-primary">How it Works</h4>
                                    <p className="text-sm text-slate-500">Learn about MiniCode</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-300 ml-auto group-hover:text-primary" />
                            </Link>
                        </>
                    )}
                </motion.div>

                {/* Topics */}
                <div className="space-y-6">
                    <AnimatePresence>
                        {filteredTopics.map((topic, index) => (
                            <TopicSection key={topic.title} topic={topic} index={index} />
                        ))}
                    </AnimatePresence>
                </div>

                {/* Contact Support */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-16 text-center p-8 bg-gradient-to-br from-violet-50 to-blue-50 rounded-2xl border border-violet-200"
                >
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Still have questions?</h3>
                    <p className="text-slate-600 mb-6">Can't find what you're looking for? We're here to help.</p>
                    <button 
                        onClick={() => setIsFeedbackOpen(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500/50 text-white rounded-xl font-semibold hover:bg-violet-700 transition-all"
                    >
                        <MessageCircle className="w-5 h-5" />
                        Contact Support
                    </button>
                </motion.div>

                {/* Feedback Modal */}
                <FeedbackModal 
                    isOpen={isFeedbackOpen} 
                    onClose={() => setIsFeedbackOpen(false)} 
                />

                {/* Footer
                <div className="mt-12 text-center">
                    <p className="text-slate-500 text-sm">
                        MiniCode Documentation v1.0 • Built with 💜 by SCET Computer Engineering
                    </p>
                </div> */}
            </main>
        </div>
    );
}