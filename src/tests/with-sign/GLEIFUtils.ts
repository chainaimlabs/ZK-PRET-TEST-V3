// import axios from 'axios';
// import * as dotenv from 'dotenv';
// dotenv.config();

// export async function fetchGLEIFCompanyData(companyName: string, typeOfNet: string): Promise<any> {
//     //const BASEURL = process.env.GLEIF_URL_PROD;
//     let BASEURL: string | undefined;
//     let url: string;
//     if (!typeOfNet) {
//         typeOfNet = 'TESTNET';
//     }
//     console.log('Type of Network:', typeOfNet);
//     if (typeOfNet === process.env.BUILD_ENV) {
//         console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++in sandbox++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
//         BASEURL = "https://api.gleif.org/api/v1/lei-records";
//         if (!BASEURL) {
//         throw new Error('BASEURL is not set in the environment variables.');
//         }
//         if (!companyName) {
//             throw new Error('Company name is required.');
//         }
//         url = `${BASEURL}?filter[entity.legalName]=${encodeURIComponent(companyName)}`;
//    } else if (typeOfNet === 'LOCAL') {
//     //
//         console.log('------------------------------------------------in mock--------------------------------------------------');
//         BASEURL = "https://9a4d8990-c981-42fa-ace4-675ddec17321.mock.pstmn.io";
//         if (!BASEURL) {
//             throw new Error('BASEURL is not set in the environment variables.');
//         }
//         if (!companyName) {
//             throw new Error('Company name is required.');
//         }
//         url = `${BASEURL}/${companyName}`;
//     }
//     else{
//         console.log('///////////////////////////////////////////////in prod//////////////////////////////////////////////');
//         BASEURL = "https://api.gleif.org/api/v1/lei-records";
//         if (!BASEURL) {
//             throw new Error('BASEURL is not set in the environment variables.');
//         }
//         if (!companyName) {
//             throw new Error('Company name is required.');
//         }
//         url = `${BASEURL}?filter[entity.legalName]=${encodeURIComponent(companyName)}`;
//     }
//     const response = await axios.get(url);
//     const parsedData = response.data;
//     console.log('GLEIF API Response:', parsedData);

//     if (!parsedData.data || parsedData.data.length === 0) {
//     throw new Error('No company found with that name.');
//     }

//     return parsedData;
// }
import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

/**
 * Fetch company data from GLEIF API based on company name and network type
 */
export async function fetchGLEIFCompanyData(companyName: string, typeOfNet: string): Promise<any> {
  let BASEURL;
  let url;

  if (!typeOfNet) {
    typeOfNet = 'TESTNET';
  }

  console.log('Type of Network:', typeOfNet);

  if (typeOfNet === process.env.BUILD_ENV) {
    console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++in sandbox++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
    BASEURL = "https://api.gleif.org/api/v1/lei-records";
    url = `${BASEURL}?filter[entity.legalName]=${encodeURIComponent(companyName)}`;
  } else if (typeOfNet === 'LOCAL') {
    console.log('------------------------------------------------in mock--------------------------------------------------');
    BASEURL = "https://9a4d8990-c981-42fa-ace4-675ddec17321.mock.pstmn.io";
    url = `${BASEURL}/${companyName}`;
  } else {
    console.log('///////////////////////////////////////////////in prod//////////////////////////////////////////////');
    BASEURL = "https://api.gleif.org/api/v1/lei-records";
    url = `${BASEURL}?filter[entity.legalName]=${encodeURIComponent(companyName)}`;
  }

  if (!BASEURL) {
    throw new Error('BASEURL is not set in the environment variables.');
  }
  if (!companyName) {
    throw new Error('Company name is required.');
  }

  const response = await axios.get(url);
  const parsedData = response.data;

  console.log('GLEIF API Response:', parsedData);

  // Check for data existence and non-empty array/object
  if (
    !parsedData.data ||
    (Array.isArray(parsedData.data) && parsedData.data.length === 0)
  ) {
    throw new Error('No company found with that name.');
  }

  return parsedData;
}

/**
 * Check if a company is GLEIF compliant by verifying if company data exists and status is ACTIVE
 */
export async function isCompanyGLEIFCompliant(companyName: string, typeOfNet: string): Promise<boolean> {
  const res = await fetchGLEIFCompanyData(companyName, typeOfNet);

  // Handle both array and object responses
  let firstRecord;
  if (Array.isArray(res.data)) {
    firstRecord = res.data[0];
  } else if (res.data) {
    firstRecord = res.data;
  }

  const status = firstRecord?.attributes?.entity?.status;
  console.log('Company Status:', status);

  // Return true only if status is ACTIVE
  return !!status && status === 'ACTIVE';
}




/*
async function main() {
  const companyName = process.argv[2];
  let typeOfNet = process.argv[3] || 'TESTNET'; // Default to PROD if not provided


  console.log('Company Name:', companyName);

  //await fetchGLEIFCompanyData(companyName, typeOfNet);

  try {
    const res = await isCompanyGLEIFCompliant(companyName, typeOfNet);
    console.log(`Is company "${companyName}" GLEIF compliant?`, res);
  } catch (err: any) {
    console.error('Error:', err.message || err);
  }
}

main();*/
