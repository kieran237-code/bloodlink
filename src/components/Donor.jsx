import React, { useState, useEffect, useCallback } from "react";
import { Heart, Send, MapPin, CheckCircle, X, Loader2, User } from "lucide-react";
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

// --- Fonction utilitaire pour l'urgence ---
const getUrgencyClasses = (urgency) => {
    switch (urgency) {
        case 'extremely_urgent':
            return 'bg-red-200 text-red-800 border-red-300';
        case 'urgent':
            return 'bg-yellow-200 text-yellow-800 border-yellow-300';
        case 'normal':
            return 'bg-blue-200 text-blue-800 border-blue-300';
        default:
            return 'bg-gray-200 text-gray-800 border-gray-300';
    }
};

// --- Composant Principal ---
export default function Donor() {
    const [donor, setDonor] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [isAvailable, setIsAvailable] = useState(true); // État initial de la bascule
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');

    const displayMessage = (msg, duration = 3000) => {
        setMessage(msg);
        setTimeout(() => setMessage(''), duration);
    };

    // --- 1. Récupération des Alertes ---
    const loadAlerts = useCallback(async (currentAvailability) => {
        if (!currentAvailability) {
            setAlerts([]);
            return;
        }
        
        setIsLoading(true);
        try {
            // Endpoint: /api/donor/alerts/ (filtre automatiquement par groupe sanguin du donneur)
            const response = await api.get('/api/donor/alerts/'); 
            setAlerts(response.data);
            setError(null);
        } catch (err) {
            console.error("Error loading alerts:", err);
            setError("Failed to load alerts. Please check your network connection or authentication.");
            setAlerts([]);
        } finally {
            setIsLoading(false);
        }
    }, []);


    // --- 2. Récupération du Profil ---
    const loadDonorProfile = useCallback(async () => {
        setIsLoading(true);
        try {
            // Endpoint: /api/donor/me/
            const response = await api.get('/api/donor/me/');
            const profile = response.data;

            setDonor(profile);
            // Synchroniser l'état local avec l'état du backend
            setIsAvailable(profile.is_available);
            
            // Charger les alertes immédiatement après avoir récupéré le statut de disponibilité
            loadAlerts(profile.is_available); 
            
            setError(null);
        } catch (err) {
            console.error("Error loading donor profile:", err);
            // Rediriger si non authentifié ou profil non trouvé
            if (err.response?.status === 401 || err.response?.status === 404) {
                 setError("Authentication failed or donor profile not found. Please log in again.");
                 // Simuler une redirection vers la page de connexion après une erreur critique
                 // NOTE: useNavigate doit être importé si l'on veut décommenter navigate('/auth')
                 // navigate('/auth'); 
            } else {
                 setError("Failed to load profile. Check API status.");
            }
            setIsLoading(false);
        }
    }, [loadAlerts]);
    
    useEffect(() => {
        loadDonorProfile();
    }, [loadDonorProfile]);


    // --- 3. Basculer la disponibilité du donneur (API) ---
    const handleAvailabilityToggle = async () => {
        const newStatus = !isAvailable;

        // Mise à jour optimiste de l'UI
        setIsAvailable(newStatus); 
        setMessage(newStatus ? "Updating status to Available..." : "Updating status to Unavailable...");

        try {
            // Endpoint: /api/donor/me/availability/
            await api.patch('/api/donor/me/availability/', { 
                is_available: newStatus 
            });

            displayMessage(
                `Status updated: You are now ${newStatus ? 'AVAILABLE' : 'UNAVAILABLE'}.`,
                4000
            );

            // Recharger/vider les alertes en fonction du nouveau statut réel
            loadAlerts(newStatus);

        } catch (err) {
            console.error("Error updating availability:", err);
            // Rétablir l'état UI en cas d'échec
            setIsAvailable(!newStatus); 
            displayMessage("Failed to update status. Please try again.", 5000);
        }
    };

    // --- 4. Accepter / Rejeter une alerte (API) ---
    const handleResponse = async (alertId, action) => {
        if (!donor) return;

        // Mise à jour optimiste: supprime l'alerte de la liste
        setAlerts(prevAlerts => prevAlerts.filter((alert) => alert.id !== alertId));

        try {
            // Endpoint: /api/donor/alerts/<alert_id>/<action>/
            // NOTE: Le backend utilise l'utilisateur authentifié pour trouver le donneur. 
            // Cependant, l'implémentation de RespondToAlert utilise encore 'donor_id' dans le body. 
            // Si le backend est corrigé pour utiliser request.user.donorprofile.id, on peut retirer 'donor_id' du body.
            // Pour être sûr que cela fonctionne avec le backend fourni, je l'inclus :
            const response = await api.post(`/api/donor/alerts/${alertId}/${action}/`, {
                 donor_id: donor.id // Utilisation de l'ID du donneur pour le backend actuel
            });
            
            displayMessage(
                `Alert ${action}ed successfully! Donor count: ${response.data.donor_count}`, 
                4000
            );
            
            // Recharger les alertes au cas où d'autres changements seraient survenus
            loadAlerts(isAvailable);

        } catch (err) {
            console.error(`Error responding to alert ${alertId}:`, err);
            displayMessage(`Failed to ${action} alert. Please retry.`, 5000);
            
            // En cas d'échec, recharger toutes les alertes pour restaurer l'alerte manquante
            loadAlerts(isAvailable);
        }
    };

    const handleAccept = (alertId) => handleResponse(alertId, 'accept');
    const handleDismiss = (alertId) => handleResponse(alertId, 'reject');

    // --- Gestion du rendu ---
    if (isLoading && !donor) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg">
                <Loader2 className="w-8 h-8 text-red-600 animate-spin mb-3" />
                <p className="text-lg font-semibold text-gray-700">Loading donor profile...</p>
            </div>
        </div>
    );

    if (error || !donor) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="text-center p-8 bg-white shadow-xl max-w-lg mx-auto rounded-xl border-t-4 border-red-700">
                <XCircle className="w-10 h-10 text-red-700 mx-auto mb-4" />
                <p className="text-xl font-bold text-red-800 mb-3">Connection Error</p>
                <p className="text-gray-600 mb-6">{error || "Could not load donor profile. Please check your login status."}</p>
                <Link to="/auth" className="mt-4 inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition shadow-md">
                    <User className="w-5 h-5 mr-2" /> Go to Login / Register
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-inter">
            {/* --- Header --- */}
            <header className="flex justify-between items-center bg-white p-4 rounded-lg shadow-xl mb-6 max-w-4xl mx-auto border-t-4 border-red-600">
                <div className="flex items-center gap-3">
                    <Heart className="w-6 h-6 text-red-600 fill-red-600" />
                    <div>
                        <span className="text-xl font-bold text-gray-900">BloodLink</span>
                        <p className="text-sm text-gray-500">Welcome, {donor.name || "Donor"}</p>
                    </div>
                </div>
                {/* Rediriger vers l'auth pour se déconnecter (MOCK) */}
                <Link to="/auth">
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition shadow-sm">
                        Logout
                    </button>
                </Link>
            </header>

            {message && (
                <div className="max-w-4xl mx-auto mb-4 p-3 rounded-lg bg-green-100 text-green-700 text-center font-medium shadow-md border border-green-200">
                    {message}
                </div>
            )}

            {/* --- Corps principal --- */}
            <main className="max-w-4xl mx-auto space-y-6">

                {/* Statut de disponibilité */}
                <div className="flex justify-between items-center p-6 bg-white rounded-xl shadow-md border border-gray-100">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Availability Status</h2>
                        <p className="text-sm text-gray-600">Turn on to receive urgent donation alerts</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-md font-medium text-gray-800">
                            {isAvailable ? "Available" : "Unavailable"}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isAvailable}
                                onChange={handleAvailabilityToggle}
                                className="sr-only peer"
                            />
                            {/* Tailwind Toggle Switch */}
                            <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-red-600 after:content-[''] after:absolute after:w-4 after:h-4 after:bg-white after:rounded-full after:top-[4px] after:left-[4px] after:transition-all peer-checked:after:translate-x-full shadow-inner"></div>
                        </label>
                    </div>
                </div>

                {/* Groupe sanguin */}
                <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 text-center">
                    <p className="text-lg font-medium text-gray-700 mb-2">Your Blood Group</p>
                    <h3 className="text-6xl font-extrabold text-red-600 mb-1">
                        {donor.blood_group || "N/A"}
                    </h3>
                    <p className="text-xs text-gray-400 mt-2">ID: {donor.id}</p> 
                </div>

                {/* Alertes */}
                <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100">
                    <div className="flex items-center mb-6 border-b pb-4">
                        <Send className="w-5 h-5 text-red-600 mr-2 transform rotate-45" />
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Nearby Alerts ({alerts.length})</h2>
                            <p className="text-sm text-gray-500">Blood requests matching your type</p>
                        </div>
                    </div>

                    {isLoading && donor && alerts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40">
                            <Loader2 className="w-6 h-6 text-red-500 animate-spin mb-3" />
                            <p className="text-gray-500">Loading alerts...</p>
                        </div>
                    ) : (
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {!isAvailable ? (
                                <p className="text-center text-red-500 font-semibold p-4 bg-red-50 rounded-lg">
                                    <XCircle className="w-5 h-5 inline mr-2" /> Please turn on "Availability Status" to view nearby alerts.
                                </p>
                            ) : alerts.length === 0 ? (
                                <p className="text-center text-gray-500 p-4 bg-gray-50 rounded-lg">No active alerts matching your criteria.</p>
                            ) : (
                                alerts.map((alert) => (
                                    <div
                                        key={alert.id}
                                        className="bg-gray-50 p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition duration-200"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-lg font-bold text-gray-900">
                                                {alert.hospital}
                                            </h4>
                                            <span
                                                className={`text-xs font-semibold px-3 py-1 rounded-full border ${getUrgencyClasses(alert.urgency)}`}
                                            >
                                                {alert.urgency.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <MapPin className="w-4 h-4 mr-1 text-red-500" />
                                                {alert.distance} {alert.distance && <span className="text-xs text-gray-400 ml-1">(approx.)</span>}
                                            </div>
                                            <p className="text-2xl font-extrabold text-red-600 border px-2 py-1 rounded">
                                                {alert.blood_group}
                                            </p>
                                        </div>
                                        {/* Nouvelle ligne pour le nombre de donneurs */}
                                        <div className="text-sm text-gray-500 mb-4">
                                            <Heart className="w-4 h-4 inline mr-1 text-red-500 fill-red-500" />
                                            {alert.donor_count} donors have accepted so far.
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleAccept(alert.id)}
                                                className="flex-1 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition shadow-md focus:ring-4 focus:ring-red-300"
                                            >
                                                <CheckCircle className="w-5 h-5 mr-2" />
                                                Accept & Go
                                            </button>
                                            <button
                                                onClick={() => handleDismiss(alert.id)}
                                                className="w-1/4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg transition shadow-md"
                                            >
                                                <X className="w-5 h-5 mx-auto" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}