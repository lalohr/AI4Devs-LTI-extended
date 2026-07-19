import axios from 'axios';

const extractErrorMessage = (error, fallback) => {
    const responseData = error.response?.data;
    return (
        responseData?.error ||
        responseData?.message ||
        (typeof responseData === 'string' ? responseData : null) ||
        error.message ||
        fallback
    );
};

export const uploadCV = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await axios.post('http://localhost:3010/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data; // Devuelve la ruta del archivo y el tipo
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Error uploading the file'));
    }
};

export const sendCandidateData = async (candidateData) => {
    try {
        const response = await axios.post('http://localhost:3010/candidates', candidateData);
        return response.data;
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Error sending candidate data'));
    }
};