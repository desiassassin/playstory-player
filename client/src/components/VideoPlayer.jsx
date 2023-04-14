import styled from "styled-components";

const VideoPlayer = ({ src }) => {
     return (
          <div className="wrapper">
               <Player src={src} />
          </div>
     );
};

export default VideoPlayer;

const Wrapper = styled.div`
     min-height: 100vh;
     background-color: #999999;
`;

const Player = styled.video`
     height: 200px;
     width: 500px;
     object-fit: cover;
`;
