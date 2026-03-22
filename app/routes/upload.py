# app/routes/upload.py
"""Upload & AI Classification Module — REAL predictions only."""

import os
import io

os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from fastapi.responses import JSONResponse
from PIL import Image
import numpy as np
import requests as http_requests

router = APIRouter(prefix="/upload", tags=["Upload & Prediction"])

BASE_DIR  = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_DIR = os.path.join(BASE_DIR, "app", "models")
DEFAULT_MODEL_PATH = os.path.join(MODEL_DIR, "Brain_Tumor_Model.h5")

# Lazy-loaded model
_model = None
_model_loaded = False
_model_error  = None
_active_model_path = None
_model_mode = None


def _discover_model_candidates():
    """Return available local model files in priority order."""
    candidates = []

    env_model = os.getenv("BRAIN_TUMOR_MODEL_PATH")
    if env_model:
        candidates.append(env_model)

    # Keep original expected path first for backward compatibility.
    candidates.append(DEFAULT_MODEL_PATH)

    search_dirs = [MODEL_DIR, BASE_DIR]
    for search_dir in search_dirs:
        if os.path.isdir(search_dir):
            for name in sorted(os.listdir(search_dir)):
                if name.lower().endswith((".h5", ".keras")):
                    candidates.append(os.path.join(search_dir, name))

    seen = set()
    unique = []
    for path in candidates:
        norm = os.path.normpath(path)
        if norm not in seen:
            seen.add(norm)
            unique.append(norm)
    return unique


def _resolve_model_path():
    """Pick the first existing model path from discovered candidates."""
    for path in _discover_model_candidates():
        if os.path.isfile(path):
            return path
    return None


def _build_legacy_vgg16_4class_model():
    """Build legacy architecture used by common public brain tumor VGG16 weight files."""
    import tensorflow as tf

    base = tf.keras.applications.VGG16(weights=None, include_top=False, input_shape=(224, 224, 3), name="vgg16")
    for layer in base.layers:
        layer.trainable = False

    inputs = tf.keras.Input(shape=(224, 224, 3), name="legacy_input")
    x = base(inputs)
    x = tf.keras.layers.Lambda(
        lambda t: t[0] if isinstance(t, (list, tuple)) else t,
        name="ensure_tensor",
    )(x)
    x = tf.keras.layers.Flatten(name="flatten_1")(x)
    x = tf.keras.layers.Dropout(0.4, name="dropout_1")(x)
    outputs = tf.keras.layers.Dense(4, activation="softmax", name="dense_3")(x)
    model = tf.keras.Model(inputs=inputs, outputs=outputs, name="legacy_vgg16_4class")
    return model


def _load_legacy_vgg16_weights_manual(model, weights_path):
    """Manually load legacy H5 groups into matching layer names."""
    import h5py

    with h5py.File(weights_path, "r") as h5f:
        mw = h5f.get("model_weights")
        if mw is None:
            raise ValueError("Missing 'model_weights' group in legacy H5 file")

        base = model.get_layer("vgg16")
        vgg_group = mw.get("vgg16")
        if vgg_group is None:
            raise ValueError("Missing 'vgg16' group in model_weights")

        for layer in base.layers:
            if layer.name in vgg_group:
                grp = vgg_group[layer.name]
                if "kernel:0" in grp and "bias:0" in grp:
                    layer.set_weights([grp["kernel:0"][()], grp["bias:0"][()]])

        dense = model.get_layer("dense_3")
        dense_root = mw.get("dense_3")
        if dense_root is None or "dense_3" not in dense_root:
            raise ValueError("Missing dense_3 weights group")
        dense_grp = dense_root["dense_3"]
        dense.set_weights([dense_grp["kernel:0"][()], dense_grp["bias:0"][()]])


def _get_model_image_size(model):
    """Infer expected image size from model input shape, fallback to 224x224."""
    try:
        shape = getattr(model, "input_shape", None)
        if isinstance(shape, list):
            shape = shape[0]
        if shape and len(shape) >= 3:
            h = shape[1]
            w = shape[2]
            if isinstance(h, int) and isinstance(w, int) and h > 0 and w > 0:
                return h, w
    except Exception:
        pass
    return 224, 224


def _normalize_prediction(raw_pred):
    """Return standardized API result fields for binary or multi-class outputs."""
    pred = np.array(raw_pred).squeeze()

    if pred.ndim == 0:
        score = float(pred)
        if score > 0.5:
            return "Tumor Detected", round(score * 100, 2)
        return "No Tumor Detected", round((1 - score) * 100, 2)

    if pred.ndim == 1 and pred.size == 1:
        score = float(pred[0])
        if score > 0.5:
            return "Tumor Detected", round(score * 100, 2)
        return "No Tumor Detected", round((1 - score) * 100, 2)

    # For class probabilities, report top class confidence without pretending class semantics.
    top_idx = int(np.argmax(pred))
    top_conf = float(pred[top_idx])
    return f"Class {top_idx}", round(top_conf * 100, 2)


