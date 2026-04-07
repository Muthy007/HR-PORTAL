import https from 'https';


const agent = new https.Agent({ rejectUnauthorized: false });

async function updateDB() {
  console.log("Fetching elements...");
  const elementsRes = await fetch('https://localhost:7080/api/EmployeeMaster/elements', { agent });
  if (!elementsRes.ok) throw new Error("Could not fetch elements");
  const elements = await elementsRes.json();
  
  const grossHeads = [5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 21]; 
  const basicHeads = [2, 3, 14, 19, 20, 22, 23]; 
  
  for (const el of elements) {
    const headId = el.headId || el.head_id;
    const elementId = el.elementId || el.element_id;
    let expectedCalc = el.valueCalculating || el.value_calculating;
    
    if (headId === 1) {
        expectedCalc = "Annual CTC";
    } else if (headId === 4) {
        expectedCalc = "CTC Remainder (Balancer)";
    } else if (grossHeads.includes(headId)) {
        expectedCalc = "Gross Salary";
    } else if (basicHeads.includes(headId)) {
        expectedCalc = "Basic Salary";
    }
    
    if ((el.valueCalculating || el.value_calculating) !== expectedCalc) {
      console.log(`Updating Element ${elementId} (Head ${headId}) -> ${expectedCalc}`);
      
      const payload = {
        elementId: elementId,
        headId: headId,
        elementValue: el.elementValue || el.element_value,
        valueType: el.valueType || el.value_type,
        valueCalculating: expectedCalc
      };
      
      const updateRes = await fetch(`https://localhost:7080/api/EmployeeMaster/update-element/${elementId}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'accept': '*/*'
        },
        body: JSON.stringify(payload),
        agent
      });
      
      if (updateRes.ok) {
        console.log(`Successfully updated element ${elementId}`);
      } else {
        console.error(`Failed to update element ${elementId} - Status ${updateRes.status}`);
      }
    }
  }
}

updateDB()
  .then(() => console.log('Database sync complete.'))
  .catch(err => console.error(err));
