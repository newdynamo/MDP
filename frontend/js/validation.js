/**
 * Co-Fleeter Form Validation Utility
 * Real-time form validation with user feedback
 */

class Validator {
    constructor() {
        this.rules = {
            required: (value) => value.trim() !== '',
            email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            minLength: (value, min) => value.length >= min,
            maxLength: (value, max) => value.length <= max,
            number: (value) => !isNaN(value) && value.trim() !== '',
            positive: (value) => parseFloat(value) > 0,
            integer: (value) => Number.isInteger(parseFloat(value)),
            range: (value, min, max) => {
                const num = parseFloat(value);
                return num >= min && num <= max;
            },
            match: (value, otherValue) => value === otherValue
        };

        this.messages = {
            required: 'This field is required',
            email: 'Please enter a valid email address',
            minLength: 'Must be at least {min} characters',
            maxLength: 'Must be at most {max} characters',
            number: 'Please enter a valid number',
            positive: 'Must be a positive number',
            integer: 'Must be a whole number',
            range: 'Must be between {min} and {max}',
            match: 'Values do not match'
        };
    }

    /**
     * Validate a single field
     * @param {HTMLElement} field - Input field
     * @param {Array} validations - Array of validation rules
     * @returns {Object} {valid: boolean, message: string}
     */
    validateField(field, validations) {
        const value = field.value;

        for (const validation of validations) {
            const { rule, params = [], message } = validation;
            const validator = this.rules[rule];

            if (!validator) {
                console.warn(`Unknown validation rule: ${rule}`);
                continue;
            }

            const isValid = validator(value, ...params);

            if (!isValid) {
                return {
                    valid: false,
                    message: message || this.formatMessage(rule, params)
                };
            }
        }

        return { valid: true, message: '' };
    }

    formatMessage(rule, params) {
        let msg = this.messages[rule] || 'Invalid value';
        params.forEach((param, index) => {
            const key = ['min', 'max', 'other'][index] || `param${index}`;
            msg = msg.replace(`{${key}}`, param);
        });
        return msg;
    }

    /**
     * Show validation feedback on field
     * @param {HTMLElement} field - Input field
     * @param {boolean} valid - Validation result
     * @param {string} message - Error message
     */
    showFeedback(field, valid, message) {
        // Remove existing feedback
        this.clearFeedback(field);

        // Add validation class
        field.classList.remove('input-valid', 'input-invalid');
        field.classList.add(valid ? 'input-valid' : 'input-invalid');

        // Show error message
        if (!valid && message) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'input-error-message';
            errorDiv.textContent = message;
            field.parentNode.appendChild(errorDiv);
        }

        // Add icon
        const icon = document.createElement('span');
        icon.className = 'input-validation-icon';
        icon.textContent = valid ? '✓' : '✕';
        field.parentNode.style.position = 'relative';
        field.parentNode.appendChild(icon);
    }

    clearFeedback(field) {
        field.classList.remove('input-valid', 'input-invalid');

        // Remove error message
        const errorMsg = field.parentNode.querySelector('.input-error-message');
        if (errorMsg) errorMsg.remove();

        // Remove icon
        const icon = field.parentNode.querySelector('.input-validation-icon');
        if (icon) icon.remove();
    }

    /**
     * Attach real-time validation to a field
     * @param {HTMLElement} field - Input field
     * @param {Array} validations - Validation rules
     */
    attachValidation(field, validations) {
        // Validate on blur
        field.addEventListener('blur', () => {
            const result = this.validateField(field, validations);
            this.showFeedback(field, result.valid, result.message);
        });

        // Clear validation on focus
        field.addEventListener('focus', () => {
            this.clearFeedback(field);
        });

        // Optional: validate on input (for immediate feedback)
        field.addEventListener('input', () => {
            if (field.classList.contains('input-invalid')) {
                const result = this.validateField(field, validations);
                if (result.valid) {
                    this.showFeedback(field, true, '');
                }
            }
        });
    }

    /**
     * Validate entire form
     * @param {HTMLFormElement} form - Form element
     * @param {Object} fieldValidations - Map of field names to validation rules
     * @returns {boolean} Form is valid
     */
    validateForm(form, fieldValidations) {
        let isValid = true;

        for (const [fieldName, validations] of Object.entries(fieldValidations)) {
            const field = form.querySelector(`[name="${fieldName}"], #${fieldName}`);
            if (!field) continue;

            const result = this.validateField(field, validations);
            this.showFeedback(field, result.valid, result.message);

            if (!result.valid) {
                isValid = false;
            }
        }

        return isValid;
    }

    /**
     * Password strength checker
     * @param {string} password
     * @returns {Object} {strength: string, score: number, feedback: string}
     */
    checkPasswordStrength(password) {
        let score = 0;
        const feedback = [];

        if (password.length >= 8) score++;
        else feedback.push('At least 8 characters');

        if (/[a-z]/.test(password)) score++;
        else feedback.push('Lowercase letter');

        if (/[A-Z]/.test(password)) score++;
        else feedback.push('Uppercase letter');

        if (/[0-9]/.test(password)) score++;
        else feedback.push('Number');

        if (/[^a-zA-Z0-9]/.test(password)) score++;
        else feedback.push('Special character');

        const strength = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][score];

        return {
            strength,
            score,
            feedback: feedback.length ? 'Add: ' + feedback.join(', ') : 'Strong password!'
        };
    }
}

// Create global instance
const validator = new Validator();
