import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Heart } from 'lucide-react';

// URL de base de l'API déployée
const API_BASE_URL = 'https://bloodlink-of0v.onrender.com';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState('Donor');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    
    // Registration fields
    const [fullName, setFullName] = useState('');
    const [bloodGroup, setBloodGroup] = useState('O+');
    const [dateOfBirth, setDateOfBirth] = useState(''); // Format: YYYY-MM-DD
    const [professionalId, setProfessionalId] = useState('');
    const [hospital, setHospital] = useState('');
    const [bankName, setBankName] = useState('');
    const [location, setLocation] = useState('');

    const navigate = useNavigate();
    
    // MODIFICATION APPLIQUÉE : Ajout de 'text-gray-900' pour forcer le texte saisi en noir
    const inputClasses = "w-full px-3 py-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500 transition shadow-sm text-gray-900";
    const labelClasses = "block text-sm font-medium text-gray-700 mb-1";
    
    // Fonction utilitaire pour gérer l'expiration du message
    const displayMessage = (msg, isSuccess = false) => {
        setMessage(msg);
        setTimeout(() => setMessage(''), 5000);
    };

    // --- LOGIC: Handle Submission ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            if (isLogin) {
                await handleLogin();
            } else {
                await handleRegister();
            }
        } catch (error) {
            console.error("Authentication Error:", error);
            
            // Tentative d'extraction d'un message d'erreur spécifique du backend
            const errorMsg = error.response?.data?.error || 
                             error.response?.data?.detail || 
                             error.response?.data?.message || 
                             'An unknown error occurred. Please check your inputs.';

            displayMessage(`Error: ${errorMsg}`, false);

        } finally {
            setLoading(false);
        }
    };

    // --- LOGIC: Login ---
    const handleLogin = async () => {
        const loginRole = role === 'Blood Bank' ? 'bloodbank' : role.toLowerCase();

        const response = await axios.post(`${API_BASE_URL}/api/auth/login/`, {
            email,
            password,
            role: loginRole, // 'donor', 'doctor', 'bloodbank'
        });

        // Supposons que le token d'accès soit utilisé pour les requêtes futures
        localStorage.setItem("accessToken", response.data.access);
        localStorage.setItem("refreshToken", response.data.refresh);
        localStorage.setItem("userRole", response.data.role); // Rôle réel du backend

        displayMessage(`Login successful as ${response.data.role.toUpperCase()}!`, true);

        // Redirection basée sur le rôle
        const userRole = response.data.role;
        let path;
        switch (userRole) {
            case 'donor':
                path = '/donor';
                break;
            case 'doctor':
                path = '/doctor'; 
                break;
            case 'bloodbank':
                path = '/blood-bank';
                break;
            default:
                path = '/';
        }
        
        // Simuler un léger délai avant la redirection pour que l'utilisateur voie le message de succès
        setTimeout(() => navigate(path), 1500);
    };

    // --- LOGIC: Registration ---
    const handleRegister = async () => {
        let endpoint;
        let data = { email, password };
        
        // Construction des données spécifiques au rôle
        switch (role) {
            case 'Donor':
                endpoint = '/api/auth/register/donneur/'; // URL définie dans urls.py
                data = {
                    ...data,
                    name: fullName,
                    blood_group: bloodGroup,
                    // Le backend s'attend à JJ/MM/AAAA ou YYYY-MM-DD. Utilisons YYYY-MM-DD pour les inputs HTML
                    date_of_birth: dateOfBirth, 
                };
                break;
            case 'Doctor':
                endpoint = '/api/auth/register/doctor/';
                data = {
                    ...data,
                    professional_id: professionalId,
                    hospital: hospital,
                };
                break;
            case 'Blood Bank':
                endpoint = '/api/auth/register/blood_bank/';
                data = {
                    ...data,
                    bank_name: bankName,
                    location: location,
                };
                break;
            default:
                throw new Error("Invalid role selected.");
        }
        
        const response = await axios.post(`${API_BASE_URL}${endpoint}`, data);

        console.log("Registration Response:", response.data);
        console.error(`Erreur d'Authentification (Statut ${status}):`, serverMessage);
        displayMessage(`Account created successfully! Please log in now.`, true);
        
        // Nettoyer les champs d'enregistrement et passer au mode connexion
        setFullName('');
        setProfessionalId('');
        setHospital('');
        setBankName('');
        setLocation('');
        setIsLogin(true);
    };


    // --- RENDERING: Conditional Registration Fields ---
    const renderRegisterFields = useCallback(() => {
        switch (role) {
            case 'Donor':
                return (
                    <>
                        <div className="mb-4">
                            <label htmlFor="fullName" className={labelClasses}>Full Name</label>
                            <input
                                type="text"
                                id="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className={inputClasses}
                                placeholder="John Doe"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="bloodGroup" className={labelClasses}>Blood Group</label>
                            <select
                                id="bloodGroup"
                                value={bloodGroup}
                                onChange={(e) => setBloodGroup(e.target.value)}
                                className={`${inputClasses} appearance-none bg-white`}
                                required
                            >
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="dateOfBirth" className={labelClasses}>Date of Birth</label>
                            <input
                                type="date"
                                id="dateOfBirth"
                                value={dateOfBirth}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                                className={inputClasses}
                                required
                            />
                        </div>
                    </>
                );

            case 'Doctor':
                return (
                    <>
                        <div className="mb-4">
                            <label htmlFor="profID" className={labelClasses}>Professional ID</label>
                            <input
                                type="text"
                                id="profID"
                                value={professionalId}
                                onChange={(e) => setProfessionalId(e.target.value)}
                                className={inputClasses}
                                placeholder="MED-NY-2045"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="hospital" className={labelClasses}>Hospital</label>
                            <input
                                type="text"
                                id="hospital"
                                value={hospital}
                                onChange={(e) => setHospital(e.target.value)}
                                className={inputClasses}
                                placeholder="Central Hospital"
                                required
                            />
                        </div>
                    </>
                );

            case 'Blood Bank':
                return (
                    <>
                        <div className="mb-4">
                            <label htmlFor="bankName" className={labelClasses}>Blood Bank Name</label>
                            <input
                                type="text"
                                id="bankName"
                                value={bankName}
                                onChange={(e) => setBankName(e.target.value)}
                                className={inputClasses}
                                placeholder="City Blood Bank"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="location" className={labelClasses}>Location</label>
                            <input
                                type="text"
                                id="location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className={inputClasses}
                                placeholder="123 Main Street"
                                required
                            />
                        </div>
                    </>
                );
            
            default:
                return null;
        }
    }, [role, fullName, bloodGroup, dateOfBirth, professionalId, hospital, bankName, location, labelClasses, inputClasses]);
    
    // --- RENDERING: Main Component ---
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-10 pb-20 font-inter">
            <div className="w-full max-w-sm md:max-w-md mb-8 px-4 text-gray-900 self-center md:self-center">
                <Link to="/donor" className="flex items-center text-sm hover:text-red-600 transition duration-150">
                    <span className="mr-1">←</span> Back to Donor Dashboard
                </Link>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm border-t-4 border-red-600">
                
                <h2 className="text-3xl font-bold text-red-600 flex items-center gap-2">
                    <Heart className="w-8 h-8 fill-red-600" />
                    BloodLink
                </h2>
                <p className="text-gray-500 mb-6 text-sm">Sign in or register to join the network.</p>
                
                {/* Toggle Login/Register */}
                <div className="flex bg-gray-100 p-1 rounded-xl mb-8 shadow-inner">
                    <button
                        type="button"
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition duration-200 ${isLogin ? 'bg-white shadow-md text-red-700' : 'text-gray-500 hover:bg-gray-200'}`}
                        onClick={() => {
                            setIsLogin(true);
                            setMessage('');
                        }}
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition duration-200 ${!isLogin ? 'bg-white shadow-md text-red-700' : 'text-gray-500 hover:bg-gray-200'}`}
                        onClick={() => {
                            setIsLogin(false);
                            setMessage('');
                        }}
                    >
                        Register
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    {/* Role Selection */}
                    <div className="mb-4">
                        <label htmlFor="role" className={labelClasses}>I am a</label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className={`${inputClasses} appearance-none bg-white`}
                            disabled={loading}
                        >
                            <option value="Donor">Donor</option>
                            <option value="Doctor">Doctor</option>
                            <option value="Blood Bank">Blood Bank</option>
                        </select>
                    </div>

                    {/* Conditional Registration Fields */}
                    {!isLogin && (
                        <div className="mt-6 mb-6 border-t pt-4 border-gray-100">
                           <h3 className="text-md font-semibold text-gray-800 mb-4">Role Details</h3>
                           {renderRegisterFields()}
                        </div>
                    )}

                    {/* Email */}
                    <div className="mb-4">
                        <label htmlFor="email" className={labelClasses}>Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={inputClasses}
                            placeholder="your@email.com"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Password */}
                    <div className="mb-6">
                        <label htmlFor="password" className={labelClasses}>Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={inputClasses}
                            placeholder="********"
                            required
                            disabled={loading}
                        />
                    </div>
                    
                    {/* Message */}
                    {message && (
                        <div className={`mb-4 p-3 rounded-lg text-sm font-medium border ${message.includes('successful') || message.includes('created') ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                            {message}
                        </div>
                    )}

                    {/* Action Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 transition duration-200 disabled:bg-red-400 disabled:cursor-not-allowed shadow-lg"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </div>
                        ) : (isLogin ? 'Login' : 'Create Account')}
                    </button>
                    
                    {isLogin && (
                        <div className="mt-4 text-center">
                            <a href="#forgot" className="text-sm text-gray-500 hover:text-red-600 transition duration-150">
                                Forgot password?
                            </a>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Login;