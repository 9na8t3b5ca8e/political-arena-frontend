import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-800 border-t border-gray-700 mt-12">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Logo and Description */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white">Political Arena</h3>
                        <p className="text-gray-400 text-sm">
                            A strategic political simulation game where you can climb the ranks, 
                            build coalitions, and shape the future of the nation.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link 
                                    to="/" 
                                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    to="/map" 
                                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                                >
                                    Electoral Map
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    to="/parties" 
                                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                                >
                                    Political Parties
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    to="/campaign-hq" 
                                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                                >
                                    Campaign HQ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white">Legal</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link 
                                    to="/privacy-policy" 
                                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    to="/terms-of-service" 
                                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                                >
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright Bar */}
                <div className="border-t border-gray-700 mt-8 pt-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                        <p className="text-gray-400 text-sm">
                            © {currentYear} Political Arena. All rights reserved.
                        </p>
                        <p className="text-gray-500 text-xs mt-2 sm:mt-0">
                            Made for political strategy enthusiasts
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 