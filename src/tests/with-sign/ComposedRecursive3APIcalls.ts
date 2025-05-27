import axios from 'axios';
import { Field, CircuitString } from 'o1js';
import { ComplianceData } from './CorporateRegistrationo1.js';
import { EXIMComplianceDataO1 } from './EXIMo1.js';
import { GLEIFComplianceDataO1 } from './GLEIFo1.js';

export async function fetchMCAData() {
    const response = await axios.get('https://0f4aef00-9db0-4057-949e-df6937e3449b.mock.pstmn.io/vernon_mca');
    const parsedData = response.data;
    
    return new ComplianceData({
        companyID: CircuitString.fromString(parsedData["CIN"] || ''),
        companyName: CircuitString.fromString(parsedData["Company Name"] || ''),
        activeCompliance: CircuitString.fromString(parsedData["Active Compliance"]),
    });
}

export async function fetchEXIMData() {
    const BASEURL = "https://0f4aef00-9db0-4057-949e-df6937e3449b.mock.pstmn.io";
    const companyname = "zenova_dgft";
    const response = await axios.get(`${BASEURL}/${companyname}`);
    const parsedData = response.data;
    
    return new EXIMComplianceDataO1({
        iec: CircuitString.fromString(parsedData["iec"] || ''),
        entityName: CircuitString.fromString(parsedData["entityName"] || ''),
        iecStatus: Field(parsedData["iecStatus"] ?? 0),
    });
}

export async function fetchGLEIFData() {
    const BASEURL = "https://9a4d8990-c981-42fa-ace4-675ddec17321.mock.pstmn.io";
    const companyname = "zenova_gleif";
    const response = await axios.get(`${BASEURL}/${companyname}`);
    const parsedData = response.data;
    
    return new GLEIFComplianceDataO1({
        type: CircuitString.fromString(parsedData.data[0].type || ''),
        id: CircuitString.fromString(parsedData.data[0].id || ''),
        lei: CircuitString.fromString(parsedData.data[0].attributes.lei || ''),
        name: CircuitString.fromString(parsedData.data[0].attributes.entity.legalName.name || ''),
        registration_status: CircuitString.fromString(parsedData.data[0].attributes.registration.status || ''),
    });
}