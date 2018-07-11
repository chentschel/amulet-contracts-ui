
let contract;

function refreshEscrowed() {
    contract.getEscrowedIds(web3.eth.coinbase, function(err, ret) {
        if (err) { console.error(err); }
        else {
            $('.k-list').empty();   
            $('.escrowed-len').text(`${ret.length} items`);
            for (x of ret) {
                var html = `
                <li class="border position-relative">
                    <p class="lead position-absolute">${x.toString()}</p>
                    <img width="200" src="https://storage.googleapis.com/ck-kitty-image/0x06012c8cf97bead5deae237070f9587f8e7a266d/${x.toNumber()}.svg">
                </li>`;
                $('.k-list').append(html);
            }
        }
    });
}

function getKittiesForged(amuletId) {
    contract.getForgetForAmulet(amuletId, function(err, ret) {
        if (err) { console.error(err); }
        else {
            var html = `
            <li class="pt-3 pl-2 border">
                <p class="lead">AmuletId: ${amuletId.toString()}</p>
                <p>PowerValue: <span id="power-${amuletId}">--</span></p>
                <p>kitties: ${ret}</p>
            </li>`;
            $('.a-list').append(html);
        }
    });

    contract.getAmuletPower(amuletId, function(err, ret) {
        if (err) { console.error(err); }
        else {
            $('#power-' + amuletId).text(ret.toFixed(2));
        }
    });
}

function refreshAmulets() {
    contract.getOwnedAmulets(function(err, ret) {
        if (err) { console.error(err); }
        else {
            $('.a-list').empty();
            for (x of ret) {
                getKittiesForged(x);
            }
        }
    });
}

function deposit() {
    var kittyId = $('input[name="kitty-id"]').val();
    if (!kittyId) {
        return;
    }
    contract.depositKitty(kittyId, function(err, ret) {
        if (err) { console.error(err); }
        else {
            console.log('deposited');            
            refreshEscrowed();
        }
    });
}

function withdraw() {
    var kittyId = $('input[name="kitty-id"]').val();
    if (!kittyId) {
        return;
    }
    contract.withdrawKitty(kittyId, function(err, ret) {
        if (err) { console.error(err); }
        else {
            console.log('withdraw');
            refreshEscrowed();
        }
    });
}

function forge() {
    contract.forgeAmulet(function(err, ret) {
        if (err) { console.error(err); }
        else {
            refreshEscrowed();
            refreshAmulets();
        }
    });
}

function unforge() {
    var amuletId = $('input[name="amulet-id"]').val();
    if (!amuletId) {
        return;
    }
    contract.unforgeAmulet(amuletId, function(err, ret) {
        if (err) { console.error(err); }
        else {
            console.log('unforge');
            refreshEscrowed();
            refreshAmulets();
        }
    });
}

function startApp() {
    let registry = web3.eth.contract(contractABI);
    
    // Set contract instance 
    contract = registry.at(contractAddr);

    refreshAmulets();
    refreshEscrowed();

    // hoocks
    $('#deposit').on('click', function(evt) {
        deposit();
    });

    $('#withdraw').on('click', function(evt) {
        withdraw();
    });

    $('#forge').on('click', function(evt) {
        forge();
    });

    $('#unforge').on('click', function(evt) {
        unforge();
    });
}

function jqload() {
    $(document).ready(function() {
        if (typeof web3 !== 'undefined') {
            web3 = new Web3(web3.currentProvider);

            web3.version.getNetwork((err, netId) => {
                if (netId !== "1" && netId !== "4") { 
                    console.warn("network not supported. Change it to mainnet or ropsten");
                }
            });

            let account = web3.eth.accounts[0];
            if (!account) {
                console.warn('Web3 account is locked.');
            
            } else {
                startApp();
            }
        
        } else {
            console.warn('web3 not available...');
        }
    });
}