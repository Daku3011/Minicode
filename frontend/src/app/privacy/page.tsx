import Link from "next/link";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#0f0a1e] text-white">
            <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-purple-500/10 via-transparent to-transparent pointer-events-none" />
            
            <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Link href="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8">
                    ← Back to Login
                </Link>

                <h1 className="text-4xl font-black text-white mb-2">Privacy Policy</h1>
                <p className="text-slate-400 mb-8">Last updated: March 31, 2026</p>

                <div className="prose prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
                        <p className="text-slate-300 leading-relaxed mb-4">
                            We collect information you provide directly, including:
                        </p>
                        <ul className="text-slate-300 list-disc list-inside space-y-2">
                            <li><strong>Account Information:</strong> Username, email address, GitHub profile data (avatar, public repos)</li>
                            <li><strong>Profile Data:</strong> Full name, role (student/faculty/admin)</li>
                            <li><strong>Code Submissions:</strong> Repository URLs, commit history, code content</li>
                            <li><strong>Activity Data:</strong> Problem-solving history, event participation, scores, XP earned</li>
                            <li><strong>Authentication Tokens:</strong> Encrypted GitHub access tokens for repository management</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
                        <p className="text-slate-300 leading-relaxed mb-4">
                            Your information is used to:
                        </p>
                        <ul className="text-slate-300 list-disc list-inside space-y-2">
                            <li>Provide and improve the coding platform experience</li>
                            <li>Evaluate code submissions using AI-powered judging</li>
                            <li>Generate leaderboards and progress reports</li>
                            <li>Manage events, challenges, and team projects</li>
                            <li>Create and manage GitHub repositories for problem-solving</li>
                            <li>Communicate platform updates and announcements</li>
                            <li>Prevent fraud, plagiarism, and platform abuse</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. Data Sharing</h2>
                        <p className="text-slate-300 leading-relaxed">
                            We do not sell your personal information. Data may be shared with:
                        </p>
                        <ul className="text-slate-300 list-disc list-inside space-y-2">
                            <li><strong>Faculty/Administrators:</strong> Can view student submissions, scores, and progress for educational purposes</li>
                            <li><strong>GitHub:</strong> Repository data is stored on GitHub per their privacy policy</li>
                            <li><strong>AI Services:</strong> Code content is sent to Google Gemini API for evaluation (see Section 6)</li>
                            <li><strong>Legal Requirements:</strong> When required by law or to protect rights</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Data Security</h2>
                        <p className="text-slate-300 leading-relaxed">
                            We implement security measures to protect your data:
                        </p>
                        <ul className="text-slate-300 list-disc list-inside space-y-2">
                            <li>GitHub access tokens are encrypted using Fernet encryption</li>
                            <li>Passwords are hashed using bcrypt</li>
                            <li>JWT tokens are used for secure authentication</li>
                            <li>Input sanitization prevents XSS and injection attacks</li>
                            <li>Rate limiting prevents abuse and brute-force attacks</li>
                            <li>Security headers are enforced on all responses</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Data Retention</h2>
                        <p className="text-slate-300 leading-relaxed">
                            We retain your data for as long as your account is active. Upon account deletion:
                        </p>
                        <ul className="text-slate-300 list-disc list-inside space-y-2">
                            <li>Personal identifying information is removed</li>
                            <li>Anonymous aggregate data (leaderboard stats, platform metrics) may be retained</li>
                            <li>GitHub repositories created through the Platform remain on GitHub</li>
                            <li>Submission history may be retained for educational record-keeping</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">6. Third-Party Services</h2>
                        <p className="text-slate-300 leading-relaxed mb-4">
                            Our Platform integrates with:
                        </p>
                        <ul className="text-slate-300 list-disc list-inside space-y-2">
                            <li><strong>GitHub:</strong> For authentication and repository management. Subject to GitHub's Privacy Policy.</li>
                            <li><strong>Google Gemini:</strong> For AI-powered code evaluation. Code content is sent to Gemini for analysis.</li>
                            <li><strong>Supabase/PostgreSQL:</strong> For data storage. Subject to Supabase's Privacy Policy.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">7. Your Rights</h2>
                        <p className="text-slate-300 leading-relaxed mb-4">
                            You have the right to:
                        </p>
                        <ul className="text-slate-300 list-disc list-inside space-y-2">
                            <li>Access your personal data stored on the Platform</li>
                            <li>Request correction of inaccurate information</li>
                            <li>Request deletion of your account and data</li>
                            <li>Opt out of non-essential communications</li>
                            <li>Export your submission history and progress data</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">8. Children's Privacy</h2>
                        <p className="text-slate-300 leading-relaxed">
                            The Platform is designed for educational use. If you are under 13, you may only use 
                            the Platform with parental consent and under the supervision of a faculty member or 
                            guardian.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">9. Cookies</h2>
                        <p className="text-slate-300 leading-relaxed">
                            We use cookies for authentication (JWT tokens stored in cookies) and session management. 
                            No third-party tracking cookies are used.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">10. Changes to This Policy</h2>
                        <p className="text-slate-300 leading-relaxed">
                            We may update this Privacy Policy from time to time. Significant changes will be 
                            communicated through the Platform or via email.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">11. Contact</h2>
                        <p className="text-slate-300 leading-relaxed">
                            For privacy-related inquiries, contact us through the Platform or at the 
                            institutional email provided by your organization.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
