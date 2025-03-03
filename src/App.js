import React, { useState } from "react";

const TreeView = ({ data, level = 0 }) => {
  if (typeof data !== "object" || data === null) {
    return <div style={{ marginLeft: level * 15 }}>{String(data)}</div>;
  }

  return (
    <div style={{ marginLeft: level * 15 }}>
      {Object.entries(data).map(([key, value]) => (
        <div key={key}>
          <strong>{key}:</strong>
          {typeof value === "object" && value !== null ? (
            <TreeView data={value} level={level + 1} />
          ) : (
            <span> {String(value)}</span>
          )}
        </div>
      ))}
    </div>
  );
};

const App = () => {
  const [mode, setMode] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState({ image1: null, image2: null });
  const [metadata, setMetadata] = useState([]);
  const [mdLength, setMDLength] = useState(1);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("formatted"); // "formatted" or "tree"

  const handleModeSelection = (choice) => {
    setMode(choice);
    setSelectedFiles({ image1: null, image2: null });
    setMetadata([]);
  };

  const handleFileChange = (event, key) => {
    setSelectedFiles((prev) => ({ ...prev, [key]: event.target.files[0] }));
  };

  const handleUpload = async () => {
    if (!selectedFiles.image1 && mode === 1) {
      alert("Please select an image before extracting metadata.");
      return;
    }
    if ((!selectedFiles.image1 || !selectedFiles.image2) && mode === 2) {
      alert("Please select both images before extracting metadata.");
      return;
    }

    if (mode === 2) {
      setMDLength(2);
    }

    setLoading(true);
    setMetadata([]);

    const uploadResults = await Promise.all(
      Object.entries(selectedFiles).map(async ([key, file]) => {
        const formData = new FormData();
        formData.append("file", file);

        try {
          const response = await fetch("http://localhost:8000/upload/", {
            method: "POST",
            body: formData,
          });
          return { key, data: await response.json() };
        } catch (error) {
          console.error("Error uploading file:", error);
          return null;
        }
      })
    );

    setMetadata(uploadResults.filter((res) => res !== null));
    setLoading(false);
  };

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      minHeight: "100vh", 
      fontFamily: "Arial, sans-serif", 
      backgroundColor: "#f9f9f9",
      padding: "20px",
      position: "relative"
    }}>
      {metadata.length > 0 && (
        <button 
          onClick={() => window.location.reload()} 
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            padding: "10px 15px",
            backgroundColor: "#ff4757",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          Go Back to Home
        </button>
      )}

      {!metadata.length ? (
        <>
          <div style={{ textAlign: "center", maxWidth: "600px" }}>
            <h1 style={{ color: "#333" }}>C2PA Metadata Verification</h1>
            <p style={{ color: "#555" }}>
              The Coalition for Content Provenance and Authenticity (C2PA) provides a framework to verify the authenticity of digital media. Verifying an image’s metadata can help detect tampering, origin details, and ensure content integrity.
            </p>
          </div>

          {!mode ? (
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <label>Select an option:</label>
              <select onChange={(e) => handleModeSelection(Number(e.target.value))} style={{ padding: "10px", marginLeft: "10px" }}>
                <option value="">-- Choose --</option>
                <option value="1">Check One Image</option>
                <option value="2">Compare Two Images</option>
              </select>
            </div>
          ) : (
            <div style={{ 
              background: "white", 
              padding: "20px", 
              borderRadius: "10px", 
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", 
              textAlign: "center", 
              marginTop: "20px",
              width: "60%"
            }}>
              <h2 style={{ color: "#333" }}>{mode === 1 ? "Upload Image for Metadata Extraction" : "Compare Metadata for Two Images"}</h2>
              {mode === 1 ? (
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileChange(e, "image1")} 
                  style={{ margin: "10px 0", padding: "5px" }}
                />
              ) : (
                <div>
                  <label>Upload Image 1:</label>
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "image1")} style={{ display: "block", marginBottom: "10px" }} />
                  <label>Upload Image 2:</label>
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "image2")} style={{ display: "block", marginBottom: "10px" }} />
                </div>
              )}

              <button 
                onClick={handleUpload} 
                disabled={loading || (mode === 1 && !selectedFiles.image1) || (mode === 2 && (!selectedFiles.image1 || !selectedFiles.image2))}
                style={{
                  padding: "10px 15px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginTop: "10px",
                  fontSize: "16px"
                }}
              >
                {loading ? "Extracting..." : "Upload & Extract Metadata"}
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: "center" }}>
          <h3 style={{ color: "#333" }}>Metadata</h3>
          {mdLength === 1 && mode === 1 && (
            <button 
              onClick={() => setViewMode(viewMode === "formatted" ? "tree" : "formatted")}
              style={{
                marginBottom: "10px",
                padding: "10px 15px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer"
              }}
            >
              Toggle View ({viewMode === "formatted" ? "Tree" : "Formatted"})
            </button>
          )}
          <div style={{ display: "flex", justifyContent: mdLength === 1 ? "center" : "space-between", width: mdLength === 1 ? "80%" : "100%" }}>
            {metadata.filter(({ key }) => selectedFiles[key] !== null).map(({ key, data }) => (
              <div key={key} style={{ width: mdLength === 1 ? "100%" : "48%" }}>
                <h4>{selectedFiles[key]?.name}</h4>
                <div style={{ background: "#eef", padding: "10px", borderRadius: "5px", textAlign: "left" }}>
                  {viewMode === "formatted" ? (
                    <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{JSON.stringify(data, null, 2)}</pre>
                  ) : (
                    <TreeView data={data} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
