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
class Bytes20 extends Bytes(20) { }

// import axios from 'axios';
export class BusinessProcessIntegrityData extends Struct({
   businessProcessID: Field,              // MCA ID
   expectedContent: CircuitString,
   actualContent: CircuitString,
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
            //creatorSignature: Signature,
            //creatorPublicKey: PublicKey
         ): Promise<BusinessProcessIntegrityPublicOutput> {

            let out = Bool(true);
            //let out = Bool(false);

            //try {
               // =================================== Oracle Signature Verification ===================================
               const complianceDataHash = Poseidon.hash(BusinessProcessIntegrityData.toFields(businessProcessIntegrityData));
               const registryPublicKey = getPublicKeyFor('BPMN');
               
               // Currently this Registry is implemented as an example in MINA L!. But Eventually 
               // This registry might be a overall trust registry, that could be centralized ( some univ)
               //  or decentralized ( Like MIT NANDA ), for blockchain and AI agents looking for 
               // the PKs, and can be from any blockchain ( multi chain tranaction) or X 509
               // verified off-chain thru the ZK program oracle, and update the MINA L1 state.

               const isValidSignature = oracleSignature.verify(
                  registryPublicKey,
                  [complianceDataHash]
               );


               isValidSignature.assertTrue();

               const actualContent = businessProcessIntegrityData.actualContent;
               console.log('actual ||||||||||||||| content |||||||||||||||||', actualContent);
        
               //if (isValidString(actualContent)) {

                  // ----------------------------------------------------
                  //console.log( "expected path ",businessProcessIntegrityData.expectedContent.values.toString);
                  //const actualPath = CircuitString.fromString(actualContent);
                  // console.log( "actual path ",businessProcessIntegrityData.actualContent.toString);
           
                  //out = verifyProcess(Bytes20.fromString(`${actualPath}`).bytes);

               
                  //actualContent.values.map((c) => UInt8.from(c.toField()))
                  //`${actualContent}`


                  out = verifyProcess( actualContent.values.map((c) => UInt8.from(c.toField())));


                  Provable.asProver(() => {
                     console.log( 'out ', out.toJSON()
                     );
                   });

                  //out = verifyProcess(Bytes20.fromString(`${actualContent}`).bytes);

                  //out = Bool(true);

                  //console.log(' actual Path.. ', actualPath.toString(), " ############ Final Result...:", out.toJSON());
                  //out.assertTrue(); // Removed the asserts and intermittent states.
               
               //out = Bool(true); // Removed the asserts and intermittent states.

               /*

               return new BusinessProcessIntegrityPublicOutput({
                  //outputExpectedHash: Field(corporateRegistationToProveHash),
                  //outputActualHash: Field(1),
                  //creatorPublicKey: creatorPublicKey,
                  businessProcessID: businessProcessIntegrityData.businessProcessID,
                  out: out,
                  //companyName: corporateRegistrationData.companyName,
                  //companyID: corporateRegistrationData.companyID,
                  //complianceProof: CorporateRegistration.proveCompliance(Field(0),complianceData)

               });
               */
            //}  
            /*      
         }
         catch (error) {
            console.log(' out , ', out, ' catching error ... ' , error);
            out = Bool(false);
         }
         */   
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
   }
} });

export class BusinessProcessIntegrityProof extends ZkProgram.Proof(BusinessProcessIntegrityZKProgram) { }
