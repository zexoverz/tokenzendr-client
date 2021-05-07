import React from 'react';  
import AddressBar from './AddressBar';
import TokenBlock from './TokenBlock';
import TradeMarkBlock from './TradeMarkBlock';
import SortTokenBlock from './SortTokenBlock';
import TransferToken from './TransferToken';
import TransferHeader from './TransferHeader';
import SuccessTransaction from './SuccessTransaction';


function Container(props) {
    return (
        <section className="container">  
             <div className="columns">  
                <div className="is-half is-offset-one-quarter column">  
                        <div className="panel">  
                         { props.tx ?  
                         <SuccessTransaction tx={props.tx} /> :  
                          ''  
                         }  
                      
                     <AddressBar account={props.account} tx={props.tx}/>  
                     {  
                         props.transferDetail.hasOwnProperty('name') ?  
                         <div>  
                             <TransferHeader token={props.transferDetail} />  
                             <TransferToken closeTransfer={props.closeTransfer}  
                                          transferDetail={props.transferDetail}  
                                          fields={props.fields}  
                                          account={props.account}  
                                          Transfer={props.Transfer}  
                                          inProgress={props.inProgress}  
                                          defaultGasPrice={props.defaultGasPrice}  
                                          defaultGasLimit={props.defaultGasLimit}  
                                          onInputChangeUpdateField={props.onInputChangeUpdateField}/>  
                     </div> :  
                     <div className={props.tx ? 'is-hidden' : ''}>  
                        <SortTokenBlock />  
                        <TokenBlock newTransfer={props.newTransfer} tokens={props.tokens} />  
                     </div>  
                     } 
                     <TradeMarkBlock tx={props.tx}/>  
                     </div>  
                 </div>  
             </div>  
        </section>  
    )
} 

export default Container;