import { useState, useRef } from "react";
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

// MobileNet returns its top guesses sorted by confidence. We accept an image
// only when the single most-confident guess is a dog breed AND that guess
// clears a real confidence bar. The previous logic accepted *any* top guess
// above 10%, which let non-dog images (e.g. a person) pass on a weak dog
// match buried lower in the results.
const DOG_CONFIDENCE_THRESHOLD = 0.4;

function isDogLabel(className) {
  const label = className.toLowerCase();
  return DOG_INDICATORS.some((word) => label.includes(word));
}

function isDogImage(predictions) {
  if (!predictions || predictions.length === 0) return false;
  const top = predictions[0];
  return (
    top.probability >= DOG_CONFIDENCE_THRESHOLD && isDogLabel(top.className)
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

  // Lazy-load TensorFlow.js + MobileNet only when the user actually picks an
  // image. Using dynamic import() code-splits this ~1.4MB of JS into its own
  // chunk, so it's downloaded on first upload instead of bloating the initial
  // Feed bundle. Cached in a ref so it loads at most once per session.
  const loadModel = async () => {
    if (modelRef.current) return modelRef.current;
    const tf = await import("@tensorflow/tfjs");
    await import("@tensorflow/tfjs-backend-webgl");
    const mobilenet = await import("@tensorflow-models/mobilenet");
    await tf.ready();
    modelRef.current = await mobilenet.load();
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
          const predictions = await model.classify(img);
          setValidationState(isDogImage(predictions) ? "valid" : "invalid");
        } catch (err) {
          console.error("Classification error:", err);
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
          Share a dog moment…
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
