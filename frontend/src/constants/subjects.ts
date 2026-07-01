export const SUBJECT_CATEGORIES = [
    {
        title: "1. Core DSA Subjects",
        items: [
            { id: "data-structures", name: "Data Structures", icon: "🌳" },
            { id: "algorithms", name: "Algorithms", icon: "⚙️" },
            { id: "strings", name: "Arrays & Strings", icon: "📝" },
            { id: "linked-list", name: "Linked List", icon: "🔗" },
            { id: "stack-queue", name: "Stack & Queue", icon: "📚" },
            { id: "trees-binary-trees", name: "Trees & Binary Trees", icon: "🌲" },
            { id: "heap-priority-queue", name: "Heap / Priority Queue", icon: "📊" },
            { id: "graphs", name: "Graph Theory", icon: "⚙️" },
            { id: "dp", name: "Dynamic Programming", icon: "📉" },
            { id: "greedy-algorithms", name: "Greedy Algorithms", icon: "🍕" },
            { id: "backtracking", name: "Backtracking", icon: "↩️" },
            { id: "bit-manipulation", name: "Bit Manipulation", icon: "🔢" },
            { id: "math", name: "Mathematics", icon: "🔢" },
            { id: "number-theory", name: "Number Theory", icon: "🔐" },
            { id: "combinatorics", name: "Combinatorics", icon: "🎲" },
            { id: "geometry", name: "Geometry", icon: "📐" },
            { id: "game-theory", name: "Game Theory", icon: "🎮" },
        ]
    },
    {
        title: "2. Real-World Problem Domains",
        items: [
            { id: "logistics-routing", name: "Logistics & Routing Systems", icon: "🚚" },
            { id: "fintech-payment", name: "Fintech & Payment Systems", icon: "💳" },
            { id: "social-media", name: "Social Media Systems", icon: "📱" },
            { id: "ecommerce", name: "E-commerce Systems", icon: "🛒" },
            { id: "gaming-simulation", name: "Gaming & Simulation", icon: "🎮" },
            { id: "healthcare", name: "Healthcare Systems", icon: "🏥" },
            { id: "networking-systems", name: "Networking & Systems", icon: "🌐" },
            { id: "cybersecurity", name: "Cybersecurity & Cryptography", icon: "🔐" },
        ]
    },
    {
        title: "3. Trending / Future Tech",
        items: [
            { id: "ai-ml", name: "AI / Machine Learning Basics", icon: "🤖" },
            { id: "data-analytics", name: "Data Analytics & Big Data", icon: "📊" },
            { id: "blockchain", name: "Blockchain & Web3", icon: "⛓️" },
            { id: "cloud-distributed", name: "Cloud & Distributed Systems", icon: "☁️" },
            { id: "realtime-systems", name: "Real-time Systems", icon: "📡" },
            { id: "search-ranking", name: "Search & Ranking Systems", icon: "🔍" },
        ]
    }
];

export const SUBJECTS = SUBJECT_CATEGORIES.flatMap(c => c.items);
