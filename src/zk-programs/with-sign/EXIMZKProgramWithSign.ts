import {
   Field,
   Signature,
   SmartContract,
   Struct,
   ZkProgram,
   Proof,
   CircuitString,
   method,
   Poseidon,
} from 'o1js';
import { getPublicKeyFor } from '../../core/OracleRegistry.js';
import {EXIMComplianceDataO1} from '../../tests/with-sign/EXIMo1.js';
//

/*//  =================================== Compliance Data Definition ===================================
export class EXIMComplianceData extends Struct({
   iec: CircuitString,
   entityName: CircuitString,
   addressLine1: CircuitString,
   addressLine2: CircuitString,
   city: CircuitString,
   state: CircuitString,
   pin: Field,
   contactNo: Field,
   email: CircuitString,
   iecIssueDate: CircuitString,
   exporterType: Field,
   pan: CircuitString,
   iecStatus: Field,
   activeComplianceStatusCode: Field,
   starStatus: Field,
   iecModificationDate: CircuitString,
   dataAsOn: CircuitString,
   natureOfConcern: Field,
   branchCode: Field,
   badd1: CircuitString,
   badd2: CircuitString,
   branchCity: CircuitString,
   branchState: CircuitString,
   branchPin: Field,
   director1Name: CircuitString,
   director2Name: CircuitString,
}) { }*/

// ========================== Public Output Structure Definition ========================================
export class EXIMPublicOutput extends Struct({
   entityName: CircuitString,
   iec: CircuitString,
}) { }

// =================================== ZkProgram Definition ===================================
export const EXIM = ZkProgram({
   name: 'EXIM',
   publicInput: Field,
   publicOutput: EXIMPublicOutput,

   methods: {
      proveCompliance: {
         privateInputs: [EXIMComplianceDataO1, Signature], // Include Signature for oracle verification
         async method(
            EXIMToProve: Field,
            EXIMDatao1: EXIMComplianceDataO1,
            oracleSignature: Signature // Oracle Signature
         ): Promise<EXIMPublicOutput> {

            //console.log('Data before compliance check - Company Name:', EXIMData.entityName.toString, 'IEC Status:', EXIMData.iecStatus.toString);

            // =================================== Oracle Signature Verification ===================================
            // Hash the compliance data
            const complianceDataHash = Poseidon.hash(EXIMComplianceDataO1.toFields(EXIMDatao1));

            // Get the oracle's public key
            const registryPublicKey = getPublicKeyFor('EXIM');

            // Verify the oracle's signature
            const isValidSignature = oracleSignature.verify(registryPublicKey, [complianceDataHash]);
            isValidSignature.assertTrue();
            //---------------------------------------------------------------------------------------------------
            // Compliance check: Verify that IEC status is active
            // Define compliance statuses
            const normalStatus = Field(0);
            const clearFromBlackList = Field(4);
            const revokeSuspension = Field(7);
            const revokeCancellation = Field(8);

            // Check for compliant IEC statuses
            EXIMDatao1.iecStatus
              .equals(normalStatus)
              .or(EXIMDatao1.iecStatus.equals(clearFromBlackList))
              .or(EXIMDatao1.iecStatus.equals(revokeSuspension))
              .or(EXIMDatao1.iecStatus.equals(revokeCancellation))
              .assertTrue(); // Ensures the IEC status is compliant

            // Check for non-compliant IEC statuses
            EXIMDatao1.iecStatus
              .equals(Field(1)) // BLACK LISTED
              .or(EXIMDatao1.iecStatus.equals(Field(2))) // SUSPENDED
              .or(EXIMDatao1.iecStatus.equals(Field(3))) // CANCELLED
              .assertFalse(); // Ensures the IEC status is compliant

            //console.log('Data after compliance check - Company Name:', EXIMData.entityName.toString, 'IEC Status:', EXIMData.iecStatus.toString);
            //---------------------------------------------------------------------------------------------------

            // const activeStatusCode = Field.from(1);
            // const inactiveStatusCode = Field.from(0);

            // EXIMDatao1.activeComplianceStatusCode.assertEquals(activeStatusCode);
            // EXIMDatao1.activeComplianceStatusCode.assertNotEquals(inactiveStatusCode);


            return new EXIMPublicOutput({
               entityName: EXIMDatao1.entityName,
               iec: EXIMDatao1.iec,
            });
         },
      },
   },
});

export class EXIMProof extends ZkProgram.Proof(EXIM) { }
