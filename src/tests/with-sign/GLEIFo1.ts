// // GLEIFo1.ts
// import { CircuitString, Field } from 'o1js';
// import { GLEIFComplianceData } from '../../zk-programs/with-sign/GLEIFZKProgramWithSign.js';

// // Type for parsedData expected structure
// interface GLEIFRecord {
//   type?: string;
//   id?: string;
//   attributes: {
//     lei?: string;
//     entity: {
//       legalName?: {
//         name?: string;
//       };
//       status?: string;
//     };
//   };
// }
// interface ParsedData {
//   data: GLEIFRecord[];
// }

// /**
//  * Extracts the first record from parsedData and creates a GLEIFComplianceData instance.
//  * @param parsedData The data object returned from fetchGLEIFCompanyData
//  * @returns GLEIFComplianceData
//  */
// export function getComplianceDataFromParsed(parsedData: ParsedData): GLEIFComplianceData {
//   if (!parsedData.data || parsedData.data.length === 0) {
//     throw new Error('No records found in parsedData');
//   }
//   const record = parsedData.data[0];
//   return new GLEIFComplianceData({
//     type: CircuitString.fromString(record.type || ''),
//     id: CircuitString.fromString(record.id || ''),
//     lei: CircuitString.fromString(record.attributes.lei || ''),
//     name: CircuitString.fromString(record.attributes.entity.legalName?.name || ''),
//     registration_status: CircuitString.fromString(record.attributes.entity.status || ''),
//   });
// }


// GLEIFo1.ts
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
//import { GLEIFComplianceDataO1 } from '../../zk-programs/with-sign/GLEIFZKProgramWithSign.js';

/**
 * Extracts the first record from parsedData and creates a GLEIFComplianceData instance.
 * @param parsedData The data object returned from fetchGLEIFCompanyData
 * @returns GLEIFComplianceData
 */

export class GLEIFComplianceDataO1 extends Struct({
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
   //initialRegistrationDate: CircuitString,
   //lastUpdateDate: CircuitString,
   //activeComplianceStatusCode: Field,
   registration_status: CircuitString,
   //nextRenewalDate: CircuitString,
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


export function getGLEIFComplianceDataO1(parsedData: any): GLEIFComplianceDataO1 {
  if (!parsedData.data || parsedData.data.length === 0) {
    throw new Error('No records found in parsedData');
  }
  const record = parsedData.data[0];
  return new GLEIFComplianceDataO1({
    type: CircuitString.fromString(record.type || ''),
    id: CircuitString.fromString(record.id || ''),
    lei: CircuitString.fromString(record.attributes.lei || ''),
    name: CircuitString.fromString(record.attributes.entity.legalName?.name || ''),
    registration_status: CircuitString.fromString(record.attributes.entity.status || ''),
  });
}
