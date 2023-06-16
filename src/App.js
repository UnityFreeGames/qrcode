import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";

import axios from 'axios';
import QRCode from "react-qr-code";
import html2canvas from 'html2canvas';
import { ColorPicker, useColor } from "react-color-palette";
import "react-color-palette/lib/css/styles.css";

import "./App.css";
import "./font.css";

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 50px;
  border: none;
  background-color: var(--secondary);
  padding: 10px;
  font-weight: bold;
  color: var(--secondary-text);
  width: 100px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: var(--primary);
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: var(--primary-text);
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledLogo = styled.img`
  width: 200px;
  @media (min-width: 767px) {
    width: 300px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  border: 4px dashed var(--secondary);
  background-color: var(--accent);
  border-radius: 100%;
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click buy to mint your NFT`);
  const [mintAmount, setMintAmount] = useState(0);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
	NAME_BARCODE:"",
	COUNT_LOGO : "None",
	COLOR_BARCODE:"#000000",
    BORDER_BARCODE:"None"
  });
  
  
  
  const claimNFTs = () => {
      if(CONFIG.NAME_BARCODE.length==0)
	  {
	    setFeedback(`length barcode 0`);
		return;
	  }
      const random_num = randomNumberInRange(1, 1000000000000000000000);
	  setFeedback(`Creating Barcode...`);
	  getimg();
	  
	  window.setTimeout(() => {
	  	  
		  var bodyFormData = new FormData();
		  bodyFormData.append('name', CONFIG.NAME_BARCODE);
		  bodyFormData.append('des', 'For the uninitiated, QR Codes are basically 2D barcodes that store a lot of information and are easily scannable with a smartphone.');
		  bodyFormData.append('img_encode', localStorage.getItem('image_base64').replace("data:image/png;base64,", ""));
		  bodyFormData.append('url', random_num);
		  bodyFormData.append('Length', CONFIG.NAME_BARCODE.length);
		  bodyFormData.append('image_color', CONFIG.COLOR_BARCODE);
		  bodyFormData.append('image_border', CONFIG.BORDER_BARCODE);
		  bodyFormData.append('image_emoji', CONFIG.COUNT_LOGO);
		  
		  

		  
		  axios({
		  method: "post",
		  url: "https://elevator-services.com/NFT/nft.php?action=metadata",
		  data: bodyFormData,
		  headers: { "Content-Type": "multipart/form-data" },
		  })
		  .then(function (response) {
			//handle success
			if(response.data==0 || response.data=="0")
			{
			  setFeedback(`Barcode is available...`);
			  return;
			}
			else
			{
			    let cost = CONFIG.WEI_COST;
				let gasLimit = CONFIG.GAS_LIMIT;
				let totalCostWei = String(cost * mintAmount);
				let totalGasLimit = String(gasLimit);
				console.log("Cost: ", totalCostWei);
				console.log("Gas limit: ", totalGasLimit);
				setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
				setClaimingNft(true);
				
				blockchain.smartContract.methods
				  .mint("https://elevator-services.com/NFT/json/"+random_num+".json")
				  .send({
					gasLimit: String(totalGasLimit),
					to: CONFIG.CONTRACT_ADDRESS,
					from: blockchain.account,
					value: totalCostWei,
				  })
				  .once("error", (err) => {
					console.log(err);
					setFeedback("Sorry, something went wrong please try again later.");
					setClaimingNft(false);
				  })
				  .then((receipt) => {
					console.log(receipt);
					setFeedback(
					  `WOW, the ${CONFIG.NFT_NAME} is yours! go visit Opensea.io to view it.`
					);
					  setClaimingNft(false);
					  dispatch(fetchData(blockchain.account));
					
					  var bodyFormData_n = new FormData();
		              bodyFormData_n.append('name', CONFIG.NAME_BARCODE);
					
				      axios({
					  method: "post",
					  url: "https://elevator-services.com/NFT/nft.php?action=add_nft",
					  data: bodyFormData_n,
					  headers: { "Content-Type": "multipart/form-data" },
					  })
					  .then(function (response) {
						//handle success	
					
					  })
					  .catch(function (response) {
						//handle error
						console.log(response);
					  });
					
			
					
				  }); 
			}
		
	  })
	  .catch(function (response) {
		//handle error
		console.log(response);
	  });

      }, 3000);
	  

	  
   
  };
  
  function randomNumberInRange(min, max) {
    // 👇️ get number between min (inclusive) and max (inclusive)
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  const getimg = async () => {
     const element = document.getElementById('image_barcode');
	 const canvas = await html2canvas(element);
     const imagex = canvas.toDataURL("image/png", 1.0);
	 
	 localStorage.setItem('image_base64', imagex);	 
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 10) {
      newMintAmount = 10;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);
  ///////////////
  const [text, setText] = useState("");
  function handleChange(e){
   setText(e.target.value);
   CONFIG.NAME_BARCODE = e.target.value;  
  }
  const [displayprice, setdisplayprice] = useState("0");
  
  ////////////////////////////////
  const [color, setColor] = useColor("hex", "#000000");
  const [color_barcode, setcolor] = useState("");
  
  function handleChangecolor(e){
   setcolor(e.hex);
   CONFIG.COLOR_BARCODE=e.hex;
   
  };
  
 
/////////////////////////////////	
	const[style, setStyle] = useState('divbarcode1');
	const [checked, setChecked] = React.useState(false);

	  const handleChange_style = () => {
		  setChecked(!checked);
		 if(checked)
		 {
		   setStyle('divbarcode1');
		   CONFIG.BORDER_BARCODE="None";
		   let newMintAmount = mintAmount - 1;
		   setdisplayprice(newMintAmount);
           setMintAmount(newMintAmount);
		   
		 }
		 else
		 {
		   setStyle('divbarcode2');
		   CONFIG.BORDER_BARCODE="dot";
           let newMintAmount = mintAmount + 1;
		   setdisplayprice(newMintAmount);
           setMintAmount(newMintAmount);
	   
		 }
		 
		 
		 
	  };
	  
///////////////////////////
const[style2, setStyle2] = useState('picker1');
const [checked_color, setChecked_color] = React.useState(false);


	  const handleChange_color = () => {
		 setChecked_color(!checked_color);
		 if(checked_color)	
			{
			  setStyle2('picker1');
			  setcolor("#000000");
              CONFIG.COLOR_BARCODE="#000000";
			  let newMintAmount = mintAmount - 1;
		      setdisplayprice(newMintAmount);
              setMintAmount(newMintAmount);
			  
			}
		 else
		 {
		   setStyle2('picker2');
           let newMintAmount = mintAmount + 1;
		   setdisplayprice(newMintAmount);
           setMintAmount(newMintAmount);
           	   
		 }
		 
          	 
	  };
/////////////////////////////////
const[style3, setStyle3] = useState('singleLineImageContainer2');
const [image, setImage] = useState("/config/images/imoji/Emoji0.png");
  function clickElement(index , name) {

	 setImage("/config/images/imoji/Emoji"+index+".png");
	 CONFIG.COUNT_LOGO=name;
	
  }
const [checked_emoji, setChecked__emoji] = React.useState(false);


	  const handleChange_emoji = () => {
		 setChecked__emoji(!checked_emoji);
		 if(checked_emoji)
		 {
		   setImage("/config/images/imoji/Emoji0.png");
	       CONFIG.COUNT_LOGO="None";
		   setStyle3('singleLineImageContainer2');
		   let newMintAmount = mintAmount - 1;
		   setdisplayprice(newMintAmount);
           setMintAmount(newMintAmount);
		  
		 }
		 else
		 {
		   setImage("/config/images/imoji/Emoji1.png");
	       CONFIG.COUNT_LOGO="upset";
		   setStyle3('singleLineImageContainer1');
		   let newMintAmount = mintAmount + 1;
		   setdisplayprice(newMintAmount);
           setMintAmount(newMintAmount);
		   
		 }
		 
		 
		 	 
	  };
/////////////////////////////////////////////
  return (
    <s.Screen>
      <s.Container
        flex={1}
        ai={"center"}
        style={{ padding: 8, backgroundColor: "var(--primary)" }}
        image={CONFIG.SHOW_BACKGROUND ? "/config/images/bg.png" : null}
      >
       
        <s.SpacerSmall />
        <ResponsiveWrapper flex={1} style={{ padding: 24 }} test>
         
          <s.SpacerLarge />
          <s.Container
            flex={2}
            jc={"center"}
            ai={"center"}
            style={{
             // backgroundColor: "var(--accent)",
              padding: 0,
             // borderRadius: 24,
             // border: "4px dashed var(--secondary)",
             // boxShadow: "0px 5px 11px 2px rgba(0,0,0,0.7)",
            }}
          >
		  
		   <span
              style={{
                textAlign: "center",
              }}
            >
			
			<StyledButton
                onClick={(e) => {
                  window.open(CONFIG.Twitter_LINK, "_blank");
                }}
                style={{
                  margin: "5px",
                }}
              >
                Twitter
              </StyledButton>
              <StyledButton
                style={{
                  margin: "5px",
                }}
                onClick={(e) => {
                  window.open(CONFIG.MARKETPLACE_LINK, "_blank");
                }}
              >
                {CONFIG.MARKETPLACE}
              </StyledButton>
            
              
            </span>
			
			<s.SpacerSmall />
		  
		    <div id="image_barcode" class={style}>
				<QRCode size={256} style={{ height: "350px", width: "350px" }} value={text} fgColor={color_barcode}/>
				<img src={image} height={50} width={50}  class="center" />
			</div>
			<s.SpacerSmall />
			<div>
				<p>Enter your text here</p>
				<input id='title_bar' type="text" value={text} onChange={(e)=>{handleChange(e)}} />			
			</div>
			<s.SpacerSmall />
			
			<div style={{width: "300px" ,display: 'flex', flexDirection: 'row'}}>
			
				<input class="scheckbox"
				  type="checkbox"
				  checked={checked_color}
				  onChange={handleChange_color}
				/>
			    <label class="labble_border"> Custom Color (+1 MATIC) </label>

			</div>
			
			<div  class={style2}>
				<ColorPicker width={300} height={80} color={color} onChange={setColor} onChangeComplete={(color)=>{handleChangecolor(color)}} hideHSV hideRGB hideHEX dark />
			</div>
			
			<s.SpacerSmall />
			<div style={{width: "300px" ,display: 'flex', flexDirection: 'row' }}>
			
				<input class="scheckbox"
				  type="checkbox"
				  checked={checked_emoji}
				  onChange={handleChange_emoji}
				/>
			    <label class="labble_border"> Custom Emoji (+1 MATIC) </label>

			</div>
			
			<div class={style3}>
			 <img src={require("./assets/imoji/Emoji1.png").default} height={100} width={100}  class="image" onClick={() => clickElement(1 , "Upset")}/>
			 <img src={require("./assets/imoji/Emoji2.png").default} height={100} width={100}  class="image" onClick={() => clickElement(2 , "Glasses")}/>
			 <img src={require("./assets/imoji/Emoji3.png").default} height={100} width={100}  class="image" onClick={() => clickElement(3 , "Cry")}/>
			 <img src={require("./assets/imoji/Emoji4.png").default} height={100} width={100}  class="image" onClick={() => clickElement(4 , "Play")}/>
			 <img src={require("./assets/imoji/Emoji5.png").default} height={100} width={100}  class="image" onClick={() => clickElement(5 , "Snooze")}/>
			 <img src={require("./assets/imoji/Emoji6.png").default} height={100} width={100}  class="image" onClick={() => clickElement(6 , "Fool")}/>
			 <img src={require("./assets/imoji/Emoji7.png").default} height={100} width={100}  class="image" onClick={() => clickElement(7 , "Polite")}/>
			 <img src={require("./assets/imoji/Emoji8.png").default} height={100} width={100}  class="image" onClick={() => clickElement(8 , "Laugh")}/>
			 <img src={require("./assets/imoji/Emoji9.png").default} height={100} width={100}  class="image" onClick={() => clickElement(9 , "Titter")}/>
			 <img src={require("./assets/imoji/Emoji10.png").default} height={100} width={100}  class="image" onClick={() => clickElement(10 , "Smile")}/>
			 <img src={require("./assets/imoji/Emoji11.png").default} height={100} width={100}  class="image" onClick={() => clickElement(11 , "Good Luck")}/>
			 <img src={require("./assets/imoji/Emoji12.png").default} height={100} width={100}  class="image" onClick={() => clickElement(12 , "Devour")}/>
			 <img src={require("./assets/imoji/Emoji13.png").default} height={100} width={100}  class="image" onClick={() => clickElement(13 , "Think")}/>
			 <img src={require("./assets/imoji/Emoji14.png").default} height={100} width={100}  class="image" onClick={() => clickElement(14 , "Shy")}/>
			 <img src={require("./assets/imoji/Emoji15.png").default} height={100} width={100}  class="image" onClick={() => clickElement(15 , "Winking")}/>
			 <img src={require("./assets/imoji/Emoji16.png").default} height={100} width={100}  class="image" onClick={() => clickElement(16 , "Surprised")}/>
			 <img src={require("./assets/imoji/Emoji17.png").default} height={100} width={100}  class="image" onClick={() => clickElement(17 , "Wide-Eyed")}/>
			 <img src={require("./assets/imoji/Emoji18.png").default} height={100} width={100}  class="image" onClick={() => clickElement(18 , "Astounding")}/>
			 <img src={require("./assets/imoji/Emoji19.png").default} height={100} width={100}  class="image" onClick={() => clickElement(19 , "wonderful")}/>
			 <img src={require("./assets/imoji/Emoji20.png").default} height={100} width={100}  class="image" onClick={() => clickElement(20 , "Fickle")}/>
			 <img src={require("./assets/imoji/Emoji21.png").default} height={100} width={100}  class="image" onClick={() => clickElement(21 , "Right hand")}/>
			 <img src={require("./assets/imoji/Emoji22.png").default} height={100} width={100}  class="image" onClick={() => clickElement(22 , "Left hand")}/>
			 <img src={require("./assets/imoji/Emoji23.png").default} height={100} width={100}  class="image" onClick={() => clickElement(23 , "Long tongue")}/>
			 <img src={require("./assets/imoji/Emoji24.png").default} height={100} width={100}  class="image" onClick={() => clickElement(24 , "Stupid")}/>
			 <img src={require("./assets/imoji/Emoji25.png").default} height={100} width={100}  class="image" onClick={() => clickElement(25 , "Silly")}/>
			 <img src={require("./assets/imoji/Emoji26.png").default} height={100} width={100}  class="image" onClick={() => clickElement(26 , "Happy")}/>
             <img src={require("./assets/imoji/Emoji27.png").default} height={100} width={100}  class="image" onClick={() => clickElement(27 , "Pain")}/>

		   </div>
			
			<s.SpacerSmall />
			<div style={{width: "300px" ,display: 'flex', flexDirection: 'row' }}>
			
				<input class="scheckbox"
				  type="checkbox"
				  checked={checked}
				  onChange={handleChange_style}
				/>
			    <label class="labble_border"> Custom Frame(+1 MATIC)</label>

			</div>
			
		
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--primary-text)",
              }}
            >

            </s.TextDescription>
           
            <s.SpacerSmall />
            {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  Sold Out
                </s.TextTitle>
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  You can still find {CONFIG.NFT_NAME} on
                </s.TextDescription>
                <s.SpacerSmall />
                <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                  {CONFIG.MARKETPLACE}
                </StyledLink>
              </>
            ) : (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-Texttype1)" }}
                >
                  NFT MINT PRICE: {displayprice}{" "}
                  {CONFIG.NETWORK.SYMBOL}
                </s.TextTitle>
                <s.SpacerXSmall />
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  
                </s.TextDescription>
                <s.SpacerSmall />
                {blockchain.account === "" ||
                blockchain.smartContract === null ? (
                  <s.Container ai={"center"} jc={"center"}>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      Connect to the {CONFIG.NETWORK.NAME} network
                    </s.TextDescription>
                    <s.SpacerSmall />
                    <StyledButton
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(connect());
                        getData();
                      }}
                    >
                      CONNECT
                    </StyledButton>
                    {blockchain.errorMsg !== "" ? (
                      <>
                        <s.SpacerSmall />
                        <s.TextDescription
                          style={{
                            textAlign: "center",
                            color: "var(--accent-text)",
                          }}
                        >
                          {blockchain.errorMsg}
                        </s.TextDescription>
                      </>
                    ) : null}
                  </s.Container>
                ) : (
                  <>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      {feedback}
                    </s.TextDescription>
                    <s.SpacerMedium />
                    
                    <s.SpacerSmall />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          claimNFTs();
                          getData();
                        }}
                      >
                        {claimingNft ? "BUSY" : "MINT"}
                      </StyledButton>
                    </s.Container>
                  </>
                )}
              </>
            )}
            <s.SpacerMedium />
          </s.Container>
          <s.SpacerLarge />
          
        </ResponsiveWrapper>
        <s.SpacerMedium />
       

	   <s.Container jc={"center"} ai={"center"} style={{ width: "90%" }}>
         



	
		  
		  
		  
		<div id="faq" className="textBlock row">
          <div id="toadverseIntro" className="textBlockColumn">
            <div>
              <s.Texttype1>NFT COLLECTION</s.Texttype1>
              <s.TextSubTitle>
               For the uninitiated, QR Codes are basically 2D barcodes that store a lot of information and are easily scannable with a smartphone.
