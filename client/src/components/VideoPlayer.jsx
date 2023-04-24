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
     const [loading, setLoading] = useState(true);
     const [showEndScreen, setShowEndScreen] = useState(false);
     const [reactPlayerProps, setReactPlayerProps] = useState({
          url: "",
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
               video.style.objectFit = "cover";
          }

          return function () {
               if (video) {
                    video.onclick = null;
                    video.onmouseenter = null;
                    video.onmouseout = null;
               }
          };
     }, [playstory, reactPlayerProps]);

     useEffect(() => {
          (async function () {
               if (!playstory) {
                    try {
                         const response = await axios({ url: `${BASE_URL}/api/playstory/${playstoryID}`, method: "GET" });

                         if (response.data.success === true) {
                              const nextClipURL = response.data.to_show_now.data.clip.url;
                              setPlaystory(response.data);
                              setReactPlayerProps((previousState) => ({ ...previousState, url: `${VIDEO_SERVER_URL}${nextClipURL}` }));

                              // show the welcome text
                              document.getElementById("welcome-text").classList.remove("hidden");
                         }
                    } catch (error) {
                         console.log(error.message);
                    } finally {
                         setLoading(false);
                    }
               }
          })();
     }, []);

     function play() {
          setReactPlayerProps((previousState) => ({ ...previousState, playing: true }));

          // hide welcome text
          document.getElementById("welcome-text").classList.add("hidden");
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

     function showHideOptions(event) {
          const options = document.getElementById("options-wrapper");
          const duration = PlayerRef.current.getDuration();
          const timeToShowButtons = (playstory.to_show_now.data.show_after_percent / 100) * duration;
          const shouldShowButtons = event.playedSeconds >= timeToShowButtons;

          shouldShowButtons ? options.classList.add("show") : options.classList.remove("show");
     }

     function videoEnded() {
          if (playstory.to_show_now.type === "end") {
               setShowEndScreen(true);
          }
     }

     function showControlBar() {
          const controlBar = document.getElementById("control-bar");
          controlBar.style.visibility = "visible";
     }

     function hideControlBar(event) {
          if (event.relatedTarget) return;

          const controlBar = document.getElementById("control-bar");
          controlBar.style.visibility = "hidden";
     }

     async function submitAnswer(event) {
          event.preventDefault();
          event.stopPropagation();

          const { id: optionID } = event.currentTarget.dataset;
          const { playstoryID, uniqueID } = playstory;

          setLoading(true);

          try {
               let response;
               const isClip = playstory.to_show_now.type === "clip";
               const isQuestionWithOptions = playstory.to_show_now.type === "question" && playstory.to_show_now.data.answer_type === "Options";

               if (isClip || isQuestionWithOptions) {
                    // submit option request
                    response = await axios({
                         url: `${BASE_URL}/api/answers-add`,
                         method: "POST",
                         data: { playstoryID, optionID, uniqueID }
                    });
               } else {
                    const answer = document.getElementById("answer-input").value;
                    // submit answer request
                    response = await axios({
                         url: `${BASE_URL}/api/answers-add`,
                         method: "POST",
                         data: {
                              uniqueID,
                              playstoryID,
                              type: "question",
                              questionID: playstory.to_show_now.id,
                              question: playstory.to_show_now.data.question,
                              answerType: playstory.to_show_now.data.answer_type,
                              answer
                         }
                    });
               }

               if (response.data.success === true) {
                    const type = response.data.to_show_now.type;

                    switch (type) {
                         case "clip": {
                              const nextClipURL = response.data.to_show_now.data.clip.url;
                              setPlaystory(response.data);
                              setReactPlayerProps((previousState) => ({ ...previousState, url: `${VIDEO_SERVER_URL}${nextClipURL}` }));
                              showHideOptions({ playedSeconds: 0 });
                              break;
                         }
                         case "question": {
                              setPlaystory(response.data);
                              setReactPlayerProps((previousState) => ({ ...previousState, url: "" }));
                              break;
                         }
                         case "link": {
                              const url = response.data.to_show_now.data.link;
                              setReactPlayerProps((previousState) => ({ ...previousState, playing: false }));
                              window.open(url);
                              break;
                         }
                         case "end": {
                              setPlaystory(response.data);
                              setReactPlayerProps((previousState) => ({ ...previousState, playing: false, url: "" }));
                              setShowEndScreen(true);
                              break;
                         }
                         default: {
                              console.error(new Error("Unexpected playstory type recieved"));
                         }
                    }
               }
          } catch (error) {
               console.log(error.message);
          } finally {
               setLoading(false);
          }
     }

     function handleCallToAction(event) {
          const { url } = event.target.dataset;
          window.open(url);
     }

     return (
          <Wrapper>
               <Loader loading={loading} />

               {playstory?.to_show_now.type === "clip" && (
                    <ReactPlayer
                         ref={PlayerRef}
                         height="100vh"
                         width="100vw"
                         style={{ overflow: "hidden", zIndex: "1", position: "absolute", objectFit: "cover", backgroundColor: "black" }}
                         {...reactPlayerProps}
                         onDuration={updateTrackbarOnLoad}
                         onProgress={(event) => {
                              updateTrackbar(event);
                              showHideOptions(event);
                         }}
                         onEnded={videoEnded}
                         onBuffer={() => {
                              // show video loader
                              document.getElementById("video-loader").classList.add("show");
                         }}
                         onBufferEnd={() => {
                              // hide video loader
                              document.getElementById("video-loader").classList.remove("show");
                         }}
                    />
               )}

               <VideoLoader id="video-loader" className="" onClick={pause} onMouseEnter={showControlBar} onMouseOut={hideControlBar}>
                    <div className="loader"></div>
               </VideoLoader>

               {playstory?.to_show_now.type === "clip" && (
                    <ControlBar id="control-bar">
                         <RestartButton id="restart-button" onClick={restart} />
                         <input id="trackbar" type="range" min={0} max={1000} step={1} defaultValue={0} onChange={seek} />
                         {reactPlayerProps.muted ? (
                              <MutedButton id="muted-button" onClick={toggleMute} />
                         ) : (
                              <SoundButton id="sound-button" onClick={toggleMute} />
                         )}
                         <FullscreenButton id="fullscreen-button" onClick={toggleFullscreen} />
                    </ControlBar>
               )}

               {!reactPlayerProps.playing && (
                    <PlayButtonWrapper onClick={play} customStyles={{ color: playstory?.videoTextColor }}>
                         <PlayButton />
                         <h1 id="welcome-text" className="hidden">
                              {playstory?.welcomeText || "Begin an interactive conversation"}
                         </h1>
                    </PlayButtonWrapper>
               )}

               <Options
                    id="options-wrapper"
                    customStyles={{
                         opacity: playstory?.btnOpacity,
                         backgroundColor: playstory?.btnColor,
                         color: playstory?.textColor,
                         videoTextColor: playstory?.videoTextColor
                    }}
                    onClick={pause}
               >
                    <h1 id="video-heading">{playstory?.to_show_now.data.video_title || playstory?.to_show_now.data.question}</h1>
                    <div id="options">
                         {playstory?.to_show_now.data.hasOwnProperty("options") &&
                              playstory?.to_show_now.data.options.map(({ id, value }, index) => {
                                   return (
                                        <div key={id} className="option" onClick={submitAnswer} data-id={id} data-value={value}>
                                             <span className="option-number">{index + 1}</span>
                                             <p className="option-title">{value}</p>
                                        </div>
                                   );
                              })}
                    </div>
               </Options>

               {["Short Text", "Long Text", "Email", "Phone Number", "Website"].includes(playstory?.to_show_now.data.answer_type) && (
                    <QuestionForm id="answer-form">
                         <h1>{playstory?.to_show_now.data.question}</h1>
                         <div className="form-control" onSubmit={submitAnswer}>
                              {(() => {
                                   switch (playstory.to_show_now.data.answer_type) {
                                        case "Short Text":
                                             return <input type="text" id="answer-input" placeholder="Short Answer" autoFocus spellCheck="false" />;
                                        case "Long Text":
                                             return (
                                                  <textarea
                                                       name=""
                                                       id="answer-input"
                                                       placeholder="Long Answer"
                                                       autoFocus
                                                       spellCheck="false"
                                                  ></textarea>
                                             );
                                        case "Email":
                                             return <input type="text" id="answer-input" placeholder="Your Email" autoFocus spellCheck="false" />;
                                        case "Phone Number":
                                             return (
                                                  <input type="text" id="answer-input" placeholder="Your Phone Number" autoFocus spellCheck="false" />
                                             );
                                        case "Website":
                                             return <input type="text" id="answer-input" placeholder="Your Website" autoFocus spellCheck="false" />;
                                        default:
                                             return;
                                   }
                              })()}
                              <button id="answer-submit" onClick={submitAnswer}>
                                   Submit
                              </button>
                         </div>
                    </QuestionForm>
               )}

               {showEndScreen && (
                    <EndScreen customStyles={{ videoTextColor: playstory.videoTextColor }}>
                         {playstory?.to_show_now.data.show_image && (
                              <img id="company-logo" src={playstory?.to_show_now.data.company_logo} alt={playstory?.company.company_logo} />
                         )}

                         <p id="endscreen-text">{playstory?.to_show_now.data.text || "Interactive video has ended."}</p>
                         {playstory?.to_show_now.data.show_button && (
                              <button id="call-to-action-button" onClick={handleCallToAction} data-url={playstory?.to_show_now.data.button_link}>
                                   {playstory?.to_show_now.data.button_text}
                              </button>
                         )}
                         <p id="self-branding">Powered by Playstory.io</p>
                    </EndScreen>
               )}
          </Wrapper>
     );
}

