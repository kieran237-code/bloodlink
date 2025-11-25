import React, { useState, useEffect, useCallback } from "react";
import { Heart, Send, Clock, CheckCircle, Hourglass, XCircle, Loader2, User } from "lucide-react";
import { Link } from "react-router-dom";
import axios from 'axios';

// URL de base de l'API déployée
const API_BASE_URL = 'https://bloodlink-of0v.onrender.com';

// Instance Axios configurée pour inclure le token d'accès dans chaque requête
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur pour ajouter le token JWT aux requêtes
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Helper for urgency tag styling
const getUrgencyClasses = (urgency) => {
    switch (urgency) {
        case "Extremely Urgent":
            return "bg-red-600 text-white shadow-lg";
        case "Urgent":
            return "bg-yellow-500 text-gray-900 shadow-md";
        case "Normal":
            return "bg-green-500 text-white shadow-md";
        default:
            return "bg-gray-400 text-gray-800";
    }
};

// Helper for status icons
const getStatusIcon = (status) => {
    switch (status) {
        case "completed":
            return <CheckCircle className="w-4 h-4 text-green-500 fill-green-100" />;
        case "pending":
            return <Clock className="w-4 h-4 text-yellow-500 fill-yellow-100" />;
        case "failed":
            return <XCircle className="w-4 h-4 text-red-500 fill-red-100" />;
        default:
            return <Hourglass className="w-4 h-4 text-gray-500" />;
    }
};

