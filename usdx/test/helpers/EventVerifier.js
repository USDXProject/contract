const BigNumber = web3.BigNumber;
const expect = require('chai').expect;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

function approvalEvent(result, owner, spender, value) {
    let approvalEvent = result.logs.find(e => e.event === 'Approval');
    expect(approvalEvent).to.exist;
    approvalEvent.args._owner.should.equal(owner);
    approvalEvent.args._spender.should.equal(spender);
    approvalEvent.args._value.should.be.bignumber.equal(value);
}

function burnEvent(result, burner, value) {
    let burnEvent = result.logs.find(e => e.event === 'Burn');
    expect(burnEvent).to.exist;
    burnEvent.args.burner.should.equal(burner);
    burnEvent.args.value.should.be.bignumber.equal(value);
}

function mintEvent(result, to, amount) {
    let mintEvent = result.logs.find(e => e.event === 'Mint');
    expect(mintEvent).to.exist;
    mintEvent.args.to.should.equal(to);
    mintEvent.args.amount.should.be.bignumber.equal(amount);
}

function transferEvent(result, from, to, amount) {
    let transferEvent = result.logs.find(e => e.event === 'Transfer');
    expect(transferEvent).to.exist;
    if (from === 0) {
        // A roundabout way to test from address is 0x0. Without this, the test
        // attemps a string match to compare string
        // '0x0000000000000000000000000000000000000000' to number 0x0.
        parseInt(transferEvent.args._from).should.equal(from);
    } else {
        transferEvent.args._from.should.equal(from);
    }
    transferEvent.args._to.should.equal(to);
    transferEvent.args._value.should.be.bignumber.equal(amount);
}

function never(result, eventType) {
    let event = result.logs.find(e => e.event === eventType);
    expect(transferEvent).to.not.exist;
}

module.exports = {
    approvalEvent: approvalEvent,
    burnEvent: burnEvent,
    mintEvent: mintEvent,
    transferEvent: transferEvent,
    never: never,
};
