"use client";
import { useState, useRef } from "react";

interface MediaItem {
  url: string;
  type: "image" | "video";
  name: string;
}

interface MediaUploadProps {
  onMediaChange?: (media: MediaItem[]) => void;
}

export default function MediaUpload({ onMediaChange }: MediaUploadProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);

    const newItems: MediaItem[] = [];

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("fileName", file.name);
        formData.append("folder", "products");

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (data.url) {
          const isVideo = file.type.startsWith("video/");
          newItems.push({
            url: data.url,
            type: isVideo ? "video" : "image",
            name: file.name,
          });
        }
      } catch {
        const isVideo = file.type.startsWith("video/");
        const localUrl = URL.createObjectURL(file);
        newItems.push({
          url: localUrl,
          type: isVideo ? "video" : "image",
          name: file.name,
        });
      }
    }

    const updated = [...mediaItems, ...newItems];
    setMediaItems(updated);
    onMediaChange?.(updated);
    setUploading(false);
  };

  const removeItem = (index: number) => {
    const updated = mediaItems.filter((_, i) => i !== index);
    setMediaItems(updated);
    setSelectedIndex(Math.min(selectedIndex, updated.length - 1));
    onMediaChange?.(updated);
  };

  const selected = mediaItems[selectedIndex];

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-gray-900 w-full aspect-square flex items-center justify-center border border-gray-800 relative overflow-hidden">
        {selected ? (
          selected.type === "video" ? (
            <video src={selected.url} controls className="w-full h-full object-cover"/>
          ) : (
            <img src={selected.url} alt={selected.name} className="w-full h-full object-cover"/>
          )
        ) : (
          <div className="text-center">
            <p className="text-gray-700 text-xs tracking-widest mb-2">NO MEDIA UPLOADED</p>
            <p className="text-gray-800 text-xs">Click below to upload</p>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
            <p className="text-white text-xs tracking-widest">UPLOADING...</p>
          </div>
        )}
      </div>

      {mediaItems.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {mediaItems.map((item, i) => (
            <div key={i} className="relative group">
              <div
                onClick={() => setSelectedIndex(i)}
                className={`w-16 h-16 border cursor-pointer overflow-hidden flex items-center justify-center bg-gray-900 ${selectedIndex === i ? "border-white" : "border-gray-700 hover:border-gray-500"}`}
              >
                {item.type === "video" ? (
                  <div className="text-center">
                    <p className="text-white text-lg">▶</p>
                    <p className="text-gray-500 text-xs">VIDEO</p>
                  </div>
                ) : (
                  <img src={item.url} alt={item.name} className="w-full h-full object-cover"/>
                )}
              </div>
              <button
                onClick={() => removeItem(i)}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-xs rounded-full hidden group-hover:flex items-center justify-center"
              >×</button>
            </div>
          ))}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-16 h-16 border border-dashed border-gray-700 cursor-pointer flex items-center justify-center hover:border-gray-400 transition"
          >
            <p className="text-gray-500 text-2xl">+</p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleUpload}
        className="hidden"
      />

      {mediaItems.length === 0 && (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full border border-dashed border-gray-700 py-6 text-xs tracking-widest text-gray-500 hover:border-gray-400 hover:text-gray-300 transition"
        >
          + CLICK TO UPLOAD IMAGES & VIDEOS
          <p className="text-gray-700 text-xs mt-1 normal-case tracking-normal">Unlimited images and videos — JPG, PNG, WEBP, MP4, MOV</p>
        </button>
      )}
    </div>
  );
}
