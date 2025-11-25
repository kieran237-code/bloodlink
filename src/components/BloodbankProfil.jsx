// Import des icônes nécessaires de lucide-react
import {
  ArrowLeft,
  Heart,
  Users,
  CheckCircle,
  Award,
  MapPin,
  Mail,
  Phone,
  Clock,
  Droplet,
  Edit,
  LogOut,
} from "lucide-react";
// Import de Link et useNavigate (ajouté)
import { Link, useNavigate } from "react-router-dom";

// --- Données Fictives de la Banque de Sang ---
const bloodBankData = {
  name: "Central Hospital Blood Bank",
  id: "BB-2845",
  license: "BNK-NY-2008",
  address: "123 Medical Plaza, New York, NY 10001",
  email: "bloodbank@central.hospital",
  phone: "+1 (555) 100-2000",
  hours: "Open 24/7",
  isAcceptingDonations: true, // Statut du toggle
  stats: {
    totalDonors: 2847,
    requestsFulfilled: 1254,
    yearsOperating: 15,
  },
  inventory: [
    { group: "O+", units: 45, capacity: 100 },
    { group: "O-", units: 28, capacity: 50 },
    { group: "A+", units: 38, capacity: 80 },
    { group: "A-", units: 15, capacity: 40 },
    { group: "B+", units: 32, capacity: 70 },
    { group: "B-", units: 12, capacity: 35 },
    { group: "AB+", units: 18, capacity: 50 },
    { group: "AB-", units: 8, capacity: 30 },
  ],
};

// Fonction pour déterminer le statut de l'inventaire
const getInventoryStatus = (units, capacity) => {
  const ratio = units / capacity;
  if (ratio < 0.3) return { label: "Low", class: "bg-red-500" };
  if (ratio < 0.6) return { label: "Moderate", class: "bg-yellow-500" };
  return { label: "Good", class: "bg-green-500" };
};

export default function BloodBankProfil() {
  
  // 1. Initialiser le hook de navigation
  const navigate = useNavigate();

  // Dans une vraie application, cet état serait géré via useState
  const handleAcceptingToggle = () => {
    console.log("Toggle 'Accepting Donations' basculé !");
  };

  const handleUpdateInventory = () => {
    console.log("Mise à jour de l'inventaire demandée.");
  };

  // 2. Fonction de déconnexion pour vider le token et rediriger
  const handleLogout = () => {
    console.log("Déconnexion de la Banque de Sang...");
    
    // --- Logique réelle de déconnexion ---
    // Simuler la suppression du token d'authentification (si vous utilisez localStorage)
    localStorage.removeItem("accessToken"); 
    // ------------------------------------

    // 3. Rediriger l'utilisateur vers la page de connexion
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6">
        
        {/* --- En-tête du Profil --- */}
        <header className="flex items-center pb-4 border-b border-gray-100 mb-6">
          <Link to="/blood-bank">
            <button className="text-gray-600 hover:text-red-600 transition mr-4">
            <ArrowLeft className="w-6 h-6" />
            </button>
          </Link>

          <div>
            <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
            <p className="text-sm text-gray-500">Blood Bank Portal</p>
          </div>
        </header>

        {/* --- Section Infos Banque de Sang --- */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-gray-100 mb-6">
          
          {/* Logo/Avatar (Cercle Rouge avec initiales) */}
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-3xl">
            CH {/* Central Hospital */}
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-red-600">
                <Mail className="w-4 h-4 text-red-600"/>
            </div>
          </div>
          
          {/* Détails de la Banque */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{bloodBankData.name}</h2>
            <p className="text-md text-gray-600 mb-3">
              ID: {bloodBankData.id} • License: {bloodBankData.license}
            </p>

            {/* Informations de Contact (Grid pour alignement) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-red-500" />
                {bloodBankData.address}
              </span>
              <span className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-red-500" />
                {bloodBankData.phone}
              </span>
              <span className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-red-500" />
                {bloodBankData.email}
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-red-500" />
                {bloodBankData.hours}
              </span>
            </div>
          </div>
        </div>
        
        {/* --- Section Statut d'Acceptation des Dons --- */}
        <div className="flex justify-between items-center p-4 mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Accepting Donations</h3>
            <p className="text-sm text-gray-600">Currently accepting blood donations from donors</p>
          </div>
          
          {/* Bascule (Toggle Switch) */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={bloodBankData.isAcceptingDonations} 
              onChange={handleAcceptingToggle} 
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
          </label>
        </div>
        
        {/* --- Section Statistiques --- */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard icon={Users} value={bloodBankData.stats.totalDonors} label="Total Donors" />
          <StatCard icon={CheckCircle} value={bloodBankData.stats.requestsFulfilled} label="Requests Fulfilled" />
          <StatCard icon={Award} value={bloodBankData.stats.yearsOperating} label="Years Operating" />
        </div>
        
        {/* --- Section Statut de l'Inventaire Sanguin --- */}
        <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm mb-8">
          <div className="flex items-center mb-6">
            <Droplet className="w-5 h-5 text-red-600 mr-2" />
            <h3 className="text-xl font-semibold text-gray-900">Blood Inventory Status</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {bloodBankData.inventory.map((item) => {
              const status = getInventoryStatus(item.units, item.capacity);
              const progressWidth = `${(item.units / item.capacity) * 100}%`;
              
              return (
                <div key={item.group} className="flex justify-between items-center p-4 border border-gray-100 rounded-lg">
                  <div className="flex-1 mr-4">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-lg font-bold text-red-600">{item.group} <span className="text-gray-800 ml-1">{item.units} units</span></p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.class === 'bg-red-500' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">of {item.capacity} capacity</p>
                    
                    {/* Barre de Progression */}
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${status.class}`}
                        style={{ width: progressWidth }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* --- Boutons d'Action --- */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={handleUpdateInventory}
            className="flex-1 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg shadow-md transition"
          >
            <Droplet className="w-5 h-5 mr-2" />
            Update Inventory
          </button>
          <button className="flex-1 flex items-center justify-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-lg transition">
            <Edit className="w-5 h-5 mr-2" />
            Edit Profile
          </button>
          
          {/* 4. Association de la fonction handleLogout au bouton */}
          <button 
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-lg transition"
          >
            Logout
            <LogOut className="w-5 h-5 ml-2" />
          </button>
        </div>
        
      </div>
    </div>
  );
}

// --- Composant Réutilisable pour les statistiques ---
const StatCard = ({ icon: Icon, value, label }) => (
  <div className="bg-white p-4 rounded-lg text-center border border-gray-100 shadow-sm">
    <div className="w-8 h-8 mx-auto mb-2 text-red-600">
        <Icon className="w-full h-full" />
    </div>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500">{label}</p>
  </div>
);