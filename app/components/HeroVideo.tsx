"use client";
import { useEffect, useRef, useState } from "react";

export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setPlaying(true);
        }).catch(() => {
          video.muted = true;
          video.play().then(() => setPlaying(true)).catch(() => {});
        });
      }
    }
  }, []);

  const handleClick = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  return (
    <div className="absolute inset-0 w-full h-full" onClick={handleClick}>
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        style={{width:"100%", height:"100%", objectFit:"cover"}}
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 cursor-pointer">
          <div className="text-center">
            <div className="text-6xl mb-4">▶</div>
            <p className="text-xs tracking-widest text-gray-400">TAP TO PLAY</p>
          </div>
        </div>
      )}
    </div>
  );
}
