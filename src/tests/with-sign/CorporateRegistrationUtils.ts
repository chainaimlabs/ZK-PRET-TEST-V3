// import axios, { AxiosResponse } from 'axios';
// import * as dotenv from 'dotenv';

// dotenv.config();

// interface AuthResponse {
//   access_token: string;
//   [key: string]: any;
// }

// interface MasterDataRequest {
//   "@entity": string;
//   id: string;
//   consent: string;
//   reason: string;
// }

// async function getAccessToken(): Promise<string> {
//   try {
//     const response: AxiosResponse<AuthResponse> = await axios.post(
//       process.env.AUTH_URL as string,
//       {},
//       {
//         headers: {
//           'x-api-key': process.env.API_KEY as string,
//           'x-api-secret': process.env.API_SECRET as string,
//           'x-api-version': process.env.API_VERSION as string,
//           'Content-Type': 'application/json'
//         }
//       }
//     );
//     return response.data.access_token;
//   } catch (error: any) {
//     console.error('Error fetching access token:', error.response ? error.response.data : error.message);
//     process.exit(1);
//   }
// }

// async function fetchMasterData(accessToken: string): Promise<void> {
//   try {
//     const body: MasterDataRequest = {
//       "@entity": "in.co.sandbox.kyc.mca.master_data.request",
//       id: process.env.CIN as string,
//       consent: process.env.CONSENT as string,
//       reason: process.env.REASON as string
//     };

//     const response: AxiosResponse = await axios.post(
//       process.env.CORPREG_URL_SANDBOX_INDIA as string,
//       body,
//       {
//         headers: {
//           'Authorization': accessToken,
//           'x-api-key': process.env.API_KEY as string,
//           'x-api-version': process.env.API_VERSION as string,
//           'Content-Type': 'application/json'
//         }
//       }
//     );
//     console.log('Master Data Response:', response.data);
//   } catch (error: any) {
//     console.error('Error fetching master data:', error.response ? error.response.data : error.message);
//   }
// }

// (async () => {
//   const accessToken = await getAccessToken();
//   // Print the access token
//   console.log('Access Token:', accessToken);
//   await fetchMasterData(accessToken);
// })();
import axios, { AxiosResponse } from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

interface AuthResponse {
  access_token: string;
  [key: string]: any;
}

interface MasterDataRequest {
  "@entity": string;
  id: string;
  consent: string;
  reason: string;
}

export async function fetchCorporateRegistrationData(cin: string,typeOfNet: string): Promise<any> {
  let CORPREG_URL: string | undefined;

  // Default to TESTNET if not provided or empty
  if (!typeOfNet) {
    typeOfNet = 'TESTNET';
  }

  console.log('Type of Network:', typeOfNet);

  if (typeOfNet.toUpperCase() === 'TESTNET') {
    console.log('========== Using TESTNET endpoints ==========');
    CORPREG_URL = process.env.CORPREG_URL_PROD_INDIA;
    if (!CORPREG_URL) {
      throw new Error('CORPREG_URL is not set in the environment variables.');
    }
    if (!cin) {
      throw new Error('CIN is required.');
    }

    const accessToken = await getAccessToken(process.env.AUTH_URL as string);
    return fetchMasterData(accessToken, CORPREG_URL, cin);


  } 
  
  
  else if (typeOfNet.toUpperCase() === 'LOCAL') {
    console.log('========== Using MOCK endpoints ==========');
    CORPREG_URL = process.env.CORPREG_URL_MOCK_INDIA;
    const response = await axios.get(`${CORPREG_URL}/${cin}`);
    return response.data;
  } 
  
  
  else { // default to SANDBOX
    console.log('========== Using SANDBOX endpoints ==========');
    CORPREG_URL = process.env.CORPREG_URL_SANDBOX_INDIA;
    if (!CORPREG_URL) {
      throw new Error('CORPREG_URL is not set in the environment variables.');
    }
    if (!cin) {
      throw new Error('CIN is required.');
    }

    const accessToken = await getAccessToken(process.env.AUTH_URL as string);
    return fetchMasterData(accessToken, CORPREG_URL, cin);
  }

  // if (!CORPREG_URL) {
  //   throw new Error('CORPREG_URL is not set in the environment variables.');
  // }
  // if (!cin) {
  //   throw new Error('CIN is required.');
  // }

  // const accessToken = await getAccessToken(process.env.AUTH_URL as string);
  // return fetchMasterData(accessToken, CORPREG_URL, cin);
}

async function getAccessToken(AUTH_URL: string): Promise<string> {
  try {
    const response: AxiosResponse<AuthResponse> = await axios.post(
      AUTH_URL,
      {},
      {
        headers: {
          'x-api-key': process.env.API_KEY as string,
          'x-api-secret': process.env.API_SECRET as string,
          'x-api-version': process.env.API_VERSION as string,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.access_token;
  } catch (error: any) {
    throw new Error(`Error fetching access token: ${error.response?.data || error.message}`);
  }
}

async function fetchMasterData(
  accessToken: string,
  CORPREG_URL: string,
  cin: string
): Promise<any> {
  try {
    const body: MasterDataRequest = {
      "@entity": "in.co.sandbox.kyc.mca.master_data.request",
      id: cin,
      consent: process.env.CONSENT as string,
      reason: process.env.REASON as string
    };

    const response: AxiosResponse = await axios.post(
      CORPREG_URL,
      body,
      {
        headers: {
          'Authorization': accessToken,
          'x-api-key': process.env.API_KEY as string,
          'x-api-version': process.env.API_VERSION as string,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(`Error fetching master data: ${error.response?.data || error.message}`);
  }
}
