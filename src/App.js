import { useState } from 'react';
import styled from 'styled-components';
import { FileUploader } from "react-drag-drop-files";
import BeatLoader from "react-spinners/BeatLoader";

import { ReactComponent as LogoSVG } from './logohatify.svg';

const Container = styled.div`
  padding: 2rem;
  width: max(400px, 50%);
  margin: 0 auto;
  font-size: 1.1rem;
`;

const Nav = styled.nav`
  width: min(400px, 60%);
  border-bottom: 1px solid black;
  padding: 1rem 0;
`;

const Content = styled.div`

`;

const Logo = styled(LogoSVG)`
  height: 60px;
  padding-right: 1rem;
`;

const ModelViewerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  h2 {
    font-weight: 400;
  }

  model-viewer {
    width: 50%;
    height: 300px;
  }
`

function App() {

  const fileTypes = ['png'];
  
  const cluster_map = {
    0 : 10,
    1 : 7,
    2 : 5,
    3 : 1,
    4 : 10,
    5 : "We are detecting sunglasses. You don't need a hat. You are too cool.",
    6 : 4,
    7 : 1,
    8 : 6,
    9 : 5,
    10 : 8,
    11 : 6,
    12 : "We are detecting cool accessories. You are tool cool for our advice.",
    13 : 4,
    14 : 3,
    15 : 1,
    16 : "We are detecting a graduation hat. You are a grown up now, do your own hat shopping!",
    17 : 6,
    18 : 8,
    19 : 11,
    20 : "Your face seems very rare. It shall be rewarded with the following link: https://www.youtube.com/watch?v=tpiyEe_CqB4&ab_channel=Rufus",
    21 : 2,
    22 : 10,
    23 : "We are detecting a hat. You already have a hat dude, leave us alone.",
    24 : "Your face seems very rare. It shall be rewarded with the following link: https://www.youtube.com/watch?v=tpiyEe_CqB4&ab_channel=Rufus",
    25 : 9,
    26 : "We are detecting a graduation hat. You are a grown up now, do your own hat shopping!",
    27 : "We are detecting a hat. You already have a hat dude, leave us alone.",
    28 : "We are detecting a hat. You already have a hat dude, leave us alone.",
    29 : 13
  }

  const image_map = {
    1: 'CatEars.glb',
    2: 'BunnyEars.glb',
    3: 'Floppy.glb',
    4: 'Mets.glb',
    5: 'Party.glb',
    6: 'Propeller.glb',
    7: 'SunHat.glb',
    8: 'TopHat.glb',
    9: 'Baseball.glb',
    10: 'Boater.glb',
    11: 'Crown.glb',
    12: 'Fancy.glb',
    13: 'Unicorn.glb',
  }

  const hat_names = {
    1: 'Cat Ears',
    2: 'Bunny Ears',
    3: 'Floppy Hat',
    4: 'Mets Hat',
    5: 'Party Hat',
    6: 'Propeller Hat',
    7: 'Sun Hat',
    8: 'Top Hat',
    9: 'Baseball Cap',
    10: 'Boater Hat',
    11: 'Crown',
    12: 'Fancy Hat',
    13: 'Unicorn Cap',
  }
  
  const [loading, setLoading] = useState(false);  
  const [hat, setHat] = useState(null);
  const handleChange = async (file) => {
    if (file.size / 1024 / 1024 > 10) {
      alert("Sorry that file is too large!");
    }
    var data = new FormData()
    setLoading(true);
    data.append('file', file[0])
    fetch('https://us-central1-hatify.cloudfunctions.net/predict', {
      method: 'POST',
      body: data,
    }).then(async (resp) => {
      setLoading(false);
      const hat = await resp.text();
      // Match the hats
      if (typeof cluster_map[hat] === 'string') {
        alert(cluster_map[hat])
      } else {
        setHat(cluster_map[hat]);
      }
    })
    .catch((e) => {
      setLoading(false);
      console.log(e);
      alert("Something went wrong please try again");
    })
  };

  console.log({hat});

  return (
    <Container>
      <Nav>
        <Logo />
      </Nav>
      <Content>
        <p>Do you find yourself wanting a hat really badly, but don't know which one is right for you?</p>
        <p>Why use your own intelligence to figure it out, when you can use</p>
        <img src="/ai.svg" />
        <p>Upload a picture of your face, and we will match you with a hat</p>
        {(!loading & hat === null) ? (
          <div>
            <FileUploader
              multiple={true}
              handleChange={handleChange}
              name="file"
              types={fileTypes}
            />
          </div>
        ) : null}
        {loading ? (
          <>
            <BeatLoader />
            <i><p>Figuring out your facial features...</p></i>
          </>
        ) : null}
        {hat != null ? (
          <ModelViewerContainer>
            <h2>{hat_names[hat]}</h2>
            <model-viewer 
              alt="Your hat" 
              src={`/hats/${image_map[hat]}`}
              ar 
              shadow-intensity="1" 
              camera-controls t
              touch-action="pan-y">
            </model-viewer>
          </ModelViewerContainer>
        ) : null}
      </Content>
    </Container>
  );
}

export default App;
