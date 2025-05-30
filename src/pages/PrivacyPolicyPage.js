import React from 'react';

const PrivacyPolicyPage = () => {
    const lastUpdated = "December 2024";

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
                <p className="text-gray-400">Last updated: {lastUpdated}</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 space-y-6">
                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
                    <p className="text-gray-300 leading-relaxed">
                        Welcome to Political Arena. This Privacy Policy explains how we collect, use, disclose, 
                        and safeguard your information when you use our political simulation game platform. 
                        Please read this privacy policy carefully. If you do not agree with the terms of this 
                        privacy policy, please do not access the application.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium text-blue-400 mb-2">Personal Information</h3>
                            <p className="text-gray-300 leading-relaxed">
                                We may collect personal information that you provide directly to us, including:
                            </p>
                            <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
                                <li>Username and display name</li>
                                <li>Email address</li>
                                <li>Profile information (age, gender, race, religion, political stances)</li>
                                <li>Biography and other profile details</li>
                                <li>Game-related data and statistics</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium text-blue-400 mb-2">Automatically Collected Information</h3>
                            <p className="text-gray-300 leading-relaxed">
                                When you use our service, we may automatically collect certain information, including:
                            </p>
                            <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
                                <li>IP address and browser type</li>
                                <li>Device information and operating system</li>
                                <li>Usage patterns and game activity</li>
                                <li>Session duration and frequency of use</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
                    <p className="text-gray-300 leading-relaxed mb-4">
                        We use the information we collect for various purposes, including:
                    </p>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                        <li>Providing and maintaining our game service</li>
                        <li>Creating and managing user accounts</li>
                        <li>Facilitating gameplay and social interactions</li>
                        <li>Improving our game features and user experience</li>
                        <li>Communicating with users about game updates</li>
                        <li>Detecting and preventing fraud or abuse</li>
                        <li>Complying with legal obligations</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">4. Information Sharing and Disclosure</h2>
                    <p className="text-gray-300 leading-relaxed mb-4">
                        We do not sell, trade, or otherwise transfer your personal information to third parties, 
                        except in the following circumstances:
                    </p>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                        <li>With your explicit consent</li>
                        <li>To comply with legal obligations or court orders</li>
                        <li>To protect our rights and prevent fraud</li>
                        <li>In connection with a business transfer or merger</li>
                        <li>To service providers who assist in our operations (under strict confidentiality)</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">5. Data Security</h2>
                    <p className="text-gray-300 leading-relaxed">
                        We implement appropriate security measures to protect your personal information against 
                        unauthorized access, alteration, disclosure, or destruction. However, no method of 
                        transmission over the internet or electronic storage is 100% secure, and we cannot 
                        guarantee absolute security.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">6. Data Retention</h2>
                    <p className="text-gray-300 leading-relaxed">
                        We retain your personal information for as long as necessary to provide our services 
                        and fulfill the purposes outlined in this privacy policy, unless a longer retention 
                        period is required or permitted by law.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">7. Your Rights and Choices</h2>
                    <p className="text-gray-300 leading-relaxed mb-4">
                        Depending on your location, you may have certain rights regarding your personal information:
                    </p>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                        <li>Access to your personal information</li>
                        <li>Correction of inaccurate data</li>
                        <li>Deletion of your personal information</li>
                        <li>Data portability</li>
                        <li>Objection to processing</li>
                        <li>Withdrawal of consent</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">8. Children's Privacy</h2>
                    <p className="text-gray-300 leading-relaxed">
                        Our service is not intended for children under the age of 13. We do not knowingly 
                        collect personal information from children under 13. If you become aware that a 
                        child has provided us with personal information, please contact us immediately.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">9. Changes to This Privacy Policy</h2>
                    <p className="text-gray-300 leading-relaxed">
                        We may update this Privacy Policy from time to time. We will notify you of any 
                        changes by posting the new Privacy Policy on this page and updating the "Last updated" 
                        date. You are advised to review this Privacy Policy periodically for any changes.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">10. Contact Us</h2>
                    <p className="text-gray-300 leading-relaxed">
                        If you have any questions about this Privacy Policy or our privacy practices, 
                        please contact us through the game's support system or feedback mechanisms.
                    </p>
                </section>
            </div>

            <div className="text-center">
                <p className="text-gray-500 text-sm">
                    This Privacy Policy is effective as of {lastUpdated} and will remain in effect 
                    except with respect to any changes in its provisions in the future.
                </p>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage; 