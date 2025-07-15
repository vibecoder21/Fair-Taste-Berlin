// Application state
let selectedEmploymentType = '';

// DOM elements
const recruitmentSection = document.getElementById('recruitment-section');
const applicationSection = document.getElementById('application-section');
const successSection = document.getElementById('success-section');
const freelancerOption = document.getElementById('freelancer-option');
const minijobOption = document.getElementById('minijob-option');
const applicationForm = document.getElementById('application-form');
const backButton = document.getElementById('back-button');
const newApplicationButton = document.getElementById('new-application-button');
const selectedEmploymentTypeElement = document.getElementById('selected-employment-type');

// Form validation messages in German
const validationMessages = {
    required: 'Dieses Feld ist erforderlich.',
    email: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
    phone: 'Bitte geben Sie eine gültige Telefonnummer ein.',
    date: 'Bitte geben Sie ein gültiges Datum ein.',
    minAge: 'Sie müssen mindestens 16 Jahre alt sein.',
    name: 'Bitte geben Sie Vor- und Nachname ein.'
};

// Initialize the application
function init() {
    // Add event listeners
    freelancerOption.addEventListener('click', () => selectEmploymentType('Freelancer'));
    minijobOption.addEventListener('click', () => selectEmploymentType('Mini-Jobber'));
    backButton.addEventListener('click', showRecruitmentSection);
    newApplicationButton.addEventListener('click', showRecruitmentSection);
    applicationForm.addEventListener('submit', handleFormSubmissionWithLoading);
    
    // Add input event listeners for real-time validation
    const formInputs = applicationForm.querySelectorAll('input, textarea, select');
    formInputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
    });
    
    // Add accessibility attributes
    addAccessibilityAttributes();
}

// Select employment type and show application form
function selectEmploymentType(type) {
    selectedEmploymentType = type;
    selectedEmploymentTypeElement.textContent = type;
    
    // Hide recruitment section and show application section
    recruitmentSection.classList.add('hidden');
    applicationSection.classList.remove('hidden');
    
    // Scroll to top of application section
    applicationSection.scrollIntoView({ behavior: 'smooth' });
}

// Show recruitment section
function showRecruitmentSection() {
    recruitmentSection.classList.remove('hidden');
    applicationSection.classList.add('hidden');
    successSection.classList.add('hidden');
    
    // Reset form
    applicationForm.reset();
    clearAllErrors();
    selectedEmploymentType = '';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Validate individual field
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';
    
    // Clear previous errors
    clearFieldError(field);
    
    // Required field validation
    if (field.required && !value) {
        isValid = false;
        errorMessage = validationMessages.required;
    }
    
    // Specific field validations
    if (value && isValid) {
        switch (fieldName) {
            case 'vorname_nachname':
                if (value.split(' ').length < 2) {
                    isValid = false;
                    errorMessage = validationMessages.name;
                }
                break;
                
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = validationMessages.email;
                }
                break;
                
            case 'telefon':
                const phoneRegex = /^[\+]?[\d\s\-\(\)]{8,}$/;
                if (!phoneRegex.test(value)) {
                    isValid = false;
                    errorMessage = validationMessages.phone;
                }
                break;
                
            case 'geburtsdatum':
                const birthDate = new Date(value);
                const today = new Date();
                const age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
                
                if (age < 16) {
                    isValid = false;
                    errorMessage = validationMessages.minAge;
                }
                break;
        }
    }
    
    if (!isValid) {
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

// Show field error
function showFieldError(field, message) {
    const formGroup = field.closest('.form-group');
    const existingError = formGroup.querySelector('.error-message');
    
    if (existingError) {
        existingError.remove();
    }
    
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.style.color = 'var(--color-error)';
    errorElement.style.fontSize = 'var(--font-size-sm)';
    errorElement.style.marginTop = 'var(--space-4)';
    
    formGroup.appendChild(errorElement);
    field.style.borderColor = 'var(--color-error)';
}

// Clear field error
function clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    const errorElement = formGroup.querySelector('.error-message');
    
    if (errorElement) {
        errorElement.remove();
    }
    
    field.style.borderColor = 'var(--color-border)';
}

// Clear all errors
function clearAllErrors() {
    const errorElements = applicationForm.querySelectorAll('.error-message');
    errorElements.forEach(element => element.remove());
    
    const inputs = applicationForm.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.style.borderColor = 'var(--color-border)';
    });
}

