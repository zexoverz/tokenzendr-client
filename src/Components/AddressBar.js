import React from 'react';

function AddressBar(props) {

    return (
        <p className={props.tx ? "is-hidden" : "panel-heading has-text-centered is-clipped is-size-7"}>
            ETH Account:
            <strong>{props.account}</strong>
        </p>
    )
}

export default AddressBar;