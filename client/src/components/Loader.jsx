import styled from "styled-components";

function Loader({ loading }) {
     return (
          loading && (
               <LoaderWrapper className={loading ? "show" : ""}>
                    <div className="loader"></div>
               </LoaderWrapper>
          )
     );
}

export default Loader;

const LoaderWrapper = styled.div`
    position: absolute;
    inset: 0;
    background-color: rgba(255,255,255, 0.4),
    display: none;
    place-items: center;
    z-index: 100;
    backdrop-filter: blur(10px);

    &.show {
        display: grid;
    }

    .loader {
        border: 16px solid #f3f3f3;
        border-radius: 50%;
        border-top: 16px solid #3498db;
        width: 120px;
        height: 120px;
        -webkit-animation: spin 2s linear infinite;
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
