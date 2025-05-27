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
import axios from 'axios';
//import {Oracle_Public_key} from './oracle_mca.js';//
import { getPublicKeyFor } from '../../core/OracleRegistry.js';
import { ComplianceData } from '../../tests/with-sign/CorporateRegistrationo1.js';

// =================================== Compliance Data Definition ===================================


/*
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
}) { }*/

// ========================== Public Output Structure Definition ========================================
export class CorporateRegistrationPublicOutput extends Struct({
   companyName: CircuitString,
   companyID: CircuitString,
}) { }

// =================================== ZkProgram Definition ===================================
export const CorporateRegistration = ZkProgram({
   name: 'CorporateRegistration',
   publicInput: Field,
   publicOutput: CorporateRegistrationPublicOutput,
   methods: {
      proveCompliance: { // Generates the public output
         privateInputs: [
            ComplianceData,
            Signature, // Oracle Signature
         ],
         async method(
            corporateRegistationToProve: Field,
            corporateRegistrationData: ComplianceData,
            oracleSignature: Signature, // Oracle Signature
         ): Promise<CorporateRegistrationPublicOutput> {

            // =================================== Oracle Signature Verification ===================================
            // Hash the compliance data
            const complianceDataHash = Poseidon.hash(ComplianceData.toFields(corporateRegistrationData));
            //const sameKey = keyRegistry.get(deployerAccount);
            // Verify the oracle's signature
            //const registryPublicKey = [...mcaRegistry.keys()][0];
            const registryPublicKey = getPublicKeyFor('MCA');
            const isValidSignature = oracleSignature.verify(
               //  Oracle_Private_key, // Replace with the actual oracle public key, from the registry hashmap.
               registryPublicKey,//registry.lookup keep one key mca value object:private,publickey
               [complianceDataHash]
            );
            isValidSignature.assertTrue();
            // =================================== Compliance Status Verification ===================================
            const expectedActiveComplianceHash = CircuitString.fromString("Active").hash();
            const activeComplianceHash = corporateRegistrationData.activeCompliance.hash();
            activeComplianceHash.assertEquals(expectedActiveComplianceHash);

            /*const activeStatusCode = Field.from(1);
            const inactiveStatusCode = Field.from(0);

            corporateRegistrationData.activeComplianceStatusCode.assertEquals(activeStatusCode);
            corporateRegistrationData.activeComplianceStatusCode.assertNotEquals(inactiveStatusCode);*/


            return new CorporateRegistrationPublicOutput({
               companyName: corporateRegistrationData.companyName,
               companyID: corporateRegistrationData.companyID,
            });
         },
      },
   },
});

export class CorporateRegistrationProof extends ZkProgram.Proof(CorporateRegistration) { }

