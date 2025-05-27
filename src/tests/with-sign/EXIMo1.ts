
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
//import { GLEIFComplianceDataO1 } from '../../zk-programs/with-sign/GLEIFZKProgramWithSign.js';

export class EXIMComplianceDataO1 extends Struct({
   iec: CircuitString,
   entityName: CircuitString,
//    addressLine1: CircuitString,
//    addressLine2: CircuitString,
//    city: CircuitString,
//    state: CircuitString,
//    pin: Field,
//    contactNo: Field,
//    email: CircuitString,
//    iecIssueDate: CircuitString,
//    exporterType: Field,
//    pan: CircuitString,
      iecStatus: Field,
//    activeComplianceStatusCode: Field,
//    starStatus: Field,
//    iecModificationDate: CircuitString,
//    dataAsOn: CircuitString,
//    natureOfConcern: Field,
//    branchCode: Field,
//    badd1: CircuitString,
//    badd2: CircuitString,
//    branchCity: CircuitString,
//    branchState: CircuitString,
//    branchPin: Field,
//    director1Name: CircuitString,
//    director2Name: CircuitString,
}) {}


export function getEXIMComplianceDataO1(parsedData: any): EXIMComplianceDataO1 {
//   if (!parsedData.data || parsedData.data.length === 0) {
//     throw new Error('No records found in parsedData');
//   }
//   const record = parsedData.data[0];
  return new EXIMComplianceDataO1({
    iec: CircuitString.fromString(parsedData["iec"] || ''),
    entityName: CircuitString.fromString(parsedData["entityName"] || ''),
    // addressLine1: CircuitString.fromString(parsedData["addressLine1"] || ''),
    // addressLine2: CircuitString.fromString(parsedData["addressLine2"] || ''),
    // city: CircuitString.fromString(parsedData["city"] || ''),
    // state: CircuitString.fromString(parsedData["state"] || ''),
    // pin: Field(parsedData["pin"] ?? 0),
    // contactNo: Field(parsedData["contactNo"] ?? 0),
    // email: CircuitString.fromString(parsedData["email"] || ''),
    // iecIssueDate: CircuitString.fromString(parsedData["iecIssueDate"] || ''),
    // exporterType: Field(parsedData["exporterType"] ?? 0),
    // pan: CircuitString.fromString(parsedData["pan"] || ''),
       iecStatus: Field(parsedData["iecStatus"] ?? 0),
    // activeComplianceStatusCode: Field(parsedData["activeComplianceStatusCode"] ?? 0),
    // starStatus: Field(parsedData["starStatus"] ?? 0),
    // iecModificationDate: CircuitString.fromString(parsedData["iecModificationDate"] || ''),
    // dataAsOn: CircuitString.fromString(parsedData["dataAsOn"] || ''),
    // natureOfConcern: Field(parsedData["natureOfConcern"] ?? 0),

    // // Branch Data (from branches[0])
    // branchCode: Field(parsedData.branches?.[0]?.branchCode ?? 0),
    // badd1: CircuitString.fromString(parsedData.branches?.[0]?.badd1 || ''),
    // badd2: CircuitString.fromString(parsedData.branches?.[0]?.badd2 || ''),
    // branchCity: CircuitString.fromString(parsedData.branches?.[0]?.city || ''),
    // branchState: CircuitString.fromString(parsedData.branches?.[0]?.state || ''),
    // branchPin: Field(parsedData.branches?.[0]?.pin ?? 0),

    // // Director Data (from directors)
    // director1Name: CircuitString.fromString(parsedData.directors?.[0]?.name || ''),
    // director2Name: CircuitString.fromString(parsedData.directors?.[1]?.name || ''),

  });
}
