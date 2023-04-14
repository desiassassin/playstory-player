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

     return (
          <>
               {/* Render Videos */}
               {videos.map(({ name, src, show }) => (
                    <video key={name} id={`video-${name}`} className={`${!show && "hidden"}`} src={src}></video>
               ))}

               {/* custom controls */}
               <div className="controls">
                    <button id="play-button">Previous Video</button>
                    <button id="play-button">Play Video</button>
                    <button id="play-button">Next Video</button>
               </div>
          </>
     );
}

export default App;
