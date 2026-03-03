process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
fetch('https://localhost:7134/api/EmployeeMaster/1')
    .then(res => res.json())
    .then(data => require('fs').writeFileSync('temp_emp.json', JSON.stringify(data, null, 2)))
    .catch(console.error);
