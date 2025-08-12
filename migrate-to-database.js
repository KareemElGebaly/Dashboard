// Migration script to move data from localStorage to database
const fs = require('fs');
const path = require('path');

// This would be run in the browser console to export localStorage data
const exportLocalStorageData = () => {
  const data = {
    creditors: JSON.parse(localStorage.getItem('creditors') || '[]'),
    expenses: JSON.parse(localStorage.getItem('expenses') || '[]'),
    creditorTypes: JSON.parse(localStorage.getItem('creditorTypes') || '[]'),
    cashFlowSettings: JSON.parse(localStorage.getItem('cashFlowSettings') || '{}'),
    invitedUsers: JSON.parse(localStorage.getItem('invitedUsers') || '[]'),
  };
  
  console.log('Current localStorage data:');
  console.log(JSON.stringify(data, null, 2));
  
  // Create downloadable file
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], {type: 'application/json'});
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'dashboard-data-export.json';
  link.click();
  
  return data;
};

// Instructions for users:
console.log(`
🔄 To migrate your current data to database:

1. Open your dashboard in browser
2. Open Developer Tools (F12)
3. Go to Console tab
4. Paste this function and run it:

${exportLocalStorageData.toString()}

exportLocalStorageData();

5. This will download your current data as JSON
6. Send this file to your server admin for import
`);