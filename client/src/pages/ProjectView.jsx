import { useState, useEffect, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import PhotoGrid from '../components/PhotoGrid';
import { API_URL } from '../apiConfig';


const ProjectView = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [project, setProject] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef();

    useEffect(() => {
        fetchProjectData();
    }, [id]);

    const fetchProjectData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const projectRes = await axios.get(`${API_URL}/api/projects/${id}`, config);
            setProject(projectRes.data);

            const photosRes = await axios.get(`${API_URL}/api/projects/${id}/photos`, config); // Auth logic for photos handles public too, but here we are admin

            setPhotos(photosRes.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpload = async (e) => {
        const files = e.target.files;
        if (!files) return;

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('photos', files[i]);
        }

        setUploading(true);
        setUploadProgress(0);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            };
            const { data } = await axios.post(`${API_URL}/api/projects/${id}/photos`, formData, config);

            setPhotos([...photos, ...data]);
        } catch (error) {
            console.error(error);
            alert('Upload failed');
        } finally {
            setUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };


    const copyLink = () => {
        const link = `${window.location.origin}/gallery/${id}`;
        navigator.clipboard.writeText(link);
        alert('Gallery link copied!');
    };

    const downloadSelected = () => {
        const selected = photos.filter(p => p.isSelected);
        if (selected.length === 0) return alert('No photos selected yet');

        // Quick CSV generation
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Filename,URL\n"
            + selected.map(p => `${p.public_id},${p.url}`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `selected_photos_${project.title}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    const downloadZip = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
                responseType: 'blob'
            };
            const res = await axios.get(`${API_URL}/api/projects/${id}/download-selected`, config);


            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${project.title}_selected.zip`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error(error);
            alert('Failed to download zip');
        }
    };


    if (!project) return <div className="text-center py-20">Loading...</div>;

    const selectedCount = photos.filter(p => p.isSelected).length;

    const handleDeletePhoto = async (photoId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${API_URL}/api/projects/${id}/photos/${photoId}`, config);

            setPhotos(photos.filter(p => p._id !== photoId));
        } catch (error) {
            console.error(error);
            alert('Failed to delete photo');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
                        <p className="text-gray-500">Client: {project.clientName} | Limit: {project.maxSelection} | Selected: {selectedCount}</p>
                    </div>
                    <div className="mt-4 md:mt-0 space-x-2">
                        <button onClick={copyLink} className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200">
                            Share Link
                        </button>
                        <button onClick={downloadSelected} className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200">
                            CSV
                        </button>
                        <button onClick={downloadZip} className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200">
                            Download ZIP
                        </button>
                        <button onClick={() => fileInputRef.current.click()} className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800" disabled={uploading}>
                            {uploading ? `Uploading ${uploadProgress}%` : 'Upload Photos'}
                        </button>
                        {uploading && (
                            <div className="w-24 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2 md:mt-0 md:ml-2 inline-block align-middle">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                        )}
                        <input

                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleUpload}
                            ref={fileInputRef}
                            className="hidden"
                        />
                    </div>
                </div>
            </div>

            <PhotoGrid
                photos={photos}
                isClient={false}
                onSelect={(pid, action) => {
                    if (action === 'delete') handleDeletePhoto(pid);
                }}
            />
        </div>
    );
};


export default ProjectView;
