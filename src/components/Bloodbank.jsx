import React, { useState, useEffect, useCallback } from "react";
import { Heart, Users, Bell, Trash2, Clock, CheckCircle, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

// --- Configuration du Backend ---
const API_BASE_URL = 'https://bloodlink-of0v.onrender.com';

const api = axios.create({
    baseURL: API_BASE_URL,
    // Configuration pour prévenir les problèmes CORS et d'envoi de cookies si nécessaire
    withCredentials: false
});

// --- Fonction utilitaire pour gérer l'authentification (Tokens JWT) ---
const getAuthHeaders = () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        // Redirection gérée par le `fetchData` global, mais bon à vérifier ici
        return {};
    }
    return {
        Authorization: `Bearer ${accessToken}`,
    };
};

// --- Fonction utilitaire pour déterminer la couleur du badge d'urgence ---
const getUrgencyClasses = (urgency) => {
    switch (urgency) {
        case "critical":
            return "bg-red-600 text-white";
        case "high":
            return "bg-orange-500 text-white";
        case "medium":
            return "bg-yellow-500 text-gray-900";
        default:
            return "bg-gray-200 text-gray-800";
    }
};

export default function BloodBank() {
    const navigate = useNavigate();
    
    // États pour les données réelles du backend
    const [requests, setRequests] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [stats, setStats] = useState({ available_donors: 0, blood_groups: {} });
    
    // État du formulaire pour les nouvelles alertes
    const [newAlertData, setNewAlertData] = useState({
        blood_group: 'O+',
        radius: 10,
        duration: 24,
    });
    
    // États pour la gestion des messages et du chargement
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);

    // Fonction pour afficher un message temporaire
    const showMessage = (msg, isError = false) => {
        setMessage(msg);
        setError(isError);
        setTimeout(() => {
            setMessage('');
            setError(null);
        }, 4000);
    };

    // --- Fonction de récupération des données initiales ---
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        const headers = getAuthHeaders();
        if (!headers.Authorization) {
            setError("Session expirée. Redirection vers la connexion.");
            setTimeout(() => navigate('/login'), 1500);
            setLoading(false);
            return;
        }

        try {
            // Récupération simultanée des trois ensembles de données
            const [requestsRes, alertsRes, statsRes] = await Promise.all([
                api.get('/api/bloodbank/requests/', { headers }),
                api.get('/api/bloodbank/alerts/', { headers }),
                api.get('/api/bloodbank/stats/', { headers }),
            ]);

            setRequests(requestsRes.data || []);
            setAlerts(alertsRes.data || []);
            setStats(statsRes.data || { available_donors: 0, blood_groups: {} });
            
        } catch (err) {
            console.error("Erreur de récupération des données:", err);
            const status = err.response?.status;
            if (status === 401 || status === 403) {
                // Gestion de l'authentification échouée
                setError("Accès refusé. Veuillez vous reconnecter.");
                localStorage.clear();
                setTimeout(() => navigate('/login'), 1500);
            } else {
                setError("Échec de la connexion au serveur. Vérifiez la console.");
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Statistiques formatées pour l'affichage en cartes
    const portalStats = [
        { label: "Pending Requests", value: requests.length, icon: Clock, color: "text-red-600" },
        { label: "Active Alerts", value: alerts.length, icon: Bell, color: "text-green-600" },
        { label: "Available Donors", value: stats.available_donors || 0, icon: Users, color: "text-blue-600" },
    ];
    
    // --- Gérer la mise à jour des champs du formulaire ---
    const handleAlertChange = (e) => {
        const { id, value } = e.target;
        setNewAlertData(prev => ({
            ...prev,
            [id]: id === 'radius' || id === 'duration' ? Number(value) : value,
        }));
    };

    // --- Gérer le Traitement d'une Requête ---
    const handleProcessRequest = async (requestId) => {
        setLoading(true);
        try {
            // PATCH /api/bloodbank/requests/<id>/
            await api.patch(`/api/bloodbank/requests/${requestId}/`, 
                { status: 'processed' }, 
                { headers: getAuthHeaders() }
            );

            // Mettre à jour l'état local pour retirer la requête
            setRequests(requests.filter(req => req.id !== requestId));
            showMessage(`Request ${requestId} successfully marked as processed.`);
            
        } catch (err) {
            console.error("Error processing request:", err);
            showMessage("Échec du traitement de la requête.", true);
        } finally {
            setLoading(false);
        }
    };

    // --- Gérer la Création d'une Alerte ---
    const handleCreateAlert = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // POST /api/bloodbank/alerts/
            const response = await api.post('/api/bloodbank/alerts/', 
                newAlertData, 
                { headers: getAuthHeaders() }
            );

            // Mettre à jour l'état local avec la nouvelle alerte retournée par le backend
            setAlerts(prev => [...prev, response.data]);
            showMessage(`Alert for ${newAlertData.blood_group} broadcast successfully!`);

            // Réinitialiser le formulaire
            setNewAlertData({ blood_group: 'O+', radius: 10, duration: 24 });
            
        } catch (err) {
            console.error("Error creating alert:", err.response?.data || err.message);
            // Le backend renvoie probablement une erreur si une alerte pour ce groupe existe déjà
            showMessage(`Échec de la création de l'alerte: ${err.response?.data?.non_field_errors || "Vérifiez si une alerte pour ce groupe est déjà active."}`, true);
        } finally {
            setLoading(false);
        }
    };

    // --- Gérer la Désactivation d'une Alerte ---
    const handleCloseAlert = async (bloodGroup) => {
        setLoading(true);
        try {
            // DELETE /api/bloodbank/alerts/<blood_group>/
            await api.delete(`/api/bloodbank/alerts/${bloodGroup}/`, { headers: getAuthHeaders() });

            // Mettre à jour l'état local pour retirer l'alerte
            setAlerts(alerts.filter(alert => alert.blood_group !== bloodGroup));
            showMessage(`Alert for ${bloodGroup} successfully deactivated.`);
            
        } catch (err) {
            console.error("Error closing alert:", err);
            showMessage("Échec de la désactivation de l'alerte.", true);
        } finally {
            setLoading(false);
        }
    };
    
    // Style pour les inputs
    const inputStyleClasses = "w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-red-500 focus:border-red-500 transition text-gray-900 placeholder-gray-500 disabled:bg-gray-50";


    if (loading && requests.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="flex items-center text-red-600 text-lg font-semibold">
                    <span className="animate-spin h-6 w-6 mr-3 border-b-2 border-red-600 rounded-full"></span>
                    Loading Blood Bank Data...
                </div>
            </div>
        );
    }
    
    if (error && !message) {
        // Afficher l'erreur critique avant la redirection
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
                <div className="bg-red-100 text-red-800 p-6 rounded-xl shadow-lg border border-red-200">
                    <p className="font-semibold">{error}</p>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-inter">

            {/* --- En-tête du Portail --- */}
            <header className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md mb-6 max-w-7xl mx-auto border-t-4 border-red-600">
                <div className="flex items-center gap-3">
                    <Heart className="w-6 h-6 text-red-600 fill-red-600" />
                    <div>
                        <span className="text-xl font-bold text-gray-900">BloodLink</span>
                        <p className="text-sm text-gray-500">Blood Bank Portal</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/bloodbankprofil">
                        <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition shadow-lg">
                            Admin Profile
                        </button>
                    </Link>
                </div>
            </header>

            {/* Message de notification */}
            {(message || error) && (
                <div className={`max-w-7xl mx-auto mb-4 p-3 rounded-lg text-center font-medium transition duration-300 ${error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message}
                </div>
            )}
            
            <main className="max-w-7xl mx-auto space-y-8">

                {/* --- Section 1: Statistiques Chargées --- */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {portalStats.map((stat, index) => (
                        <div
                            key={index}
                            className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex justify-between items-center transform hover:scale-[1.02] transition duration-300"
                        >
                            <div>
                                <p className="text-lg text-gray-600">{stat.label}</p>
                                <h3 className="text-4xl font-extrabold text-gray-900">{stat.value}</h3>
                            </div>
                            <stat.icon className={`w-10 h-10 ${stat.color} opacity-80`} />
                        </div>
                    ))}
                </div>

                {/* --- Section 2: Requêtes Actives et Création d'Alerte --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Colonne Gauche: Requêtes Actives */}
                    <section className="bg-white p-6 rounded-xl shadow-lg border border-red-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Active Blood Requests</h2>
                        <p className="text-sm text-gray-500 mb-6 border-b pb-4">Pending requests from hospitals: {requests.length}</p>

                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                            {requests.length === 0 ? (
                                <p className="text-center text-gray-500 p-8 bg-gray-50 rounded-lg">No pending requests at this time.</p>
                            ) : (
                                requests.map((req) => (
                                    <div
                                        key={req.id}
                                        className="bg-gray-50 p-4 rounded-lg flex flex-col gap-3 border border-gray-200 shadow-sm"
                                    >
                                        <div className="flex justify-between items-center">
                                            {/* ID et Urgence */}
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl font-extrabold text-red-600">{req.blood_group}</span>
                                                <span
                                                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getUrgencyClasses(req.urgency)}`}
                                                >
                                                    {req.urgency.toUpperCase()}
                                                </span>
                                            </div>
                                            {/* Quantité */}
                                            <p className="text-xl font-bold text-gray-800">{req.quantity} units</p>
                                        </div>
                                        
                                        {/* Hôpital et Docteur */}
                                        <p className="text-sm text-gray-600 pt-1 border-t border-gray-100">
                                            From: <span className="font-medium text-gray-800">{req.hospital}</span> 
                                            <span className="ml-4">Dr. {req.doctor}</span>
                                        </p>

                                        {/* Bouton Processus */}
                                        <button
                                            onClick={() => handleProcessRequest(req.id)}
                                            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-md transition mt-2 shadow-md hover:shadow-lg flex items-center justify-center disabled:opacity-50"
                                            disabled={loading}
                                        >
                                            {loading ? 'Processing...' : (
                                                <>
                                                    <CheckCircle className="w-5 h-5 mr-2" />
                                                    Mark as Processed
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {/* Colonne Droite: Créer/Gérer les Alertes */}
                    <section className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Alert Management</h2>
                        <p className="text-sm text-gray-500 mb-6">Broadcast and manage active donor alerts</p>

                        <form onSubmit={handleCreateAlert} className="space-y-4 mb-8 p-4 border border-green-100 bg-green-50 rounded-lg">
                            <h3 className="text-md font-semibold text-green-700">New Alert Setup</h3>
                            
                            {/* Champ Groupe Sanguin */}
                            <div>
                                <label htmlFor="blood_group" className="block text-sm font-medium text-gray-700 mb-1">
                                    Blood Group Needed
                                </label>
                                <select
                                    id="blood_group"
                                    value={newAlertData.blood_group}
                                    onChange={handleAlertChange}
                                    required
                                    className={inputStyleClasses}
                                    disabled={loading}
                                >
                                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(group => (
                                        <option key={group} value={group}>{group}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Champ Rayon de Recherche (km) */}
                            <div>
                                <label htmlFor="radius" className="block text-sm font-medium text-gray-700 mb-1">
                                    Search Radius (km)
                                </label>
                                <input
                                    id="radius"
                                    type="number"
                                    min="1"
                                    value={newAlertData.radius}
                                    onChange={handleAlertChange}
                                    required
                                    className={inputStyleClasses}
                                    disabled={loading}
                                />
                            </div>

                            {/* Champ Durée de l'Alerte (heures) */}
                            <div>
                                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                                    Alert Duration (hours)
                                </label>
                                <input
                                    id="duration"
                                    type="number"
                                    min="1"
                                    value={newAlertData.duration}
                                    onChange={handleAlertChange}
                                    required
                                    className={inputStyleClasses}
                                    disabled={loading}
                                />
                            </div>

                            {/* Bouton Créer Alerte */}
                            <button
                                type="submit"
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-md shadow-md flex items-center justify-center transition disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? 'Broadcasting...' : (
                                    <>
                                        <Bell className="w-5 h-5 mr-2" />
                                        Broadcast New Alert
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Liste des Alertes Actives */}
                        <h3 className="text-lg font-bold text-gray-900 mb-4 pt-4 border-t border-gray-100">Active Alerts ({alerts.length})</h3>
                        <div className="space-y-3">
                            {alerts.length === 0 ? (
                                <p className="text-center text-gray-500 p-3 bg-gray-50 rounded-lg">No active alerts running.</p>
                            ) : (
                                alerts.map((alert) => (
                                    <div
                                        // On utilise blood_group si l'ID n'est pas fourni (surtout après POST)
                                        key={alert.id || alert.blood_group} 
                                        className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200 shadow-sm"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-extrabold text-red-600">{alert.blood_group}</span>
                                            <span className="text-sm text-gray-600 mt-1">
                                                {alert.radius} km radius • {alert.duration}h duration • <span className="font-semibold text-gray-800">{alert.donor_count || 0} Responders</span>
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleCloseAlert(alert.blood_group)}
                                            className="flex items-center text-sm text-red-600 font-medium hover:text-red-700 transition px-3 py-1 rounded-full border border-red-300 hover:bg-red-50 disabled:opacity-50"
                                            disabled={loading}
                                        >
                                            {loading ? 'Closing...' : (
                                                <>
                                                    <Trash2 className="w-4 h-4 mr-1" />
                                                    Close
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}