/**
 * Footer Component
 * Accessible footer with modern design
 */

import React from "react";
import { Heart, Phone, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white transition-colors duration-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold">Pulse.ai</span>
            </div>
            <p className="text-gray-400 text-lg leading-relaxed mb-6">
              Making healthcare accessible, simple, and personal for everyone.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-400">
                <Phone className="w-5 h-5 text-teal-500" />
                <span className="text-lg">1-800-PULSE-AI</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400">
                <Mail className="w-5 h-5 text-teal-500" />
                <span className="text-lg">support@pulseai.health</span>
              </div>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h3 className="text-xl font-bold mb-5">Product</h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="#features"
                  className="text-lg text-gray-400 hover:text-teal-400 transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <button
                  type="button"
                  className="text-lg text-gray-400 hover:text-teal-400 transition-colors"
                >
                  Pricing
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="text-lg text-gray-400 hover:text-teal-400 transition-colors"
                >
                  FAQ
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="text-lg text-gray-400 hover:text-teal-400 transition-colors"
                >
                  For Doctors
                </button>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="text-xl font-bold mb-5">Company</h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="#about"
                  className="text-lg text-gray-400 hover:text-teal-400 transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <button
                  type="button"
                  className="text-lg text-gray-400 hover:text-teal-400 transition-colors"
                >
                  Careers
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="text-lg text-gray-400 hover:text-teal-400 transition-colors"
                >
                  Contact
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="text-lg text-gray-400 hover:text-teal-400 transition-colors"
                >
                  Blog
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="text-xl font-bold mb-5">Legal</h3>
            <ul className="space-y-4">
              <li>
                <button
                  type="button"
                  className="text-lg text-gray-400 hover:text-teal-400 transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="text-lg text-gray-400 hover:text-teal-400 transition-colors"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="text-lg text-gray-400 hover:text-teal-400 transition-colors"
                >
                  HIPAA Compliance
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="text-lg text-gray-400 hover:text-teal-400 transition-colors"
                >
                  Accessibility
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-gray-400 text-lg text-center sm:text-left">
              © {new Date().getFullYear()} Pulse.ai. All rights reserved.
            </p>
            <p className="text-gray-500 text-base">
              Made with <Heart className="w-4 h-4 text-red-500 inline mx-1" />{" "}
              for better healthcare
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
