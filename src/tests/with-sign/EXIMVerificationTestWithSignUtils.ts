import { Field, Mina, PrivateKey, AccountUpdate, CircuitString, Poseidon, Signature } from 'o1js';
import { EXIM} from '../../zk-programs/with-sign/EXIMZKProgramWithSign.js';
import { EXIMVerifierSmartContract } from '../../contracts/with-sign/EXIMVerifierSmartContractWithSign.js';

// import axios from 'axios';


import { fetchEXIMCompanyData } from './EXIMUtils.js';
import { getEXIMComplianceDataO1 } from './EXIMo1.js';
import {EXIMComplianceDataO1} from './EXIMo1.js'



import { EXIMdeployerAccount, EXIMsenderAccount, EXIMdeployerKey, EXIMsenderKey, getPrivateKeyFor, Local } from '../../core/OracleRegistry.js';


export async function getEXIMVerificationWithSignUtils(companyName: string, typeOfNet: string){
   // Compile programs
   await EXIM.compile();
   const { verificationKey } = await EXIMVerifierSmartContract.compile();

   // Generate ZKApp key and address
   const zkAppKey = PrivateKey.random();
   const zkAppAddress = zkAppKey.toPublicKey();
   const zkApp = new EXIMVerifierSmartContract(zkAppAddress);

   // Deploy ZKApp
   const deployTxn = await Mina.transaction(
      EXIMdeployerAccount,
      async () => {
         AccountUpdate.fundNewAccount(EXIMdeployerAccount);
         await zkApp.deploy({ verificationKey });
      }
   );
   await deployTxn.sign([EXIMdeployerKey, zkAppKey]).send();
   console.log("Deploy transaction signed successfully");
/*
   // Fetch compliance data
   const BASEURL = "https://0f4aef00-9db0-4057-949e-df6937e3449b.mock.pstmn.io";
   // <<<<<<< HEAD
   //const companyname = "oxxon_dgft";
   //const companyname = "vernon_dgft";
   const companyname = "zenova_dgft";

   // =======
   //   const companyname = "vernon_dgft";
   // >>>>>>> 3edd1b2332aabbf0b494f31fd1d084129582c843
   const response = await axios.get(`${BASEURL}/${companyname}`);
   const parsedData = response.data;*/
   


      // const companyName = process.argv[2];
      // let typeOfNet = process.argv[3];
      console.log('Company Name:', companyName);
      console.log('Type of Net:', typeOfNet);
   
      // Fetch company data using the utility function
      let parsedData;
      try {
        parsedData = await fetchEXIMCompanyData(companyName,typeOfNet);
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
   
   //----------------------------------------------------------------------------------------------------------------
      // Use the first matching record
      // const record = parsedData.data[0];
      const EXIMComplianceDatao1 = getEXIMComplianceDataO1(parsedData);
   


/*
   // Create EXIM compliance data
   const EXIMcomplianceData = new EXIMComplianceData({
      //const complianceData = new EXIMComplianceData({
      iec: CircuitString.fromString(parsedData["iec"] || ''),
      entityName: CircuitString.fromString(parsedData["entityName"] || ''),
      addressLine1: CircuitString.fromString(parsedData["addressLine1"] || ''),
      addressLine2: CircuitString.fromString(parsedData["addressLine2"] || ''),
      city: CircuitString.fromString(parsedData["city"] || ''),
      state: CircuitString.fromString(parsedData["state"] || ''),
      pin: Field(parsedData["pin"] ?? 0),
      contactNo: Field(parsedData["contactNo"] ?? 0),
      email: CircuitString.fromString(parsedData["email"] || ''),
      iecIssueDate: CircuitString.fromString(parsedData["iecIssueDate"] || ''),
      exporterType: Field(parsedData["exporterType"] ?? 0),
      pan: CircuitString.fromString(parsedData["pan"] || ''),
      iecStatus: Field(parsedData["iecStatus"] ?? 0),
      activeComplianceStatusCode: Field(parsedData["activeComplianceStatusCode"] ?? 0),
      starStatus: Field(parsedData["starStatus"] ?? 0),
      iecModificationDate: CircuitString.fromString(parsedData["iecModificationDate"] || ''),
      dataAsOn: CircuitString.fromString(parsedData["dataAsOn"] || ''),
      natureOfConcern: Field(parsedData["natureOfConcern"] ?? 0),

      // Branch Data (from branches[0])
      branchCode: Field(parsedData.branches?.[0]?.branchCode ?? 0),
      badd1: CircuitString.fromString(parsedData.branches?.[0]?.badd1 || ''),
      badd2: CircuitString.fromString(parsedData.branches?.[0]?.badd2 || ''),
      branchCity: CircuitString.fromString(parsedData.branches?.[0]?.city || ''),
      branchState: CircuitString.fromString(parsedData.branches?.[0]?.state || ''),
      branchPin: Field(parsedData.branches?.[0]?.pin ?? 0),

      // Director Data (from directors)
      director1Name: CircuitString.fromString(parsedData.directors?.[0]?.name || ''),
      director2Name: CircuitString.fromString(parsedData.directors?.[1]?.name || ''),
   });*/

   // =================================== Oracle Signature Generation ===================================
   // Create message hash
   const complianceDataHash = Poseidon.hash(EXIMComplianceDataO1.toFields(EXIMComplianceDatao1));

   // Get oracle private key
   const registryPrivateKey = getPrivateKeyFor('EXIM');

   // Sign the message hash with the oracle's private key
   const oracleSignature = Signature.create(registryPrivateKey, [complianceDataHash]);

   // =================================== Generate Proof ===================================
   const proof = await EXIM.proveCompliance(Field(0), EXIMComplianceDatao1, oracleSignature);

   console.log('Corporate Registration Compliance Data ..', EXIMComplianceDatao1.entityName.toString(), ' compliance ..', EXIMComplianceDatao1.iecStatus);
   console.log('Corporate Registration Oracle Signature..', oracleSignature.toJSON());

   console.log('generating proof ..', proof.toJSON());

   // Verify proof
   console.log("Before verification, Initial value of num:", zkApp.num.get().toJSON());
   const txn = await Mina.transaction(
      EXIMsenderAccount,
      async () => {
         await zkApp.verifyComplianceWithProof(proof);
      }
   );
   await txn.prove();
   await txn.sign([EXIMsenderKey]).send();
   console.log("Final value of num:", zkApp.num.get().toJSON());
   console.log('✅ Proof verified successfully!');
   return proof;
}

