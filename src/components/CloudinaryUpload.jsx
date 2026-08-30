import { useEffect, useRef } from "react";

import Notiflix from "notiflix";

import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
} from "../config/cloudinary";

const CloudinaryUpload = ({ onUpload }) => {
  const widgetRef = useRef(null);
  const widgetInitialized = useRef(false);

  useEffect(() => {
    if (widgetInitialized.current || !window.cloudinary) {
      return;
    }

    widgetRef.current = window.cloudinary.createUploadWidget(
      {
        cloudName: CLOUDINARY_CLOUD_NAME,

        uploadPreset: CLOUDINARY_UPLOAD_PRESET,

        sources: ["local", "camera"],

        multiple: false,

        cropping: true,

        croppingAspectRatio: 1,

        showAdvancedOptions: false,

        showSkipCropButton: false,

        resourceType: "image",

        clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],

        maxImageFileSize: 10000000,

        folder: "kunpaos/products",

        styles: {
          palette: {
            window: "#2c1e1a",
            windowBorder: "#765238",
            tabIcon: "#f0c14b",
            menuIcons: "#f0c14b",
            textDark: "#2c1e1a",
            textLight: "#fffdf9",
            link: "#f0c14b",
            action: "#f0c14b",
            inactiveTabIcon: "#9a8c83",
          },
        },
      },

      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);

          Notiflix.Notify.failure("Nem sikerült feltölteni a képet.");

          return;
        }

        if (result?.event === "success") {
          const imageData = result.info;

          onUpload({
            url: imageData.secure_url,

            publicId: imageData.public_id,

            width: imageData.width,

            height: imageData.height,

            format: imageData.format,
          });

          Notiflix.Notify.success("Sikeres képfeltöltés!");
        }
      },
    );

    widgetInitialized.current = true;

    return () => {
      if (widgetRef.current?.destroy) {
        widgetRef.current.destroy();
      }

      widgetRef.current = null;

      widgetInitialized.current = false;
    };
  }, [onUpload]);

  const openWidget = () => {
    if (!widgetRef.current) {
      Notiflix.Notify.failure("A képfeltöltő még nem érhető el.");

      return;
    }

    widgetRef.current.open();
  };

  return (
    <button
      type="button"
      onClick={openWidget}
      className="addProduct__uploadButton"
    >
      ☁ Kép feltöltése
    </button>
  );
};

export default CloudinaryUpload;
