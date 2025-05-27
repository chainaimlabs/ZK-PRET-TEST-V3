import { Field, CircuitString, Mina, PrivateKey, AccountUpdate, Poseidon, Signature } from 'o1js';
import { ComposedCompliance, ComposedProof } from '../../zk-programs/with-sign/Composed3levelZKProgramWithSign.js';
import { CorporateRegistration} from '../../zk-programs/with-sign/CorporateRegistrationZKProgramWithSign.js';
import { ComplianceVerifierSC } from '../../contracts/with-sign/ComposedRecursive3LevelSmartContractWithSign.js';
// import { getPrivateKeyFor, Local } from '@/contracts/with-sign/OracleRegistry.js';
import { getPrivateKeyFor, Local } from '../../core/OracleRegistry.js';
import { EXIM } from '../../zk-programs/with-sign/EXIMZKProgramWithSign.js';
import { GLEIF } from '../../zk-programs/with-sign/GLEIFZKProgramWithSign.js';
import {GLEIFComplianceDataO1 } from './GLEIFo1.js';
import { EXIMComplianceDataO1 } from './EXIMo1.js';
import { ComplianceData } from './CorporateRegistrationo1.js';

import { fetchMCAData, fetchEXIMData, fetchGLEIFData } from './ComposedRecursive3APIcalls.js';


//import axios from 'axios';