Do you know you can customize QR Code�s design as per your wish? This helps make your QR Code a point-of-engagement to attract more scans. You can do it by adding a logo and color or a background image to it.
              </s.TextSubTitle>
            </div>
          </div>
          <div id="imgGrid" className="textBlockColumn inhabitantsContainer">
            <div className="inhabitantsContainer">
              <div className="imgBox">
                <img
                  src={require("./assets/1.png").default}
                  alt="Toadverse inhabitant"
                />
              </div>
              <div className="imgBox i2">
                <img
                  src={require("./assets/2.png").default}
                  alt="Toadverse inhabitant"
                />
              </div>
              <div className="imgBox i3">
                <img
                  src={require("./assets/3.png").default}
                  alt="Toadverse inhabitant"
                />
              </div>
              <div className="imgBox i4">
                <img
                  src={require("./assets/4.png").default}
                  alt="Toadverse inhabitant"
                />
              </div>
            </div>
          </div>
        </div>
		
		
		
		
		
		  
		 <div id="about" className="textBlock row">
          <div className="textBlockColumn">
            <div id="nnn-collectiv-big">
              <img
                width="400"
                src={require("./assets/5.png").default}
                alt="nnn kolectiv"
              />
            </div>
          </div>
          <div className="textBlockColumn">
            <s.TextTitle>
              <s.Texttype1>High-speed Scannability</s.Texttype1>
              QR Codes are known for their high-speed scannability. They come alive within seconds of holding your camera in front of them. This makes the user experience faster and better.
            </s.TextTitle>
          </div>
        </div>
        <div className="textBlock row">
          <div className="textBlockColumn">
            <s.TextTitle>
              <s.Texttype1>
                <span style={{ textDecoration: "line-through", opacity: 0.7 }}>
                  Toadmap
                </span>{" "}
                Vibemap
              </s.Texttype1>
              No toadmap just vibes. That's why we have the Vibemap which is
              used to track how vibes radiate through Toadverse. First of all we
              plan on giving NFT-enthusiasts opportunity to explore different
              parallel chains by giving them limited free mints. Those explorers
              and researchers will receive generated Toadz or custom made Toadz,
              which will serve as a WL pass for the upcoming Mainnet drop.
             
            </s.TextTitle>
          </div>
          <div className="textBlockColumn" id="vibemap">
            <div id="nnn-collectiv-big">
              <img
                width="400"
                src={require("./assets/6.png").default}
                alt="Vibemap"
              />
            </div>
            
          </div>
        </div>
        <div id="team" className="text row">
          <s.Texttype1>Made With Love</s.Texttype1>
		  <s.SpacerLarge />
          <div id="teamMembers">
            <div className="teamMember">
              <img
                className="teamImg"
                src={require("./assets/7.png").default}
                alt="bored ape"
              />
              <s.TextSubTitle id="nameTag">QRCODE ape</s.TextSubTitle>
            </div>
            <div className="teamMember">
              <img
                className="teamImg"
                src={require("./assets/8.png").default}
                alt="lazy lions"
              />
              <s.TextSubTitle id="nameTag">QRCODE lions</s.TextSubTitle>
            </div>
            <div className="teamMember">
              <img
                className="teamImg"
                src={require("./assets/9.png").default}
                alt="pudgy penguins"
              />
              <s.TextSubTitle id="nameTag">QRCODE penguins</s.TextSubTitle>
            </div>
            <div className="teamMember">
              <img
                className="teamImg"
                src={require("./assets/10.png").default}
                alt="Lego punks"
              />
              <s.TextSubTitle id="nameTag">QRCODE punks</s.TextSubTitle>
            </div>
          </div>
        </div>

        <div className="footer-container">
         
          <s.TextTitle className="px-2">
            BARCODE GENERATOR NFT
          </s.TextTitle>
        </div>  
		  
		  
		  
		  
		  
		  
		  
		  
		  
		  
		  
		  
		  
		  
		  
		  
		  
		  
		  
		  
		  
		  
        </s.Container>
		
		
		
		
      </s.Container>
    </s.Screen>
  );
}

export default App;
