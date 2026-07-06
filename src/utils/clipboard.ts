export const copyToClipboard = async (text: string): Promise<boolean> => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Clipboard API failed, fall back to legacy method
    }
  }

  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  textArea.style.top = '-9999px';
  document.body.appendChild(textArea);

  try {
    textArea.select();
    textArea.setSelectionRange(0, textArea.value.length);
    const successful = document.execCommand('copy');
    return successful;
  } catch {
    return false;
  } finally {
    document.body.removeChild(textArea);
  }
};