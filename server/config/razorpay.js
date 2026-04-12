import Razorpay from 'razorpay';

const normalizeEnv = (value) => {
    if (!value) return value;
    return value.trim().replace(/^['"]|['"]$/g, '');
};

const looksLikePlaceholder = (value = '') =>
    /(placeholder|your_|dummy|example|test_key_secret|test_api_key)/i.test(value);

const createRazorpayInstance = () => {
    const keyId = normalizeEnv(process.env.RAZORPAY_KEY_ID || process.env.TEST_API_KEY);
    const keySecret = normalizeEnv(process.env.RAZORPAY_KEY_SECRET || process.env.TEST_KEY_SECRET);

    if (!keyId || !keySecret) {
        throw new Error('Razorpay keys are missing (set RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET or TEST_API_KEY/TEST_KEY_SECRET).');
    }

    const keyIdLooksValid = /^rzp_(test|live)_/i.test(keyId);
    if (!keyIdLooksValid) {
        throw new Error('Invalid Razorpay key id. Use a key like rzp_test_... or rzp_live_...');
    }

    if (looksLikePlaceholder(keyId) || looksLikePlaceholder(keySecret)) {
        throw new Error('Razorpay keys are placeholders. Add real test keys in server/.env and restart the server.');
    }

    return new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
    });
};

export default createRazorpayInstance;
