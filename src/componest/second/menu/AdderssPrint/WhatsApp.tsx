// whatsapp.tsx (similar structure)
import { Address } from './types';

interface WhatsAppViewProps {
  selectedAddresses: Address[];
  message: string;
  onMessageChange: (message: string) => void;
  onBack: () => void;
}

export default function WhatsAppView({
  selectedAddresses,
  message,
  onMessageChange,
  onBack
}: WhatsAppViewProps) {
  return (
    <div className="action-view">
      <h2>WHATSAPP View ({selectedAddresses.length} selected)</h2>
      <textarea
        value={message}
        onChange={(e) => onMessageChange(e.target.value)}
        placeholder="Enter WhatsApp message..."
        rows={8}
      />
      <div className="action-buttons">
        <button onClick={onBack}>Back to List</button>
        <button onClick={() => alert('Sending WhatsApp messages...')}>
          Send WHATSAPP
        </button>
      </div>
    </div>
  );
}