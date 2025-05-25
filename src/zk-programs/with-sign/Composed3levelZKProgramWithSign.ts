// Composed3levelZKProgram.js

import {
   Field, CircuitString, Signature, ZkProgram, Proof, Struct, SelfProof,
   Poseidon, PublicKey,
   Provable
} from 'o1js';
//import { getPublicKeyFor } from './OracleRegistrySCF3Level.js';
import { CorporateRegistrationProof, ComplianceData, CorporateRegistrationPublicOutput } from './CorporateRegistrationZKProgramWithSign.js';
import { EXIMProof, EXIMComplianceData, EXIMPublicOutput } from './EXIMZKProgramWithSign.js';
import { GLEIFProof, GLEIFPublicOutput } from './GLEIFZKProgramWithSign.js';
import {GLEIFComplianceDataO1} from '../../tests/with-sign/GLEIFo1.js';

export class CompliancePublicOutput extends Struct({
   companyName: CircuitString,
   companyID: CircuitString,
   //compositeHash: Field
}) { }




export const ComposedCompliance = ZkProgram({
   name: 'ComposedCompliance',
   publicInput: Field,
   publicOutput: CompliancePublicOutput,
   methods: {
      level1: {
         privateInputs: [CorporateRegistrationProof],
         async method(publicInput: Field, proof: CorporateRegistrationProof): Promise<CompliancePublicOutput> {
            proof.verify();
            //const compositeHash = Poseidon.hash(proof.publicOutput.toFields());
            return new CompliancePublicOutput({
               companyName: proof.publicOutput.companyName,
               companyID: proof.publicOutput.companyID,
               //compositeHash: compositeHash
            });
         }
      },
      level2: {
         privateInputs: [SelfProof<Field, CompliancePublicOutput>, EXIMProof],
         async method(
            publicInput: Field,
            prevProof: SelfProof<Field, CompliancePublicOutput>,
            newProof: EXIMProof
         ): Promise<CompliancePublicOutput> {
            prevProof.verify();
            newProof.verify();

            //const compositeHash = Poseidon.hash([prevProof.publicOutput.toFields(), newProof.publicOutput.toFields()]);
            return new CompliancePublicOutput({
               companyName: prevProof.publicOutput.companyName,
               companyID: prevProof.publicOutput.companyID,
               // compositeHash: compositeHash
            });
         }
      },
      level3: {
         privateInputs: [SelfProof<Field, CompliancePublicOutput>, GLEIFProof],
         async method(
            publicInput: Field,
            prevProof: SelfProof<Field, CompliancePublicOutput>,
            newProof: GLEIFProof
         ): Promise<CompliancePublicOutput> {
            prevProof.verify();
            newProof.verify();
            // const compositeHash = Poseidon.hash([...prevProof.publicOutput.toFields(), ...newProof.publicOutput.toFields()]);

            return new CompliancePublicOutput({
               companyName: prevProof.publicOutput.companyName,
               companyID: prevProof.publicOutput.companyID,
               //  compositeHash: compositeHash
            });
         }
      }
   }
});
export class ComposedProof extends ZkProgram.Proof(ComposedCompliance) {
   //static publicOutput = CompliancePublicOutput;
   //static tag = "Composed";
}

