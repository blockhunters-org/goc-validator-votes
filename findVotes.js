const axios = require('axios');
const ObjectsToCsv = require('objects-to-csv');

const config = {
    api: "https://api.goc.provider.bh.rocks/",
    addresses: ["cosmos1v08ramvfc2vftm7h8actkqk0gg5kd39jyry2lx"],
    csv: "goc-votes.csv"
}

let castVotes = [];

async function main() {
    let votes = [];

    for(let i=0;i<config.addresses.length;i++) {
        const res = await axios.get(`${config.api}/cosmos/tx/v1beta1/txs?events=message.sender='${config.addresses[i]}'`);
        votes = votes.concat(res.data.tx_responses)
    }

    for(let i=0;i<votes.length;i++) {
        const message = votes[i].tx.body.messages[0]
        if(message["@type"] === "/cosmos.gov.v1beta1.MsgVote") {
            castVotes.push({blockHeight: votes[i].height, txHash: votes[i].txhash, proposalId: Number(message.proposal_id), vote: message.option.replace("VOTE_OPTION_","")});
        }
    }

    castVotes.sort((a,b) => { if(a.proposalId > b.proposalId) return 1; else return -1});

    await new ObjectsToCsv(castVotes).toDisk(config.csv, {});
}

main().then(() => {
    console.log("Done.")
});