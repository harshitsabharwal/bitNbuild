import React from 'react';

const AuthLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen w-full bg-white">
            {/* Form Panel */}
            <div className="flex flex-1 flex-col justify-center items-center p-8 overflow-y-auto">
                <div className="w-full max-w-md">
                    {children}
                </div>
            </div>

            {/* Image Panel */}
            <div className="relative hidden lg:flex flex-1 items-center justify-center bg-blue-600">
                <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('https://placehold.co/1000x1200/3b82f6/ffffff?text=EduConnect&font=raleway')" }}
                >
                   <div className="absolute inset-0 bg-blue-600 opacity-50"></div>
                </div>
                <div className="relative z-10 text-center text-white p-8">
                    <h1 className="text-5xl font-bold mb-4">EduConnect</h1>
                    <p className="text-xl">Your journey to knowledge begins here.</p>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;