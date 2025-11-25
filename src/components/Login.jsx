import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Heart } from 'lucide-react';

// URL de base de l'API déployée
const API_BASE_URL = 'https://bloodlink-of0v.onrender.com';

const Login = () => {
    // Rôles et messages en français
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState('Donneur'); 
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
    
    const inputClasses = "w-full px-3 py-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500 transition shadow-sm text-gray-900";
    const labelClasses = "block text-sm font-medium text-gray-700 mb-1";
    
    // Fonction utilitaire pour gérer l'expiration du message
    const displayMessage = (msg, isSuccess = false) => {
        setMessage(msg);
        setTimeout(() => setMessage(''), 7000); // Temps augmenté pour lire l'erreur
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
            setLoading(false);
            
            // CONSOLE ERROR DÉTAILLÉ POUR LE DÉBOGAGE
            console.error("ERREUR D'AUTHENTIFICATION DÉTAILLÉE (Objet d'erreur Axios):", error);
            if (error.response) {
                 // LOG LA RÉPONSE JSON EXACTE DU SERVEUR (Code 400)
                console.error("RÉPONSE DU SERVEUR (Status Code, Data) :", error.response.status, error.response.data);
            }
            // FIN DE L'AJOUT CONSOLE ERROR
            
            const status = error.response?.status;
            let errorMsg = "Une erreur inconnue est survenue. Veuillez vérifier vos entrées.";

            if (status === 400) {
                 // 400 Bad Request: Extrait la réponse exacte du serveur
                const serverResponse = error.response?.data;
                const fieldErrors = JSON.stringify(serverResponse);
                
                // Affiche la réponse JSON exacte dans l'interface utilisateur
                errorMsg = `ERREUR 400 (Mauvaise Requête) : Le serveur a rejeté les données. Réponse: ${fieldErrors.substring(0, 200)}...`;

            } else if (status === 401 || status === 403) {
                errorMsg = "Erreur de Connexion : Les identifiants sont incorrects ou non autorisés.";
            } else if (error.message.includes('Network Error')) {
                errorMsg = "Erreur Réseau : Impossible de joindre le serveur. Vérifiez l'URL de l'API.";
            } else {
                errorMsg = error.response?.data?.error || 
                             error.response?.data?.detail || 
                             error.response?.data?.message || 
                             errorMsg;
            }

            displayMessage(`Erreur : ${errorMsg}`, false);

        } finally {
            if (!message.includes('réussie') && !message.includes('créé')) {
                setLoading(false);
            }
        }
    };

    // --- LOGIC: Login ---
    const handleLogin = async () => {
        // Mappage des rôles français vers les rôles attendus par le backend
        let loginRole;
        if (role === 'Banque de Sang') {
            loginRole = 'bloodbank';
        } else if (role === 'Donneur') {
            loginRole = 'donor';
        } else if (role === 'Docteur') {
            loginRole = 'doctor';
        } else {
            loginRole = role.toLowerCase();
        }


        const response = await axios.post(`${API_BASE_URL}/api/auth/login/`, {
            email,
            password,
            role: loginRole, // 'donor', 'doctor', 'bloodbank'
        });

        localStorage.setItem("accessToken", response.data.access);
        localStorage.setItem("refreshToken", response.data.refresh);
        localStorage.setItem("userRole", response.data.role); 

        displayMessage(`Connexion réussie en tant que ${response.data.role.toUpperCase()}!`, true);

        const userRole = response.data.role;
        let path;
        switch (userRole) {
            case 'donor':
                path = '/donor';
                break;
            case 'doctor':
                path = '/doctor'; 
                break;
            case 'Banque de Sang':
                path = '/blood-bank'; 
                break;
            default:
                path = '/';
        }
        
        setTimeout(() => navigate(path), 1500);
    };

    // --- LOGIC: Registration ---
    const handleRegister = async () => {
        let endpoint;
        let data = { email, password };
        
        // Construction des données spécifiques au rôle
        switch (role) {
            case 'Donneur':
                endpoint = '/api/auth/register/donneur/';
                data = {
                    ...data,
                    name: fullName,
                    blood_group: bloodGroup,
                    date_of_birth: dateOfBirth, 
                    role: 'donor', // CORRECTION: Ajout explicite du rôle
                };
                break;
            case 'Docteur':
                endpoint = '/api/auth/register/doctor/';
                data = {
                    ...data,
                    professional_id: professionalId,
                    hospital: hospital,
                    role: 'doctor', // CORRECTION: Ajout explicite du rôle
                };
                break;
            case 'Banque de Sang':
                endpoint = '/api/auth/register/blood_bank/';
                data = {
                    ...data,
                    // CLÉS À VÉRIFIER EN CAS D'ERREUR 400
                    bank_name: bankName, 
                    location: location,
                    role: 'bloodbank', // CORRECTION CRITIQUE: Ajout explicite du rôle pour résoudre le "Role mismatch"
                };
                console.log("PAIEMENT BANQUE DE SANG ENVOYÉ :", data); 
                break;
            default:
                throw new Error("Rôle sélectionné invalide.");
        }
        
        const response = await axios.post(`${API_BASE_URL}${endpoint}`, data);

        displayMessage(`Compte créé avec succès ! Veuillez vous connecter maintenant.`, true);
        
        // Nettoyer les champs d'enregistrement et passer au mode connexion
        setFullName('');
        setProfessionalId('');
        setHospital('');
        setBankName('');
        setLocation('');
        setEmail(''); 
        setPassword('');
        setIsLogin(true);
    };


    // --- RENDERING: Conditional Registration Fields ---
    const renderRegisterFields = useCallback(() => {
        switch (role) {
            case 'Donneur':
                return (
                    <>
                        <div className="mb-4">
                            <label htmlFor="fullName" className={labelClasses}>Nom Complet</label>
                            <input
                                type="text"
                                id="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className={inputClasses}
                                placeholder="Jean Dupont"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="bloodGroup" className={labelClasses}>Groupe Sanguin</label>
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
                            <label htmlFor="dateOfBirth" className={labelClasses}>Date de Naissance</label>
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

            case 'Docteur':
                return (
                    <>
                        <div className="mb-4">
                            <label htmlFor="profID" className={labelClasses}>Identifiant Professionnel</label>
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
                            <label htmlFor="hospital" className={labelClasses}>Hôpital</label>
                            <input
                                type="text"
                                id="hospital"
                                value={hospital}
                                onChange={(e) => setHospital(e.target.value)}
                                className={inputClasses}
                                placeholder="Hôpital Central"
                                required
                            />
                        </div>
                    </>
                );

            case 'Banque de Sang':
                return (
                    <>
                        <div className="mb-4">
                            <label htmlFor="bankName" className={labelClasses}>Nom de la Banque de Sang</label>
                            <input
                                type="text"
                                id="bankName"
                                value={bankName}
                                onChange={(e) => setBankName(e.target.value)}
                                className={inputClasses}
                                placeholder="Banque de Sang de la Ville"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="location" className={labelClasses}>Localisation</label>
                            <input
                                type="text"
                                id="location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className={inputClasses}
                                placeholder="123 Rue Principale"
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
                    <span className="mr-1">←</span> Retour au Tableau de Bord Donneur
                </Link>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm border-t-4 border-red-600">
                
                <h2 className="text-3xl font-bold text-red-600 flex items-center gap-2">
                    <Heart className="w-8 h-8 fill-red-600" />
                    BloodLink
                </h2>
                <p className="text-gray-500 mb-6 text-sm">Connectez-vous ou inscrivez-vous pour rejoindre le réseau.</p>
                
                {/* Toggle Connexion/Inscription */}
                <div className="flex bg-gray-100 p-1 rounded-xl mb-8 shadow-inner">
                    <button
                        type="button"
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition duration-200 ${isLogin ? 'bg-white shadow-md text-red-700' : 'text-gray-500 hover:bg-gray-200'}`}
                        onClick={() => {
                            setIsLogin(true);
                            setMessage('');
                        }}
                    >
                        Connexion
                    </button>
                    <button
                        type="button"
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition duration-200 ${!isLogin ? 'bg-white shadow-md text-red-700' : 'text-gray-500 hover:bg-gray-200'}`}
                        onClick={() => {
                            setIsLogin(false);
                            setMessage('');
                        }}
                    >
                        Inscription
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    {/* Role Selection */}
                    <div className="mb-4">
                        <label htmlFor="role" className={labelClasses}>Je suis un(e)</label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className={`${inputClasses} appearance-none bg-white`}
                            disabled={loading}
                        >
                            <option value="Donneur">Donneur</option>
                            <option value="Docteur">Docteur</option>
                            <option value="Banque de Sang">Banque de Sang</option>
                        </select>
                    </div>

                    {/* Conditional Registration Fields */}
                    {!isLogin && (
                        <div className="mt-6 mb-6 border-t pt-4 border-gray-100">
                           <h3 className="text-md font-semibold text-gray-800 mb-4">Détails du Rôle</h3>
                           {renderRegisterFields()}
                        </div>
                    )}

                    {/* Email */}
                    <div className="mb-4">
                        <label htmlFor="email" className={labelClasses}>Courriel</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={inputClasses}
                            placeholder="votre@email.com"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Password */}
                    <div className="mb-6">
                        <label htmlFor="password" className={labelClasses}>Mot de Passe</label>
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
                        <div className={`mb-4 p-3 rounded-lg text-sm font-medium border ${message.includes('réussie') || message.includes('créé') ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
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
                                Traitement en cours...
                            </div>
                        ) : (isLogin ? 'Se Connecter' : 'Créer un Compte')}
                    </button>
                    
                    {isLogin && (
                        <div className="mt-4 text-center">
                            <a href="#forgot" className="text-sm text-gray-500 hover:text-red-600 transition duration-150">
                                Mot de passe oublié ?
                            </a>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Login;