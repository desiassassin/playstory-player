import styled from "styled-components";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ReactPlayer from "react-player";
import { BASE_URL, VIDEO_SERVER_URL } from "../env";
import { ReactComponent as FullscreenButton } from "../assets/svg/fullscreenButton.svg";
import { ReactComponent as MutedButton } from "../assets/svg/mutedButton.svg";
import { ReactComponent as PlayButton } from "../assets/svg/playButton.svg";
import { ReactComponent as RestartButton } from "../assets/svg/restartButton.svg";
import { ReactComponent as SoundButton } from "../assets/svg/soundButton.svg";
import Loader from "./Loader";
import { useRef } from "react";

export default function PlaystoryPlayer() {
     const { playstoryID } = useParams();
     const [playstory, setPlaystory] = useState();
     const [loading, setLoading] = useState(false);
     const [showEndScreen, setShowEndScreen] = useState(false);
     const [reactPlayerProps, setReactPlayerProps] = useState({
          url: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.mp4/.m3u8",
          playing: false,
          volume: 1,
          muted: false,
          progressInterval: 250
     });
     const PlayerRef = useRef();

     useEffect(() => {
          // add event listener to the video to pause the video when user clicks on it
          const video = document.querySelector("video");

          if (video) {
               video.onclick = pause;
               video.onmouseenter = showControlBar;
               video.onmouseout = hideControlBar;
          }

          //  (async function () {
          //       const response = await axios({ url: `${BASE_URL}/api/playstory/${playstoryID}` });

          //       if (response.data.success === true) {
          //            setPlaystory(response.data);
          //            setLoading(false);

          //            /* Uncomment the code below to show playstory clip */
          //            // const url = response.data.to_show_now.data.clip.url;
          //            //  const baseURL = VIDEO_SERVER_URL;
          //            // setReactPlayerProps(previousState => ({...previousState, url: `${baseURL}${url}`}));
          //       }
          //  })();

          return function () {
               if (video) video.onclick = null;
          };
     }, [playstory, loading, reactPlayerProps]);

     function play() {
          setReactPlayerProps((previousState) => ({ ...previousState, playing: true }));
          showControlBar();
     }

     function pause() {
          setReactPlayerProps((previousState) => ({ ...previousState, playing: false }));
     }
     function restart() {
          PlayerRef.current.seekTo(0, "seconds");
     }
     function seek(event) {
          PlayerRef.current.seekTo(event.target.value, "seconds");
     }
     function toggleMute() {
          setReactPlayerProps((previousState) => ({ ...previousState, muted: !previousState.muted }));
     }
     function toggleFullscreen() {
          return !document.fullscreenElement ? document.documentElement.requestFullscreen() : document.exitFullscreen();
     }

     function updateTrackbarOnLoad(duration) {
          const trackbar = document.getElementById("trackbar");
          trackbar.value = 0;
          trackbar.max = duration;
     }

     function updateTrackbar(event) {
          const trackbar = document.getElementById("trackbar");
          trackbar.value = event.playedSeconds;
     }

     function videoEnded() {
          setShowEndScreen(true);
     }

     function showControlBar() {
          const controlBar = document.getElementById("control-bar");
          controlBar.style.visibility = "visible";
     }

     function hideControlBar(event) {
          if (event.toElement?.id === "control-bar") return;

          const controlBar = document.getElementById("control-bar");
          controlBar.style.visibility = "hidden";
     }

     return (
          <Wrapper>
               <Loader loading={loading} />

               <ReactPlayer
                    ref={PlayerRef}
                    height="100vh"
                    width="100vw"
                    style={{ overflow: "hidden", zIndex: "1", position: "absolute", objectFit: "cover" }}
                    {...reactPlayerProps}
                    onDuration={updateTrackbarOnLoad}
                    onProgress={updateTrackbar}
                    onEnded={videoEnded}
               />

               <ControlBar id="control-bar">
                    <RestartButton id="restart-button" onClick={restart} />
                    <input id="trackbar" type="range" min={0} max={1000} step={1} onChange={seek} />
                    {reactPlayerProps.muted ? (
                         <MutedButton id="muted-button" onClick={toggleMute} />
                    ) : (
                         <SoundButton id="sound-button" onClick={toggleMute} />
                    )}
                    <FullscreenButton id="fullscreen-button" onClick={toggleFullscreen} />
               </ControlBar>

               {!reactPlayerProps.playing && (
                    <PlayButtonWrapper onClick={play}>
                         <PlayButton />
                         <h1 id="start-text">Begin an interactive conversation.</h1>
                    </PlayButtonWrapper>
               )}

               {/* <Options>
               {[{ title: "I'm just looking" }, { title: "What's this?" }, { title: "What's that?" }, { title: "Sorry, I'm not interested" }].map(({ title }, index) => {
                         return (
                              <div className="option">
                                   <span className="option-number">{index + 1}</span>
                                   <p className="option-title">{title}</p>
                              </div>
                         );
                    })}
               </Options> */}

               {showEndScreen && <EndScreen>Interactive video has ended.</EndScreen>}
          </Wrapper>
     );
}

const Wrapper = styled.div`
     min-height: 100vh;
     position: relative;
`;

const ControlBar = styled.div`
     position: absolute;
     z-index: 2;
     padding: 1rem;
     display: flex;
     align-items: center;
     gap: 1rem;
     background-image: linear-gradient(rgba(0, 0, 0, 0.9), transparent);
     width: 100%;
     visibility: hidden;

     #trackbar {
          flex-grow: 1;
          cursor: pointer;
          padding: 0 !important;
     }

     svg {
          --size: 25px;
          cursor: pointer;
          transition: scale 150ms;
          width: var(--size);
          height: var(--size);

          :hover {
               scale: 1.25;
          }
     }
`;
const PlayButtonWrapper = styled.div`
     position: absolute;
     inset: 0;
     display: flex;
     flex-direction: column;
     gap: 1rem;
     align-items: center;
     justify-content: center;
     z-index: 3;
     background-color: rgba(0, 0, 0, 0.5);

     svg:hover {
          transition: scale 150ms;
          scale: 1.1;
          cursor: pointer;
     }

     #start-text {
          font-size: 18px;
          width: max-content;
          font-weight: normal;
          color: white;
          user-select: none;
     }
`;

const Options = styled.div`
     width: clamp(300px, 100%, 900px);
     position: absolute;
     z-index: 2;
     left: 50%;
     bottom: 1rem;
     translate: -50%;
     display: grid;
     grid-template-columns: repeat(auto-fit, minmax(275px, 1fr));
     gap: 1rem;

     padding-block: 2rem;

     .option {
          display: flex;
          align-items: center;
          gap: 1rem;
          width: 275px;

          background-color: black;
          padding: 0.25rem 1rem;
          border-radius: 100px;

          margin: auto;

          .option-number {
               --size: 30px;
               min-height: var(--size);
               min-width: var(--size);
               display: flex;
               justify-content: center;
               align-items: center;
               border-radius: 50%;
               background-color: #fff;
               color: black;
               font-weight: bold;
               font-size: 1.25rem;
          }

          .option-title {
               color: white;
          }
     }
`;

const EndScreen = styled.div`
     position: absolute;
     z-index: 4;
     inset: 0;
     backdrop-filter: blur(10px);
     background-color: rgba(0, 0, 0, 0.25);
     color: white;
     display: grid;
     place-items: center;
`;

/* video urls */
// live gaming talk: "https://moctobpltc-i.akamaihd.net/hls/live/571329/eight/playlist.m3u8",
