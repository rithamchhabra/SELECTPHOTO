import Masonry from 'react-masonry-css';
import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

const PhotoGrid = ({ photos, isClient = false, onSelect, selectedIds = [] }) => {
    const [index, setIndex] = useState(-1);

    const breakpointColumnsObj = {
        default: 4,
        1100: 3,
        700: 2,
        500: 1
    };

    const handlePhotoClick = (photoIndex) => {
        setIndex(photoIndex);
    };

    // Prepare slides for lightbox
    const slides = photos.map(photo => ({ src: photo.url }));

    return (
        <>
            <Masonry
                breakpointCols={breakpointColumnsObj}
                className="my-masonry-grid flex w-auto -ml-4"
                columnClassName="my-masonry-grid_column pl-4 bg-clip-padding"
            >
                {photos.map((photo, i) => {
                    const isSelected = selectedIds.includes(photo._id) || photo.isSelected; // Handle both client local state vs server state

                    return (
                        <div key={photo._id} className="relative group mb-4">
                            <img
                                src={photo.url}
                                alt="Gallery"
                                className={`w-full h-auto rounded-lg transition duration-300 cursor-pointer ${isSelected ? 'ring-4 ring-black p-1' : ''}`}
                                onClick={() => handlePhotoClick(i)}
                                loading="lazy"
                            />

                            {/* Overlay for client selection */}
                            {isClient && (
                                <button
                                    className={`absolute top-2 right-2 p-2 rounded-full transition ${isSelected ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelect(photo._id);
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isSelected ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </button>
                            )}

                            {/* Indicator for photographer (Admin View) */}
                            {!isClient && (
                                <>
                                    {photo.isSelected && (
                                        <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow z-10">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                    <button
                                        className="absolute top-2 left-2 bg-white text-red-500 p-1 rounded shadow opacity-0 group-hover:opacity-100 transition z-10 hover:bg-red-50"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.confirm('Delete this photo?')) onSelect(photo._id, 'delete');
                                        }}
                                        title="Delete Photo"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </>
                            )}

                        </div>
                    );
                })}
            </Masonry>

            <Lightbox
                open={index >= 0}
                index={index}
                close={() => setIndex(-1)}
                slides={slides}
            />
        </>
    );
};

export default PhotoGrid;
