import React from 'react';

const TermsOfServicePage = () => {
    const lastUpdated = "December 2024";

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-white">Terms of Service</h1>
                <p className="text-gray-400">Last updated: {lastUpdated}</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 space-y-6">
                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
                    <p className="text-gray-300 leading-relaxed">
                        Welcome to Political Arena. These Terms of Service ("Terms") govern your use of our 
                        political simulation game platform. By accessing or using our service, you agree to 
                        be bound by these Terms. If you do not agree to these Terms, please do not use our service.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
                    <p className="text-gray-300 leading-relaxed">
                        Political Arena is an online political simulation game where users can create characters, 
                        engage in political activities, join parties, run for office, and participate in various 
                        gameplay mechanics designed to simulate the political process. The service is provided 
                        for entertainment purposes only.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts and Registration</h2>
                    <div className="space-y-4">
                        <p className="text-gray-300 leading-relaxed">
                            To use our service, you must create an account and provide accurate information. You are responsible for:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-1">
                            <li>Maintaining the confidentiality of your account credentials</li>
                            <li>All activities that occur under your account</li>
                            <li>Providing accurate and current information</li>
                            <li>Notifying us immediately of any unauthorized use</li>
                        </ul>
                        <p className="text-gray-300 leading-relaxed">
                            You must be at least 13 years old to create an account. Users under 18 should have 
                            parental consent before using our service.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">4. Acceptable Use Policy</h2>
                    <div className="space-y-4">
                        <p className="text-gray-300 leading-relaxed">
                            You agree to use our service responsibly and in compliance with all applicable laws. 
                            The following activities are prohibited:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-1">
                            <li>Harassment, bullying, or threatening other users</li>
                            <li>Posting inappropriate, offensive, or discriminatory content</li>
                            <li>Attempting to hack, exploit, or compromise the service</li>
                            <li>Creating multiple accounts to gain unfair advantages</li>
                            <li>Sharing or selling account credentials</li>
                            <li>Using automated tools or bots</li>
                            <li>Engaging in real-world political coordination through the game</li>
                            <li>Impersonating other users or public figures</li>
                        </ul>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">5. Content and Conduct</h2>
                    <div className="space-y-4">
                        <p className="text-gray-300 leading-relaxed">
                            Political Arena includes political themes and discussions. While we encourage 
                            thoughtful political roleplay, all content must remain:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-1">
                            <li>Respectful and civil in tone</li>
                            <li>Focused on game mechanics rather than real-world politics</li>
                            <li>Free from hate speech or discriminatory language</li>
                            <li>Appropriate for a diverse, international audience</li>
                        </ul>
                        <p className="text-gray-300 leading-relaxed">
                            We reserve the right to moderate, edit, or remove any content that violates these standards.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">6. Virtual Currency and Items</h2>
                    <p className="text-gray-300 leading-relaxed">
                        Our game may include virtual currency, items, or achievements that have no real-world value. 
                        These virtual assets are not transferable outside the game and cannot be exchanged for 
                        real money. We reserve the right to modify, suspend, or terminate virtual economies 
                        at any time.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">7. Intellectual Property Rights</h2>
                    <div className="space-y-4">
                        <p className="text-gray-300 leading-relaxed">
                            Political Arena and all its content, features, and functionality are owned by us 
                            and are protected by intellectual property laws. You are granted a limited, 
                            non-exclusive license to use the service for personal entertainment purposes.
                        </p>
                        <p className="text-gray-300 leading-relaxed">
                            By creating content in the game (profiles, messages, etc.), you grant us a 
                            non-exclusive license to use, display, and moderate such content within the service.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">8. Privacy and Data Protection</h2>
                    <p className="text-gray-300 leading-relaxed">
                        Your privacy is important to us. Please review our Privacy Policy, which explains 
                        how we collect, use, and protect your information. By using our service, you consent 
                        to the collection and use of information as described in our Privacy Policy.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">9. Service Availability and Modifications</h2>
                    <p className="text-gray-300 leading-relaxed">
                        We strive to provide reliable service but cannot guarantee 100% uptime. We may 
                        temporarily suspend the service for maintenance, updates, or other operational needs. 
                        We also reserve the right to modify, update, or discontinue features at any time 
                        without prior notice.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">10. Account Suspension and Termination</h2>
                    <div className="space-y-4">
                        <p className="text-gray-300 leading-relaxed">
                            We may suspend or terminate your account for violations of these Terms, including:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-1">
                            <li>Repeated violations of the Acceptable Use Policy</li>
                            <li>Harmful behavior toward other users</li>
                            <li>Attempts to exploit or hack the service</li>
                            <li>Creating multiple accounts</li>
                            <li>Inactive accounts (after extended periods of non-use)</li>
                        </ul>
                        <p className="text-gray-300 leading-relaxed">
                            You may also terminate your account at any time by contacting us or using 
                            account deletion features if available.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">11. Disclaimers and Limitation of Liability</h2>
                    <div className="space-y-4">
                        <p className="text-gray-300 leading-relaxed">
                            The service is provided "as is" without warranties of any kind. We disclaim all 
                            warranties, express or implied, including but not limited to warranties of 
                            merchantability, fitness for a particular purpose, and non-infringement.
                        </p>
                        <p className="text-gray-300 leading-relaxed">
                            To the maximum extent permitted by law, we shall not be liable for any indirect, 
                            incidental, special, or consequential damages arising from your use of the service.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">12. Governing Law and Dispute Resolution</h2>
                    <p className="text-gray-300 leading-relaxed">
                        These Terms shall be governed by and construed in accordance with applicable laws. 
                        Any disputes arising from these Terms or your use of the service should be resolved 
                        through good faith discussion or appropriate legal channels in your jurisdiction.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">13. Changes to Terms</h2>
                    <p className="text-gray-300 leading-relaxed">
                        We may update these Terms from time to time to reflect changes in our service or 
                        legal requirements. We will notify users of significant changes by posting updates 
                        on this page and updating the "Last updated" date. Continued use of the service 
                        after such changes constitutes acceptance of the new Terms.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">14. Contact Information</h2>
                    <p className="text-gray-300 leading-relaxed">
                        If you have questions about these Terms of Service, please contact us through the 
                        game's support system or feedback mechanisms. We will do our best to address your 
                        concerns promptly.
                    </p>
                </section>
            </div>

            <div className="text-center">
                <p className="text-gray-500 text-sm">
                    By using Political Arena, you acknowledge that you have read, understood, and 
                    agree to be bound by these Terms of Service.
                </p>
            </div>
        </div>
    );
};

export default TermsOfServicePage; 