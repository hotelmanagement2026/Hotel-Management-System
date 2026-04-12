export const formatExactTime = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    
    // Format: 12 April 2026
    const datePart = d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    // Format: 03:33 PM
    const timePart = d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    
    return `${datePart}, ${timePart}`;
};
