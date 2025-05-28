import axios from 'axios';

export async function fetchActusBasel3Data(url: string): Promise<string> {
    const data = {
        "contracts": [
            {
                "contractType": "PAM",
                "contractID": "pam01",
                "contractRole": "RPA",
                "contractDealDate": "2023-01-01T00:00:00",
                "initialExchangeDate": "2023-01-02T00:00:00",
                "statusDate": "2023-01-01T00:00:00",
                "notionalPrincipal": "10000",
                "maturityDate": "2024-01-01T00:00:00",
                "nominalInterestRate": "0.05",
                "currency": "USD",
                "dayCountConvention": "A365"
            },
            {
                "contractType": "ANN",
                "contractID": "ann01",
                // ... copy exact contract data from main file
            },
            {
                "contractType": "STK",
                "contractID": "stk01",
                // ... copy exact contract data from main file
            },
            {
                "contractType": "PAM",
                "contractID": "pam02",
                // ... copy exact contract data from main file
            }
        ],
        "riskFactors": []
    };

    try {
        const response = await axios.post(url, data);
        console.log('Response Code:', response.status);
        return JSON.stringify(response.data, null, 2);
    } catch (error: any) {
        console.error('Error:', error.response ? error.response.data : error.message);
        throw new Error('Failed to fetch ACTUS data');
    }
}