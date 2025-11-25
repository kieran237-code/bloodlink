import { Heart, Hospital, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 px-6 text-center">
      {/* Logo */}
      <div className="mb-4 flex items-center gap-2">
        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
          🩸
        </div>
        <span className="text-2xl font-semibold text-gray-900">BloodLink</span>
      </div>

      {/* Titre principal */}
      <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
        Saving Lives Through{" "}
        <span className="text-red-600">Real-Time Connection</span>
      </h1>

      {/* Sous-texte */}
      <p className="text-gray-600 max-w-xl mb-8">
        Connecting doctors, donors, and blood banks instantly. Every second counts when lives are at stake.
      </p>

      {/* Boutons d’action */}
      <div className="flex flex-col sm:flex-row gap-4 mb-16">
        <Link
          to="/auth"
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition"
        >
          Get Started →
        </Link>
        <a
          href="#learn-more"
          className="border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold px-6 py-3 rounded-lg transition"
        >
          Learn More
        </a>
      </div>

      {/* Cartes d’infos */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl w-full">
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center border border-gray-100 hover:shadow-lg transition">
          <div className="w-12 h-12 bg-red-50 text-red-600 flex items-center justify-center rounded-full mb-4 text-xl">
            <Users />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">For Donors</h3>
          <p className="text-gray-600 text-sm">
            Receive instant alerts when your blood type is needed nearby.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center border border-gray-100 hover:shadow-lg transition">
          <div className="w-12 h-12 bg-red-50 text-red-600 flex items-center justify-center rounded-full mb-4 text-xl">
            <Heart />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">For Doctors</h3>
          <p className="text-gray-600 text-sm">
            Request blood with urgency levels and track status in real-time.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center border border-gray-100 hover:shadow-lg transition">
          <div className="w-12 h-12 bg-red-50 text-red-600 flex items-center justify-center rounded-full mb-4 text-xl">
            <Hospital />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">For Blood Banks</h3>
          <p className="text-gray-600 text-sm">
            Manage requests, create alerts, and coordinate donations efficiently.
          </p>
        </div>
      </div>
    </div>
  );
}
