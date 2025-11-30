import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Section = ({ title, children, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="glass-panel p-8 mb-8"
    >
        <h2 className="text-2xl font-bold text-white mb-6 border-b border-purple-500/30 pb-2">{title}</h2>
        {children}
    </motion.div>
);

const TeamMember = ({ name, role, skills }) => (
    <div className="glass-card p-4 rounded-xl">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4 mx-auto flex items-center justify-center text-2xl font-bold text-white">
            {name.charAt(0)}
        </div>
        <h3 className="text-lg font-bold text-white text-center">{name}</h3>
        <p className="text-purple-300 text-center text-sm mb-2">{role}</p>
        <div className="flex flex-wrap gap-2 justify-center">
            {skills.map((skill, index) => (
                <span key={index} className="text-xs bg-purple-500/20 text-purple-200 px-2 py-1 rounded-full">
                    {skill}
                </span>
            ))}
        </div>
    </div>
);

export default function CompetitionSubmission() {
    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white p-8 pb-20">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
                        AI Anti-Fraud Platform
                    </h1>
                    <p className="text-xl text-gray-400 mb-6">AI500 Stage 1 Submission</p>

                    <div className="flex items-center justify-center gap-4 flex-wrap mb-6">
                        <Link
                            to="/demo"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full text-white font-bold transition-all hover:scale-105 shadow-lg shadow-purple-500/50"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                            </svg>
                            View Live Demo
                        </Link>

                        <a
                            href="https://github.com/Hazratqul21/ai_antiFraud.git"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-full text-white transition-all hover:scale-105"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                            Source Code
                        </a>
                    </div>
                </motion.div>

                <Section title="1. Problem & Solution" delay={0.1}>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-xl font-semibold text-purple-300 mb-3">The Problem</h3>
                            <p className="text-gray-300 leading-relaxed">
                                Financial fraud is escalating with digital adoption. Traditional rule-based systems fail to detect complex, evolving fraud patterns in real-time, leading to billions in losses and eroding user trust in digital financial systems.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-green-300 mb-3">Our Solution</h3>
                            <p className="text-gray-300 leading-relaxed">
                                A real-time, AI-driven Anti-Fraud Platform that leverages Machine Learning to analyze transaction patterns instantly. Our system detects anomalies, flags suspicious activities, and prevents fraud before it happens, ensuring security without compromising user experience.
                            </p>
                        </div>
                    </div>
                </Section>

                <Section title="2. Team Information" delay={0.2}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <TeamMember
                            name="Abduraufov Hazratqul"
                            role="Team Lead & ML Engineer"
                            skills={['Machine Learning', 'Leadership', 'Python']}
                        />
                        <TeamMember
                            name="Farkhodov Islomjon"
                            role="AI/ML Engineer"
                            skills={['Deep Learning', 'Data Science', 'AI Models']}
                        />
                        <TeamMember
                            name="Karimzhanov Abubakir"
                            role="Backend Developer"
                            skills={['FastAPI', 'Database Design', 'Security']}
                        />
                        <TeamMember
                            name="Nurali Ishburiyev"
                            role="Frontend Developer"
                            skills={['React', 'UI/UX', 'JavaScript']}
                        />
                        <TeamMember
                            name="Velichkin Danil"
                            role="Frontend Developer"
                            skills={['React', 'Frontend Architecture', 'CSS']}
                        />
                    </div>
                    <p className="text-center text-gray-500 text-sm mt-6">
                        * All team members are registered via the AI500 Telegram Bot.
                    </p>
                </Section>

                <Section title="3. Why Us?" delay={0.3}>
                    <ul className="space-y-4 text-gray-300">
                        <li className="flex items-start gap-3">
                            <span className="text-purple-500 mt-1">✓</span>
                            <div>
                                <strong className="text-white">Proven Expertise:</strong> Our team combines deep technical knowledge in AI/ML with practical experience in fintech security.
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-purple-500 mt-1">✓</span>
                            <div>
                                <strong className="text-white">Innovative Approach:</strong> Unlike static rules, our self-learning models adapt to new fraud tactics automatically.
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-purple-500 mt-1">✓</span>
                            <div>
                                <strong className="text-white">Speed & Scalability:</strong> Built on a high-performance stack (FastAPI + React) designed to handle high transaction volumes with sub-second latency.
                            </div>
                        </li>
                    </ul>
                </Section>

                <Section title="4. Roadmap & Stage" delay={0.4}>
                    <div className="flex items-center justify-center mb-8">
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-full">
                            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-green-300 font-bold">Current Stage: MVP (Minimum Viable Product)</span>
                        </div>
                    </div>
                    <div className="relative border-l-2 border-purple-500/30 ml-6 space-y-8">
                        <div className="relative pl-8">
                            <span className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-purple-500"></span>
                            <h4 className="text-lg font-bold text-white">Phase 1: MVP (Completed)</h4>
                            <p className="text-gray-400 text-sm">Core fraud detection engine, real-time dashboard, and basic reporting.</p>
                        </div>
                        <div className="relative pl-8">
                            <span className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-gray-700 border-2 border-purple-500"></span>
                            <h4 className="text-lg font-bold text-white">Phase 2: Pilot Testing (Next Step)</h4>
                            <p className="text-gray-400 text-sm">Deploying with beta users, gathering dataset for model refinement.</p>
                        </div>
                        <div className="relative pl-8">
                            <span className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-gray-700 border-2 border-purple-500"></span>
                            <h4 className="text-lg font-bold text-white">Phase 3: Advanced AI & Scaling</h4>
                            <p className="text-gray-400 text-sm">Deep Learning integration, behavioral biometrics, and API for external partners.</p>
                        </div>
                    </div>
                </Section>

                <Section title="5. Technical Approach" delay={0.5}>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-4">Tech Stack</h3>
                            <div className="flex flex-wrap gap-2">
                                {['React', 'Vite', 'Tailwind CSS', 'Python', 'FastAPI', 'Scikit-learn', 'PostgreSQL'].map(tech => (
                                    <span key={tech} className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-gray-300">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-4">AI Methodology</h3>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                We utilize <strong>Isolation Forests</strong> and <strong>Random Cut Forests</strong> for unsupervised anomaly detection. The system ingests transaction metadata (amount, location, time, frequency) and scores each transaction in real-time. High-risk scores trigger immediate alerts and temporary blocks.
                            </p>
                        </div>
                    </div>
                </Section>
            </div>
        </div>
    );
}
