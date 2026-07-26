"""
One-time script to seed subtasks, prerequisites, and what_to_submit
for all existing milestones in the database.
"""
import json
import os
import sys

# Add parent so imports work
sys.path.insert(0, os.path.dirname(__file__))

from sqlmodel import Session, select, create_engine
from core.models import Milestone

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5433/minicode")
engine = create_engine(DATABASE_URL)

MILESTONE_SUBTASK_DATA = {
    # ── Cybersecurity (stream_id=1) ──────────────────────────────────────
    "Networking Basics": {
        "prerequisites": "No prior experience needed. You should be comfortable using a computer and browsing the web.",
        "what_to_submit": "A written report (PDF/Markdown) explaining: (1) The 7 OSI layers with examples, (2) How DNS resolves a domain, (3) Difference between TCP and UDP with use-cases. Optionally include Wireshark screenshots.",
        "subtasks": [
            {
                "id": "nb-1",
                "title": "Learn the OSI Model",
                "description": "Understand all 7 layers of the OSI model and what each layer does.",
                "starting_point": "Watch Professor Messer's OSI Model video (free on YouTube). Then read the TryHackMe 'Pre-Security' room on networking basics.",
                "what_to_submit": "Write a table mapping each OSI layer to a real-world example (e.g., Layer 7 = HTTP).",
                "estimated_minutes": 60,
            },
            {
                "id": "nb-2",
                "title": "TCP vs UDP Deep Dive",
                "description": "Understand the differences between TCP and UDP, and when each is used.",
                "starting_point": "Read the Cloudflare Learning article on TCP vs UDP. Try the TryHackMe 'Intro to Networking' room.",
                "what_to_submit": "List 3 protocols that use TCP and 3 that use UDP with reasons why.",
                "estimated_minutes": 45,
            },
            {
                "id": "nb-3",
                "title": "DNS & How the Internet Works",
                "description": "Trace how a URL becomes an IP address through DNS resolution.",
                "starting_point": "Use 'How DNS Works' by dnsimple.com (comic). Then open a terminal and run: nslookup google.com",
                "what_to_submit": "Draw or describe step-by-step: what happens when you type 'google.com' in a browser.",
                "estimated_minutes": 45,
            },
            {
                "id": "nb-4",
                "title": "Packet Analysis with Wireshark",
                "description": "Capture and inspect real network packets to see how data flows.",
                "starting_point": "Install Wireshark (free). Start a capture on your Wi-Fi adapter, then visit a website. Filter by 'dns' to see DNS queries.",
                "what_to_submit": "Screenshot of a DNS packet in Wireshark with labels on: Source IP, Destination IP, Query Name.",
                "estimated_minutes": 60,
            },
        ],
    },
    "Web Security Fundamentals": {
        "prerequisites": "Complete 'Networking Basics' first. Basic knowledge of how websites work (HTML/HTTP).",
        "what_to_submit": "A security report demonstrating: (1) An XSS vulnerability you found/tested, (2) How SQL injection works with example, (3) HTTPS explanation. Submit as PDF with screenshots.",
        "subtasks": [
            {
                "id": "wsf-1",
                "title": "OWASP Top 10 Overview",
                "description": "Learn the 10 most critical web security risks.",
                "starting_point": "Read the official OWASP Top 10 page (owasp.org). Focus on A1 (Injection) and A3 (XSS) first.",
                "what_to_submit": "For each of the Top 5 OWASP risks, write 1 sentence explaining the attack and 1 sentence on how to prevent it.",
                "estimated_minutes": 90,
            },
            {
                "id": "wsf-2",
                "title": "Practice XSS in a Safe Environment",
                "description": "Find and exploit a Cross-Site Scripting vulnerability in a practice app.",
                "starting_point": "Use DVWA (Damn Vulnerable Web Application) - install via Docker: 'docker run -p 80:80 vulnerables/web-dvwa'. Or use PortSwigger Web Security Academy labs (free).",
                "what_to_submit": "Screenshot showing an alert popup from an XSS payload you injected, with the payload written below.",
                "estimated_minutes": 75,
            },
            {
                "id": "wsf-3",
                "title": "SQL Injection Basics",
                "description": "Understand how SQL injection attacks work and how to prevent them.",
                "starting_point": "Use PortSwigger Web Security Academy 'SQL injection' labs (free, no install needed). Start with the 'WHERE clause bypass' lab.",
                "what_to_submit": "Screenshot of a completed SQLi lab with explanation of what the payload did.",
                "estimated_minutes": 60,
            },
        ],
    },
    "Cryptography 101": {
        "prerequisites": "Basic understanding of binary numbers and how computers store data.",
        "what_to_submit": "Submit a Python script that: (1) Encrypts a message with AES, (2) Decrypts it back, (3) Shows a hash of the original message. Also include a 1-page explanation of symmetric vs asymmetric encryption.",
        "subtasks": [
            {
                "id": "cr-1",
                "title": "Symmetric vs Asymmetric Encryption",
                "description": "Understand the core difference between symmetric (same key) and asymmetric (public/private key) encryption.",
                "starting_point": "Watch 'Cryptography 101' by Computerphile on YouTube. Read the simple explainer on Khan Academy.",
                "what_to_submit": "Write an analogy that explains symmetric vs asymmetric encryption to a 12-year-old.",
                "estimated_minutes": 45,
            },
            {
                "id": "cr-2",
                "title": "Implement Basic AES Encryption",
                "description": "Write Python code to encrypt and decrypt a string using AES.",
                "starting_point": "Install the 'cryptography' library: pip install cryptography. Use Fernet (built on AES) for simplicity. Docs: cryptography.io/en/latest/fernet/",
                "what_to_submit": "Python script that encrypts 'Hello MiniCode' and then decrypts it, printing both the ciphertext and plaintext.",
                "estimated_minutes": 60,
            },
            {
                "id": "cr-3",
                "title": "Hashing & Password Security",
                "description": "Learn why passwords are hashed, not encrypted, and practice with SHA-256 and bcrypt.",
                "starting_point": "Read 'Why you should hash passwords' on OWASP. Then use Python's hashlib: import hashlib; hashlib.sha256(b'password').hexdigest()",
                "what_to_submit": "Demonstrate the 'avalanche effect': hash 'password' and 'Password' and show how different the hashes are.",
                "estimated_minutes": 45,
            },
        ],
    },
    # ── AI & Machine Learning (stream_id=2) ──────────────────────────────
    "Python for ML": {
        "prerequisites": "Basic Python knowledge (variables, loops, functions). If new to Python, complete the Python crash course on python.org first.",
        "what_to_submit": "A Jupyter Notebook with: (1) NumPy array operations, (2) Pandas DataFrame analysis of a CSV dataset, (3) A matplotlib plot. Upload the .ipynb file.",
        "subtasks": [
            {
                "id": "pml-1",
                "title": "NumPy Fundamentals",
                "description": "Learn array creation, indexing, slicing, and mathematical operations with NumPy.",
                "starting_point": "Install Jupyter: pip install notebook numpy. Open a notebook and follow the official NumPy quickstart tutorial at numpy.org/doc/stable/user/quickstart.html",
                "what_to_submit": "Notebook cells showing: creating a 3x3 matrix, computing its transpose, and element-wise multiplication.",
                "estimated_minutes": 90,
            },
            {
                "id": "pml-2",
                "title": "Pandas for Data Manipulation",
                "description": "Load, clean, and analyze tabular data using Pandas DataFrames.",
                "starting_point": "Download the Titanic dataset from Kaggle (free). Load it with pd.read_csv(). Practice: df.head(), df.describe(), df.isnull().sum(), and groupby operations.",
                "what_to_submit": "3 data insights you found in the Titanic dataset using Pandas (e.g., survival rate by gender).",
                "estimated_minutes": 90,
            },
            {
                "id": "pml-3",
                "title": "Data Visualization with Matplotlib",
                "description": "Create charts and graphs to visualize patterns in data.",
                "starting_point": "Using your Titanic dataset from the previous subtask, create: a bar chart of survivors by class, a histogram of ages, and a scatter plot. Use matplotlib.pyplot.",
                "what_to_submit": "3 plots saved as PNG files with clear titles and axis labels.",
                "estimated_minutes": 60,
            },
        ],
    },
    "ML Fundamentals": {
        "prerequisites": "Complete 'Python for ML'. Understanding of basic statistics (mean, variance) is helpful.",
        "what_to_submit": "A Jupyter Notebook implementing a Linear Regression model from scratch using NumPy, plus a Scikit-Learn version for comparison. Include a plot of actual vs predicted values.",
        "subtasks": [
            {
                "id": "mlf-1",
                "title": "Understand Train/Test Split & Overfitting",
                "description": "Learn why we split data and what overfitting/underfitting means.",
                "starting_point": "Watch 'Bias vs Variance' by StatQuest on YouTube. Then read the Scikit-Learn user guide on model evaluation.",
                "what_to_submit": "Explain in your own words: what is overfitting, and name 2 ways to prevent it.",
                "estimated_minutes": 60,
            },
            {
                "id": "mlf-2",
                "title": "Linear Regression from Scratch",
                "description": "Implement gradient descent and a linear regression model without libraries.",
                "starting_point": "Use NumPy only. Start with a simple dataset (house sizes vs prices). The formula: prediction = w*x + b. Update weights using: w = w - lr * gradient. Andrew Ng's ML course on Coursera has the math explained clearly.",
                "what_to_submit": "Python script with gradient descent that trains for 1000 epochs and prints the final loss. Plot the regression line over data points.",
                "estimated_minutes": 120,
            },
            {
                "id": "mlf-3",
                "title": "Classification with Scikit-Learn",
                "description": "Use Decision Trees and Logistic Regression on a real classification dataset.",
                "starting_point": "Use the Iris dataset: from sklearn.datasets import load_iris. Try both LogisticRegression and DecisionTreeClassifier. Compare accuracy on test set.",
                "what_to_submit": "Notebook showing accuracy scores and a confusion matrix for both models.",
                "estimated_minutes": 90,
            },
        ],
    },
    # ── Web Development (stream_id=3) ────────────────────────────────────
    "HTML/CSS Foundations": {
        "prerequisites": "No experience needed. Just a text editor (VS Code recommended) and a browser.",
        "what_to_submit": "A personal portfolio webpage (HTML + CSS only): name, bio, skills list, and a projects section with at least 2 placeholder cards. Submit the .html and .css files zipped.",
        "subtasks": [
            {
                "id": "hcf-1",
                "title": "Build Your First HTML Page",
                "description": "Create a complete HTML document with semantic elements: header, main, section, footer.",
                "starting_point": "Open VS Code and create index.html. Use MDN Web Docs 'Getting started with HTML' (first article). Add a heading, paragraph, image, and list.",
                "what_to_submit": "index.html file with at least 5 different HTML elements, proper DOCTYPE and head section.",
                "estimated_minutes": 60,
            },
            {
                "id": "hcf-2",
                "title": "CSS Styling & Box Model",
                "description": "Style your HTML page with colors, fonts, spacing, and learn the CSS box model.",
                "starting_point": "Link a style.css file to your HTML. Learn: margin, padding, border, width. Use Google Fonts for typography. The CSS Tricks 'Box Model' article is great.",
                "what_to_submit": "Styled page with custom colors, Google Font, and proper spacing using the box model.",
                "estimated_minutes": 90,
            },
            {
                "id": "hcf-3",
                "title": "Flexbox Layout",
                "description": "Use CSS Flexbox to create responsive navigation and card layouts.",
                "starting_point": "Play Flexbox Froggy (flexboxfroggy.com) to learn flexbox interactively. Then apply it: create a navbar with flex and a 3-card row layout.",
                "what_to_submit": "A page section with 3 project cards displayed in a row using flexbox.",
                "estimated_minutes": 75,
            },
            {
                "id": "hcf-4",
                "title": "Make It Responsive",
                "description": "Add media queries to make your page look good on mobile devices.",
                "starting_point": "Add @media (max-width: 768px) rules to your CSS. Test using Chrome DevTools (F12 → toggle device toolbar). The cards should stack vertically on mobile.",
                "what_to_submit": "Screenshots of your page on desktop (3-column) and mobile (1-column) views.",
                "estimated_minutes": 60,
            },
        ],
    },
    "JavaScript Mastery": {
        "prerequisites": "Complete 'HTML/CSS Foundations'. Comfortable with basic programming concepts.",
        "what_to_submit": "A To-Do list web app with: add/delete/complete tasks, task count display, and local storage persistence. Submit as a folder with index.html, style.css, app.js.",
        "subtasks": [
            {
                "id": "js-1",
                "title": "JavaScript Basics & DOM Manipulation",
                "description": "Learn variables, functions, loops, and how to modify webpage elements with JavaScript.",
                "starting_point": "Open browser DevTools console (F12). Practice: document.getElementById(), innerHTML, addEventListener. Follow the 'JavaScript First Steps' on MDN Web Docs.",
                "what_to_submit": "A JS script that changes the color of all paragraphs on a page when a button is clicked.",
                "estimated_minutes": 120,
            },
            {
                "id": "js-2",
                "title": "Array Methods & Functional Patterns",
                "description": "Master .map(), .filter(), .reduce(), and .forEach() for working with data.",
                "starting_point": "Use JavaScript.info 'Array methods' chapter. Practice each method in the browser console with a sample array of numbers and objects.",
                "what_to_submit": "Code examples using all 4 methods on the same dataset (e.g., a list of products with price and name).",
                "estimated_minutes": 90,
            },
            {
                "id": "js-3",
                "title": "Async JavaScript - Fetch & Promises",
                "description": "Understand callbacks, Promises, and async/await by fetching real data from an API.",
                "starting_point": "Use the free JSONPlaceholder API (jsonplaceholder.typicode.com). Fetch posts: fetch('https://jsonplaceholder.typicode.com/posts').then(r => r.json()).then(console.log)",
                "what_to_submit": "Code that fetches and displays a list of 5 users from the JSONPlaceholder API on a webpage.",
                "estimated_minutes": 90,
            },
        ],
    },
    "React/Next.js": {
        "prerequisites": "Complete 'JavaScript Mastery'. Understand ES6 features (arrow functions, destructuring, modules).",
        "what_to_submit": "A Next.js blog app with: list of posts page, individual post detail page, and a simple contact form. Deploy to Vercel for free and submit the live URL + GitHub repo link.",
        "subtasks": [
            {
                "id": "rn-1",
                "title": "React Core: Components & Props",
                "description": "Build reusable UI components and pass data between them with props.",
                "starting_point": "Run: npx create-react-app my-app (or use Vite). Follow the official React tutorial 'Tic-Tac-Toe' on react.dev. It teaches components, state, and props perfectly.",
                "what_to_submit": "A React component that accepts a 'name' and 'bio' prop and renders a profile card.",
                "estimated_minutes": 120,
            },
            {
                "id": "rn-2",
                "title": "React Hooks: useState & useEffect",
                "description": "Manage component state and side effects with React hooks.",
                "starting_point": "Read the 'Hooks at a Glance' guide on react.dev. Build a counter with useState, then fetch data in useEffect. Practice with: const [count, setCount] = useState(0)",
                "what_to_submit": "A component that fetches and displays weather data from a free API (openweathermap.org has a free tier) using useState and useEffect.",
                "estimated_minutes": 120,
            },
            {
                "id": "rn-3",
                "title": "Next.js App Router & File-based Routing",
                "description": "Set up a Next.js project with App Router and create multiple pages.",
                "starting_point": "Run: npx create-next-app@latest my-blog. Create pages in the app/ directory. A file at app/about/page.tsx becomes the /about route.",
                "what_to_submit": "Next.js app with at least 3 pages (/home, /about, /projects) with navigation between them.",
                "estimated_minutes": 90,
            },
        ],
    },
    # ── Data Science (stream_id=4) ────────────────────────────────────────
    "Statistics Fundamentals": {
        "prerequisites": "High school math (algebra). No coding experience needed for the first subtask.",
        "what_to_submit": "A Jupyter Notebook with Python code showing: mean/median/mode calculation, a normal distribution plot, and a hypothesis test (t-test) with interpretation.",
        "subtasks": [
            {
                "id": "sf-1",
                "title": "Descriptive Statistics",
                "description": "Calculate and interpret mean, median, mode, variance, and standard deviation.",
                "starting_point": "Use Khan Academy 'Statistics and Probability' course (free). Then implement in Python: import numpy as np; data = [2,3,5,5,7]; np.mean(data), np.median(data), np.std(data)",
                "what_to_submit": "Python code that calculates all descriptive stats for a dataset of 20 numbers and plots a histogram.",
                "estimated_minutes": 75,
            },
            {
                "id": "sf-2",
                "title": "Probability & Distributions",
                "description": "Understand probability rules, the normal distribution, and the central limit theorem.",
                "starting_point": "Watch 'The Normal Distribution' by StatQuest. Then use scipy.stats.norm to plot a normal curve: from scipy import stats; stats.norm.pdf(x, loc=0, scale=1)",
                "what_to_submit": "A plot of the normal distribution with mean=0, std=1, with the area between -1 and +1 shaded (68% rule).",
                "estimated_minutes": 90,
            },
            {
                "id": "sf-3",
                "title": "Hypothesis Testing",
                "description": "Learn p-values, null hypotheses, and run a t-test to compare two groups.",
                "starting_point": "Read the 'Hypothesis Testing' explainer on Statistics How To. Then use: from scipy.stats import ttest_ind; ttest_ind(group_a, group_b). A p-value < 0.05 means statistically significant.",
                "what_to_submit": "Run a t-test on 2 generated datasets and write a 3-sentence interpretation: what the p-value means and your conclusion.",
                "estimated_minutes": 75,
            },
        ],
    },
    # ── Cloud & DevOps (stream_id=5) ─────────────────────────────────────
    "Cloud & DevOps": {
        "prerequisites": "Basic Linux command line knowledge. Comfort using a terminal. Understand what a server is.",
        "what_to_submit": "A working CI/CD pipeline on GitHub Actions that: runs tests, builds a Docker container, and deploys to a cloud service (e.g., Render or Railway free tier). Submit GitHub repo link.",
        "subtasks": [
            {
                "id": "cd-1",
                "title": "Linux & Bash Fundamentals",
                "description": "Master essential Linux commands for file management, permissions, and process control.",
                "starting_point": "Use OverTheWire Bandit (free Linux wargame) to practice commands. Or use the Linux Survival online simulator (linuxsurvival.com). Focus on: ls, cd, mkdir, chmod, ps, grep, curl.",
                "what_to_submit": "A bash script that: creates a directory, writes a file, reads it, and prints the disk usage.",
                "estimated_minutes": 120,
            },
            {
                "id": "cd-2",
                "title": "Docker Fundamentals",
                "description": "Build and run Docker containers to package applications consistently.",
                "starting_point": "Install Docker Desktop. Follow the official 'Get Started' tutorial at docs.docker.com. Build a container for a simple Python Flask app: docker build -t myapp . && docker run -p 5000:5000 myapp",
                "what_to_submit": "A Dockerfile for a simple web app, and a screenshot of it running at localhost:5000.",
                "estimated_minutes": 120,
            },
            {
                "id": "cd-3",
                "title": "GitHub Actions CI/CD",
                "description": "Create an automated workflow that tests and deploys your app on every push.",
                "starting_point": "Create .github/workflows/ci.yml in your repo. Start with the GitHub Actions 'Hello World' template. Add a step to run: pytest (or npm test). Trigger on push to main.",
                "what_to_submit": "Screenshot of a successful GitHub Actions workflow run showing all steps passing.",
                "estimated_minutes": 90,
            },
        ],
    },
    # ── Mobile Development (stream_id=6) ─────────────────────────────────
    "Mobile Development": {
        "prerequisites": "Basic programming knowledge in any language. JavaScript/Dart knowledge is helpful but not required.",
        "what_to_submit": "A simple mobile app (iOS or Android) that: displays a list from an API, has navigation between 2 screens, and includes a form. Submit GitHub repo + APK/TestFlight link.",
        "subtasks": [
            {
                "id": "md-1",
                "title": "Set Up React Native / Flutter",
                "description": "Install your development environment and run your first mobile app.",
                "starting_point": "Choose: React Native (npx create-expo-app MyApp) or Flutter (flutter create my_app). Follow the official 'Getting Started' guide. Get a 'Hello World' app running on a simulator.",
                "what_to_submit": "Screenshot of your app running on a simulator/emulator showing 'Hello World'.",
                "estimated_minutes": 90,
            },
            {
                "id": "md-2",
                "title": "Navigation Between Screens",
                "description": "Implement a stack navigator to move between multiple screens.",
                "starting_point": "React Native: install @react-navigation/native. Flutter: use Navigator.push(). Create a Home screen and a Detail screen. Add a button that navigates between them.",
                "what_to_submit": "Screen recording (gif or mp4) of navigating between 2 screens in your app.",
                "estimated_minutes": 90,
            },
        ],
    },
    # ── Blockchain (stream_id=7) ─────────────────────────────────────────
    "Blockchain & Web3": {
        "prerequisites": "Basic JavaScript knowledge. Understanding of how the internet works.",
        "what_to_submit": "A deployed smart contract on Ethereum testnet (Sepolia) with: mint function, transfer function, and event logging. Submit the contract address + etherscan link + GitHub repo.",
        "subtasks": [
            {
                "id": "bw-1",
                "title": "Blockchain Fundamentals",
                "description": "Understand blocks, chains, consensus mechanisms, and why blockchain is immutable.",
                "starting_point": "Play with 'andersbrownworth.com/blockchain' - a visual blockchain demo. Then read 'What is Ethereum?' on ethereum.org/learn.",
                "what_to_submit": "Answer: What is a consensus mechanism? Explain Proof of Work vs Proof of Stake in simple terms.",
                "estimated_minutes": 60,
            },
            {
                "id": "bw-2",
                "title": "Write Your First Smart Contract",
                "description": "Create a basic ERC-20 token smart contract with Solidity.",
                "starting_point": "Use Remix IDE (remix.ethereum.org) - no install needed. Start with the OpenZeppelin ERC-20 template. Modify the token name and symbol. Compile and deploy to the Remix VM.",
                "what_to_submit": "Screenshot of your contract deployed in Remix with a successful transfer transaction.",
                "estimated_minutes": 120,
            },
        ],
    },
    # ── System Design (stream_id=8) ─────────────────────────────────────
    "System Design": {
        "prerequisites": "At least 1 year of software development experience. Understanding of databases, APIs, and basic networking.",
        "what_to_submit": "A detailed system design document for a URL shortener (like bit.ly): architecture diagram, database schema, API design, caching strategy, and scalability plan. Submit as PDF.",
        "subtasks": [
            {
                "id": "sd-1",
                "title": "Scalability Fundamentals",
                "description": "Understand horizontal vs vertical scaling, load balancers, and CDNs.",
                "starting_point": "Read 'Scalability for Dummies' by Leah Culver (available via web search). Watch 'System Design Introduction' by Gaurav Sen on YouTube.",
                "what_to_submit": "Diagram showing how you would scale a simple web app from 100 users to 1 million users.",
                "estimated_minutes": 90,
            },
            {
                "id": "sd-2",
                "title": "Database Design & Caching",
                "description": "Design a database schema and implement caching strategies for performance.",
                "starting_point": "Read 'SQL vs NoSQL' on Bret Cameron's blog. Then learn Redis basics: redis.io/docs/getting-started/. The key insight: put frequently-read data in cache, rarely-changing data in DB.",
                "what_to_submit": "Database schema (ERD) for a social media app with users, posts, likes, and comments.",
                "estimated_minutes": 90,
            },
        ],
    },
    # ── Open Source (stream_id=9) ─────────────────────────────────────────
    "Open Source Contribution": {
        "prerequisites": "Intermediate programming skills. Familiarity with Git basics (clone, commit, push).",
        "what_to_submit": "An accepted Pull Request on any public GitHub repository. Submit the PR link. If not yet merged, submit the link to your open PR with reviewer comments addressed.",
        "subtasks": [
            {
                "id": "os-1",
                "title": "Git & GitHub Workflow",
                "description": "Master: fork, branch, commit, PR workflow used in open source projects.",
                "starting_point": "Fork any repo. Clone it. Create a branch: git checkout -b fix/typo. Make a change, commit, push, and open a PR. The GitHub docs 'Contributing to a project' guide is excellent.",
                "what_to_submit": "Screenshot of a PR you opened on any public repository (even fixing a README typo counts!).",
                "estimated_minutes": 60,
            },
            {
                "id": "os-2",
                "title": "Find Your First Issue",
                "description": "Find a beginner-friendly issue tagged 'good first issue' on GitHub.",
                "starting_point": "Go to goodfirstissue.dev or github.com/explore. Filter by your language. Look for 'good first issue' or 'beginner-friendly' labels. Comment 'I'd like to work on this' before starting.",
                "what_to_submit": "Screenshot of the issue you've claimed with your comment, and your plan for fixing it.",
                "estimated_minutes": 45,
            },
        ],
    },
}


def update_milestone_subtasks():
    with Session(engine) as session:
        milestones = session.exec(select(Milestone)).all()
        updated = 0

        for milestone in milestones:
            # Try exact title match first
            data = MILESTONE_SUBTASK_DATA.get(milestone.title)
            if not data:
                # Try partial match by stream context keywords
                for key, val in MILESTONE_SUBTASK_DATA.items():
                    if key.lower() in milestone.title.lower() or milestone.title.lower() in key.lower():
                        data = val
                        break

            if data:
                milestone.subtasks = json.dumps(data["subtasks"])
                milestone.prerequisites = data.get("prerequisites")
                milestone.what_to_submit = data.get("what_to_submit")
                session.add(milestone)
                updated += 1
                print(f"  ✓ Updated: [{milestone.id}] {milestone.title}")
            else:
                print(f"  ✗ No data for: [{milestone.id}] {milestone.title}")

        session.commit()
        print(f"\nDone! Updated {updated}/{len(milestones)} milestones.")


if __name__ == "__main__":
    print("Seeding subtasks into milestones...\n")
    update_milestone_subtasks()
