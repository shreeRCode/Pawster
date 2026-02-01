import { useEffect, useState, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import * as mobilenet from "@tensorflow-models/mobilenet";

const BASE_API_URL = "https://pawster-pi.vercel.app";

function Upload({ user, onPostUploaded }) {
  const [model, setModel] = useState(null);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [isValid, setIsValid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [classifying, setClassifying] = useState(false);
  const imageRef = useRef();

  const loadModel = async () => {
    try {
      await tf.ready();
      console.log("TensorFlow backend initialized:", tf.getBackend());

      const loadedModel = await mobilenet.load();
      setModel(loadedModel);
      setLoading(false);
      console.log("MobileNet model loaded successfully");
    } catch (error) {
      console.error("Error loading model:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModel();
  }, []);

  const isDog = (predictions) => {
    console.log("=== Starting Dog Detection ===");
    console.log("All predictions:", predictions);

    // Common words that indicate it's a dog
    const dogIndicators = [
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
      "eskimo",
      "samoyed",
      "spitz",
      "schipperke",
      "bouvier",
      "briard",
      "vizsla",
      "weimaraner",
    ];

    for (const p of predictions) {
      const className = p.className.toLowerCase();

      // Check if any dog indicator is in the class name
      const matchesDog = dogIndicators.some((indicator) =>
        className.includes(indicator),
      );

      console.log(`Class: "${p.className}"`);
      console.log(`Probability: ${(p.probability * 100).toFixed(2)}%`);
      console.log(`Matches dog: ${matchesDog}`);
      console.log("---");

      // If it matches and has reasonable confidence
      if (matchesDog && p.probability > 0.1) {
        console.log(
          `✅ DOG DETECTED! (${p.className} - ${(p.probability * 100).toFixed(2)}%)`,
        );
        return true;
      }
    }

    console.log("❌ No dog detected in predictions");
    return false;
  };

  const handleImageChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    console.log("File selected:", selectedFile.name);

    setFile(selectedFile);
    setIsValid(null);
    setClassifying(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = imageRef.current;
      img.src = event.target.result;

      img.onload = async () => {
        console.log("Image loaded, starting classification...");

        if (model) {
          try {
            const predictions = await model.classify(img);
            const isDogImage = isDog(predictions);

            console.log("=== FINAL RESULT ===");
            console.log(
              `Is this a dog image? ${isDogImage ? "YES ✅" : "NO ❌"}`,
            );

            setIsValid(isDogImage);
            setClassifying(false);
          } catch (error) {
            console.error("Classification error:", error);
            setIsValid(false);
            setClassifying(false);
          }
        } else {
          console.error("Model not loaded!");
          setClassifying(false);
        }
      };

      img.onerror = () => {
        console.error("Failed to load image");
        setClassifying(false);
      };
    };

    reader.onerror = () => {
      console.error("Failed to read file");
      setClassifying(false);
    };

    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!isValid) {
      alert("Only dog images allowed!");
      return;
    }

    const token = await user.getIdToken();

    const formData = new FormData();
    formData.append("image", file);
    formData.append("caption", caption);

    try {
      const response = await fetch(`${BASE_API_URL}/api/posts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        setCaption("");
        setFile(null);
        setIsValid(null);
        onPostUploaded();
        alert("Post uploaded successfully! 🎉");
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload post");
    }
  };

  if (!user) return null;

  return (
    <section className="upload-section">
      {loading && <p>⏳ Loading AI model...</p>}

      <input
        type="file"
        onChange={handleImageChange}
        disabled={loading || !model || classifying}
        accept="image/*"
      />

      <input
        type="text"
        placeholder="Write a caption..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        disabled={!file || classifying}
      />

      <button onClick={handleUpload} disabled={isValid !== true || classifying}>
        Upload
      </button>

      {classifying && <p style={{ color: "blue" }}>🔍 Analyzing image...</p>}

      {!classifying && isValid === false && (
        <p style={{ color: "red" }}>❌ Only dog images are allowed!</p>
      )}

      {!classifying && isValid === true && (
        <p style={{ color: "green" }}>✅ Dog detected! Ready to upload.</p>
      )}

      <img
        ref={imageRef}
        style={{ display: "none" }}
        alt="preview"
        crossOrigin="anonymous"
      />
    </section>
  );
}

export default Upload;
