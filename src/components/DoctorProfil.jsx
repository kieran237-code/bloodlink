import {
  ArrowLeft,
  Heart,
  Users,
  FileText,
  Award,
  Calendar,
  Briefcase,
  Edit,
  LogOut,
  Mail,
  Phone,
  MapPin,
  Stethoscope,
  Hospital,
} from "lucide-react";
// Import de useNavigate pour la redirection après déconnexion
import { Link, useNavigate } from "react-router-dom";

// Données fictives du docteur
const doctorData = {
  name: "Dr. Sarah Mitchell",
  title: "Cardiologist",
  id: "DOC-2845",
  hospital: "Central Hospital",
  location: "New York, NY",
  email: "sarah.mitchell@hospital.com",
  phone: "+1 (555) 123-4567",
  availability: true, // true pour "Currently available"
  stats: {
    patients: 487,
    requests: 156,
    experience: 8,
  },
  professional: {
    specialization: "Cardiology",
    department: "Emergency Care",
    license: "MED-NY-2845-2015",
    memberSince: "January 2020",
  },
};

export default function DoctorProfile() {
  // 1. Initialiser le hook de navigation
  const navigate = useNavigate();

  // Fonction pour simuler la mise à jour de l'état de disponibilité (pour l'interactivité)
  const handleAvailabilityToggle = () => {
    console.log("Toggle de disponibilité activé !");
    // Dans une vraie app, ici on ferait un appel API PATCH
  };

  // 2. Fonction de déconnexion mise à jour
  const handleLogout = () => {
    console.log("Déconnexion de l'utilisateur...");
    
    // --- Logique réelle de déconnexion ---
    // 1. (Optionnel) Vider les informations utilisateur globales (Redux/Context)
    // 2. Supprimer le token d'authentification (localStorage, cookies, etc.)
    localStorage.removeItem("accessToken"); 
    localStorage.removeItem("refreshToken"); 
    // ------------------------------------

    // 3. Rediriger l'utilisateur vers la page de connexion
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
        
        {/* --- En-tête du Profil --- */}
        <header className="flex items-center pb-4 border-b border-gray-100 mb-6">
          <Link to="/doctor">
            <button className="text-gray-600 hover:text-red-600 transition mr-4">
                <ArrowLeft className="w-6 h-6" />
            </button>
          </Link>

          <div>
            <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
            <p className="text-sm text-gray-500">Doctor Portal</p>
          </div>
        </header>

        {/* --- Section Informations Personnelles et Contact --- */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-gray-100 mb-6">
          
          {/* Photo de Profil / Avatar (Cercle Rouge) */}
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 rounded-full flex items-center justify-center">
            {/* Icône Stéthoscope pour simuler le style de l'image */}
            <Stethoscope className="w-10 h-10 text-red-600" />
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center border-2 border-white">
                <Heart className="w-4 h-4 text-white fill-white"/>
            </div>
          </div>
          
          {/* Détails du Docteur */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{doctorData.name}</h2>
            <p className="text-md text-gray-600 mb-3">
              {doctorData.title} • ID: {doctorData.id}
            </p>

            {/* Informations de Contact (Grid pour alignement) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
              <span className="flex items-center">
                <Hospital className="w-4 h-4 mr-2 text-red-500" />
                {doctorData.hospital}
              </span>
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-red-500" />
                {doctorData.location}
              </span>
              <span className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-red-500" />
                {doctorData.email}
              </span>
              <span className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-red-500" />
                {doctorData.phone}
              </span>
            </div>
          </div>
        </div>
        
        {/* --- Section Statut de Disponibilité --- */}
        <div className="flex justify-between items-center p-4 mb-6 bg-gray-50 rounded-lg border border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Availability Status</h3>
            <p className="text-sm text-gray-600">
              {doctorData.availability ? "Currently available for urgent requests" : "Currently offline"}
            </p>
          </div>
          
          {/* Bascule (Toggle Switch) - Reproduction fidèle du style */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={doctorData.availability} 
              onChange={handleAvailabilityToggle} 
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
          </label>
        </div>
        
        {/* --- Section Statistiques --- */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          
          {/* Stat 1: Patients Aides */}
          <StatCard 
            icon={Users} 
            value={doctorData.stats.patients} 
            label="Patients Helped" 
          />
          
          {/* Stat 2: Requêtes Traitées */}
          <StatCard 
            icon={FileText} 
            value={doctorData.stats.requests} 
            label="Requests Processed" 
          />
          
          {/* Stat 3: Années d'Expérience */}
          <StatCard 
            icon={Award} 
            value={doctorData.stats.experience} 
            label="Years Experience" 
          />
        </div>
        
        {/* --- Section Informations Professionnelles --- */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Professional Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Info 1: Specialization */}
            <InfoBox 
              icon={Stethoscope} 
              label="Specialization" 
              value={doctorData.professional.specialization} 
            />

            {/* Info 2: License Number */}
            <InfoBox 
              icon={Calendar} 
              label="License Number" 
              value={doctorData.professional.license} 
            />

            {/* Info 3: Department */}
            <InfoBox 
              icon={Briefcase} 
              label="Department" 
              value={doctorData.professional.department} 
            />
            
            {/* Info 4: Member Since */}
            <InfoBox 
              icon={Calendar} 
              label="Member Since" 
              value={doctorData.professional.memberSince} 
            />
          </div>
        </div>
        
        {/* --- Boutons d'Action --- */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button className="flex-1 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg shadow-md transition">
            <Edit className="w-5 h-5 mr-2" />
            Edit Profile
          </button>
          
          {/* 3. Association de la fonction handleLogout au bouton */}
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

// --- Composants Réutilisables ---

// Composant pour les cartes de statistiques
const StatCard = ({ icon: Icon, value, label }) => (
  <div className="bg-white p-4 rounded-lg text-center border border-gray-100 shadow-sm">
    <div className="w-8 h-8 mx-auto mb-2 text-red-600">
      <Icon className="w-full h-full" />
    </div>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500">{label}</p>
  </div>
);

// Composant pour les boîtes d'information professionnelle
const InfoBox = ({ icon: Icon, label, value }) => (
  <div className="bg-gray-50 p-4 rounded-lg flex items-center shadow-sm">
    <Icon className="w-5 h-5 text-red-500 mr-3" />
    <div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-md font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);

// Pour l'utilisation, vous devez exporter DoctorProfile:
// export default DoctorProfile;
