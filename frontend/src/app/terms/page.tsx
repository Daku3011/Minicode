import Link from "next/link";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#0f0a1e] text-white">
            <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-purple-500/10 via-transparent to-transparent pointer-events-none" />
            
            <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Link href="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8">
                    ← Back to Login
                </Link>

                <h1 className="text-4xl font-black text-white mb-2">Terms of Service</h1>
                <p className="text-slate-400 mb-8">Last updated: March 31, 2026</p>

                <div className="prose prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                        <p className="text-slate-300 leading-relaxed">
                            By accessing or using MiniCode ("the Platform"), you agree to be bound by these Terms of Service. 
                            If you do not agree to these terms, do not use the Platform. MiniCode is an educational coding 
                            platform designed for students, faculty, and administrators.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
                        <p className="text-slate-300 leading-relaxed">
                            MiniCode provides:
                        </p>
                        <ul className="text-slate-300 list-disc list-inside space-y-2">
                            <li>Coding challenges and competitive programming problems</li>
                            <li>AI-powered code evaluation and feedback</li>
                            <li>GitHub repository integration for code submission</li>
                            <li>Event management for challenges and team projects</li>
                            <li>Leaderboards and progress tracking</li>
                            <li>Faculty tools for creating and managing content</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
                        <p className="text-slate-300 leading-relaxed">
                            You may create an account using GitHub OAuth or email/password. You are responsible for 
                            maintaining the security of your account. You must not share your account credentials. 
                            If you suspect unauthorized access, notify us immediately.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Code Submissions</h2>
                        <p className="text-slate-300 leading-relaxed">
                            All code submitted to the Platform must be your own original work. Plagiarism, cheating, 
                            or submitting code written by others (including AI-generated code without disclosure) is 
                            strictly prohibited. Violations may result in account suspension or disqualification from events.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Acceptable Use</h2>
                        <p className="text-slate-300 leading-relaxed">
                            You agree not to:
                        </p>
                        <ul className="text-slate-300 list-disc list-inside space-y-2">
                            <li>Attempt to exploit or abuse the Platform's AI judging system</li>
                            <li>Submit malicious, harmful, or illegal code</li>
                            <li>Harass, threaten, or abuse other users</li>
                            <li>Attempt to access other users' accounts or data</li>
                            <li>Use automated tools to scrape or abuse the Platform</li>
                            <li>Circumvent level-based content restrictions</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">6. Intellectual Property</h2>
                        <p className="text-slate-300 leading-relaxed">
                            Problem statements, platform content, and design elements are owned by MiniCode or its 
                            content creators. Your code submissions remain your intellectual property, but you grant 
                            MiniCode a license to analyze, evaluate, and display your submissions for educational purposes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">7. AI-Powered Judging</h2>
                        <p className="text-slate-300 leading-relaxed">
                            The Platform uses AI (Google Gemini) to evaluate code submissions. AI evaluations are 
                            provided as-is and may not be 100% accurate. Faculty members have the authority to 
                            override AI decisions and manually adjust scores.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">8. Termination</h2>
                        <p className="text-slate-300 leading-relaxed">
                            We reserve the right to suspend or terminate accounts that violate these terms. 
                            Upon termination, your access to the Platform will cease, but your data may be 
                            retained for educational and legal purposes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">9. Limitation of Liability</h2>
                        <p className="text-slate-300 leading-relaxed">
                            MiniCode is provided "as is" without warranties. We are not liable for any damages 
                            arising from your use of the Platform, including but not limited to data loss, 
                            service interruptions, or inaccurate AI evaluations.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">10. Changes to Terms</h2>
                        <p className="text-slate-300 leading-relaxed">
                            We may update these terms from time to time. Continued use of the Platform after 
                            changes constitutes acceptance of the new terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">11. Contact</h2>
                        <p className="text-slate-300 leading-relaxed">
                            For questions about these terms, contact us through the Platform or at the 
                            institutional email provided by your organization.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
