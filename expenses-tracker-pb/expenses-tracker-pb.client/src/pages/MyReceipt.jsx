import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { showSuccessAlert, showWarningAlert } from "../components/ToastifyAlert";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import translation from "../assets/translation.json";

const MyReceipt = (props) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [fileName, setFileName] = useState("");
    const [folderLink, setFolderLink] = useState(null);
    const [photoUrls, setPhotoUrls] = useState([]);

    const fetchFolderLink = async () => {
        try {
            const response = await fetch("/api/receipt/userfolder");
            if (response.ok) {
                const link = await response.text();
                setFolderLink(link);
            } else {
                console.error('An error occurred while fetching folder link.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchPhotos = async () => {
        try {
            const photosResponse = await fetch("/api/receipt/photos");
            if (photosResponse.ok) {
                const urls = await photosResponse.json();
                setPhotoUrls(urls);
            } else {
                console.error('An error occurred while fetching photos.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        fetchFolderLink();
        fetchPhotos();
    }, []);

    useEffect(() => {
        if (photoUrls.length === 1 && !folderLink) {
            fetchFolderLink();
        }
    }, [photoUrls, folderLink]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const fileType = file.type.split('/')[0];
            if (fileType === 'image') {
                setSelectedFile(file);
                const reader = new FileReader();
                reader.onload = () => {
                    setPreviewImage(reader.result);
                };
                reader.readAsDataURL(file);
            } else {
                alert(translation[props.language].Receipt.ChooseAlert);
                event.target.value = null;
                setSelectedFile(null);
                setPreviewImage(null);
                return;
            }
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !fileName) {
            showWarningAlert(translation[props.language].Receipt.WarningAlert);
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('fileName', fileName);

        try {
            const response = await fetch("/api/receipt/upload", {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                if (response.headers.get("content-type").includes("application/json")) {
                    const result = await response.json();
                    console.log('File path:', result.path);
                } else {
                    const text = await response.text();
                    console.error('Response is not JSON:', text);
                }
                setSelectedFile(null);
                setPreviewImage(null);
                setFileName("");
                showSuccessAlert(translation[props.language].Receipt.Success);
                fetchPhotos();
            } else {
                console.error('An error occurred while uploading the file.');
                alert(translation[props.language].Receipt.Error);
            }

        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    };

    return (
        <div className='container'>
            <h2 className="mt-4">{translation[props.language].Receipt.FolderLink}</h2>
            {folderLink ? (
                <div>
                    <a href={folderLink} target="_blank" rel="noopener noreferrer">{translation[props.language].Receipt.OpenFolder}</a>
                </div>
            ) : (
                <div>
                        {translation[props.language].Receipt.LinkNotExists}
                </div>
            )}
            <h2 className="mt-4">{translation[props.language].Receipt.PhotosGoogle}</h2>
            <div className="row">
                {photoUrls.length > 0 ? (
                    photoUrls.map((url, index) => (
                        <div className="col-md-4 mb-3 d-flex justify-content-center" key={index}>
                            <img src={url} alt={`PHOTO ${index}`} style={{ maxWidth: '100%', maxHeight: '300px' }} />
                        </div>
                    ))
                ) : (
                    <div className="col-md-12">
                            <p>{translation[props.language].Receipt.NoPhotos}</p>
                    </div>
                )}
            </div>
            <h2 className="mt-4">{translation[props.language].Receipt.AddReceipt}</h2>
            <form onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label htmlFor="firstName" className="form-label">
                            {translation[props.language].Receipt.FileName}
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="firstName"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label htmlFor="lastName" className="form-label">
                            {translation[props.language].Receipt.ImageChoose}
                        </label>
                        <input
                            className="form-control"
                            type="file"
                            id="formFile"
                            onChange={handleFileChange}
                            accept='image/*'
                        />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <label htmlFor="lastName" className="form-label">
                            {translation[props.language].Receipt.Preview}
                        </label> <br />
                        {previewImage && <img src={previewImage} alt="Preview" style={{ maxWidth: '300px', marginBottom: '20px', maxHeight: '500px' }} />}
                    </div>
                    <button type="button" className="btn btn-primary" onClick={handleUpload}>{translation[props.language].Receipt.Upload}</button>
                </div>
            </form>
            <ToastContainer />
        </div>
    );
};

export default MyReceipt;
