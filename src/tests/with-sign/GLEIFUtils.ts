import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

export async function fetchGLEIFCompanyData(companyName: string, typeOfNet: string): Promise<any> {
    //const BASEURL = process.env.GLEIF_URL_PROD;
    let BASEURL: string | undefined;
    let url: string;
    if (!typeOfNet) {
        typeOfNet = 'TESTNET';
    }
    console.log('Type of Network:', typeOfNet);
    if (typeOfNet === process.env.BUILD_ENV) {
        console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++in sandbox++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
        BASEURL = "https://api.gleif.org/api/v1/lei-records";
        if (!BASEURL) {
        throw new Error('BASEURL is not set in the environment variables.');
        }
        if (!companyName) {
            throw new Error('Company name is required.');
        }
        url = `${BASEURL}?filter[entity.legalName]=${encodeURIComponent(companyName)}`;
   } else if (typeOfNet === 'LOCAL') {
    //
        console.log('------------------------------------------------in mock--------------------------------------------------');
        BASEURL = "https://9a4d8990-c981-42fa-ace4-675ddec17321.mock.pstmn.io";
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
        BASEURL = "https://api.gleif.org/api/v1/lei-records";
        if (!BASEURL) {
            throw new Error('BASEURL is not set in the environment variables.');
        }
        if (!companyName) {
            throw new Error('Company name is required.');
        }
        url = `${BASEURL}?filter[entity.legalName]=${encodeURIComponent(companyName)}`;
    }
    const response = await axios.get(url);
    const parsedData = response.data;
    console.log('GLEIF API Response:', parsedData);

    if (!parsedData.data || parsedData.data.length === 0) {
    throw new Error('No company found with that name.');
    }

    return parsedData;
}
