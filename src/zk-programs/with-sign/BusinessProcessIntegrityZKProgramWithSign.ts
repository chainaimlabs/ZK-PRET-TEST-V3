import { verifyProcess } from '../../contracts/bpmnCircuit.js';
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
   UInt8,
   Bool,
   Bytes,
   Provable,
   Poseidon
} from 'o1js';
// import { ZkRegex } from 'zk-regex-o1js';
import { getPublicKeyFor } from '../../core/OracleRegistry.js';
class Bytes50 extends Bytes(20) { }

// import axios from 'axios';
export class BusinessProcessIntegrityData extends Struct({
   businessProcessID: Field,              // MCA ID
   expectedContent: CircuitString,
   actualContent: String,
   str: String
}) { }



// Define the Public Output Structure
export class BusinessProcessIntegrityPublicOutput extends Struct({
   businessProcessID: Field,
   out: Bool,
   //outputExpectedHash: Field,
   //outputActualHash: Field,
   //creatorPublicKey: PublicKey,
}) { }


function isValidString(str: String) {
   return str != null && str.trim().length > 0;
}

export const BusinessProcessIntegrityZKProgram = ZkProgram({
   name: 'BusinessProcessIntegrityZKProgram',
   publicInput: Field,
   publicInput1: CircuitString,
   publicOutput: BusinessProcessIntegrityPublicOutput,
   methods: {

      proveCompliance: { // Generates the public output
         privateInputs: [
            BusinessProcessIntegrityData,
            Signature,
            //Signature,
            //PublicKey,
         ],
         async method(
            businessProcessIntegrityToProve: Field,
            businessProcessIntegrityData: BusinessProcessIntegrityData,
            oracleSignature: Signature,
            //oracleSignature: Signature,
            //creatorSignature: Signature,
            //creatorPublicKey: PublicKey
         ): Promise<BusinessProcessIntegrityPublicOutput> {

            let out = Bool(true);

            try {
               // =================================== Oracle Signature Verification ===================================
               const complianceDataHash = Poseidon.hash(BusinessProcessIntegrityData.toFields(businessProcessIntegrityData));
               const registryPublicKey = getPublicKeyFor('BPMN');
               const isValidSignature = oracleSignature.verify(
                  registryPublicKey,
                  [complianceDataHash]
               );
               isValidSignature.assertTrue();

               const str = businessProcessIntegrityData.str;
               //console.log('str:',str);
               const actualContent = businessProcessIntegrityData.actualContent;
               console.log('actual ||||||||||||||| content |||||||||||||||||', actualContent);

               /*  
                 const validSignature = oracleSignature.verify(
                   PublicKey.fromBase58('B62qmXFNvz2sfYZDuHaY5htPGkx1u2E2Hn3rWuDWkE11mxRmpijYzWN'),
                   CorporateRegistrationData.toFields(corporateRegistrationData)
                 );
                 validSignature.assertTrue();
         
                 const validSignature_ = creatorSignature.verify(
                   creatorPublicKey,
                   CorporateRegistrationData.toFields(corporateRegistrationData)
                 );
                 validSignature_.assertTrue();
                 */


               if (isValidString(actualContent)) {

                  // ----------------------------------------------------
                  //console.log( "expected path ",businessProcessIntegrityData.expectedContent.values.toString);
                  //console.log( "actual path ",businessProcessIntegrityData.actualContent.toString);

                  //This works
                  //const actualPath1=CircuitString.fromString("abcdfg");

                  const actualPath1 = CircuitString.fromString(actualContent);
                  //console.log("ActualPath1:",actualPath1.values.toString());

                  // console.log( "actual path ",businessProcessIntegrityData.actualContent.toString);
                  //  let input=Bytes50.fromString(`${businessProcessIntegrityData.actualContent}`);
                  //Provable.log(businessProcessIntegrityData.expectedContent);


                  /* Provable.asProver(() => {
                  
                    console.log( "actual path ",businessProcessIntegrityData.actualContent.toString);
                    input=Bytes50.fromString(`${businessProcessIntegrityData.actualContent}`);
                  
                  });
                  Provable.log(businessProcessIntegrityData.actualContent);
                  
                  */

                  //onst actualPath2=businessProcessIntegrityData.actualContent;
                  //console.log("ActualPath2:",actualPath2.values.toString());

                  //this works

                  out = verifyProcess(Bytes50.fromString(`${actualPath1}`).bytes);

                  //const out=verifyProcess(Bytes50.fromString(`${actualPath2}`).bytes);

                  console.log(' actual Path.. ', actualPath1.toString(), " ############ Final Result...:", out.toJSON());

                  out.assertTrue();

               }

               out = Bool(true);

               return new BusinessProcessIntegrityPublicOutput({
                                    //outputExpectedHash: Field(corporateRegistationToProveHash),
                  //outputActualHash: Field(1),
                  //creatorPublicKey: creatorPublicKey,
                  businessProcessID: businessProcessIntegrityData.businessProcessID,
                  out: out,
                  //companyName: corporateRegistrationData.companyName,
                  //companyID: corporateRegistrationData.companyID,
                  // complianceProof: CorporateRegistration.proveCompliance(Field(0),complianceData)

               });


            }
            catch (error) {

               console.log(' catching error ... ', error);

               out = Bool(false);

               return new BusinessProcessIntegrityPublicOutput({
                  //outputExpectedHash: Field(corporateRegistationToProveHash),
                  //outputActualHash: Field(1),
                  //creatorPublicKey: creatorPublicKey,
                  businessProcessID: businessProcessIntegrityData.businessProcessID,
                  out: out,
                  //companyName: corporateRegistrationData.companyName,
                  //companyID: corporateRegistrationData.companyID,
                  // complianceProof: CorporateRegistration.proveCompliance(Field(0),complianceData)

               });
            }
         },
      },

   },
});


export class BusinessProcessIntegrityProof extends ZkProgram.Proof(BusinessProcessIntegrityZKProgram) { }