const Wrapper = styled.div`
     min-height: 100vh;
     position: relative;
     background: linear-gradient(to right, #d397fa, #8364e8);
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

     #welcome-text {
          font-size: 18px;
          width: max-content;
          font-weight: normal;
          color: ${(props) => (props.customStyles.color ? props.customStyles.color : "white")};
          user-select: none;

          &.hidden {
               display: none;
          }
     }
`;

const Options = styled.div`
     z-index: 2;
     left: 50%;
     bottom: 5%;
     translate: -50%;
     display: none;
     position: absolute;
     width: clamp(300px, 100%, 650px);
     /* padding-block: 2rem; */

     &.show {
          display: flex;
          flex-direction: column;
          gap: 2rem;
     }

     #video-heading {
          text-align: center;
          color: ${(props) => (props.customStyles.videoTextColor ? props.customStyles.videoTextColor : "white")};
          font-size: 1.5rem;
          pointer-events: none;
          text-shadow: 0px 0px 5px rgb(128, 128, 128);
     }

     #options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(275px, 1fr));
          row-gap: 1rem;
          column-gap: 2rem;
          padding-inline: 1rem;
          /* display: flex;
          justify-content: left;
          flex-wrap: wrap;
          padding-inline: 1rem;
          row-gap: 1rem;
          column-gap: 2rem; */

          .option {
               display: flex;
               align-items: center;
               gap: 1rem;
               width: 275px;
               background-color: ${(props) => (props.customStyles.backgroundColor ? props.customStyles.backgroundColor : "black")};
               padding: 0.5rem 1rem;
               border-radius: 100px;
               margin: auto;
               opacity: ${(props) => (props.customStyles.opacity ? props.customStyles.opacity : 1)};
               cursor: pointer;

               .option-number {
                    --size: 30px;
                    min-height: var(--size);
                    min-width: var(--size);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    border-radius: 50%;
                    background-color: ${(props) => (props.customStyles.color ? props.customStyles.color : "white")};
                    color: ${(props) => (props.customStyles.backgroundColor ? props.customStyles.backgroundColor : "black")};
                    font-weight: bold;
                    font-size: 1.25rem;
               }

               .option-title {
                    color: ${(props) => (props.customStyles.color ? props.customStyles.color : "white")};
               }
          }
     }
`;

