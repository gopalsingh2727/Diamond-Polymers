// sms.tsx (similar structure)
import { Address } from './types';

interface SMSViewProps {
  selectedAddresses: Address[];
  message: string;
  onMessageChange: (message: string) => void;
  onBack: () => void;
}

export default function SMSView({
  selectedAddresses,
  message,
  onMessageChange,
  onBack
}: SMSViewProps) {
  return (
    <div className="action-view">
      <h2>SMS View ({selectedAddresses.length} selected)</h2>
      <textarea
        value={message}
        onChange={(e) => onMessageChange(e.target.value)}
        placeholder="Enter SMS message..."
        rows={8}
      />
      <div className="action-buttons">
        <button onClick={onBack}>Back to List</button>
        <button onClick={() => alert('Sending SMS messages...')}>
          Send SMS
        </button>
      </div>
    </div>
  );
}