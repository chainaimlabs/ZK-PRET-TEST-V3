import axios from 'axios';
import * as fs from 'fs';

interface BSDIResponse {
    iec: string;
    entityName: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    pin: number;
    contactNo: number;
    email: string;
    iecIssueDate: string;
    exporterType: number;
    pan: string;
    iecStatus: number;
    starStatus: number;
    iecModificationDate: string;
    dataAsOn: string;
    natureOfConcern: number;
    branches: Array<{
        branchCode: number;
        badd1: string;
        badd2: string;
        city: string;
        state: string;
        pin: number;
    }>;
    directors: Array<{
        name: string;
    }>;
}

export async function fetchBSDIData(companyName: string): Promise<BSDIResponse> {
    const BASEURL = "https://0f4aef00-9db0-4057-949e-df6937e3449b.mock.pstmn.io";
    try {
        const response = await axios.get(`${BASEURL}/${companyName}`);
        console.log('BSDI API Response:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching BSDI data:', error.message);
        throw new Error('Failed to fetch BSDI data');
    }
}

export async function readBLJsonFile(filePath: string): Promise<any> {
    try {
        const data = await fs.promises.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error: any) {
        console.error('Error reading BL JSON file:', error.message);
        throw new Error('Failed to read BL JSON file');
    }
}