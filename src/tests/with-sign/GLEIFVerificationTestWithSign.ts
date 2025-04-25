import { Field, Mina, PrivateKey, AccountUpdate, CircuitString, Poseidon, Signature } from 'o1js';
import { GLEIF, GLEIFComplianceData } from '../../zk-programs/with-sign/GLEIFZKProgramWithSign.js';
import { GLEIFVerifierSmartContract } from '../../contracts/with-sign/GLEIFVerifierSmartContractWithSign.js';

import axios from 'axios';
import { GLEIFdeployerAccount, GLEIFsenderAccount, GLEIFdeployerKey, GLEIFsenderKey, getPrivateKeyFor } from '../../core/OracleRegistry.js';

async function main() {
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

   // Fetch compliance data
   const BASEURL = "https://9a4d8990-c981-42fa-ace4-675ddec17321.mock.pstmn.io";
   //const companyname = "bhurja_gleif";
   const companyname = "zenova_gleif";
   const response = await axios.get(`${BASEURL}/${companyname}`);
   const parsedData = response.data;

   // Create GLEIF compliance data
   const GLEIFcomplianceData = new GLEIFComplianceData({
      type: CircuitString.fromString(parsedData.data[0].type || ''),
      id: CircuitString.fromString(parsedData.data[0].id || ''),
      lei: CircuitString.fromString(parsedData.data[0].attributes.lei || ''),
      name: CircuitString.fromString(parsedData.data[0].attributes.entity.legalName.name || ''),
      // legalName_language: CircuitString.fromString(parsedData.data[0].attributes.entity.legalName.language || ''),

      // otherNames: CircuitString.fromString(parsedData.data[0].attributes.entity.otherNames?.join(', ') || ''),
      // transliteratedOtherNames: CircuitString.fromString(parsedData.data[0].attributes.entity.transliteratedOtherNames?.join(', ') || ''),

      // legalAddress_language: CircuitString.fromString(parsedData.data[0].attributes.entity.legalAddress.language || ''),
      // legalAddress_addressLines: CircuitString.fromString(parsedData.data[0].attributes.entity.legalAddress.addressLines?.join(', ') || ''),
      // legalAddress_city: CircuitString.fromString(parsedData.data[0].attributes.entity.legalAddress.city || ''),
      // legalAddress_region: CircuitString.fromString(parsedData.data[0].attributes.entity.legalAddress.region || ''),
      // legalAddress_country: CircuitString.fromString(parsedData.data[0].attributes.entity.legalAddress.country || ''),
      // legalAddress_postalCode: CircuitString.fromString(parsedData.data[0].attributes.entity.legalAddress.postalCode || ''),

      // headquartersAddress_language: CircuitString.fromString(parsedData.data[0].attributes.entity.headquartersAddress.language || ''),
      // headquartersAddress_addressLines: CircuitString.fromString(parsedData.data[0].attributes.entity.headquartersAddress.addressLines?.join(', ') || ''),
      // headquartersAddress_city: CircuitString.fromString(parsedData.data[0].attributes.entity.headquartersAddress.city || ''),
      // headquartersAddress_region: CircuitString.fromString(parsedData.data[0].attributes.entity.headquartersAddress.region || ''),
      // headquartersAddress_country: CircuitString.fromString(parsedData.data[0].attributes.entity.headquartersAddress.country || ''),
      // headquartersAddress_postalCode: CircuitString.fromString(parsedData.data[0].attributes.entity.headquartersAddress.postalCode || ''),

      // registeredAt_id: CircuitString.fromString(parsedData.data[0].attributes.entity.registeredAt.id || ''),
      // registeredAt_other: CircuitString.fromString(parsedData.data[0].attributes.entity.registeredAt.other || ''),
      // registeredAs: CircuitString.fromString(parsedData.data[0].attributes.entity.registeredAs || ''),
      // jurisdiction: CircuitString.fromString(parsedData.data[0].attributes.entity.jurisdiction || ''),
      // legalForm_id: CircuitString.fromString(parsedData.data[0].attributes.entity.legalForm.id || ''),
      // legalForm_other: CircuitString.fromString(parsedData.data[0].attributes.entity.legalForm.other || ''),

      // status: CircuitString.fromString(parsedData.data[0].attributes.entity.status || ''),
      // expiration: CircuitString.fromString(parsedData.data[0].attributes.entity.expiration?.date || ''),
      // creationDate: CircuitString.fromString(parsedData.data[0].attributes.entity.creationDate || ''),
      // subCategory: CircuitString.fromString(parsedData.data[0].attributes.entity.subCategory || ''),

      // otherAddresses: CircuitString.fromString(parsedData.data[0].attributes.entity.otherAddresses?.map((addr: { addressLines: any[]; }) => addr.addressLines?.join(', ')).join('; ') || ''),
      // eventGroups: CircuitString.fromString(parsedData.data[0].attributes.entity.eventGroups?.join(', ') || ''),

      initialRegistrationDate: CircuitString.fromString(parsedData.data[0].attributes.registration.initialRegistrationDate || ''),
      lastUpdateDate: CircuitString.fromString(parsedData.data[0].attributes.registration.lastUpdateDate || ''),
      activeComplianceStatusCode: Field(parsedData.data[0].attributes.registration.activeComplianceStatusCode || 0),
      registration_status: CircuitString.fromString(parsedData.data[0].attributes.registration.status || ''),
      nextRenewalDate: CircuitString.fromString(parsedData.data[0].attributes.registration.nextRenewalDate || ''),
      // managingLou: CircuitString.fromString(parsedData.data[0].attributes.registration.managingLou || ''),
      // corroborationLevel: CircuitString.fromString(parsedData.data[0].attributes.registration.corroborationLevel || ''),
      // validatedAt_id: CircuitString.fromString(parsedData.data[0].attributes.registration.validatedAt.id || ''),
      // validatedAt_other: CircuitString.fromString(parsedData.data[0].attributes.registration.validatedAt.other || ''),
      // validatedAs: CircuitString.fromString(parsedData.data[0].attributes.registration.validatedAs || ''),

      // otherValidationAuthorities: CircuitString.fromString(parsedData.data[0].attributes.registration.otherValidationAuthorities?.map((auth: { name: any; }) => auth.name).join(', ') || ''),

      // bic: CircuitString.fromString(parsedData.data[0].attributes.bic?.join(', ') || ''),
      // mic: CircuitString.fromString(parsedData.data[0].attributes.mic || ''),
      // ocid: CircuitString.fromString(parsedData.data[0].attributes.ocid || ''),
      // spglobal: CircuitString.fromString(parsedData.data[0].attributes.spglobal?.join(', ') || ''),
      // conformityFlag: CircuitString.fromString(parsedData.data[0].attributes.conformityFlag || ''),

      // managingLou_related: CircuitString.fromString(parsedData.data[0].relationships["managing-lou"].links.related || ''),
      // lei_issuer_related: CircuitString.fromString(parsedData.data[0].relationships["lei-issuer"].links.related || ''),
      // field_modifications_related: CircuitString.fromString(parsedData.data[0].relationships["field-modifications"].links.related || ''),

      // direct_parent_relationship_record: CircuitString.fromString(parsedData.data[0].relationships["direct-parent"].links["relationship-record"] || ''),
      // direct_parent_lei_record: CircuitString.fromString(parsedData.data[0].relationships["direct-parent"].links["lei-record"] || ''),

      // ultimate_parent_relationship_record: CircuitString.fromString(parsedData.data[0].relationships["ultimate-parent"].links["relationship-record"] || ''),
      // ultimate_parent_lei_record: CircuitString.fromString(parsedData.data[0].relationships["ultimate-parent"].links["lei-record"] || ''),

      // direct_children_relationship_records: CircuitString.fromString(parsedData.data[0].relationships["direct-children"].links["relationship-records"] || ''),
      // direct_children_related: CircuitString.fromString(parsedData.data[0].relationships["direct-children"].links["related"] || ''),

      // isins_related: CircuitString.fromString(parsedData.data[0].relationships.isins.links.related || ''),
      // links_self: CircuitString.fromString(parsedData.data[0].links.self || '')
   });


   // =================================== Oracle Signature Generation ===================================
   // Create message hash
   const complianceDataHash = Poseidon.hash(GLEIFComplianceData.toFields(GLEIFcomplianceData));

   // Get oracle private key
   const registryPrivateKey = getPrivateKeyFor('GLEIF');

   // Sign the message hash with the oracle's private key
   const oracleSignature = Signature.create(registryPrivateKey, [complianceDataHash]);

   // =================================== Generate Proof ===================================
   const proof = await GLEIF.proveCompliance(Field(0), GLEIFcomplianceData, oracleSignature);

   console.log('GLEIF Compliance Data ..', GLEIFcomplianceData.name.toString(), ' compliance ..', GLEIFcomplianceData.registration_status);
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
}

main().catch(err => {
   console.error('Error:', err);
});
