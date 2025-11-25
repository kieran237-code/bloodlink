// Import des icônes nécessaires de lucide-react
import {
  ArrowLeft,
  Heart,
  Droplet,
  Award,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Clock,
  Edit,
  LogOut,
} from "lucide-react";
// Import de Link et useNavigate (ajouté)
import { Link, useNavigate } from "react-router-dom";

// Données fictives du donneur
const donorData = {
  name: "John Doe",
  bloodGroup: "O-",
  status: "Universal Donor",
  location: "New York, NY",
  age: 28,
  email: "john.doe@email.com",
  phone: "+1 (555) 987-6543",
  isAvailable: true, // Statut du toggle
  stats: {
    donations: 12,
    livesSaved: 36,
    yearsActive: 3,
  },
  history: {
    lastDonationDate: "March 15, 2025",
    lastDonationHospital: "Central Hospital",
    nextEligibleDate: "June 15, 2025",
    waitingPeriod: "3 months waiting period completed",
  },
};

export default function DonorProfile() {
  
  // 1. Initialiser le hook de navigation
  const navigate = useNavigate();

  // Fonction pour simuler la mise à jour de l'état de disponibilité
  const handleAvailabilityToggle = () => {
    console.log("Toggle de disponibilité activé !");
    // Dans une vraie app, ici on ferait un appel API PATCH
  };

  // 2. Fonction de déconnexion pour vider le token et rediriger
  const handleLogout = () => {
    console.log("Déconnexion du donneur...");
    
    // --- Logique réelle de déconnexion ---
    // Simuler la suppression du token (si vous utilisez localStorage)
    localStorage.removeItem("accessToken"); 
    // ------------------------------------

    // 3. Rediriger l'utilisateur vers la page de connexion
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
        
        {/* --- En-tête du Profil --- */}
        <header className="flex items-center pb-4 border-b border-gray-100 mb-6">
        <Link to="/donor">
            <button className="text-gray-600 hover:text-red-600 transition mr-4">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </Link>

          <div>
            <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
            <p className="text-sm text-gray-500">Donor Portal</p>
          </div>
        </header>

        {/* --- Section Informations Personnelles et Contact --- */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-gray-100 mb-6">
          
          {/* Photo de Profil / Avatar (Cercle Rouge) */}
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 rounded-full flex items-center justify-center">
            {/* Icône de Don de Sang */}
            <Droplet className="w-10 h-10 text-red-600" />
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center border-2 border-white">
                <Droplet className="w-4 h-4 text-white fill-white"/>
            </div>
          </div>
          
          {/* Détails du Donneur */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{donorData.name}</h2>
            <div className="flex items-center mb-3">
                <span className="text-xl font-bold text-red-600 mr-2">{donorData.bloodGroup}</span>
                <span className="text-sm bg-red-100 text-red-700 font-medium px-2 py-0.5 rounded-full">
                    {donorData.status}
                </span>
            </div>

            {/* Informations de Contact (Grid pour alignement) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-red-500" />
                {donorData.location}
              </span>
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-red-500" />
                Age: {donorData.age}
              </span>
              <span className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-red-500" />
                {donorData.email}
              </span>
              <span className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-red-500" />
                {donorData.phone}
              </span>
            </div>
          </div>
        </div>
        
        {/* --- Section Statut de Disponibilité --- */}
        <div className="flex justify-between items-center p-4 mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Availability Status</h3>
            <p className="text-sm text-gray-600">Receive notifications for donation requests</p>
          </div>
          
          {/* Bascule (Toggle Switch) */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={donorData.isAvailable} 
              onChange={handleAvailabilityToggle} 
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
          </label>
        </div>
        
        {/* --- Section Statistiques de Don --- */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          
          {/* Stat 1: Total Donations */}
          <StatCard 
            icon={Droplet} 
            value={donorData.stats.donations} 
            label="Total Donations" 
          />
          
          {/* Stat 2: Lives Saved */}
          <StatCard 
            icon={Heart} 
            value={donorData.stats.livesSaved} 
            label="Lives Saved" 
          />
          
          {/* Stat 3: Years Active */}
          <StatCard 
            icon={Award} 
            value={donorData.stats.yearsActive} 
            label="Years Active" 
          />
        </div>
        
        {/* --- Section Historique de Don --- */}
        <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Donation History</h3>
          
          {/* Dernier Don */}
          <div className="flex justify-between items-center p-4 mb-3 border-b border-gray-100">
            <div className="flex items-center">
              <Droplet className="w-5 h-5 text-red-600 mr-3 fill-red-600" />
              <div>
                <p className="font-semibold text-gray-800">Last Donation</p>
                <p className="text-sm text-gray-600">{donorData.history.lastDonationHospital}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">{donorData.history.lastDonationDate}</p>
          </div>

          {/* Prochaine Date d'Éligibilité */}
          <div className="flex justify-between items-center p-4">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-red-600 mr-3" />
              <div>
                <p className="font-semibold text-gray-800">Next Eligible Date</p>
                <p className="text-sm text-gray-600">{donorData.history.waitingPeriod}</p>
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-800">{donorData.history.nextEligibleDate}</p>
          </div>
        </div>
        
        {/* --- Boutons d'Action --- */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button className="flex-1 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg shadow-md transition">
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

// Composant pour les cartes de statistiques (réutilisé de la réponse précédente)
const StatCard = ({ icon: Icon, value, label }) => (
  <div className="bg-white p-4 rounded-lg text-center border border-gray-100 shadow-sm">
    <div className="w-8 h-8 mx-auto mb-2 text-red-600">
        <Icon className="w-full h-full" />
    </div>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500">{label}</p>
  </div>
);