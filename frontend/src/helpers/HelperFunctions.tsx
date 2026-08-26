export function formatFileSize(fileSize: number | null): string {
    if (!fileSize) return '';

    const k = 1024;
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    
    // Calculate the correct index in the units array
    const i = Math.floor(Math.log(fileSize) / Math.log(k));

    return parseFloat((fileSize / Math.pow(k, i)).toFixed(2)) + ' ' + units[i];
}