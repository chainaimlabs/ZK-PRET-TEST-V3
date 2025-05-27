import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

export async function fetchEXIMCompanyData(companyName: string, typeOfNet: string): Promise<any> {
    //const BASEURL = process.env.GLEIF_URL_PROD;
    let BASEURL: string | undefined;
    let url: string;
    if (!typeOfNet) {
        typeOfNet = 'TESTNET';
    }
    console.log('Type of Network:', typeOfNet);
    if (typeOfNet === process.env.BUILD_ENV) {
        console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++in sandbox++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
        BASEURL = process.env.EXIM_URL_SANDBOX_INDIA;
        if (!BASEURL) {
        throw new Error('BASEURL is not set in the environment variables.');
        }
        if (!companyName) {
            throw new Error('Company name is required.');
        }
        url = `${BASEURL}/${companyName}`;
   } else if (typeOfNet === 'LOCAL') {
    //
        console.log('------------------------------------------------in mock--------------------------------------------------');
        BASEURL = process.env.EXIM_URL_MOCK_INDIA;
        if (!BASEURL) {
        throw new Error('BASEURL is not set in the environment variables.');
        }
        if (!companyName) {
            throw new Error('Company name is required.');
        }
        url = `${BASEURL}/${companyName}`;
    }
    else{
        console.log('///////////////////////////////////////////////in prod//////////////////////////////////////////////');
        BASEURL = process.env.EXIM_URL_PROD_INDIA;
        if (!BASEURL) {
        throw new Error('BASEURL is not set in the environment variables.');
        }
        if (!companyName) {
            throw new Error('Company name is required.');
        }
        url = `${BASEURL}/${companyName}`;
    }
    const response = await axios.get(url);
    const parsedData = response.data;
    console.log('EXIM API Response:', parsedData);

    // if (!parsedData.data || parsedData.data.length === 0) {
    // throw new Error('No company found with that name.');
    // }

    return parsedData;
}