const EndScreen = styled.div`
     position: absolute;
     z-index: 4;
     inset: 0;
     backdrop-filter: blur(50px);
     background-color: rgba(0, 0, 0, 0.9);
     color: ${(props) => (props.customStyles.videoTextColor ? props.customStyles.videoTextColor : "white")};
     display: flex;
     flex-direction: column;
     align-items: center;
     justify-content: center;

     #company-logo {
          position: absolute;
          top: 0rem;
          max-width: 300px;
          padding: 2rem;
     }

     #endscreen-text {
          max-width: 900px;
          text-align: center;
          padding: 1rem;
     }

     #call-to-action-button {
          border-radius: 100rem;
          margin: 1rem;
          padding: 0.5em 1em;
          max-width: 300px;
          cursor: pointer;
          font-size: 1.25rem;

          :hover {
               opacity: 0.75;
          }
     }

     #self-branding {
          position: absolute;
          bottom: 0;
          opacity: 0.75;
          font-size: 0.75rem;
     }
`;

const VideoLoader = styled.div`
     position: absolute;
     inset: 0;
     background-color: rgba(0, 0, 0, 0.25);
     display: none;
     place-items: center;
     z-index: 1;

     &.show {
          display: grid;
     }

     .loader {
          --size: 50px;
          --border-size: 5px;
          width: var(--size);
          height: var(--size);
          border-radius: 50%;
          border: var(--border-size) solid #f3f3f3;
          border-top-color: #3498db;
          animation: spin 2s linear infinite;
     }

     @keyframes spin {
          0% {
               transform: rotate(0deg);
          }
          100% {
               transform: rotate(360deg);
          }
     }
`;

const QuestionForm = styled.form`
     position: absolute;
     z-index: 3;
     inset: 0;
     background: linear-gradient(to right, #b597f6, #96c6ea);

     display: flex;
     justify-content: space-between;
     align-items: center;
     gap: 2rem;

     h1 {
          max-width: 50%;
          font-size: 2rem;
          padding: 1rem 1rem 1rem 2rem;
          color: white;
     }

     .form-control {
          border-radius: 20px;
          margin-inline: 1rem;
          width: clamp(300px, 100%, 50%);
          height: calc(100% - 2rem);
          background-color: #fff;
          position: relative;

          input,
          button,
          textarea {
               position: absolute;
               outline: none;
               border: none;
               font-size: 2rem;
          }

          input,
          textarea {
               border-bottom: 2px solid black;
               right: 2rem;
               left: 2rem;
               top: 50%;
               transform: translateY(-50%);
          }

          textarea {
               resize: vertical;
               box-shadow: 1px 1px 5px black;
               border-radius: 20px;
               padding: 1rem;
               font-size: 1.5rem;
               min-height: 50%;
          }

          button {
               bottom: 1rem;
               right: 1rem;
               padding: 0.5em 2em;
               border-radius: 10px;
               font-size: 1.5rem;
               background: linear-gradient(to right, #b597f6, #96c6ea);
               cursor: pointer;
               color: white;
          }
     }
`;
