exports.handler = async function(event, context) {

    // Allow ALL origins (fixes CORS from GitHub Pages)
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const data = JSON.parse(event.body);
        const { firstName, email, role, annualGap, totalLost, lifetimeTotal } = data;

        if (!email || !firstName) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Email and first name are required' })
            };
        }

        const API_KEY = 'eo_fd128ca3dde890b2484d2fc4cf483e63b78bf9a4c1217757f9c68e56fed5bce1';
        const LIST_ID = '7854ed60-2bf8-11f1-a8ea-cb30e66712ec';

        const response = await fetch(`https://emailoctopus.com/api/1.6/lists/${LIST_ID}/contacts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                api_key: API_KEY,
                email_address: email,
                fields: {
                    FirstName: firstName,
                    Role: role || 'Not selected',
                    AnnualGap: annualGap || '$0',
                    TotalLost: totalLost || '$0',
                    LifetimeTotal: lifetimeTotal || '$0'
                },
                status: 'SUBSCRIBED'
            })
        });

        const result = await response.json();
        console.log('EmailOctopus result:', JSON.stringify(result));

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, result })
        };

    } catch (error) {
        console.error('Function error:', error.message);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};
