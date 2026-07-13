import { useState, useRef } from "react";
import { createPost } from "../services/api";

// COCO-SSD is an object *detector*: it finds individual objects in an image and
// labels each one (dog, cat, person, …) with a confidence score. We accept an
// upload when a dog or cat is detected above a confidence bar, and reject
// everything else — so a photo of a person is correctly rejected. This fixes
// the old false positives from whole-image classification (where a human could
// pick up a weak "dog" label) and lets the app cover all pets, not just dogs.
const PET_CLASSES = ["dog", "cat"];
const PET_CONFIDENCE_THRESHOLD = 0.5;

function isPetImage(predictions) {
  return predictions.some(
    (p) => PET_CLASSES.includes(p.class) && p.score >= PET_CONFIDENCE_THRESHOLD,
  );
}

function Upload({ user, onPostUploaded }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [validationState, setValidationState] = useState("idle"); // idle | classifying | valid | invalid
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const imageRef = useRef();
  const modelRef = useRef(null);

  // Lazy-load TensorFlow.js + COCO-SSD only when the user picks an image.
  // Dynamic import() code-splits this ML code into its own chunk so it's
  // downloaded on first upload instead of bloating the initial Feed bundle.
  // Cached in a ref so it loads at most once per session.
  const loadModel = async () => {
    if (modelRef.current) return modelRef.current;
    const tf = await import("@tensorflow/tfjs");
    await import("@tensorflow/tfjs-backend-webgl");
    const cocoSsd = await import("@tensorflow-models/coco-ssd");
    await tf.ready();
    modelRef.current = await cocoSsd.load();
    return modelRef.current;
  };

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
          const model = await loadModel();
          const predictions = await model.detect(img);
          setValidationState(isPetImage(predictions) ? "valid" : "invalid");
        } catch (err) {
          console.error("Detection error:", err);
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
          Share a pet moment…
        </label>
      </div>

      <input
        id="file-input"
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        disabled={validationState === "classifying"}
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
        <p className="upload-status invalid">
          ❌ Only pet photos (dogs &amp; cats) are allowed!
        </p>
      )}
      {validationState === "valid" && (
        <p className="upload-status valid">
          ✅ Pet detected! Add a caption and post.
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

      {/* Hidden img used as the source for COCO-SSD detection */}
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
