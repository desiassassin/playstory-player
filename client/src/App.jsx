import { useEffect, useState } from "react";
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

     useEffect(() => {
          const updateTrackBarInterval = setInterval(() => {
               const video = document.getElementById(`video-${currentVideo.name}`);
               const trackbar = document.getElementById("track-bar");
               const { currentTime, duration, paused } = video;

               if (!paused) trackbar.value = (currentTime / duration) * 100;
          }, 100);

          return () => {
               clearInterval(updateTrackBarInterval);
          };
     }, []);

     function playPauseCurrentVideo(event) {
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

     return (
          <>
               {/* Render Videos */}
               {/* {currentVideo.map(({ name, src, show }) => ( */}
               <video
                    // key={currentVideo.name}
                    id={`video-${currentVideo.name}`}
                    className={!currentVideo.show ? "hidden" : ""}
                    src={currentVideo.src}
                    muted
               ></video>
               {/* ))} */}
               {/* custom controls */}
               <div id="control-wrapper" onClick={playPauseCurrentVideo}>
                    <div id="control-bar" onClick={(event) => event.stopPropagation()}>
                         <RestartButton id="restart-button" />
                         <input id="track-bar" type="range" min={0} max={100} step={1} />
                         {videoIsMuted ? (
                              <MutedButton id="muted-button" onClick={() => setVideoIsMuted(false)} />
                         ) : (
                              <SoundButton id="sound-button" onClick={() => setVideoIsMuted(true)} />
                         )}
                         <FullscreenButton id="fullscreen-button" />
                    </div>
                    {/* <button id="previous-button" onClick={playPreviousVideo}>
                         Previous Video
                    </button> */}
                    {!videoIsPlaying && (
                         <div id="play-button" onClick={playPauseCurrentVideo}>
                              <PlayButton />
                         </div>
                    )}
                    {/* <button id="next-button" onClick={playNextVideo}>
                         Next Video
                    </button> */}
               </div>
               {/* End screen */}
               <div id="end-screen" className={end ? "show" : ""}>
                    Interactive video has ended. Reload the page.
               </div>
          </>
     );
}

export default App;
