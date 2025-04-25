import {
   Field,
   Signature,
   SmartContract,
   Struct,
   ZkProgram,
   Proof,
   CircuitString,
   method,
   Permissions,
   Circuit,
   Provable,
   Poseidon,
} from 'o1js';
import { getPublicKeyFor } from '../../core/OracleRegistry.js';

// =================================== Compliance Data Definition ===================================
export class GLEIFComplianceData extends Struct({
   type: CircuitString,
   id: CircuitString,
   lei: CircuitString,
   name: CircuitString,
   // legalName_language: CircuitString,
   // otherNames: CircuitString,
   // transliteratedOtherNames: CircuitString,
   // legalAddress_language: CircuitString,
   // legalAddress_addressLines: CircuitString,
   // legalAddress_city: CircuitString,
   // legalAddress_region: CircuitString,
   // legalAddress_country: CircuitString,
   // legalAddress_postalCode: CircuitString,
   // headquartersAddress_language: CircuitString,
   // headquartersAddress_addressLines: CircuitString,
   // headquartersAddress_city: CircuitString,
   // headquartersAddress_region: CircuitString,
   // headquartersAddress_country: CircuitString,
   // headquartersAddress_postalCode: CircuitString,
   // registeredAt_id: CircuitString,
   // registeredAt_other: CircuitString,
   // registeredAs: CircuitString,
   // jurisdiction: CircuitString,
   // legalForm_id: CircuitString,
   // legalForm_other: CircuitString,
   // status: CircuitString,
   // expiration: CircuitString,
   // creationDate: CircuitString,
   // subCategory: CircuitString,
   // otherAddresses: CircuitString,
   // eventGroups: CircuitString,
   initialRegistrationDate: CircuitString,
   lastUpdateDate: CircuitString,
   activeComplianceStatusCode: Field,
   registration_status: CircuitString,
   nextRenewalDate: CircuitString,
   // managingLou: CircuitString,
   // corroborationLevel: CircuitString,
   // validatedAt_id: CircuitString,
   // validatedAt_other: CircuitString,
   // validatedAs: CircuitString,
   // otherValidationAuthorities: CircuitString,
   // bic: CircuitString,
   // mic: CircuitString,
   // ocid: CircuitString,
   // spglobal: CircuitString,
   // conformityFlag: CircuitString,
   // managingLou_related: CircuitString,
   // lei_issuer_related: CircuitString, // Note the change from '-' to '_'
   // field_modifications_related: CircuitString,
   // direct_parent_relationship_record: CircuitString,
   // direct_children_relationship_records: CircuitString,
   // direct_children_related: CircuitString,
   // direct_parent_lei_record: CircuitString,
   // ultimate_parent_relationship_record: CircuitString,
   // ultimate_parent_lei_record: CircuitString,
   // isins_related: CircuitString,
   // links_self: CircuitString
}) { }

// ========================== Public Output Structure Definition ========================================
export class GLEIFPublicOutput extends Struct({
   name: CircuitString, // Adjust if needed
   id: CircuitString, // Adjust if needed
}) { }



function isValidObject(GLEIFData: GLEIFComplianceData) {

   //console.log('  GLEIFData ...  id .. ', GLEIFData.id, '  .. reg status ..', GLEIFData.registration_status);

   /*
   if( GLEIFData === null) {
     return false;
   }
       
   console.log('  GLEIFData ...  ', GLEIFData.activeComplianceStatusCode.toJSON());
   //return str !=null && str.trim().length > 0;
   */

   return true;
}


export const GLEIF = ZkProgram({
   name: 'GLEIF',

   publicInput: Field,

   publicOutput: GLEIFPublicOutput,

   methods: {
      proveCompliance: { // Generates the public output
         privateInputs: [
            GLEIFComplianceData,
            Signature // Oracle Signature
         ],
         async method(
            GLEIFToProve: Field,
            GLEIFData: GLEIFComplianceData,
            oracleSignature: Signature // Oracle Signature
         ): Promise<GLEIFPublicOutput> {

            try {

               //console.log('GLEIF in ZKProgram with Sign', GLEIFData.name.toString, ' status ..', GLEIFData.registration_status.toString);

               // =================================== Oracle Signature Verification ===================================
               // Hash the compliance data
               const complianceDataHash = Poseidon.hash(GLEIFComplianceData.toFields(GLEIFData));

               // Get the oracle's public key
               const registryPublicKey = getPublicKeyFor('GLEIF');

               //console.log('GLEIF in ZKProgram with Sign ComplianceDataHash', complianceDataHash);
               //console.log('GLEIF in ZKProgram with Sign registryPublicKey', registryPublicKey);

               // Verify the oracle's signature
               const isValidSignature = oracleSignature.verify(registryPublicKey, [complianceDataHash]);

               //console.log('GLEIF in ZKProgram with Sign isValidSignature assert before ', isValidSignature);

               isValidSignature.assertTrue();

               //console.log('GLEIF in ZKProgram with Sign isValidSignature assert after', isValidSignature);

               if (isValidObject(GLEIFData)) {

                  // =================================== Compliance Status Verification ===================================
                  // const activeComplianceHash = CircuitString.fromString("Active").hash();
                  // const inactiveComplianceHash = CircuitString.fromString("Inactive").hash();
                  // const currentStatusHash = GLEIFData.registration_status.hash();

                  // currentStatusHash.assertNotEquals(inactiveComplianceHash);
                  // currentStatusHash.assertEquals(activeComplianceHash);

                  /*
                  const activeStatusCode = Field.from(1);
                  const inactiveStatusCode = Field.from(0);
        
                  console.log('GLEIF in ZKProgram GLEIFData.activeComplianceStatusCode   ', GLEIFData.activeComplianceStatusCode );
        
                  GLEIFData.activeComplianceStatusCode.assertEquals(activeStatusCode);
                  GLEIFData.activeComplianceStatusCode.assertNotEquals(inactiveStatusCode);
                  */


                  const activeComplianceHash = CircuitString.fromString("Active").hash();
                  const inactiveComplianceHash = CircuitString.fromString("Inactive").hash();
                  const currentStatusHash = GLEIFData.registration_status.hash();

                  //console.log(' reg status ', GLEIFData.registration_status ,' activeComplianceHash ', activeComplianceHash,  '   currentStatusHash  ',currentStatusHash);
                  //console.log(' activeComplianceHash ', activeComplianceHash,  '   currentStatusHash  ',currentStatusHash);

                  currentStatusHash.assertNotEquals(inactiveComplianceHash);

                  currentStatusHash.assertEquals(activeComplianceHash);


               }

               return new GLEIFPublicOutput({
                  name: GLEIFData.name,
                  id: GLEIFData.id, // Adjust if needed
               });


            }
            catch (error) {

               console.log('error..', error)

               return new GLEIFPublicOutput({
                  name: GLEIFData.name,
                  id: GLEIFData.id, // Adjust if needed
               });


            }


         },


      },
   },
});

export class GLEIFProof extends ZkProgram.Proof(GLEIF) { }
