import fs from "fs";

interface Event {
  time: string;
  payoff: number;
}

interface Contract {
  id: string;
  contractId: string;
  type: string;
  events: Event[];
}

// HQLA Classification Types
interface ClassifiedContract extends Contract {
  hqlaCategory: "L1" | "L2A" | "L2B" | "Non-HQLA";
}

function classifyContract(contract: Contract): "L1" | "L2A" | "L2B" | "Non-HQLA" {
  if (contract.contractId === "pam02") return "L1"; // Cash = Level 1 (0% haircut)
  if (contract.contractId === "pam01") return "L2A"; // Long-term PAM = Level 2A (15% haircut)
  if (contract.contractId === "ann01" || contract.contractId === "stk01") return "L2B"; // Short-term ANN or STK = Level 2B (50% haircut)
  return "Non-HQLA"; // Other types are not HQLA
}

function mapJsonToRiskData(
  jsonData: Contract[]
): { inflow: number[][]; outflow: number[][]; monthsCount: number; classifiedContracts: ClassifiedContract[] } {
  if (jsonData.length === 0) return { inflow: [], outflow: [], monthsCount: 0, classifiedContracts: [] };

  const allDates = jsonData.flatMap(contract => contract.events.map(event => new Date(event.time)));
  const minDate = new Date(Math.min(...allDates.map(date => date.getTime())));
  const maxDate = new Date(Math.max(...allDates.map(date => date.getTime())));

  const monthsCount = Math.max(
    (maxDate.getFullYear() - minDate.getFullYear()) * 12 + (maxDate.getMonth() - minDate.getMonth()) + 1,
    1
  );
  
  
  const inflow: number[][] = Array.from({ length: monthsCount }, () => []);
  const outflow: number[][] = Array.from({ length: monthsCount }, () => []);
  

  const classifiedContracts: ClassifiedContract[] = jsonData.map(contract => ({
    ...contract,
    hqlaCategory: classifyContract(contract),
  }));

  jsonData.forEach((contract: Contract) => {
    contract.events.forEach((event: Event) => {
      const date = new Date(event.time);
      const monthIndex = (date.getFullYear() - minDate.getFullYear()) * 12 + (date.getMonth() - minDate.getMonth());
      if (event.payoff > 0) {
        inflow[monthIndex].push(event.payoff);
      } else if (event.payoff < 0) {
        outflow[monthIndex].push(Math.abs(event.payoff));
      }
    });
  });

  return { inflow, outflow, monthsCount, classifiedContracts };
}

function loadAndProcessJsonData(
  jsonData: string
): { inflow: number[][]; outflow: number[][]; monthsCount: number; classifiedContracts: ClassifiedContract[] } {
  const parsedData: Contract[] = JSON.parse(jsonData);
  return mapJsonToRiskData(parsedData);
}

export { mapJsonToRiskData, loadAndProcessJsonData };
