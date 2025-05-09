// ecomerce/src/components/profile/ProfileLayout.tsx
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const ProfileLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Seu Perfil</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <nav className="md:w-1/4">
          <ul className="space-y-2">
            <li>
              <Link
                to="/profile/orders"
                className={`block px-4 py-2 rounded ${location.pathname === '/profile/orders' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
              >
                Histórico de Compras
              </Link>
            </li>
            <li>
              <Link
                to="/profile/addresses"
                className={`block px-4 py-2 rounded ${location.pathname === '/profile/addresses' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
              >
                Meus Endereços
              </Link>
            </li>
            {/* Add other profile navigation links here */}
          </ul>
        </nav>
        <div className="md:w-3/4">
          {/* The Outlet renders the matched child route component */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;