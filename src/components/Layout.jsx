import { Outlet, NavLink } from 'react-router-dom';
import Footer from './Footer/Footer';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 p-4">
        <ul className="flex space-x-4">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? 'text-white font-bold' : 'text-white'
              }
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                isActive ? 'text-white font-bold' : 'text-white'
              }
            >
              About
            </NavLink>
          </li>
        </ul>
      </nav>
      <main className="p-4 min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}