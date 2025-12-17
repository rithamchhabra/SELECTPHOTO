import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { API_URL } from '../apiConfig';


const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [projects, setProjects] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newProject, setNewProject] = useState({ title: '', clientName: '', maxSelection: 50 });

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.get(`${API_URL}/api/projects`, config);
            setProjects(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.post(`${API_URL}/api/projects`, newProject, config);

            setProjects([data, ...projects]);
            setShowModal(false);
            setNewProject({ title: '', clientName: '', maxSelection: 50 });
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id, e) => {
        e.preventDefault(); // Prevent link navigation
        if (!window.confirm("ALL CLEAN? This will permanently delete the project and ALL photos.")) return;

        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            await axios.delete(`${API_URL}/api/projects/${id}`, config);


            setProjects(projects.filter(p => p._id !== id));
        } catch (error) {
            console.error(error);
            alert("Delete failed");
        }
    };


    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Your Projects</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
                >
                    + New Project
                </button>
            </div>

            {projects.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500 text-lg">No projects yet. Create one to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <Link to={`/project/${project._id}`} key={project._id} className="block group">
                            <div className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition">
                                <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-gray-300">
                                    {/* Placeholder for project thumbnail - could be first photo */}
                                    <span className="text-4xl">📷</span>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-lg text-gray-900">{project.title}</h3>
                                    <p className="text-sm text-gray-500">{project.clientName}</p>
                                    <div className="mt-4 flex justify-between items-center text-xs text-gray-500 uppercase tracking-wide font-semibold">
                                        <span className={`px-2 py-1 rounded ${project.status === 'submitted' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {project.status}
                                        </span>
                                        <div className="flex items-center space-x-2">
                                            <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                                            <button
                                                onClick={(e) => handleDelete(project._id, e)}
                                                className="bg-red-50 text-red-500 hover:bg-red-100 p-1 rounded z-10 duration-200"
                                                title="All Clean (Delete Project)"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Create Project Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Create New Project</h2>
                        <form onSubmit={handleCreateProject}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Project Title</label>
                                <input
                                    type="text"
                                    className="w-full border rounded p-2"
                                    value={newProject.title}
                                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Client Name</label>
                                <input
                                    type="text"
                                    className="w-full border rounded p-2"
                                    value={newProject.clientName}
                                    onChange={(e) => setNewProject({ ...newProject, clientName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-1">Max Selection Limit</label>
                                <input
                                    type="number"
                                    className="w-full border rounded p-2"
                                    value={newProject.maxSelection}
                                    onChange={(e) => setNewProject({ ...newProject, maxSelection: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