// --- Composant Principal ---
export default function Doctor() {
    // Form state
    const [bloodGroup, setBloodGroup] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [urgency, setUrgency] = useState("");
    const [hospitalName, setHospitalName] = useState("Hospital Central"); // Default hospital name

    // Data and UI state
    const [requests, setRequests] = useState([]);
    
    const [loadingRequests, setLoadingRequests] = useState(true);
    const [submissionLoading, setSubmissionLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Fonction utilitaire pour gérer les messages
    const showMessage = (msg, isError = false) => {
        if (isError) {
            setError(msg);
            setSuccessMessage(null);
            setTimeout(() => setError(null), 5000);
        } else {
            setSuccessMessage(msg);
            setError(null);
            setTimeout(() => setSuccessMessage(null), 4000);
        }
    };

    // --- 1. Récupération de l'historique des requêtes ---
    const loadRequests = useCallback(async () => {
        setLoadingRequests(true);
        try {
            // Endpoint: /api/doctor/requests/
            const response = await api.get('/api/doctor/requests/'); 
            // S'assurer que les plus récents sont en haut
            setRequests(response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
            setError(null);
        } catch (err) {
            console.error("Error loading requests:", err);
            // Gérer spécifiquement l'erreur 401/403 pour l'authentification
            if (err.response?.status === 401 || err.response?.status === 403) {
                 showMessage("Session expired or unauthorized. Please log in again.", true);
                 // Simuler une redirection si nécessaire: navigate('/auth');
            } else {
                 showMessage("Failed to load request history. Check network.", true);
            }
        } finally {
            setLoadingRequests(false);
        }
    }, []);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);


    // --- 2. Soumettre une nouvelle requête (API) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmissionLoading(true);
        setError(null);
        setSuccessMessage(null);

        // Validation simple
        if (!bloodGroup || !urgency || !hospitalName || quantity < 1) {
            setSubmissionLoading(false);
            showMessage("Please complete all required fields and ensure quantity is at least 1.", true);
            return;
        }

        try {
            // Le backend gère automatiquement le champ 'doctor' à partir de l'utilisateur authentifié
            const newRequestData = {
                blood_group: bloodGroup,
                quantity: parseInt(quantity, 10),
                urgency: urgency, // Assurez-vous que cela correspond aux choices du modèle (Normal, Urgent, Extremely Urgent)
                hospital: hospitalName,
                // Le status sera 'pending' par défaut côté backend
            };

            // Endpoint: /api/doctor/requests/
            const response = await api.post('/api/doctor/requests/', newRequestData);
            
            const createdRequest = response.data;
            
            // Mise à jour de l'UI: Ajouter la nouvelle requête au début de la liste
            setRequests(prevRequests => [
                createdRequest, 
                ...prevRequests.filter(req => req.id !== createdRequest.id) // S'assurer qu'il n'y ait pas de duplicata
            ]);

            // Reset form fields
            setBloodGroup("");
            setQuantity(1);
            setUrgency("");
            
            showMessage(`Request for ${bloodGroup} sent successfully! Donors are being notified.`, false);

        } catch (err) {
            console.error("API Submission Error:", err.response?.data || err.message);
            showMessage("Failed to submit request. Please check the data and try again.", true);
        } finally {
            setSubmissionLoading(false);
        }
    };

    const inputStyleClasses = "w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-red-500 focus:border-red-500 transition text-gray-900 placeholder-gray-500";

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-inter">
            {/* --- En-tête --- */}
            <header className="flex justify-between items-center bg-white p-4 rounded-xl shadow-xl mb-6 max-w-7xl mx-auto border-t-4 border-red-600">
                <div className="flex items-center gap-3">
                    <Heart className="w-6 h-6 text-red-600 fill-red-600" />
                    <div>
                        <span className="text-xl font-bold text-gray-900">BloodLink</span>
                        <p className="text-sm text-gray-500">Doctor Portal</p>
                    </div>
                </div>
                {/* Bouton de Déconnexion (simulé) */}
                <Link to="/auth"> 
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition shadow-sm">
                        <User className="w-4 h-4 inline mr-1" /> Logout
                    </button>
                </Link>
            </header>

            {/* Error and Success Messages */}
            <div className="max-w-7xl mx-auto mb-4">
                {error && (
                    <div className="p-3 mb-3 text-sm font-medium text-red-800 bg-red-100 rounded-lg flex items-center shadow-md border border-red-200" role="alert">
                        <XCircle className="w-5 h-5 mr-2" />
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div className="p-3 mb-3 text-sm font-medium text-green-800 bg-green-100 rounded-lg flex items-center shadow-md border border-green-200">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        {successMessage}
                    </div>
                )}
            </div>

            <main className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
                {/* Nouvelle demande */}
                <section className="bg-white rounded-xl shadow-lg p-6 border border-red-100 h-fit">
                    <div className="flex items-center mb-6 border-b pb-4">
                        <Send className="w-5 h-5 text-red-600 mr-2 transform rotate-45" />
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">New Blood Request</h2>
                            <p className="text-sm text-gray-500">Submit a new blood request to notify donors</p>
                        </div>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {/* Blood Group */}
                        <div>
                            <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700 mb-1">
                                Blood Group
                            </label>
                            <select
                                id="bloodGroup"
                                value={bloodGroup}
                                onChange={(e) => setBloodGroup(e.target.value)}
                                required
                                className={inputStyleClasses}
                            >
                                <option value="">Select blood group</option>
                                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(group => (
                                    <option key={group} value={group}>{group}</option>
                                ))}
                            </select>
                        </div>

                        {/* Hospital Name */}
                        <div>
                            <label htmlFor="hospitalName" className="block text-sm font-medium text-gray-700 mb-1">
                                Hospital Name
                            </label>
                            <input
                                id="hospitalName"
                                type="text"
                                value={hospitalName}
                                onChange={(e) => setHospitalName(e.target.value)}
                                required
                                className={inputStyleClasses}
                                placeholder="Ex: Hôpital Central"
                            />
                        </div>

                        {/* Quantity */}
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                                Quantity (units)
                            </label>
                            <input
                                id="quantity"
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className={inputStyleClasses}
                            />
                        </div>

                        {/* Urgency Level */}
                        <div>
                            <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-1">
                                Urgency Level
                            </label>
                            <select
                                id="urgency"
                                value={urgency}
                                onChange={(e) => setUrgency(e.target.value)}
                                required
                                className={inputStyleClasses}
                            >
                                <option value="">Select urgency</option>
                                <option value="Normal">Normal</option>
                                <option value="Urgent">Urgent</option>
                                <option value="Extremely Urgent">Extremely Urgent</option>
                            </select>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={submissionLoading || !bloodGroup || !urgency || !hospitalName || quantity < 1}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 mt-4 rounded-lg shadow-xl flex items-center justify-center transition disabled:bg-red-400 disabled:cursor-not-allowed"
                        >
                            {submissionLoading ? (
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5 mr-2" />
                            )}
                            {submissionLoading ? "Sending Request..." : "Send Request"}
                        </button>
                    </form>
                </section>

                {/* Historique */}
                <section className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">Previous Requests ({requests.length})</h2>
                    
                    {loadingRequests ? (
                        <div className="flex flex-col items-center justify-center h-40">
                            <Loader2 className="w-6 h-6 text-red-500 animate-spin mb-3" />
                            <p className="text-gray-500">Loading request history...</p>
                        </div>
                    ) : requests.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-8 bg-gray-50 rounded-lg">No requests found. Use the form to submit one.</p>
                    ) : (
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                            {requests.map((req) => (
                                <div
                                    key={req.id}
                                    className="bg-gray-50 p-4 border border-gray-200 rounded-lg flex justify-between items-center shadow-sm hover:shadow-md transition duration-200"
                                >
                                    <div>
                                        <div className="flex items-center mb-1">
                                            <span 
                                                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getUrgencyClasses(
                                                    req.urgency
                                                )}`}
                                            >
                                                {req.urgency}
                                            </span>
                                            <span className="text-xs font-light text-gray-500 ml-2">
                                                ID: #{req.id}
                                            </span>
                                        </div>
                                        <p className="text-sm font-light text-gray-600 mb-2">
                                            Hospital: <span className="font-medium text-gray-800">{req.hospital}</span>
                                        </p>
                                        <p className="text-3xl font-extrabold text-red-600">{req.blood_group} ({req.quantity} units)</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(req.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center justify-end text-sm font-bold capitalize text-gray-600 mb-2">
                                            {getStatusIcon(req.status)}
                                            <span className="ml-1">{req.status}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}