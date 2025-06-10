import { FC } from 'react';
import { Address } from './types';

interface EmailViewProps {
  selectedAddresses: Address[];
  message: string;
  subject: string;
  attachments: File[];
  onMessageChange: (message: string) => void;
  onSubjectChange: (subject: string) => void;
  onAttachmentsChange: (files: File[]) => void;
  onBack: () => void;
  onSend: () => void;
}

const EmailView: FC<EmailViewProps> = ({
  selectedAddresses = [],
  message = '',
  subject = '',
  attachments = [],
  onMessageChange,
  onSubjectChange,
  onAttachmentsChange,
  onBack,
  onSend
}) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      onAttachmentsChange([...attachments, ...Array.from(files)]);
    }
  };

  const removeAttachment = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    onAttachmentsChange(newAttachments);
  };

  return (
    <div className="email-template">
      <div className="email-header">
        <h2>New Email ({selectedAddresses.length} recipients)</h2>
        <div className="recipient-list">
          {selectedAddresses?.map((address, index) => (
            <span key={index} className="recipient-chip">
              {address.name} &lt;{address.email}&gt;
            </span>
          ))}
        </div>
      </div>

      <div className="email-fields">
        <input
          type="text"
          className="email-subject"
          placeholder="Subject"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
        />

        <textarea
          className="email-body"
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Compose your email..."
          rows={12}
        />

        <div className="attachments-section">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden-file-input"
            id="email-attachments"
          />
          <label htmlFor="email-attachments" className="attachment-button">
            Add Attachments
          </label>

          <div className="attachment-previews">
            {attachments?.map((file, index) => (
              <div key={index} className="attachment-item">
                <span className="file-name">{file.name}</span>
                <button 
                  className="remove-attachment"
                  onClick={() => removeAttachment(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="email-actions">
        <button onClick={onBack} className="secondary-button">
          Cancel
        </button>
        <button onClick={onSend} className="primary-button send-button">
          Send Email
        </button>
      </div>
    </div>
  );
};

export default EmailView;