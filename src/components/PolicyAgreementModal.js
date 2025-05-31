import React, { useState, useEffect, useRef } from 'react';
import { X, Check, FileText, Shield } from 'lucide-react';

const PRIVACY_POLICY_LAST_UPDATED = "December 2024";
const TERMS_OF_SERVICE_LAST_UPDATED = "December 2024";

const PolicyAgreementModal = ({ isOpen, onClose, onAgreementComplete }) => {
    const [currentView, setCurrentView] = useState('menu'); // 'menu', 'privacy', 'terms'
    const [privacyAgreed, setPrivacyAgreed] = useState(false);
    const [termsAgreed, setTermsAgreed] = useState(false);
    const [canAgreePrivacy, setCanAgreePrivacy] = useState(false);
    const [canAgreeTerms, setCanAgreeTerms] = useState(false);
    const scrollRef = useRef(null);

    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
            const isScrolledToBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold
            
            if (currentView === 'privacy') {
                setCanAgreePrivacy(isScrolledToBottom);
            } else if (currentView === 'terms') {
                setCanAgreeTerms(isScrolledToBottom);
            }
        }
    };

    const handleAgreePrivacy = () => {
        setPrivacyAgreed(true);
        if (termsAgreed) {
            onAgreementComplete(true);
            onClose();
        } else {
            setCurrentView('terms');
            setCanAgreeTerms(false);
        }
    };

    const handleAgreeTerms = () => {
        setTermsAgreed(true);
        if (privacyAgreed) {
            onAgreementComplete(true);
            onClose();
        } else {
            setCurrentView('privacy');
            setCanAgreePrivacy(false);
        }
    };

    const resetScrollState = () => {
        setCanAgreePrivacy(false);
        setCanAgreeTerms(false);
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    };

    useEffect(() => {
        resetScrollState();
    }, [currentView]);

    const renderMenu = () => (
        <div className="p-6 space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Legal Agreements</h2>
                <p className="text-gray-400">Please review and agree to both policies to continue</p>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                        <Shield className="h-6 w-6 text-blue-400" />
                        <div>
                            <h3 className="font-semibold text-white">Privacy Policy</h3>
                            <p className="text-sm text-gray-400">How we collect and use your data</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {privacyAgreed && <Check className="h-5 w-5 text-green-400" />}
                        <button
                            onClick={() => setCurrentView('privacy')}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                        >
                            {privacyAgreed ? 'Review' : 'Read & Agree'}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                        <FileText className="h-6 w-6 text-blue-400" />
                        <div>
                            <h3 className="font-semibold text-white">Terms of Service</h3>
                            <p className="text-sm text-gray-400">Rules and guidelines for using our service</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {termsAgreed && <Check className="h-5 w-5 text-green-400" />}
                        <button
                            onClick={() => setCurrentView('terms')}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                        >
                            {termsAgreed ? 'Review' : 'Read & Agree'}
                        </button>
                    </div>
                </div>
            </div>

            {privacyAgreed && termsAgreed && (
                <div className="text-center pt-4">
                    <button
                        onClick={() => {
                            onAgreementComplete(true);
                            onClose();
                        }}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold transition-colors"
                    >
                        Continue Registration
                    </button>
                </div>
            )}
        </div>
    );

    const renderPrivacyPolicy = () => (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setCurrentView('menu')}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        ← Back
                    </button>
                    <h2 className="text-xl font-semibold text-white">Privacy Policy</h2>
                </div>
                {privacyAgreed && <Check className="h-6 w-6 text-green-400" />}
            </div>
            
            <div 
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-6 space-y-6"
            >
                <div className="text-gray-400 text-sm mb-4">Last updated: {PRIVACY_POLICY_LAST_UPDATED}</div>
                
                <section>
                    <h3 className="text-lg font-semibold text-white mb-3">1. Introduction</h3>
                    <p className="text-gray-300 leading-relaxed">
                        Welcome to Political Arena. This Privacy Policy explains how we collect, use, disclose, 
                        and safeguard your information when you use our political simulation game platform. 
                        Please read this privacy policy carefully. If you do not agree with the terms of this 
                        privacy policy, please do not access the application.
                    </p>
                </section>

                <section>
                    <h3 className="text-lg font-semibold text-white mb-3">2. Information We Collect</h3>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium text-blue-400 mb-2">Personal Information</h4>
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
                            <h4 className="font-medium text-blue-400 mb-2">Automatically Collected Information</h4>
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
                    <h3 className="text-lg font-semibold text-white mb-3">3. How We Use Your Information</h3>
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
                    <h3 className="text-lg font-semibold text-white mb-3">4. Information Sharing and Disclosure</h3>
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
                    <h3 className="text-lg font-semibold text-white mb-3">5. Data Security</h3>
                    <p className="text-gray-300 leading-relaxed">
                        We implement appropriate security measures to protect your personal information against 
                        unauthorized access, alteration, disclosure, or destruction. However, no method of 
                        transmission over the internet or electronic storage is 100% secure, and we cannot 
                        guarantee absolute security.
                    </p>
                </section>

                <section>
                    <h3 className="text-lg font-semibold text-white mb-3">6. Your Rights and Choices</h3>
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

                <div className="pt-8 pb-4">
                    <p className="text-gray-500 text-sm text-center">
                        This Privacy Policy is effective as of December 2024 and will remain in effect 
                        except with respect to any changes in its provisions in the future.
                    </p>
                </div>
            </div>
            
            <div className="p-4 border-t border-gray-700">
                <button
                    onClick={handleAgreePrivacy}
                    disabled={!canAgreePrivacy}
                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md font-semibold transition-colors"
                >
                    {!canAgreePrivacy ? 'Scroll to bottom to agree' : 'I Agree to Privacy Policy'}
                </button>
            </div>
        </div>
    );

    const renderTermsOfService = () => (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setCurrentView('menu')}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        ← Back
                    </button>
                    <h2 className="text-xl font-semibold text-white">Terms of Service</h2>
                </div>
                {termsAgreed && <Check className="h-6 w-6 text-green-400" />}
            </div>
            
            <div 
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-6 space-y-6"
            >
                <div className="text-gray-400 text-sm mb-4">Last updated: {TERMS_OF_SERVICE_LAST_UPDATED}</div>
                
                <section>
                    <h3 className="text-lg font-semibold text-white mb-3">1. Acceptance of Terms</h3>
                    <p className="text-gray-300 leading-relaxed">
                        Welcome to Political Arena. These Terms of Service ("Terms") govern your use of our 
                        political simulation game platform. By accessing or using our service, you agree to 
                        be bound by these Terms. If you do not agree to these Terms, please do not use our service.
                    </p>
                </section>

                <section>
                    <h3 className="text-lg font-semibold text-white mb-3">2. Description of Service</h3>
                    <p className="text-gray-300 leading-relaxed">
                        Political Arena is an online political simulation game where users can create characters, 
                        engage in political activities, join parties, run for office, and participate in various 
                        gameplay mechanics designed to simulate the political process. The service is provided 
                        for entertainment purposes only.
                    </p>
                </section>

                <section>
                    <h3 className="text-lg font-semibold text-white mb-3">3. Acceptable Use Policy</h3>
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
                    <h3 className="text-lg font-semibold text-white mb-3">4. Content and Conduct</h3>
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
                    </div>
                </section>

                <section>
                    <h3 className="text-lg font-semibold text-white mb-3">5. Virtual Currency and Items</h3>
                    <p className="text-gray-300 leading-relaxed">
                        Our game may include virtual currency, items, or achievements that have no real-world value. 
                        These virtual assets are not transferable outside the game and cannot be exchanged for 
                        real money. We reserve the right to modify, suspend, or terminate virtual economies 
                        at any time.
                    </p>
                </section>

                <section>
                    <h3 className="text-lg font-semibold text-white mb-3">6. Account Suspension and Termination</h3>
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
                    </div>
                </section>

                <section>
                    <h3 className="text-lg font-semibold text-white mb-3">7. Disclaimers and Limitation of Liability</h3>
                    <p className="text-gray-300 leading-relaxed">
                        The service is provided "as is" without warranties of any kind. We disclaim all 
                        warranties, express or implied, including but not limited to warranties of 
                        merchantability, fitness for a particular purpose, and non-infringement.
                    </p>
                </section>

                <div className="pt-8 pb-4">
                    <p className="text-gray-500 text-sm text-center">
                        By using Political Arena, you acknowledge that you have read, understood, and 
                        agree to be bound by these Terms of Service.
                    </p>
                </div>
            </div>
            
            <div className="p-4 border-t border-gray-700">
                <button
                    onClick={handleAgreeTerms}
                    disabled={!canAgreeTerms}
                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md font-semibold transition-colors"
                >
                    {!canAgreeTerms ? 'Scroll to bottom to agree' : 'I Agree to Terms of Service'}
                </button>
            </div>
        </div>
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h1 className="text-xl font-semibold text-white">Legal Agreements Required</h1>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-hidden">
                    {currentView === 'menu' && renderMenu()}
                    {currentView === 'privacy' && renderPrivacyPolicy()}
                    {currentView === 'terms' && renderTermsOfService()}
                </div>
            </div>
        </div>
    );
};

export default PolicyAgreementModal; 