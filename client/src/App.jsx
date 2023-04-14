import { useState } from "react";

// import short videos
import caterpillarVideo from "./assets/caterpillar.mp4";
import fishVideo from "./assets/fish.mp4";
import noiseVideo from "./assets/noise.mp4";
import rabbitVideo from "./assets/rabbit.mp4";

// const VIDEOS = ;

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

     function playPauseCurrentVideo() {
          const videoBeingShownCurrently = videos.find(({ show }) => show);
          const videoElement = document.getElementById(`video-${videoBeingShownCurrently.name}`);

          return videoElement.paused ? videoElement.play() : videoElement.pause();
     }

     return (
          <>
               {/* Render Videos */}
               {videos.map(({ name, src, show }) => (
                    <video key={name} id={`video-${name}`} className={`${!show && "hidden"}`} src={src}></video>
               ))}

               {/* custom controls */}
               <div className="controls">
                    <button id="previous-button" onClick={(event) => console.log("previous")}>
                         Previous Video
                    </button>
                    <button id="play-button" onClick={playPauseCurrentVideo}>
                         Play / Pause Video
                    </button>
                    <button id="next-button" onClick={(event) => console.log("next")}>
                         Next Video
                    </button>
               </div>
          </>
     );
}

export default App;
