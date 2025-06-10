import { useState } from "react";
import { BackButton } from "../../allCompones/BackButton";
import "./indexAllOders.css";

type SideItem = {
  side: string;
  allSide: string;
};

type SidebarData = {
  name: string;
  sides: SideItem[];
};

const sidebarData: SidebarData[] = [
  {
    name: "sideBar1A",
    sides: [
      { side: "1", allSide: "12" },
      { side: "2", allSide: "2" },
    ]
  },
  {
    name: "sideBar2B",
    sides: [
      { side: "1", allSide: "12" },
    ]
  }
];

const IndexAllOders = () => {
  const [selectedSidebar, setSelectedSidebar] = useState<string | null>(null);
  const [selectedSide, setSelectedSide] = useState<SideItem | null>(null);
  const [showGlobalAll, setShowGlobalAll] = useState(false);

  const handleSidebarSelect = (sidebarName: string) => {
    if (selectedSidebar === sidebarName) {
      setSelectedSidebar(null);
    } else {
      setSelectedSidebar(sidebarName);
    }
    setSelectedSide(null);
  };

  const handleSideSelect = (sideItem: SideItem) => {
    setSelectedSide(sideItem);
    setShowGlobalAll(false);
  };

  const handleNoneSelect = () => {
    setSelectedSide(null);
    setShowGlobalAll(false);
  };

  const handleGlobalAllSelect = () => {
    setSelectedSide(null);
    setShowGlobalAll(true);
  };

  return (
    <div className="container">
      <div className="item">
        <BackButton />
      </div>

      <div className="item">
        <div className="sidebarGroup">
          <h3 onClick={handleGlobalAllSelect}>Show All Side</h3>
        </div>

        {sidebarData.map((sidebar, index) => (
          <div key={index} className="sidebarGroup">
            <h3 onClick={() => handleSidebarSelect(sidebar.name)}>{sidebar.name}</h3>
            {selectedSidebar === sidebar.name && (
              <ul>
                {sidebar.sides.map((sideItem, idx) => (
                  <li key={idx} onClick={() => handleSideSelect(sideItem)}>
                    Side: {sideItem.side}
                  </li>
                ))}
                <li onClick={handleNoneSelect} style={{ fontWeight: 'bold', color: 'red' }}>
                  None
                </li>
              </ul>
            )}
          </div>
        ))}
      </div>

      <div className="item">
        <div className="inputBoxAllodersSrearchbox">
          <input type="text" placeholder="text" className="input" />
        </div>

        <div className="AllInputOders">
          {selectedSidebar && (
            <div>
              <h2>{selectedSidebar}</h2>
            </div>
          )}

          {selectedSide && (
            <div>
              <h4>Selected AllSide: {selectedSide.allSide}</h4>
            </div>
          )}

          {showGlobalAll && (
            <div>
              {sidebarData.map((sidebar, idx1) => (
                sidebar.sides.map((sideItem, idx2) => (
                  <div key={`global-${idx1}-${idx2}`}>
                    <h4>AllSide: {sideItem.allSide}</h4>
                  </div>
                ))
              ))}
            </div>
          )}

          {selectedSidebar && !selectedSide && !showGlobalAll && (
            <div>
              {sidebarData
                .filter(sidebar => sidebar.name === selectedSidebar)
                .map((sidebar, idx1) => (
                  sidebar.sides.map((sideItem, idx2) => (
                    <div key={`${idx1}-${idx2}`}>
                      <h4>AllSide: {sideItem.allSide}</h4>
                    </div>
                  ))
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndexAllOders;