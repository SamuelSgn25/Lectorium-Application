const axios = require('axios');
const { randomUUID } = require('crypto');

// Simulation locale — compteurs par référence
const _simPollCount = {};

// In-memory token cache (per product)
const _tokenCache = {
    collection: { token: null, expiresAt: 0 },
};

const _getBasicAuthToken = () => {
    const credentials = `${process.env.MTN_MOMO_API_USER}:${process.env.MTN_MOMO_API_KEY}`;
    return `Basic ${Buffer.from(credentials).toString('base64')}`;
};

const getAccessToken = async (product = 'collection') => {
    const now = Date.now();
    const cache = _tokenCache[product] || { token: null, expiresAt: 0 };

    if (cache.token && now < cache.expiresAt) {
        return cache.token;
    }

    const subscriptionKey = process.env.MTN_MOMO_COLLECTION_PRIMARY_KEY;
    const endpoint = `${process.env.MTN_MOMO_BASE_URL}/${product}/token/`;

    const response = await axios.post(endpoint, {}, {
        headers: {
            'Authorization': _getBasicAuthToken(),
            'Ocp-Apim-Subscription-Key': subscriptionKey,
        },
    });

    const { access_token, expires_in = 3600 } = response.data;

    _tokenCache[product] = {
        token: access_token,
        expiresAt: now + (expires_in - 60) * 1000,
    };

    return access_token;
};

// ===== MODE SIMULATION =====
const isSimulate = () => process.env.MTN_MOMO_SIMULATE === 'true';

const _simulateRequestToPay = (referenceId) => {
    _simPollCount[referenceId] = 0;
    console.log('[MTN SIM] requestToPay accepté :', referenceId);
    return { success: true, reference: referenceId, status: 'pending' };
};

const _simulateGetStatus = (referenceId) => {
    _simPollCount[referenceId] = (_simPollCount[referenceId] || 0) + 1;
    const count = _simPollCount[referenceId];
    console.log(`[MTN SIM] getTransactionStatus appel #${count} pour ${referenceId}`);
    if (count < 3) {
        return { success: true, status: 'PENDING' };
    }
    // Après 2 checks PENDING → SUCCESSFUL
    delete _simPollCount[referenceId];
    return {
        success: true,
        status: 'SUCCESSFUL',
        financialTransactionId: `SIM-${referenceId.split('-')[0].toUpperCase()}`,
        amount: '5000',
        currency: 'SIM',
    };
};

/**
 * Initiate a RequestToPay (Collection)
 * @param {number} amount - Amount in FCFA
 * @param {string} phoneNumber - Phone number in international format without + (e.g. 22997000000)
 * @param {string} referenceId - UUID to use as X-Reference-Id (generated if not provided)
 * @param {string} payerMessage - Message shown to the payer
 * @param {string} payeeNote - Note for the payee
 */
const requestToPay = async (amount, phoneNumber, referenceId, payerMessage = '', payeeNote = '') => {
    if (!referenceId) referenceId = randomUUID();

    // Normalize phone: remove spaces, remove leading +
    let phone = phoneNumber.replace(/\s+/g, '');
    if (phone.startsWith('+')) phone = phone.slice(1);

    const accessToken = await getAccessToken('collection');
    const endpoint = `${process.env.MTN_MOMO_BASE_URL}/collection/v1_0/requesttopay`;

    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'X-Reference-Id': referenceId,
        'X-Target-Environment': process.env.MTN_MOMO_TARGET_ENVIRONMENT,
        'Ocp-Apim-Subscription-Key': process.env.MTN_MOMO_COLLECTION_PRIMARY_KEY,
        'Content-Type': 'application/json',
    };

    if (process.env.MTN_MOMO_CALLBACK_URL) {
        headers['X-Callback-Url'] = process.env.MTN_MOMO_CALLBACK_URL;
    }

    const payload = {
        amount: String(amount),
        currency: process.env.MTN_MOMO_CURRENCY || 'XOF',
        externalId: `LRB-${referenceId}`,
        payer: {
            partyIdType: 'MSISDN',
            partyId: phone,
        },
        payerMessage: payerMessage || 'Paiement Lectorium Rosicrucianum',
        payeeNote: payeeNote || 'Inscription activité LRB',
    };

    if (isSimulate()) return _simulateRequestToPay(referenceId);

    try {
        const response = await axios.post(endpoint, payload, { headers });

        if (response.status === 202) {
            return { success: true, reference: referenceId, status: 'pending' };
        }

        return { success: false, error: `Réponse inattendue MTN: ${response.status}` };
    } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || 'Erreur MTN inconnue';
        console.error('[MTN MoMo] requestToPay error:', errorMsg);
        return { success: false, error: errorMsg };
    }
};

/**
 * Check the status of a RequestToPay transaction
 * @param {string} referenceId - The UUID used as X-Reference-Id
 * @returns {{ success, status, financialTransactionId, amount, currency, reason }}
 */
const getTransactionStatus = async (referenceId) => {
    if (isSimulate()) return _simulateGetStatus(referenceId);

    const accessToken = await getAccessToken('collection');
    const endpoint = `${process.env.MTN_MOMO_BASE_URL}/collection/v1_0/requesttopay/${referenceId}`;

    try {
        const response = await axios.get(endpoint, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'X-Target-Environment': process.env.MTN_MOMO_TARGET_ENVIRONMENT,
                'Ocp-Apim-Subscription-Key': process.env.MTN_MOMO_COLLECTION_PRIMARY_KEY,
            },
        });

        const data = response.data;
        return {
            success: true,
            status: data.status,              // PENDING | SUCCESSFUL | FAILED
            financialTransactionId: data.financialTransactionId,
            amount: data.amount,
            currency: data.currency,
            reason: data.reason,
        };
    } catch (err) {
        const errorMsg = err.response?.data?.message || err.message;
        console.error('[MTN MoMo] getTransactionStatus error:', errorMsg);
        return { success: false, error: errorMsg };
    }
};

module.exports = { requestToPay, getTransactionStatus };
