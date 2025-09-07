import React from 'react';
import logo from '../assets/logo1main.jpg'; // Import the new logo

const AuthLayout = ({ children }) => {
    return (
        <div className="min-h-screen flex">
            {/* Form Section */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12">
                <div className="w-full max-w-md">
                    {children}
                </div>
            </div>

            {/* Branding Section - Updated with logo1main.jpg */}
            <div className="hidden lg:flex w-1/2 bg-gray-800 items-center justify-center p-12 text-white text-center">
                <img 
                    src={logo} 
                    alt="SkillForge Logo" 
                    className="max-w-xs rounded-full" // Control the size of the logo
                />
            </div>
        </div>
    );
};

export default AuthLayout;

