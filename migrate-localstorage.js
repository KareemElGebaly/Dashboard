// Migration utility to export localStorage data for import to SQLite
// Run this in the browser console on your dashboard

function exportDashboardData() {
    console.log('🔄 Exporting Dashboard Data from localStorage...');
    
    const data = {
        creditors: JSON.parse(localStorage.getItem('creditors') || '[]'),
        expenses: JSON.parse(localStorage.getItem('expenses') || '[]'),
        creditorTypes: JSON.parse(localStorage.getItem('creditorTypes') || '[]'),
        cashFlowSettings: JSON.parse(localStorage.getItem('cashFlowSettings') || '{}'),
        invitedUsers: JSON.parse(localStorage.getItem('invitedUsers') || '[]'),
        currentUser: JSON.parse(localStorage.getItem('currentUser') || 'null'),
        darkMode: JSON.parse(localStorage.getItem('darkMode') || 'false')
    };
    
    console.log('📊 Current Data Summary:');
    console.log(`- Creditors: ${data.creditors.length}`);
    console.log(`- Expenses: ${data.expenses.length}`);
    console.log(`- Creditor Types: ${data.creditorTypes.length}`);
    console.log(`- Invited Users: ${data.invitedUsers.length}`);
    console.log(`- Current User: ${data.currentUser ? data.currentUser.email : 'None'}`);
    
    // Create downloadable JSON file
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-data-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('✅ Data exported successfully!');
    console.log('📁 Check your downloads folder for the JSON file');
    
    return data;
}

// Instructions
console.log(`
🔄 localStorage to SQLite Migration Guide
========================================

1. Run this function to export your current data:
   exportDashboardData();

2. This will download a JSON file with all your data

3. Send this file to your server administrator for import

4. The data will be imported into the new SQLite database

Ready to export? Run: exportDashboardData();
`);