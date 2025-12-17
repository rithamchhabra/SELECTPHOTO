import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-white text-center px-4">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-6">
                Photo Selection Made Simple
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mb-10">
                Upload your photos, share a link, and let your clients select their favorites.
                Free, fast, and beautiful.
            </p>
            <div className="flex space-x-4">
                <Link to="/register" className="bg-black text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-gray-800 transition">
                    Start for Free
                </Link>
                <Link to="/login" className="bg-gray-100 text-gray-900 px-8 py-3 rounded-full text-lg font-medium hover:bg-gray-200 transition">
                    Login
                </Link>
            </div>
        </div>
    );
};

export default Home;
