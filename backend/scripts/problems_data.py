problems_data = [
    # AI / MACHINE LEARNING BASICS
    {
        "title": "Deepfake Detection System",
        "description": """With the rise of synthetic media, detecting manipulated videos is critical. Build a system that identifies whether a video is real or AI-generated (deepfake) using extracted features.

(Inspired by real hackathon challenges)""",
        "difficulty": "Hard",
        "level": 6,
        "subject": "ai-ml",
        "xp_reward": 500,
        "input_format": "features[] → numerical representation of video frames",
        "output_format": "1 → Fake, 0 → Real",
        "constraints": "Use classification logic (threshold / average)",
        "hints": "Think like binary classification. Extendable to ML model later.",
        "test_cases": [
            {"input": "[0.9, 0.85, 0.88]", "expected": "1", "is_sample": True},
            {"input": "[0.2, 0.3, 0.25]", "expected": "0", "is_sample": True},
        ],
    },
    # DATA ANALYTICS & BIG DATA
    {
        "title": "Real-Time Trend Analyzer",
        "description": """Given a stream of hashtags, find the top K trending topics in real-time.

(Inspired by social media analytics systems)""",
        "difficulty": "Medium",
        "level": 4,
        "subject": "data-analytics",
        "xp_reward": 250,
        "input_format": "stream = ['#ai','#ml','#ai','#data','#ai'], K=2",
        "output_format": "['#ai','#ml']",
        "constraints": "Optimize for streaming (O(log K))",
        "hints": "Use Heap + HashMap",
        "test_cases": [
            {"input": "['#ai', '#ml', '#ai', '#data', '#ai'], 2", "expected": "['#ai', '#ml']", "is_sample": True},
        ],
    },
    # BLOCKCHAIN & WEB3
    {
        "title": "Tamper-Proof Voting System",
        "description": """Design a voting system where:
- Each vote is hashed
- Votes cannot be modified
- Detect if tampering occurred

(Inspired by blockchain transparency problems)""",
        "difficulty": "Hard",
        "level": 6,
        "subject": "blockchain",
        "xp_reward": 500,
        "input_format": "votes = ['A','B','A'], hashes = valid",
        "output_format": "VALID or INVALID",
        "constraints": "Chain validation (like blockchain blocks)",
        "hints": "Use hashing (SHA concept)",
        "test_cases": [
            {"input": "['A', 'B', 'A']", "expected": "VALID", "is_sample": True},
            {"input": "['A', 'B_modified', 'A']", "expected": "INVALID", "is_sample": True},
        ],
    },
    # CLOUD & DISTRIBUTED SYSTEMS
    {
        "title": "Load Balancer Optimization",
        "description": """You are given:
- N servers
- Incoming requests

Distribute load such that:
- No server overloads
- Response time minimized

(Inspired by real distributed systems problems)""",
        "difficulty": "Hard",
        "level": 5,
        "subject": "cloud-distributed",
        "xp_reward": 400,
        "input_format": "servers=[10,10], requests=[5,7,3]",
        "output_format": "Balanced allocation",
        "constraints": "Think like real load balancer",
        "hints": "Greedy + Priority Queue",
        "test_cases": [
            {"input": "[10, 10], [5, 7, 3]", "expected": "[15, 15]", "is_sample": True},
        ],
    },
    # REAL-TIME SYSTEMS
    {
        "title": "Live Ride Matching",
        "description": """Match drivers to riders based on:
- Distance
- Availability
- Time constraints

(Inspired by real systems like ride-sharing apps)""",
        "difficulty": "Medium",
        "level": 4,
        "subject": "realtime-systems",
        "xp_reward": 300,
        "input_format": "drivers=[(0,0),(5,5)], rider=(1,1)",
        "output_format": "driver 1",
        "constraints": "Can extend to graph shortest path",
        "hints": "Use nearest neighbor logic",
        "test_cases": [
            {"input": "[(0,0), (5,5)], (1,1)", "expected": "driver 1", "is_sample": True},
        ],
    },
    # SEARCH & RANKING SYSTEMS
    {
        "title": "Search Engine Ranking Algorithm",
        "description": """Given:
- Search query
- List of documents

Rank documents based on:
- Keyword frequency
- Relevance score

(Inspired by search engine ranking systems)""",
        "difficulty": "Hard",
        "level": 5,
        "subject": "search-ranking",
        "xp_reward": 420,
        "input_format": "query='data', docs=['data science','big data','hello world']",
        "output_format": "['data science','big data']",
        "constraints": "Sorting + scoring logic",
        "hints": "Use TF (term frequency)",
        "test_cases": [
            {"input": "'data', ['data science', 'big data', 'hello world']", "expected": "['data science', 'big data']", "is_sample": True},
        ],
    },
    # SUBJECT 1: ARRAYS & HASHING
    {
        "title": "Warehouse Inventory Mismatch",
        "description": """A warehouse tracks product IDs in two lists:
- expected[]
- actual[]

Find the missing product ID.""",
        "difficulty": "Easy",
        "level": 1,
        "subject": "strings",
        "xp_reward": 70,
        "input_format": "expected[], actual[]",
        "output_format": "Missing product ID",
        "constraints": "O(n) solution expected",
        "hints": "Use HashSet",
        "test_cases": [
            {"input": "[1,2,3,4], [1,2,4]", "expected": "3", "is_sample": True},
            {"input": "[7,8,9], [9,7]", "expected": "8", "is_sample": True},
        ],
    },
    {
        "title": "Suspicious Transaction Pair",
        "description": """Find if any two transactions sum to a suspicious amount K.""",
        "difficulty": "Easy",
        "level": 2,
        "subject": "strings",
        "xp_reward": 100,
        "input_format": "arr[], K",
        "output_format": "True or False",
        "constraints": "Use HashMap",
        "hints": "Classic Two Sum problem",
        "test_cases": [
            {"input": "[100,200,300,400], 500", "expected": "True", "is_sample": True},
            {"input": "[50,70,90], 200", "expected": "False", "is_sample": True},
        ],
    },
    {
        "title": "Most Frequent Product",
        "description": """Find the most frequently sold product ID.""",
        "difficulty": "Medium",
        "level": 3,
        "subject": "strings",
        "xp_reward": 180,
        "input_format": "List of product IDs",
        "output_format": "Most frequent product ID",
        "constraints": "HashMap + frequency count",
        "hints": "",
        "test_cases": [
            {"input": "[1,1,2,3,3,3]", "expected": "3", "is_sample": True},
        ],
    },
    {
        "title": "Subarray with Target Sum",
        "description": """Find if a subarray exists with sum = K.""",
        "difficulty": "Medium",
        "level": 4,
        "subject": "strings",
        "xp_reward": 220,
        "input_format": "arr[], K",
        "output_format": "True or False",
        "constraints": "Prefix sum + Hashing",
        "hints": "",
        "test_cases": [
            {"input": "[1,2,3,7,5], 12", "expected": "True", "is_sample": True},
        ],
    },
    {
        "title": "Longest Unique Session",
        "description": """Find longest substring without repeating characters.""",
        "difficulty": "Hard",
        "level": 5,
        "subject": "strings",
        "xp_reward": 300,
        "input_format": "String",
        "output_format": "Length of longest unique substring",
        "constraints": "Sliding window",
        "hints": "",
        "test_cases": [
            {"input": "'abcabcbb'", "expected": "3", "is_sample": True},
        ],
    },
    # SUBJECT 2: GRAPH THEORY
    {
        "title": "City Connectivity Check",
        "description": """Check if all cities are connected.""",
        "difficulty": "Easy",
        "level": 1,
        "subject": "graphs",
        "xp_reward": 80,
        "input_format": "n, edges[]",
        "output_format": "True or False",
        "constraints": "BFS/DFS",
        "hints": "",
        "test_cases": [
            {"input": "4, [[0,1],[1,2],[2,3]]", "expected": "True", "is_sample": True},
        ],
    },
    {
        "title": "Shortest Delivery Route",
        "description": """Find shortest path from warehouse to destination.""",
        "difficulty": "Medium",
        "level": 3,
        "subject": "logistics-routing",
        "xp_reward": 200,
        "input_format": "edges[]",
        "output_format": "Shortest path weight",
        "constraints": "Dijkstra",
        "hints": "",
        "test_cases": [
            {"input": "[[0,1,4],[0,2,1],[2,1,2]]", "expected": "3", "is_sample": True},
        ],
    },
    {
        "title": "Number of Connected Networks",
        "description": """Count number of connected components.""",
        "difficulty": "Medium",
        "level": 3,
        "subject": "graphs",
        "xp_reward": 220,
        "input_format": "n, edges[]",
        "output_format": "Number of components",
        "constraints": "",
        "hints": "",
        "test_cases": [
            {"input": "5, [[0,1],[2,3]]", "expected": "3", "is_sample": True},
        ],
    },
    {
        "title": "Detect Cycle in Network",
        "description": """Detect cycle in graph.""",
        "difficulty": "Hard",
        "level": 5,
        "subject": "graphs",
        "xp_reward": 350,
        "input_format": "edges[]",
        "output_format": "True or False",
        "constraints": "DFS or Union-Find",
        "hints": "",
        "test_cases": [
            {"input": "[[0,1],[1,2],[2,0]]", "expected": "True", "is_sample": True},
        ],
    },
    {
        "title": "Minimum Spanning Network Cost",
        "description": """Connect all nodes with minimum cost.""",
        "difficulty": "Hard",
        "level": 6,
        "subject": "graphs",
        "xp_reward": 450,
        "input_format": "edges[]",
        "output_format": "Minimum cost",
        "constraints": "Kruskal / Prim",
        "hints": "",
        "test_cases": [
            {"input": "[[0,1,1],[1,2,2],[0,2,3]]", "expected": "3", "is_sample": True},
        ],
    },
    # SUBJECT 3: FINTECH / REAL-TIME SYSTEMS
    {
        "title": "Daily Spending Alert",
        "description": """Check if spending exceeds limit.""",
        "difficulty": "Easy",
        "level": 2,
        "subject": "fintech-payment",
        "xp_reward": 90,
        "input_format": "List of expenses, limit",
        "output_format": "True or False",
        "constraints": "",
        "hints": "",
        "test_cases": [
            {"input": "[100,200,300], 500", "expected": "True", "is_sample": True},
        ],
    },
    {
        "title": "Duplicate Transaction Detection",
        "description": """Detect duplicate transactions within 1 minute.""",
        "difficulty": "Medium",
        "level": 3,
        "subject": "fintech-payment",
        "xp_reward": 200,
        "input_format": "List of (id, timestamp)",
        "output_format": "True or False",
        "constraints": "HashMap + timestamp",
        "hints": "",
        "test_cases": [
            {"input": "[('id1','10:00'),('id1','10:00')]", "expected": "True", "is_sample": True},
        ],
    },
    {
        "title": "Transaction Average Spike",
        "description": """Detect if transaction is 3x average of last 5.""",
        "difficulty": "Medium",
        "level": 4,
        "subject": "fintech-payment",
        "xp_reward": 250,
        "input_format": "List of transactions",
        "output_format": "True or False",
        "constraints": "Sliding window",
        "hints": "",
        "test_cases": [
            {"input": "[10,20,30,40,50,200]", "expected": "True", "is_sample": True},
        ],
    },
    {
        "title": "Fraud Location Jump",
        "description": """Detect if user logs from different locations within 1 min.""",
        "difficulty": "Hard",
        "level": 5,
        "subject": "fintech-payment",
        "xp_reward": 400,
        "input_format": "List of (user, timestamp, location)",
        "output_format": "True or False",
        "constraints": "",
        "hints": "",
        "test_cases": [
            {"input": "[('user','10:00','NY'),('user','10:01','LA')]", "expected": "True", "is_sample": True},
        ],
    },
    {
        "title": "Real-Time Fraud Score System",
        "description": """Assign fraud score based on:
- amount spike
- location mismatch
- rapid transactions

Return list of flagged transactions.""",
        "difficulty": "Hard",
        "level": 6,
        "subject": "fintech-payment",
        "xp_reward": 500,
        "input_format": "List of transactions",
        "output_format": "List of flagged transactions",
        "constraints": "Combine multiple conditions. Use sliding window + hashmap",
        "hints": "",
        "test_cases": [
            {"input": "[('u1',100),('u1',500),('u1',2000)]", "expected": "[2000]", "is_sample": True},
        ],
    },
]