// Validate entire form
function validateForm() {
    const formInputs = applicationForm.querySelectorAll('input[required], textarea[required], select[required]');
    let isFormValid = true;
    
    formInputs.forEach(input => {
        if (!validateField(input)) {
            isFormValid = false;
        }
    });
    
    return isFormValid;
}

// Set loading state to form submission
function setFormLoading(isLoading) {
    const submitButton = applicationForm.querySelector('button[type="submit"]');
    const inputs = applicationForm.querySelectorAll('input, textarea, select, button');
    
    if (isLoading) {
        submitButton.textContent = 'Wird gesendet...';
        submitButton.disabled = true;
        inputs.forEach(input => input.disabled = true);
    } else {
        submitButton.textContent = 'Bewerbung absenden';
        submitButton.disabled = false;
        inputs.forEach(input => input.disabled = false);
    }
}

// Enhanced form submission with loading state
function handleFormSubmissionWithLoading(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        const firstError = applicationForm.querySelector('.error-message');
        if (firstError) {
            const errorField = firstError.closest('.form-group').querySelector('input, textarea, select');
            errorField.focus();
        }
        return;
    }
    
    // Set loading state
    setFormLoading(true);

    const formData = new FormData(applicationForm);
    const applicationData = {};

    for (let [key, value] of formData.entries()) {
        if (key === 'positions') {
            if (!applicationData[key]) {
                applicationData[key] = [];
            }
            applicationData[key].push(value);
        } else {
            applicationData[key] = value;
        }
    }

    applicationData.employmentType = selectedEmploymentType;

    const emailData = prepareEmailData(applicationData);
    formData.append('subject', emailData.subject);
    formData.append('body', emailData.body);

    fetch('/api/apply', {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Server Error');
            }
            return response.json();
        })
        .then(result => {
            setFormLoading(false);
            if (result && result.success) {
                showSuccessSection();
            } else {
                throw new Error('Send failed');
            }
        })
        .catch(error => {
            console.error('Submission error:', error);
            setFormLoading(false);
            alert('Es gab ein Problem beim Senden der Bewerbung. Bitte versuche es später erneut.');
        });
}

// Prepare email data
function prepareEmailData(formData) {
    const emailSubject = `Neue Bewerbung - ${formData.employmentType} - ${formData.vorname_nachname}`;
    
    const emailBody = `
Neue Bewerbung für Fair Taste

Bewerbungstyp: ${formData.employmentType}
Name: ${formData.vorname_nachname}
Geburtsdatum: ${formData.geburtsdatum}
E-Mail: ${formData.email}
Telefon: ${formData.telefon}
Wohnort: ${formData.wohnort}

Positionen: ${Array.isArray(formData.positions) ? formData.positions.join(', ') : formData.positions || ''}

Erfahrungen:
${formData.erfahrungen}

${formData.foto ? `Foto: ${formData.foto.name}` : 'Kein Foto hochgeladen'}

Bewerbung eingereicht am: ${new Date().toLocaleString('de-DE')}
    `.trim();
    
    return {
        to: 'info@fair-taste.de',
        subject: emailSubject,
        body: emailBody,
        attachments: formData.foto ? [formData.foto] : []
    };
}

// Show success section
function showSuccessSection() {
    applicationSection.classList.add('hidden');
    successSection.classList.remove('hidden');
    
    // Scroll to success section
    successSection.scrollIntoView({ behavior: 'smooth' });
}

// Add accessibility improvements
function addAccessibilityAttributes() {
    // Add ARIA labels
    freelancerOption.setAttribute('role', 'button');
    freelancerOption.setAttribute('tabindex', '0');
    freelancerOption.setAttribute('aria-label', 'Als Freelancer bewerben');
    
    minijobOption.setAttribute('role', 'button');
    minijobOption.setAttribute('tabindex', '0');
    minijobOption.setAttribute('aria-label', 'Als Mini-Jobber bewerben');
    
    // Add keyboard support for option cards
    [freelancerOption, minijobOption].forEach(option => {
        option.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                option.click();
            }
        });
    });
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Add keyboard navigation support
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        if (!applicationSection.classList.contains('hidden')) {
            showRecruitmentSection();
        } else if (!successSection.classList.contains('hidden')) {
            showRecruitmentSection();
        }
    }
});
