import axios from 'axios';

export interface ActusApiResponse {
    inflow: number[][];
    outflow: number[][];
    monthsCount: number;
}

export async function fetchActusData(): Promise<ActusApiResponse> {
    const url = 'http://localhost:8083/eventsBatch';
    
    const requestData = {
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
            "contractRole": "RPA",
            "contractDealDate": "2023-12-28T00:00:00",
            "initialExchangeDate": "2024-01-01T00:00:00",
            "statusDate": "2023-12-30T00:00:00",
            "notionalPrincipal": "5000",
            "cycleAnchorDateOfPrincipalRedemption": "2024-02-01T00:00:00",
            "nextPrincipalRedemptionPayment": "434.866594118346",
            "dayCountConvention": "A365",
            "nominalInterestRate": "0.08",
            "currency": "USD",
            "cycleOfPrincipalRedemption": "P1ML0",
            "maturityDate": "2025-01-01T00:00:00",
            "rateMultiplier": "1.0",
            "rateSpread": "0.0",
            "fixingDays": "P0D",
            "cycleAnchorDateOfInterestPayment": "2024-02-01T00:00:00",
            "cycleOfInterestPayment": "P1ML0"
         },
         {
            "contractType": "STK",
            "contractID": "stk01",
            "contractRole": "RPA",
            "contractDealDate": "2023-12-28T00:00:00",
            "statusDate": "2023-12-30T00:00:00",
            "notionalPrincipal": "1000",
            "currency": "USD",
            "purchaseDate": "2024-01-01T00:00:00",
            "priceAtPurchaseDate": "1100",
            "endOfMonthConvention": "EOM"
         },
         {
            "contractType": "PAM",
            "contractID": "pam02",
            "contractRole": "RPA",
            "contractDealDate": "2023-12-28T00:00:00",
            "initialExchangeDate": "2024-01-01T00:00:00",
            "statusDate": "2023-12-30T00:00:00",
            "notionalPrincipal": "3000",
            "currency": "USD",
            "cycleAnchorDateOfInterestPayment": "2024-01-01T00:00:00",
            "cycleOfInterestPayment": "P2ML0",
            "maturityDate": "2025-01-01T00:00:00",
            "nominalInterestRate": "0.1",
            "dayCountConvention": "A360",
            "endOfMonthConvention": "SD",
            "premiumDiscountAtIED": "-200",
            "rateMultiplier": "1.0",
         }
      ],
      "riskFactors": []
    };

    try {
        const response = await axios.post(url, requestData);
        const jsonData = response.data;
        return {
            inflow: jsonData.inflow,
            outflow: jsonData.outflow,
            monthsCount: jsonData.monthsCount
        };
    } catch (error) {
        console.error('Error fetching ACTUS data:', error);
        throw error;
    }
}