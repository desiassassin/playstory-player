import { useState } from "react";
import { ReactComponent as PlayButton } from "./assets/svg/playButton.svg";
import { ReactComponent as RestartButton } from "./assets/svg/restartButton.svg";
import { ReactComponent as MutedButton } from "./assets/svg/mutedButton.svg";
import { ReactComponent as SoundButton } from "./assets/svg/soundButton.svg";
import { ReactComponent as FullscreenButton } from "./assets/svg/fullscreenButton.svg";

// import short videos
import caterpillarVideo from "./assets/videos/caterpillar.mp4";
import fishVideo from "./assets/videos/fish.mp4";
import noiseVideo from "./assets/videos/noise.mp4";
import rabbitVideo from "./assets/videos/rabbit.mp4";

function App() {
     const [videos, setVideos] = useState([
          {
               name: "caterpillar",
               src: caterpillarVideo,
               show: true
          },
          {
               name: "fish",
               src: fishVideo,
               show: false
          },
          {
               name: "rabbit",
               src: rabbitVideo,
               show: false
          },
          {
               name: "noise",
               src: noiseVideo,
               show: false
          }
     ]);
     const [currentVideo] = videos.filter(({ show }) => show);
     const [videoIsPlaying, setVideoIsPlaying] = useState(false);
     const [videoIsMuted, setVideoIsMuted] = useState(false);
     const [end, setEnd] = useState(false);

     function playPause(event) {
          // stop the event from going to the parent
          event.stopPropagation();

          const videoBeingShownCurrently = videos.find(({ show }) => show);
          const videoElement = document.getElementById(`video-${videoBeingShownCurrently.name}`);

          if (videoElement.paused) {
               videoElement.play();
               setVideoIsPlaying(true);
          } else {
               videoElement.pause();
               setVideoIsPlaying(false);
          }
     }

     function playNextVideo() {
          const indexOfCurrentVideo = videos.findIndex(({ show }) => show);

          // this is the last video
          if (indexOfCurrentVideo === videos.length - 1) return setEnd(true);

          // display the next video
          setVideos((previousState) => {
               previousState[indexOfCurrentVideo].show = false;
               previousState[indexOfCurrentVideo + 1].show = true;

               return [...previousState];
          });
     }

     function playPreviousVideo() {
          const indexOfCurrentVideo = videos.findIndex(({ show }) => show);

          // this is the first video
          if (indexOfCurrentVideo === 0) return;

          // display the previous video
          setVideos((previousState) => {
               previousState[indexOfCurrentVideo].show = false;
               previousState[indexOfCurrentVideo - 1].show = true;

               return [...previousState];
          });
     }

     function updateTrackbar(event) {
          const { currentTime, duration, paused } = event.target;
          const trackbar = document.getElementById("track-bar");

          if (!paused) trackbar.value = Math.ceil((currentTime / duration) * 100);
     }

     function restartVideo() {
          const video = document.getElementById(`video-${currentVideo.name}`);
          const trackbar = document.getElementById("track-bar");

          // reset trackbar, video and play the video
          video.currentTime = 0;
          trackbar.value = 0;
          video.play();
          setVideoIsPlaying(true);
     }

     function seekVideo(event) {
          const { max, value } = event.target;
          const video = document.getElementById(`video-${currentVideo.name}`);
          const seekPoint = (value / max).toFixed(2);
          video.currentTime = (video.duration * seekPoint).toFixed(3);
     }

     function toggleMute() {
          const video = document.getElementById(`video-${currentVideo.name}`);
          video.volume = videoIsMuted ? 1 : 0;

          setVideoIsMuted((previousState) => !previousState);
     }

     function toggleFullScreen() {
          return !document.fullscreenElement ? document.documentElement.requestFullscreen() : document.exitFullscreen();
     }

     function toggleControlBar(event) {
          const controlBar = document.getElementById("control-bar");
          const video = document.getElementById(`video-${currentVideo.name}`);
          const [from, to] = [{ opacity: controlBar.style.opacity }, {}];
          const animationOptions = {
               duration: 250,
               fill: "forwards"
          };

          // onMouseEnter | keep the controlbar hidden until the video starts
          if (event.type === "mouseenter") to.opacity = video.currentTime === 0 ? "0" : "1";

          // onMouseLeave | always hide the controlbar when mouse moves out
          if (event.type === "mouseleave") to.opacity = "0";

          controlBar.animate([from, to], animationOptions);
     }

     return (
          <>
               {/* Render video */}
               <video
                    id={`video-${currentVideo.name}`}
                    className={!currentVideo.show ? "hidden" : ""}
                    src={currentVideo.src}
                    onTimeUpdate={updateTrackbar}
                    onLoadedData={() => {
                         document.getElementById("track-bar").value = 0;
                    }}
                    onEnded={() => {
                         const trackbar = document.getElementById("track-bar");
                         trackbar.value = trackbar.max;
                    }}
               ></video>

               {/* custom controls */}
               <div id="control-wrapper" onClick={playPause} onMouseEnter={toggleControlBar} onMouseLeave={toggleControlBar}>
                    <div id="control-bar" onClick={(event) => event.stopPropagation()}>
                         <RestartButton id="restart-button" onClick={restartVideo} />
                         <input id="track-bar" type="range" min={0} max={100} step={1} onChange={seekVideo} />
                         {videoIsMuted ? (
                              <MutedButton id="muted-button" onClick={toggleMute} />
                         ) : (
                              <SoundButton id="sound-button" onClick={toggleMute} />
                         )}
                         <FullscreenButton id="fullscreen-button" onClick={toggleFullScreen} />
                    </div>
                    {!videoIsPlaying && (
                         <div id="play-button">
                              <PlayButton />
                         </div>
                    )}
               </div>

               {/* End screen */}
               <div id="end-screen" className={end ? "show" : ""}>
                    Interactive video has ended. Reload the page.
               </div>
          </>
     );
}

export default App;
