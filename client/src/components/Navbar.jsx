import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link to={user ? "/dashboard" : "/"} className="flex-shrink-0 flex items-center font-bold text-xl tracking-tight">
                            SelectPhoto
                        </Link>

                    </div>
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <Link to="/dashboard" className="text-gray-700 hover:text-gray-900">Dashboard</Link>
                                <button onClick={handleLogout} className="text-gray-700 hover:text-gray-900">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-700 hover:text-gray-900">Login</Link>
                                <Link to="/register" className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800">Get Started</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
