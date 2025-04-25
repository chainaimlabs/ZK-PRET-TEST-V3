import { Field, Mina, PrivateKey, AccountUpdate, CircuitString, Poseidon, Signature } from 'o1js';
import { CorporateRegistration, ComplianceData } from '../../zk-programs/with-sign/CorporateRegistrationZKProgramWithSign.js';
import { CorporateRegistrationVerifierSmartContract } from '../../contracts/with-sign/CorporateRegistrationVerifierSmartContractWithSign.js';


import { MCAdeployerAccount, MCAsenderAccount, MCAdeployerKey, MCAsenderKey, getPrivateKeyFor } from '../../core/OracleRegistry.js';

//
import axios from 'axios';

async function main() {

   //console.log("Oracle Private Key:", mcaRegistry);


   await CorporateRegistration.compile();
   const { verificationKey } = await CorporateRegistrationVerifierSmartContract.compile();

   const zkAppKey = PrivateKey.random();
   const zkAppAddress = zkAppKey.toPublicKey();
   const zkApp = new CorporateRegistrationVerifierSmartContract(zkAppAddress);

   const deployTxn = await Mina.transaction(
      MCAdeployerAccount,
      //Oracle_Private_key,
      // Oracle_Public_key,
      async () => {
         AccountUpdate.fundNewAccount(MCAdeployerAccount);
         //  AccountUpdate.fundNewAccount(Oracle_Public_key);
         await zkApp.deploy({ verificationKey });
      }
   );
   await deployTxn.sign([MCAdeployerKey, zkAppKey]).send();

   console.log("deployTxn signed successfully");

   //const response = await axios.get('https://0f4aef00-9db0-4057-949e-df6937e3449b.mock.pstmn.io/vernon_mca');
   const response = await axios.get('https://0f4aef00-9db0-4057-949e-df6937e3449b.mock.pstmn.io/zenova_mca');
   const parsedData = response.data;

   const complianceData = new ComplianceData({
      companyID: CircuitString.fromString(parsedData["CIN"] || ''),
      companyName: CircuitString.fromString(parsedData["Company Name"] || ''),
      roc: CircuitString.fromString(parsedData["ROC"] || ''),
      registrationNumber: Field(parsedData["Registration Number"] ?? 0),
      incorporationDate: CircuitString.fromString(parsedData["Incorporation Date"] || ''),
      email: CircuitString.fromString(parsedData["Email"] || ''),
      corporateAddress: CircuitString.fromString(parsedData["Corporate Address"] || ''),
      listed: Field(parsedData["Listed"] ? 1 : 0),
      companyType: CircuitString.fromString(parsedData["Company Type"] || ''),
      companyCategory: CircuitString.fromString(parsedData["Company Category"] || ''),
      companySubcategory: CircuitString.fromString(parsedData["Company Subcategory"] || ''),
      companyStatus: CircuitString.fromString(parsedData["Company Status"]),
      authorizedCapital: Field(parsedData["Authorized Capital"] ?? 0),
      paidUpCapital: Field(parsedData["Paid-up Capital"] ?? 0),
      lastAGMDate: CircuitString.fromString(parsedData["Last AGM Date"] || ''),
      balanceSheetDate: CircuitString.fromString(parsedData["Balance Sheet Date"] || ''),
      activeComplianceStatusCode: Field(parsedData["activeComplianceStatusCode"] ?? 0),
      activeCompliance: CircuitString.fromString(parsedData["Active Compliance"]),
      companyActivity: CircuitString.fromString(parsedData["Company Activity"] || ''),
      jurisdiction: CircuitString.fromString(parsedData["Jurisdiction"] || ''),
      regionalDirector: CircuitString.fromString(parsedData["Regional Director"] || ''),
      mcaID: Field(parsedData["MCA ID"] ?? 0),
   });

   // =================================== Oracle Signature Generation ===================================
   // Create message hash
   const complianceDataHash = Poseidon.hash(ComplianceData.toFields(complianceData));

   //const sameKey = getDeployerPrivateKey();
   const registryPrivateKey = getPrivateKeyFor('MCA');
   // Sign the message hash with the oracle's private key
   // const oracleSignature = Signature.create(Oracle_Private_key.key, [complianceDataHash]);
   const oracleSignature = Signature.create(registryPrivateKey, [complianceDataHash]);


   // =================================== Generate Proof ===================================
   const proof = await CorporateRegistration.proveCompliance(Field(0), complianceData, oracleSignature);

   console.log('Corporate Registration Compliance Data ..', complianceData.companyName.toString(), ' compliance ..', complianceData.activeCompliance.toString());
   console.log('Corporate Registration Oracle Signature..', oracleSignature.toJSON());

   console.log('generating proof ..', proof.toJSON());
   // Verify proof
   console.log("Before verification, Initial value of risk:", zkApp.num.get().toJSON());
   const txn = await Mina.transaction(
      MCAsenderAccount,
      async () => {
         await zkApp.verifyComplianceWithProof(proof);
      }
   );
   await txn.prove();
   await txn.sign([MCAsenderKey]).send();
   console.log('✅ Proof verified successfully!');
   console.log("Final value of risk:", zkApp.num.get().toJSON());

}

main().catch(err => {
   console.error('Error:', err);
});
