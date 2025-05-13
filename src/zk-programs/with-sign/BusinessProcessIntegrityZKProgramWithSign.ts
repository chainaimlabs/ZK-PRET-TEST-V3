import { verifyProcessSCF,verifyProcessSTABLECOIN,verifyProcessDVP } from '../../contracts/bpmnCircuit.js';
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
   businessProcessID: Field,        
   businessProcessType: CircuitString,
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

/*

function executeProcess(buisnessProcessType:CircuitString, actualContent:CircuitString ) {
   return out;
}

*/

export const BusinessProcessIntegrityZKProgram = ZkProgram({
   name: 'BusinessProcessIntegrityZKProgram',
   publicInput: Field,
   publicInput1: CircuitString,
   publicOutput: BusinessProcessIntegrityPublicOutput,
   methods: {

      proveComplianceSCF: { // Generates the public output
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
               const businessProcessType = businessProcessIntegrityData.businessProcessType;

               console.log('actual ||||||||||||||| content |||||||||||||||||', actualContent.length() , "BP Type ", businessProcessType.length() );
        
                  const out = verifyProcessSCF( actualContent.values.map((c) => UInt8.from(c.toField())));

                  Provable.asProver(() => {
                     console.log( 'out ', out.toJSON()
                     );
                   });
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

   proveComplianceSTABLECOIN: { // Generates the public output
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
            const businessProcessType = businessProcessIntegrityData.businessProcessType;

            console.log('actual ||||||||||||||| content |||||||||||||||||', actualContent.length() , "BP Type ", businessProcessType.length() );
     
               const out = verifyProcessSTABLECOIN( actualContent.values.map((c) => UInt8.from(c.toField())));

               Provable.asProver(() => {
                  console.log( 'out ', out.toJSON()
                  );
                });
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
proveComplianceDVP: { // Generates the public output
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
         const businessProcessType = businessProcessIntegrityData.businessProcessType;

         console.log('actual ||||||||||||||| content |||||||||||||||||', actualContent.length() , "BP Type ", businessProcessType.length() );
  
            const out = verifyProcessDVP( actualContent.values.map((c) => UInt8.from(c.toField())));

            Provable.asProver(() => {
               console.log( ' business Process Type', businessProcessType.toString(),'actual content',actualContent.toString(), 'out ', out.toJSON())
             });
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