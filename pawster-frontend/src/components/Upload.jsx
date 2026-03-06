import { useEffect, useState, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import * as mobilenet from "@tensorflow-models/mobilenet";
import { createPost } from "../services/api";

const DOG_INDICATORS = [
  "dog",
  "puppy",
  "hound",
  "pug",
  "retriever",
  "terrier",
  "shepherd",
  "bulldog",
  "beagle",
  "poodle",
  "corgi",
  "husky",
  "chihuahua",
  "dachshund",
  "labrador",
  "spaniel",
  "boxer",
  "dalmatian",
  "mastiff",
  "collie",
  "pointer",
  "setter",
  "schnauzer",
  "pomeranian",
  "rottweiler",
  "doberman",
  "basenji",
  "whippet",
  "borzoi",
  "saluki",
  "greyhound",
  "wolfhound",
  "deerhound",
  "otterhound",
  "bloodhound",
  "kelpie",
  "malinois",
  "komondor",
  "kuvasz",
  "akita",
  "shiba",
  "chow",
  "keeshond",
  "pinscher",
  "affenpinscher",
  "groenendael",
  "malamute",
  "samoyed",
  "spitz",
  "schipperke",
  "bouvier",
  "briard",
  "vizsla",
  "weimaraner",
];

function isDogImage(predictions) {
  return predictions.some(
    (p) =>
      p.probability > 0.1 &&
      DOG_INDICATORS.some((word) => p.className.toLowerCase().includes(word)),
  );
}

function Upload({ user, onPostUploaded }) {
  const [model, setModel] = useState(null);
  const [modelLoading, setModelLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [validationState, setValidationState] = useState("idle"); // idle | classifying | valid | invalid
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const imageRef = useRef();

  useEffect(() => {
    (async () => {
      try {
        await tf.ready();
        const loaded = await mobilenet.load();
        setModel(loaded);
      } catch (err) {
        console.error("Model load error:", err);
      } finally {
        setModelLoading(false);
      }
    })();
  }, []);

  const handleImageChange = async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);
    setValidationState("classifying");
    setError("");

    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target.result);
      const img = imageRef.current;
      img.src = ev.target.result;
      img.onload = async () => {
        try {
          const predictions = await model.classify(img);
          setValidationState(isDogImage(predictions) ? "valid" : "invalid");
        } catch {
          setValidationState("invalid");
        }
      };
    };
    reader.readAsDataURL(selected);
  };

  const handleUpload = async () => {
    if (validationState !== "valid" || !file) return;
    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("caption", caption);
      await createPost(user, formData);

      // Reset
      setFile(null);
      setPreview(null);
      setCaption("");
      setValidationState("idle");
      onPostUploaded();
    } catch (err) {
      setError("Upload failed. Please try again.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  return (
    <section className="upload-section">
      <div className="upload-header">
        <div className="upload-avatar">
          {user.email?.charAt(0).toUpperCase()}
        </div>
        <label className="upload-file-label" htmlFor="file-input">
          {modelLoading ? "⏳ Loading AI model…" : "Share a dog moment…"}
        </label>
      </div>

      <input
        id="file-input"
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        disabled={modelLoading || !model || validationState === "classifying"}
      />

      {preview && (
        <div className="upload-preview">
          <img src={preview} alt="Preview" />
        </div>
      )}

      {validationState === "classifying" && (
        <p className="upload-status classifying">🔍 Analysing image…</p>
      )}
      {validationState === "invalid" && (
        <p className="upload-status invalid">❌ Only dog images are allowed!</p>
      )}
      {validationState === "valid" && (
        <p className="upload-status valid">
          ✅ Dog detected! Add a caption and post.
        </p>
      )}

      {validationState === "valid" && (
        <>
          <input
            type="text"
            placeholder="Write a caption…"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={uploading}
          />
          <button onClick={handleUpload} disabled={uploading}>
            {uploading ? "Uploading…" : "Share Post"}
          </button>
        </>
      )}

      {error && <p className="upload-status invalid">{error}</p>}

      {/* Hidden img for TensorFlow classification */}
      <img
        ref={imageRef}
        style={{ display: "none" }}
        alt=""
        crossOrigin="anonymous"
      />
    </section>
  );
}

export default Upload;