async function fullIntegrationTest() {
   //const Local = await Mina.LocalBlockchain();
   // Mina.setActiveInstance(Local);
   //initializeRegistry(Local.testAccounts);

   // Compile all programs//
   console.log('Compiling...');
   //  await BaseCompliance.compile();
   console.log('***1***');
   await CorporateRegistration.compile();
   await EXIM.compile();
   await GLEIF.compile();
   await ComposedCompliance.compile();
   console.log('***2***');
   const { verificationKey } = await ComplianceVerifierSC.compile();
   console.log('***3***');
   // Deploy contract
   const zkAppKey = PrivateKey.random();
   const zkAppAddress = zkAppKey.toPublicKey();
   const zkApp = new ComplianceVerifierSC(zkAppAddress);

   const deployTx = await Mina.transaction(Local.testAccounts[6], async () => {
      AccountUpdate.fundNewAccount(Local.testAccounts[6]);
      await zkApp.deploy({ verificationKey });
   });
   await deployTx.sign([Local.testAccounts[6].key, zkAppKey]).send();

   // Generate proofs
   console.log("Fetching MCA data...");
   const mcaData = await fetchMCAData();
   // const mcaSig = getAuthorityKeys('MCA').privateKey.sign([Poseidon.hash(mcaData.toFields())]);
   const mcaPrivateKey = getPrivateKeyFor('MCA');
   const complianceDataHash = Poseidon.hash(ComplianceData.toFields(mcaData));

   const mcaSig = Signature.create(mcaPrivateKey, [complianceDataHash]);
   const mcaProof = await CorporateRegistration.proveCompliance(Field(0), mcaData, mcaSig);
   console.log("MCA Proof:", mcaProof);





   // let BASEURL = "https://0f4aef00-9db0-4057-949e-df6937e3449b.mock.pstmn.io";
   // // <<<<<<< HEAD
   // //const companyname = "oxxon_dgft";
   // //companyname = "vernon_dgft";
   // let companyname = "zenova_dgft";

   // =======
   //   const companyname = "vernon_dgft";
   // >>>>>>> 3edd1b2332aabbf0b494f31fd1d084129582c843
   console.log("Fetching EXIM data...");
   const eximData = await fetchEXIMData();

   const eximPrivateKey = getPrivateKeyFor('EXIM');
   const eximDataHash = Poseidon.hash(EXIMComplianceDataO1.toFields(eximData));
   const eximSig = Signature.create(eximPrivateKey, [eximDataHash]);
   const eximProof = await EXIM.proveCompliance(Field(0), eximData, eximSig);
   console.log("EXIM Proof:", eximProof);






   /*
   
     BASEURL = "https://9a4d8990-c981-42fa-ace4-675ddec17321.mock.pstmn.io";
     //let companyname = "vernon_gleif";
     companyname = "zenova_gleif";
      response = await axios.get(`${BASEURL}/${companyname}`);
     parsedData = response.data;
       console.log("gleif:",parsedData);
     // Create GLEIF compliance data
     const gleifData = new GLEIFComplianceData({
       type: CircuitString.fromString(parsedData.data[0].type || ''),
       id: CircuitString.fromString(parsedData.data[0].id || ''),
       lei: CircuitString.fromString(parsedData.data[0].attributes.lei || ''),
       name: CircuitString.fromString(parsedData.data[0].attributes.entity.legalName.name || ''),
       legalName_language: CircuitString.fromString(parsedData.data[0].attributes.entity.legalName.language || ''),
   
       otherNames: CircuitString.fromString(parsedData.data[0].attributes.entity.otherNames?.join(', ') || ''),
       transliteratedOtherNames: CircuitString.fromString(parsedData.data[0].attributes.entity.transliteratedOtherNames?.join(', ') || ''),
   
       legalAddress_language: CircuitString.fromString(parsedData.data[0].attributes.entity.legalAddress.language || ''),
       legalAddress_addressLines: CircuitString.fromString(parsedData.data[0].attributes.entity.legalAddress.addressLines?.join(', ') || ''),
       legalAddress_city: CircuitString.fromString(parsedData.data[0].attributes.entity.legalAddress.city || ''),
       legalAddress_region: CircuitString.fromString(parsedData.data[0].attributes.entity.legalAddress.region || ''),
       legalAddress_country: CircuitString.fromString(parsedData.data[0].attributes.entity.legalAddress.country || ''),
       legalAddress_postalCode: CircuitString.fromString(parsedData.data[0].attributes.entity.legalAddress.postalCode || ''),
       
       headquartersAddress_language: CircuitString.fromString(parsedData.data[0].attributes.entity.headquartersAddress.language || ''),
       headquartersAddress_addressLines: CircuitString.fromString(parsedData.data[0].attributes.entity.headquartersAddress.addressLines?.join(', ') || ''),
       headquartersAddress_city: CircuitString.fromString(parsedData.data[0].attributes.entity.headquartersAddress.city || ''),
       headquartersAddress_region: CircuitString.fromString(parsedData.data[0].attributes.entity.headquartersAddress.region || ''),
       headquartersAddress_country: CircuitString.fromString(parsedData.data[0].attributes.entity.headquartersAddress.country || ''),
       headquartersAddress_postalCode: CircuitString.fromString(parsedData.data[0].attributes.entity.headquartersAddress.postalCode || ''),
   
       registeredAt_id: CircuitString.fromString(parsedData.data[0].attributes.entity.registeredAt.id || ''),
       registeredAt_other: CircuitString.fromString(parsedData.data[0].attributes.entity.registeredAt.other || ''),
       registeredAs: CircuitString.fromString(parsedData.data[0].attributes.entity.registeredAs || ''),
       jurisdiction: CircuitString.fromString(parsedData.data[0].attributes.entity.jurisdiction || ''),
       legalForm_id: CircuitString.fromString(parsedData.data[0].attributes.entity.legalForm.id || ''),
       legalForm_other: CircuitString.fromString(parsedData.data[0].attributes.entity.legalForm.other || ''),
       
       status: CircuitString.fromString(parsedData.data[0].attributes.entity.status || ''),
       expiration: CircuitString.fromString(parsedData.data[0].attributes.entity.expiration?.date || ''),
       creationDate: CircuitString.fromString(parsedData.data[0].attributes.entity.creationDate || ''),
       subCategory: CircuitString.fromString(parsedData.data[0].attributes.entity.subCategory || ''),
       
       otherAddresses: CircuitString.fromString(parsedData.data[0].attributes.entity.otherAddresses?.map((addr: { addressLines: any[]; }) => addr.addressLines?.join(', ')).join('; ') || ''),
       eventGroups: CircuitString.fromString(parsedData.data[0].attributes.entity.eventGroups?.join(', ') || ''),
   
       initialRegistrationDate: CircuitString.fromString(parsedData.data[0].attributes.registration.initialRegistrationDate || ''),
       lastUpdateDate: CircuitString.fromString(parsedData.data[0].attributes.registration.lastUpdateDate || ''),
       activeComplianceStatusCode : Field(parsedData.data[0].attributes.registration.activeComplianceStatusCode || 0),
       registration_status: CircuitString.fromString(parsedData.data[0].attributes.registration.status || ''),
       nextRenewalDate: CircuitString.fromString(parsedData.data[0].attributes.registration.nextRenewalDate || ''),
       managingLou: CircuitString.fromString(parsedData.data[0].attributes.registration.managingLou || ''),
       corroborationLevel: CircuitString.fromString(parsedData.data[0].attributes.registration.corroborationLevel || ''),
       validatedAt_id: CircuitString.fromString(parsedData.data[0].attributes.registration.validatedAt.id || ''),
       validatedAt_other: CircuitString.fromString(parsedData.data[0].attributes.registration.validatedAt.other || ''),
       validatedAs: CircuitString.fromString(parsedData.data[0].attributes.registration.validatedAs || ''),
   
       otherValidationAuthorities: CircuitString.fromString(parsedData.data[0].attributes.registration.otherValidationAuthorities?.map((auth: { name: any; }) => auth.name).join(', ') || ''),
   
       bic: CircuitString.fromString(parsedData.data[0].attributes.bic?.join(', ') || ''),
       mic: CircuitString.fromString(parsedData.data[0].attributes.mic || ''),
       ocid: CircuitString.fromString(parsedData.data[0].attributes.ocid || ''),
       spglobal: CircuitString.fromString(parsedData.data[0].attributes.spglobal?.join(', ') || ''),
       conformityFlag: CircuitString.fromString(parsedData.data[0].attributes.conformityFlag || ''),
       
       managingLou_related: CircuitString.fromString(parsedData.data[0].relationships["managing-lou"].links.related || ''),
       lei_issuer_related: CircuitString.fromString(parsedData.data[0].relationships["lei-issuer"].links.related || ''),
       field_modifications_related: CircuitString.fromString(parsedData.data[0].relationships["field-modifications"].links.related || ''),
       
       direct_parent_relationship_record: CircuitString.fromString(parsedData.data[0].relationships["direct-parent"].links["relationship-record"] || ''),
       direct_parent_lei_record: CircuitString.fromString(parsedData.data[0].relationships["direct-parent"].links["lei-record"] || ''),
       
       ultimate_parent_relationship_record: CircuitString.fromString(parsedData.data[0].relationships["ultimate-parent"].links["relationship-record"] || ''),
       ultimate_parent_lei_record: CircuitString.fromString(parsedData.data[0].relationships["ultimate-parent"].links["lei-record"] || ''),
       
       direct_children_relationship_records: CircuitString.fromString(parsedData.data[0].relationships["direct-children"].links["relationship-records"] || ''),
       direct_children_related: CircuitString.fromString(parsedData.data[0].relationships["direct-children"].links["related"] || ''),
       
       isins_related: CircuitString.fromString(parsedData.data[0].relationships.isins.links.related || ''),
       links_self: CircuitString.fromString(parsedData.data[0].links.self || '')
   });
   
     const gleifPrivateKey=getPrivateKeyFor('GLEIF');
     const gleifDataHash = Poseidon.hash(GLEIFComplianceData.toFields(gleifData));
     const gleifSig = Signature.create(gleifPrivateKey, [gleifDataHash]);
     //const gleifProof = await GLEIF.proveCompliance(Field(0), gleifData, gleifSig);
     //console.log("GLEIF Proof:",gleifProof);
   
   */

   // Fetch compliance data
   console.log("Fetching GLEIF data...");
   const GLEIFcomplianceData = await fetchGLEIFData();

   // =================================== Oracle Signature Generation ===================================
   // Create message hash
   const gLeifComplianceDataHash = Poseidon.hash(GLEIFComplianceDataO1.toFields(GLEIFcomplianceData));

   // Get oracle private key
   const registryPrivateKey = getPrivateKeyFor('GLEIF');

   // Sign the message hash with the oracle's private key
   const oracleSignature = Signature.create(registryPrivateKey, [gLeifComplianceDataHash]);

   // =================================== Generate Proof ===================================
   const gleifProof = await GLEIF.proveCompliance(Field(0), GLEIFcomplianceData, oracleSignature);

   console.log('GLEIF Compliance Data ..', GLEIFcomplianceData.name.toString(), ' compliance ..', GLEIFcomplianceData.registration_status);
   console.log('GLEIF Oracle Signature..', oracleSignature.toJSON());

   console.log('generating proof ..', gleifProof.toJSON());




   // Compose proofs
   console.log(" Starting to compose deep composition proofs .. ");

   const level1 = await ComposedCompliance.level1(Field(1), mcaProof);
   console.log("Level1:", level1);
   const level1Verified = new ComposedProof(level1);
   const level2 = await ComposedCompliance.level2(Field(1), level1, eximProof);
   console.log("Level2:", level2);
   const finalProof = await ComposedCompliance.level3(Field(1), level2, gleifProof);
   console.log("Final:", finalProof);

   const finalverified = new ComposedProof(finalProof);

   // const finalverified = new ComposedProof(level2);

   // Verify on-chain
   const verifyTx = await Mina.transaction(Local.testAccounts[7], async () => {
      return await zkApp.verifyMaster(finalProof);
      // return await zkApp.verifyMaster(level2);
   });
   const proof = await verifyTx.prove();
   console.log("proof verification:", proof.toPretty());
   await verifyTx.sign([Local.testAccounts[7].key]).send();

   console.log('Final verification state:', zkApp.verificationState.get().toJSON());
}

fullIntegrationTest().catch(console.error);