def _load_model():
    """Load TensorFlow model lazily on first prediction request."""
    global _model, _model_loaded, _model_error, _active_model_path, _model_mode
    if _model_loaded:
        return _model
    _model_loaded = True

    model_path = _resolve_model_path()
    if not model_path:
        _model_error = (
            f"Model file not found. Expected default path: {DEFAULT_MODEL_PATH}. "
            f"You can also set BRAIN_TUMOR_MODEL_PATH to a valid .h5/.keras file."
        )
        print(f"[Upload] ⚠️  {_model_error}")
        return None

    try:
        try:
            from silence_tensorflow import silence_tensorflow
            silence_tensorflow()
        except ImportError:
            pass
        import tensorflow as tf
        try:
            _model = tf.keras.models.load_model(model_path, compile=False)
            _model_mode = "native_load_model"
        except Exception as native_err:
            fallback_err = None
            try:
                legacy_model = _build_legacy_vgg16_4class_model()
                _load_legacy_vgg16_weights_manual(legacy_model, model_path)
                _model = legacy_model
                _model_mode = "legacy_vgg16_manual_h5_fallback"
            except Exception as fallback_ex:
                fallback_err = fallback_ex

            if _model is None:
                raise RuntimeError(
                    f"Native load failed: {native_err}; fallback failed: {fallback_err}"
                )

        _active_model_path = model_path
        print(f"[Upload] ✅ Model loaded successfully from: {_active_model_path} (mode={_model_mode})")
        return _model
    except Exception as e:
        _model_error = f"Failed to load model from '{model_path}': {e}"
        print(f"[Upload] ❌ Error loading model: {e}")
        return None


def _get_geolocation(ip: str) -> dict:
    """Fetch real geolocation for the given IP via ip-api.com."""
    default = {"city": "Unknown", "country": "Unknown", "region": "Unknown", "lat": None, "lon": None}
    try:
        if ip in ("127.0.0.1", "::1", "localhost"):
            pub_ip = http_requests.get("https://api.ipify.org", timeout=3).text.strip()
            resp   = http_requests.get(f"http://ip-api.com/json/{pub_ip}", timeout=3).json()
        else:
            resp = http_requests.get(f"http://ip-api.com/json/{ip}", timeout=3).json()

        if resp.get("status") == "success":
            return {
                "city":    resp.get("city",       "Unknown"),
                "country": resp.get("country",    "Unknown"),
                "region":  resp.get("regionName", "Unknown"),
                "lat":     resp.get("lat"),
                "lon":     resp.get("lon"),
            }
    except Exception:
        pass
    return default


@router.get("/model-status")
async def model_status():
    """Check whether the AI model file is present and ready."""
    discovered = _discover_model_candidates()
    model_path = _resolve_model_path()
    model_exists = model_path is not None
    return {
        "loaded":  model_exists,
        "status":  "ready" if model_exists else "not_loaded",
        "model_path": model_path,
        "model_mode": _model_mode,
        "discovered_candidates": discovered,
        "message": "AI Model Ready" if model_exists else (
            "Model not found. Place a .h5/.keras model in app/models/ as "
            "Brain_Tumor_Model.h5, or set BRAIN_TUMOR_MODEL_PATH."
        ),
        "last_error": _model_error,
    }


@router.post("/mri/")
async def predict_mri(request: Request, file: UploadFile = File(...)):
    """Upload an MRI scan and get a real AI tumor prediction."""
    consent_header = request.headers.get("x-geo-consent", "false").strip().lower()
    geolocation_consent = consent_header in ("1", "true", "yes", "y")

    if file.filename.lower().endswith(".h5"):
        raise HTTPException(status_code=400,
            detail="You uploaded the model file (.h5). Upload a patient MRI image (JPG/PNG).")

    if not file.filename.lower().endswith((".jpg", ".jpeg", ".png")):
        raise HTTPException(status_code=400,
            detail=f"Invalid file type '{file.filename}'. Only JPG/PNG images are allowed.")

    model = _load_model()
    if model is None:
        raise HTTPException(status_code=503,
            detail=(
                "AI model not loaded. Place a valid .h5/.keras model in app/models/ "
                "(recommended name: Brain_Tumor_Model.h5) and restart the server."
            ))

    try:
        target_h, target_w = _get_model_image_size(model)
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert("RGB")
        img = img.resize((target_w, target_h))
        img_array = np.expand_dims(np.array(img) / 255.0, axis=0)

        prediction = model.predict(img_array, verbose=0)
        result, confidence = _normalize_prediction(prediction)

        user_ip = request.client.host
        geo = {"city": "Unknown", "country": "Unknown", "region": "Unknown", "lat": None, "lon": None}
        if geolocation_consent:
            geo = _get_geolocation(user_ip)

        try:
            from app.utils.database import save_prediction, save_interaction
            save_prediction(
                filename=file.filename,
                result=result, confidence=confidence,
                user_ip=user_ip if geolocation_consent else None,
                city=geo["city"], country=geo["country"],
                region=geo["region"], lat=geo["lat"], lon=geo["lon"],
            )
            save_interaction(
                event_type="upload",
                page="/",
                user_ip=user_ip if geolocation_consent else None,
                city=geo["city"],
                country=geo["country"],
                region=geo["region"],
                lat=geo["lat"],
                lon=geo["lon"],
                meta={"filename": file.filename, "result": result, "consent": geolocation_consent},
            )
        except Exception as db_err:
            print(f"[Upload] DB save failed: {db_err}")

        return JSONResponse({
            "result":     result,
            "confidence": f"{confidence}%",
            "filename":   file.filename,
            "model_input_size": f"{target_w}x{target_h}",
            "location":   {"city": geo["city"], "country": geo["country"]},
        })

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")