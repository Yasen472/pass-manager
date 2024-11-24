// import React, { createContext, useState, useContext } from 'react';

// // Create the context
// const SecurityContext = createContext();

// // Provider component
// export const SecurityProvider = ({ children }) => {
//     const [isResetting, setIsResetting] = useState(false);
//     const [isResettingWithoutPassword, setIsResettingWithoutPassword] = useState(false);

//     return (
//         <SecurityContext.Provider value={{ isResetting, setIsResetting }}>
//             {children}
//         </SecurityContext.Provider>
//     );
// };

// // Custom hook for consuming the context
// export const useSecurityContext = () => {
//     return useContext(SecurityContext);
// };


import React, { createContext, useState, useContext } from 'react';

// Create the context
const SecurityContext = createContext();

// Provider component
export const SecurityProvider = ({ children }) => {
    const [isResetting, setIsResetting] = useState(false);
    const [isResettingWithoutPassword, setIsResettingWithoutPassword] = useState(false);

    return (
        <SecurityContext.Provider value={{ 
            isResetting, 
            setIsResetting, 
            isResettingWithoutPassword, 
            setIsResettingWithoutPassword 
        }}>
            {children}
        </SecurityContext.Provider>
    );
};

// Custom hook for consuming the context
export const useSecurityContext = () => {
    return useContext(SecurityContext);
};

