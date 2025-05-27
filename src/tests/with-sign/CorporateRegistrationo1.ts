
//import { ComplianceData } from '../../zk-programs/with-sign/CorporateRegistrationZKProgramWithSign.js';
import {
   Field,
   Signature,
   SmartContract,
   PublicKey,
   Struct,
   ZkProgram,
   Proof,
   CircuitString,
   method,
   Permissions,
   Circuit,
   Mina,
   PrivateKey,
   AccountUpdate,
   Poseidon,
   verify
} from 'o1js';

export class ComplianceData extends Struct({
   companyID: CircuitString,          // CIN
   companyName: CircuitString,        // Company Name
   // roc: CircuitString,                // ROC
   // registrationNumber: Field,         // Registration Number
   // incorporationDate: CircuitString,  // Incorporation Date
   // email: CircuitString,              // Email
   // corporateAddress: CircuitString,   // Corporate Address
   // listed: Field,                     // Listed (boolean as Field)
   // companyType: CircuitString,        // Company Type
   // companyCategory: CircuitString, // Company Category
   // companySubcategory: CircuitString, // Company Subcategory
   // companyStatus: CircuitString,      // Company Status
   // authorizedCapital: Field,          // Authorized Capital
   // paidUpCapital: Field,          // Paid-up Capital
   // lastAGMDate: CircuitString,        // Last AGM Date
   // balanceSheetDate: CircuitString, // Balance Sheet Date
   // activeComplianceStatusCode: Field,
   activeCompliance: CircuitString,   // Active Compliance
   // companyActivity: CircuitString,    // Company Activity
   // jurisdiction: CircuitString,       // Jurisdiction
   // regionalDirector: CircuitString,   // Regional Director
   // mcaID: Field,                      // MCA ID
}) { }

export function getCorpRegComplianceData(parsedData: any, typeofnet: string): ComplianceData {
  if (typeofnet === 'LOCAL') {
    return new ComplianceData({
      companyID: CircuitString.fromString(parsedData["CIN"] || ''),
      companyName: CircuitString.fromString(parsedData["Company Name"] || ''),
      activeCompliance: CircuitString.fromString(parsedData["Active Compliance"] || ''),

    });
  } else {
    // Return empty ComplianceData, you can fill it later
    const md = parsedData.data?.company_master_data ?? {};
    return new ComplianceData({
      companyID: CircuitString.fromString(md['cin'] || ''),
      companyName: CircuitString.fromString(md['company_name'] || ''),
      activeCompliance: CircuitString.fromString(md['company_status(for_efiling)'] || ''),
    });
  }
}
