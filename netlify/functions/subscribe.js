exports.handler = async function(event, context) {

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    // Allow requests from your GitHub Pages site
    const headers = {
        'Access-Control-Allow-Origin': 'https://darlene-conscious.github.io',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
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

        if (response.ok) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true })
            };
        } else {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: result.error || 'EmailOctopus error' })
            };
        }

    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Server error: ' + error.message })
        };
    }
};
