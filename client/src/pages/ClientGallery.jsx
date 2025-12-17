import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import PhotoGrid from '../components/PhotoGrid';
import { API_URL } from '../apiConfig';


const ClientGallery = () => {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGalleryData();
    }, [id]);

    const fetchGalleryData = async () => {
        try {
            const projectRes = await axios.get(`${API_URL}/api/projects/${id}`); // Assuming public access or refined middleware later
            setProject(projectRes.data);

            const photosRes = await axios.get(`${API_URL}/api/projects/${id}/photos`);

            setPhotos(photosRes.data);

            // Initialize selected IDs from server state
            const initialSelected = photosRes.data.filter(p => p.isSelected).map(p => p._id);
            setSelectedIds(initialSelected);

            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleSelect = async (photoId) => {
        if (project.status === 'submitted') return alert('Selection is locked.');

        const isCurrentlySelected = selectedIds.includes(photoId);

        if (!isCurrentlySelected && selectedIds.length >= project.maxSelection) {
            return alert(`You can only select up to ${project.maxSelection} photos.`);
        }

        // Optimistic UI update
        const newSelectedIds = isCurrentlySelected
            ? selectedIds.filter(id => id !== photoId)
            : [...selectedIds, photoId];

        setSelectedIds(newSelectedIds);

        try {
            await axios.put(`${API_URL}/api/projects/${id}/photos/${photoId}/selection`);

        } catch (error) {
            console.error('Selection failed', error);
            // Revert on error
            setSelectedIds(selectedIds);
            alert('Something went wrong, please try again.');
        }
    };

    const handleSubmit = async () => {
        if (!window.confirm('Are you sure you want to submit your selection? This will lock the gallery.')) return;

        try {
            await axios.put(`${API_URL}/api/projects/${id}/submit`);

            setProject({ ...project, status: 'submitted' });
            alert('Selection submitted successfully! The photographer has been notified.');
        } catch (error) {
            console.error(error);
            alert('Submission failed.');
        }
    };

    if (loading) return <div className="flex items-center justify-center h-screen">Loading Gallery...</div>;
    if (!project) return <div className="flex items-center justify-center h-screen">Project not found.</div>;

    return (
        <div className="min-h-screen bg-white">
            {/* Sticky Header */}
            <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b px-4 py-3 shadow-sm flex justify-between items-center">
                <div>
                    <h1 className="font-bold text-lg md:text-xl truncate max-w-[200px] md:max-w-md">{project.title}</h1>
                    <p className="text-xs text-gray-500">Please select up to {project.maxSelection} photos</p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium">
                        <span className={selectedIds.length > project.maxSelection ? 'text-red-500' : 'text-black'}>
                            {selectedIds.length}
                        </span>
                        <span className="text-gray-400"> / {project.maxSelection}</span>
                    </div>
                    {project.status === 'submitted' ? (
                        <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">Submitted</span>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            className="bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition shadow-lg"
                        >
                            Submit Selection
                        </button>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <PhotoGrid
                    photos={photos}
                    isClient={true}
                    onSelect={handleSelect}
                    selectedIds={selectedIds}
                />
            </div>

            <div className="text-center py-8 text-gray-400 text-sm">
                Powered by SelectPhoto
            </div>
        </div>
    );
};

export default ClientGallery;
