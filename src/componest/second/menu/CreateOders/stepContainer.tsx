import { useState } from "react";
import StepSuggestions from "./SuggestionInput/step";
import './materialAndProduct/materialAndProduct.css';

type StepItem = {
  MachineType: string;
  MachineName: string;
  SizeX: string;
  SizeY: string;
  SizeZ: string;
  OptereName: string;
  StartTime: string;
  EndTime: string;
  note?: string;
};

type StepData = {
  stepname: string;
  steps: StepItem[];
};

const StepContainre = () => {
  const [savedStep, setSavedStep] = useState<StepData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showStepPopup, setShowStepPopup] = useState(false);
  const [selectedStep, setSelectedStep] = useState<StepData | null>(null);

  const [noteIndex, setNoteIndex] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");

  const handleSelect = (step: StepData) => {
    setSelectedStep(step);
    setShowStepPopup(true);
    setSearchTerm("");
  };

  const handleSaveStep = () => {
    if (selectedStep) {
      setSavedStep(selectedStep);
      setShowStepPopup(false);
    }
  };

  const handleEditStep = () => {
    if (savedStep) {
      setSelectedStep(savedStep);
      setShowStepPopup(true);
      setSavedStep(null);
    }
  };

  return (
    <div className="container12">
      <h3>Manufacturing Steps:</h3>

      {!savedStep && (
        <div className="section search">
          <label htmlFor="searchInput">Step Name:</label>
          <input
            id="searchInput"
            type="text"
            placeholder="Enter step name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="inputBox"
          />
          <StepSuggestions
            stepName={searchTerm}
            onSelect={(selectedStep) => {
              const formattedStep = {
                stepname: selectedStep.stepName,
                steps: selectedStep.machines.map((m) => ({
                  MachineType: m.machineId?.machineType?.type || '',
                  MachineName: m.machineId?.machineName || '',
                  SizeX: m.machineId?.sizeX || '',
                  SizeY: m.machineId?.sizeY || '',
                  SizeZ: m.machineId?.sizeZ || '',
                  OptereName: '',
                  StartTime: '',
                  EndTime: '',
                  note: '',
                })),
              };
              handleSelect(formattedStep);
            }}
          />
        </div>
      )}

      {showStepPopup && selectedStep && (
        <div className="popup-overlay">
          <div className="popup">
            <div className="popup-content">
              <h3>Configure Step: {selectedStep.stepname}</h3>
              <div className="headerRow">
                <span>Machine Type</span>
                <span>Machine Name</span>
                <span>Size X</span>
                <span>Size Y</span>
                <span>Size Z</span>
                <span>Operator Name</span>
                <span>Start Time</span>
                <span>End Time</span>
                <span>Note of Operator</span>
                <span>Action</span>
              </div>

              {selectedStep.steps.map((step, index) => (
                <div key={index} className="popupitemall">
                  <input
                    type="text"
                    value={step.MachineType}
                    onChange={(e) => {
                      const updated = { ...selectedStep };
                      updated.steps[index].MachineType = e.target.value;
                      setSelectedStep({ ...updated });
                    }}
                    placeholder="Machine Type"
                  />
                  <input
                    type="text"
                    value={step.MachineName}
                    onChange={(e) => {
                      const updated = { ...selectedStep };
                      updated.steps[index].MachineName = e.target.value;
                      setSelectedStep({ ...updated });
                    }}
                    placeholder="Machine Name"
                  />
                  <input
                    type="text"
                    value={step.SizeX}
                    onChange={(e) => {
                      const updated = { ...selectedStep };
                      updated.steps[index].SizeX = e.target.value;
                      setSelectedStep({ ...updated });
                    }}
                    placeholder="Size X"
                  />
                  <input
                    type="text"
                    value={step.SizeY}
                    onChange={(e) => {
                      const updated = { ...selectedStep };
                      updated.steps[index].SizeY = e.target.value;
                      setSelectedStep({ ...updated });
                    }}
                    placeholder="Size Y"
                  />
                  <input
                    type="text"
                    value={step.SizeZ}
                    onChange={(e) => {
                      const updated = { ...selectedStep };
                      updated.steps[index].SizeZ = e.target.value;
                      setSelectedStep({ ...updated });
                    }}
                    placeholder="Size Z"
                  />
                  <input
                    type="text"
                    value={step.OptereName}
                    onChange={(e) => {
                      const updated = { ...selectedStep };
                      updated.steps[index].OptereName = e.target.value;
                      setSelectedStep({ ...updated });
                    }}
                    placeholder="Operator Name"
                  />
                  <input
                    type="text"
                    value={step.StartTime}
                    onChange={(e) => {
                      const updated = { ...selectedStep };
                      updated.steps[index].StartTime = e.target.value;
                      setSelectedStep({ ...updated });
                    }}
                    placeholder="Start Time"
                  />
                  <input
                    type="text"
                    value={step.EndTime}
                    onChange={(e) => {
                      const updated = { ...selectedStep };
                      updated.steps[index].EndTime = e.target.value;
                      setSelectedStep({ ...updated });
                    }}
                    placeholder="End Time"
                  />

                  <button
                    onClick={() => {
                      setNoteIndex(index);
                      setNoteText(step.note || "");
                    }}
                    className="buttonStepRowNote"
                  >
                    ✎ Note
                  </button>

                  <button
                    onClick={() => {
                      const updated = { ...selectedStep };
                      updated.steps.splice(index, 1);
                      setSelectedStep({ ...updated });
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: "18px",
                      cursor: "pointer",
                      color: "#ff4444",
                      padding: "5px",
                    }}
                    title="Remove Row"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                onClick={() => {
                  const updated = { ...selectedStep };
                  updated.steps.push({
                    MachineType: "",
                    MachineName: "",
                    SizeX: "",
                    SizeY: "",
                    SizeZ: "",
                    OptereName: "",
                    StartTime: "",
                    EndTime: "",
                    note: "",
                  });
                  setSelectedStep({ ...updated });
                }}
                style={{
                  marginTop: "10px",
                  padding: "8px 16px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                + Add Row
              </button>

              <div className="popupButtons">
                <button onClick={handleSaveStep} className="saveButton">
                  Save
                </button>
                <button
                  onClick={() => setShowStepPopup(false)}
                  className="cancelButton"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {savedStep && (
        <div className="section-result" onDoubleClick={handleEditStep}>
          <div className="savedStepDisplay">
            <div className="stepHeaderRow">
              <strong>#</strong>
              <strong>Machine Type</strong>
              <strong>Machine Name</strong>
              <strong>Size X</strong>
              <strong>Size Y</strong>
              <strong>Size Z</strong>
              <strong>Operator Name</strong>
              <strong>Start Time</strong>
              <strong>Ending Time</strong>
              <strong>Note of Operator</strong>
            </div>

            {savedStep.steps.map((step, index) => (
              <div key={index} className="stepRow">
                <span>{index + 1}</span>
                <span>{step.MachineType}</span>
                <span>{step.MachineName}</span>
                <span>{step.SizeX}</span>
                <span>{step.SizeY}</span>
                <span>{step.SizeZ}</span>
                <span>{step.OptereName}</span>
                <span>{step.StartTime}</span>
                <span>{step.EndTime}</span>
                <span>
                  <button
                    onClick={() => {
                      setNoteIndex(index);
                      setNoteText(step.note || "");
                    }}
                    className="buttonStepRowNote"
                  >
                    ✎ Note
                  </button>
                </span>
              </div>
            ))}
          </div>

          <div className="Configured-Step">
            <h4>✓ Configured Step: {savedStep.stepname}</h4>
          </div>
        </div>
      )}

      {noteIndex !== null && (
        <div className="popup-overlay">
          <div className="popup">
            <div className="popup-content">
              <h3>Edit Note for Operator #{noteIndex + 1}</h3>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={5}
                style={{ width: "100%", padding: "8px" }}
              />

              <div className="popupButtons">
                <button
                  onClick={() => {
                    const updated = savedStep ? { ...savedStep } : selectedStep ? { ...selectedStep } : null;
                    if (updated) {
                      updated.steps[noteIndex].note = noteText;
                      if (savedStep) setSavedStep(updated);
                      else setSelectedStep(updated);
                    }
                    setNoteIndex(null);
                    setNoteText("");
                  }}
                  className="saveButton"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setNoteIndex(null);
                    setNoteText("");
                  }}
                  className="cancelButton"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepContainre;
