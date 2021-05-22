import React, {useState, useEffect} from 'react';
import Web3 from 'web3'  
// import TruffleContract from 'truffle-contract'  
import Tokens from './Tokens/all';  
import Nav from './Components/Nav';  
import Description from './Components/Description';  
import Container from './Components/Container';  
import InstallMetamask from './Components/InstallMetamask';  
import UnlockMetamask from './Components/UnlockMetamask';  
import TokenZendR from './build/contracts/TokenZendR.json';
import './App.css';  

function App() {
  let tokens = Tokens;  //list of supported tokens by token-zendr contract
  let appName = 'TokenZendR';  
  let isWeb3 = true; //If metamask is installed  
  let isWeb3Locked = false; //If metamask account is locked 

  // State
  let [tzAddress, setTzAddress] = useState(null);
  let [inProgress, setProgress] = useState(false);
  let [tx, setTx] = useState(null);
  let [network, setNetworkValue] = useState('Checking...');
  let [account, setAccount] = useState(null);
  let [userTokens, setUserTokens] = useState([]);
  let [transferDetail, setTransferDetail] = useState({});
  let [fields, setFields] = useState({                 
    receiver: null,  
    amount: null,  
    gasPrice: null,  
    gasLimit: null,  
  });
  let [defaultGasPrice, setDefaultGasPrice] = useState(null);
  let [defaultGasLimit, setDefaultGasLimit] = useState(200000);
  let [tokenZendr, setTokenZendr] = useState(null);
  let [web3, setWeb3] = useState(null);

  //When a new transfer is initiated
  //set details of the token to be
  //transfered such as the address, symbol.. etc

  const newTransfer = (index) => {  
    setTransferDetail(tokens[index]);
  }; 

  //Called at the end of a successful
  //transfer to cclear form fields & transferDetails
  const closeTransfer = () => {  
    setTransferDetail({});
    setFields({});
  }; 

  const onInputChangeUpdateField = (name, value) => {  
    let newFields = fields;  

    newFields[name] = value;  

    setFields(newFields);
  };

  const connectToNetwork = () => {
    return new Promise((resolve, reject) => {
      window.addEventListener('load', async () => {
        if (window.ethereum) {
          let contract = TokenZendR;
          await window.ethereum.enable()
          const web3Instance = await new Web3(Web3.givenProvider || "HTTP://127.0.0.1:7545")
          const result = await new web3Instance.eth.Contract(
            contract.abi,
            "0x9923F0430377F148dD4B7670d32D08F5f1C77D8E",
          )
          return resolve({ result, web3Instance })
        }
        return resolve({ result: undefined, web3Instance: undefined })
      })
    })
  }
  
  //switch statement to check the current network and set the
  //value to be displayed on the nav component 
  const setNetwork = (instance) => {  
    let networkName = "Main"; 

    // web3.version.getNetwork(function (err, networkId) {  
    //   switch (networkId) {  
    //       case "1":  
    //           networkName = "Main";  
    //           break;  
    //       case "2":  
    //           networkName = "Morden";  
    //           break;  
    //       case "3":  
    //           networkName = "Ropsten";  
    //           break;  
    //       case "4":  
    //           networkName = "Rinkeby";  
    //           break;  
    //       case "42":  
    //           networkName = "Kovan";  
    //           break;  
    //       default:  
    //           networkName = networkId;  
    //   }  
    
    //   setNetworkValue(networkName);

    // }); 

    setNetworkValue(networkName);
  };

  
  
  const setGasPrice = (web3Instance) => {  
    web3Instance.eth.getGasPrice((err,price) => {  
      price = web3Instance.utils.fromWei(price,'gwei');
      
      if(!err) setDefaultGasPrice(Number(price));
    }); 
  };

  const resetApp = () => {
    setTransferDetail({});
    setFields({
      receiver: null,  
      amount: null,  
      gasPrice: null,  
      gasLimit: null,  
    })
    setDefaultGasPrice(null);  
  };
  
  const Transfer = async () => {  
    //Set to true to allow some component disabled
    //and button loader to show transaction progress
    setProgress(true);
    
    //Use the ABI of a token at a particular address to call its methods
    let contract = await new web3.eth.Contract(
      transferDetail.abi,
      transferDetail.address,
    );

    console.log(contract, "ERC 20")
    let transObj = {
      from: account,
      gas: defaultGasLimit,
      gasPrice: defaultGasPrice
    };  

    //Use the decimal places the token creator set to get actual amount of tokens to transfer
    // let amount = fields.amount + 'e' + transferDetail.decimal;  
    let amount = fields.amount
    let symbol = web3.utils.fromAscii(transferDetail.symbol);  
    let receiver = fields.receiver;  


    //Approve the token-zendr contract to spend on your behalf
    let approve = await contract.methods.approve(tzAddress, amount).call(transObj);

    if(approve){
      console.log(tokenZendr, "TOKEN ZENDR")
      // let tokenZendrInstance = await tokenZendr.deployed();
      watchEvents(tokenZendr);    

      //Transfer the token to third party on user behalf
      try{
        let response = await tokenZendr.methods.transferTokens(symbol, receiver, amount).send(transObj);  
        resetApp(); 
        
        setTx(response.tx);
        setProgress(false);
      }catch(err){
        console.log(err);  
      }
    }else {
      console.log("TRANSACTION NOT APPROVED")
    }
  };  


  const watchEvents = async (tokenZendrInstance) => {  
    let param = {from: account,to: fields.receiver,amount: fields.amount};

    let successTransferEvent = await tokenZendrInstance.events.TransferSuccessful(param, {  
      fromBlock: 0,  
      toBlock: 'latest'  
    });

    console.log(successTransferEvent.arguments[0], "LOG EVENT");
  }


  const setServer = async () => {
    if (web3 == null) {  
      const {result, web3Instance} = await connectToNetwork(); 
      setTokenZendr(result);
      setTzAddress(TokenZendR.networks[5777].address);
      
      console.log(web3Instance, "instance")
      let account = await web3Instance.eth.getCoinbase();
      setAccount(account);
      
      if (account === null || account === undefined ) isWeb3Locked = true;
      
      setNetwork(web3Instance);
      setGasPrice(web3Instance);

      for(let token of tokens){
        let erc20Token = await new web3Instance.eth.Contract(
          token.abi,
          token.address,
        );

        let decimal = token.decimal;  
        let precision = '1e' + decimal;  
        let balance = await erc20Token.methods.balanceOf(account).call() / precision;
        let name = token.name;  
        let symbol = token.symbol;  
        let icon = token.icon;  
        let abi = token.abi;  
        let address = token.address;

      
        balance = balance >= 0 ? balance : 0;
      
        let tokens = userTokens;  
      
        if(balance >= 0) tokens.push({  
            decimal,  
            balance,  
            name,  
            symbol,  
            icon,  
            abi,  
            address,  
        });  
             
        setUserTokens(tokens); 
      }

      setWeb3(web3Instance);
    }else{  
      isWeb3 = false;  
    }
    
  }

  //set web3 & truffle contract
  useEffect(() => {
    setServer();
  }, [])

  if(isWeb3){
    if(isWeb3Locked) {
      return (  
        <div>  
            <Nav appName={appName} network={network} />  
            <UnlockMetamask message="Unlock Your  /Mist Wallet" />  
        </div> 
      ) 
    }else {
      return (  
        <div>  
            <Nav appName={appName} network={network} />  
            <Description />  
            <Container onInputChangeUpdateField={onInputChangeUpdateField}  
                         transferDetail={transferDetail}  
                         closeTransfer={closeTransfer}  
                         newTransfer={newTransfer}  
                         Transfer={Transfer}  
                         account={account}  
                         defaultGasPrice={defaultGasPrice}  
                         defaultGasLimit={defaultGasLimit}  
                         tx={tx}  
                         inProgress={inProgress}  
                         fields={fields}  
                         tokens={userTokens} />  
        </div>  
       ) 
    }
  }else {
    return(  
      <InstallMetamask />  
    )
  }
}

export default App;
