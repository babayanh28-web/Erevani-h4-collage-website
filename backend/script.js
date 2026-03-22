// Инициализация AOS
AOS.init({
    duration: 1000,
    once: true,
    offset: 100,
    easing: 'ease-in-out'
});

// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : 'https://yourdomain.com/api';

// Обработка формы с отправкой на бэкенд
document.getElementById('applyForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        name: document.getElementById('name').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        specialty: document.getElementById('specialty').value
    };
    
    // Show loading state
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Ուղարկվում է...';
    
    try {
        // Validate form data
        if (!formData.name || !formData.phone || !formData.email || !formData.specialty) {
            throw new Error('Խնդրում ենք լրացնել բոլոր դաշտերը');
        }
        
        if (!isValidEmail(formData.email)) {
            throw new Error('Խնդրում ենք մուտքագրել վավեր էլ. փոստի հասցե');
        }
        
        if (!isValidPhone(formData.phone)) {
            throw new Error('Խնդրում ենք մուտքագրել վավեր հեռախոսահամար');
        }
        
        // Send to backend
        const response = await fetch(`${API_BASE_URL}/applications/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Սխալ է տեղի ունեցել');
        }
        
        // Success message
        showNotification('success', 'Շնորհակալություն դիմելու համար: Մենք կկապնվենք Ձեզ հետ մոտակա ժամերին:');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('applyModal'));
        modal.hide();
        
        // Reset form
        this.reset();
        
    } catch (error) {
        console.error('Form submission error:', error);
        showNotification('error', error.message);
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
});

// Helper function for email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Helper function for phone validation
function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,20}$/;
    return phoneRegex.test(phone);
}

// Notification system
function showNotification(type, message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        display: flex;
        align-items: center;
        gap: 1rem;
        font-family: 'Inter', sans-serif;
        font-size: 0.9rem;
        font-weight: 500;
        max-width: 400px;
        cursor: pointer;
    `;
    
    // Add close button styles
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        margin-left: auto;
        padding: 0 0 0 0.5rem;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
    
    // Close on click
    notification.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ... (остальной код из предыдущего script.js сохраняем)

// CSRF Protection for forms
async function getCsrfToken() {
    try {
        const response = await fetch(`${API_BASE_URL}/csrf-token`);
        const data = await response.json();
        return data.csrfToken;
    } catch (error) {
        console.error('Failed to get CSRF token:', error);
        return null;
    }
}

// Add CSRF token to forms
document.addEventListener('DOMContentLoaded', async () => {
    const csrfToken = await getCsrfToken();
    if (csrfToken) {
        document.querySelectorAll('form').forEach(form => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = '_csrf';
            input.value = csrfToken;
            form.appendChild(input);
        });
    }
});