// api.js - НОВЫЙ ФАЙЛ (добавить в корень проекта)
// Этот файл будет подключаться к существующему index.html

const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : 'https://your-backend.herokuapp.com/api'; // Замените на ваш URL бэкенда

// Функция для отправки заявки
window.submitApplication = async (formData) => {
    try {
        const response = await fetch(`${API_URL}/applications/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Ошибка отправки');
        }
        
        return { success: true, data };
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, error: error.message };
    }
};