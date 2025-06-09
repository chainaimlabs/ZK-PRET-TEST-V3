import * as dotenv from 'dotenv';
dotenv.config();

import { Field, Mina, PrivateKey, AccountUpdate, CircuitString, Poseidon, Signature } from 'o1js';
import { GLEIF } from '../../zk-programs/with-sign/GLEIFZKProgramWithSign.js';
import { GLEIFVerifierSmartContract } from '../../contracts/with-sign/GLEIFVerifierSmartContractWithSign.js';
import { GLEIFdeployerAccount, GLEIFsenderAccount, GLEIFdeployerKey, GLEIFsenderKey, getPrivateKeyFor } from '../../core/OracleRegistry.js';
import { fetchGLEIFCompanyData } from './GLEIFUtils.js';
import { getGLEIFComplianceDataO1 } from './GLEIFo1.js';
import { GLEIFComplianceDataO1 } from './GLEIFo1.js'

export async function getGLEIFVerificationWithSignUtils(companyName: string) {



   // Compile programs
   await GLEIF.compile();
   const { verificationKey } = await GLEIFVerifierSmartContract.compile();

   // Generate ZKApp key and address
   const zkAppKey = PrivateKey.random();
   const zkAppAddress = zkAppKey.toPublicKey();
   const zkApp = new GLEIFVerifierSmartContract(zkAppAddress);

   // Deploy ZKApp
   const deployTxn = await Mina.transaction(
      GLEIFdeployerAccount,
      async () => {
         AccountUpdate.fundNewAccount(GLEIFdeployerAccount);
         await zkApp.deploy({ verificationKey });
      }
   );
   await deployTxn.sign([GLEIFdeployerKey, zkAppKey]).send();
   console.log("Deploy transaction signed successfully");

   //----------------------------------------------------------------------------------------------------------------


   // Fetch company data using the utility function
   let parsedData;
   try {
      parsedData = await fetchGLEIFCompanyData(companyName);
   } catch (err: any) {
      console.error(err.message);
      process.exit(1);
   }

   //----------------------------------------------------------------------------------------------------------------
   // Use the first matching record
   // const record = parsedData.data[0];
   const GLEIFcomplianceDataO1 = getGLEIFComplianceDataO1(parsedData);

   // Create GLEIF compliance data
   /* const GLEIFcomplianceData = new GLEIFComplianceData({
       type: CircuitString.fromString(record.type || ''),
       id: CircuitString.fromString(record.id || ''),
       lei: CircuitString.fromString(record.attributes.lei || ''),
       name: CircuitString.fromString(record.attributes.entity.legalName?.name || ''),
       //initialRegistrationDate: CircuitString.fromString(record.attributes.registration?.initialRegistrationDate || ''),
       //lastUpdateDate: CircuitString.fromString(record.attributes.registration?.lastUpdateDate || ''),
       //activeComplianceStatusCode: Field(
       //    typeof record.attributes.registration?.activeComplianceStatusCode === 'number'
       //       ? record.attributes.registration.activeComplianceStatusCode
       //       : 0
       // ),
       registration_status: CircuitString.fromString(record.attributes.entity.status || ''),
       //nextRenewalDate: CircuitString.fromString(record.attributes.registration?.nextRenewalDate || '')
    });*/

   // =================================== Oracle Signature Generation ===================================
   // Create message hash
   const complianceDataHash = Poseidon.hash(GLEIFComplianceDataO1.toFields(GLEIFcomplianceDataO1));

   // Get oracle private key
   const registryPrivateKey = getPrivateKeyFor('GLEIF');

   // Sign the message hash with the oracle's private key
   const oracleSignature = Signature.create(registryPrivateKey, [complianceDataHash]);

   // =================================== Generate Proof ===================================
   const proof = await GLEIF.proveCompliance(Field(0), GLEIFcomplianceDataO1, oracleSignature);

   console.log('GLEIF Compliance Data ..', GLEIFcomplianceDataO1.name.toString(), ' compliance ..', GLEIFcomplianceDataO1.registration_status);
   console.log('GLEIF Oracle Signature..', oracleSignature.toJSON());

   console.log('generating proof ..', proof.toJSON());

   // Verify proof
   console.log("Before verification, Initial value of num:", zkApp.num.get().toJSON());
   const txn = await Mina.transaction(
      GLEIFsenderAccount,
      async () => {
         await zkApp.verifyComplianceWithProof(proof);
      }
   );

   await txn.prove();
   await txn.sign([GLEIFsenderKey]).send();

   console.log("Final value of num:", zkApp.num.get().toJSON());
   console.log('✅ Proof verified successfully!');
   //return proof.toJSON();
   return proof;
}
