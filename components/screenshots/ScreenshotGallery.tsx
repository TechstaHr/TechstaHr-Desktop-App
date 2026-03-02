"use client";

import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";

interface ScreenshotGalleryProps {
  screenshots: string[];
  taskTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

const ScreenshotGallery: React.FC<ScreenshotGalleryProps> = ({
  screenshots,
  taskTitle,
  isOpen,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen || screenshots.length === 0) return null;

  const currentScreenshot = screenshots[currentIndex];

  const openImageInNewTab = (imageUrl: string) => {
    window.open(imageUrl, "_blank", "noopener,noreferrer");
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : screenshots.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < screenshots.length - 1 ? prev + 1 : 0));
  };

  const downloadScreenshot = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Failed to download screenshot:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative max-h-[90vh] max-w-[90vw] rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Screenshots for {taskTitle}
            </h2>
            <p className="text-sm text-gray-500">
              {currentIndex + 1} of {screenshots.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Main Image Area */}
        <div className="relative flex items-center justify-center bg-gray-50 p-4">
          {screenshots.length > 1 && (
            <button
              onClick={goToPrevious}
              className="absolute left-4 z-10 rounded-full bg-black bg-opacity-50 p-2 text-white transition-all hover:bg-opacity-70"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          <div
            onClick={() => openImageInNewTab(currentScreenshot)}
            className="max-h-[60vh] max-w-4xl overflow-hidden rounded-lg shadow-lg"
          >
            <img
              src={currentScreenshot}
              alt={`Screenshot ${currentIndex + 1}`}
              className="h-full w-full object-contain"
              style={{ maxHeight: "60vh" }}
            />
          </div>

          {screenshots.length > 1 && (
            <button
              onClick={goToNext}
              className="absolute right-4 z-10 rounded-full bg-black bg-opacity-50 p-2 text-white transition-all hover:bg-opacity-70"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>

        {/* Screenshot Info and Actions */}
        <div className="border-t bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() =>
                downloadScreenshot(
                  currentScreenshot,
                  `screenshot-${taskTitle}-${currentIndex + 1}.png`,
                )
              }
              className="flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-700"
            >
              <Download size={16} />
              Download
            </button>
          </div>
        </div>

        {/* Thumbnail Navigation (if more than 1 screenshot) */}
        {screenshots.length > 1 && (
          <div className="border-t p-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {screenshots.map((screenshot, index) => (
                <button
                  key={screenshot}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                    index === currentIndex
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <img
                    src={screenshot}
                    alt={`Thumbnail ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScreenshotGallery;
