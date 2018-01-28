const BigNumber = web3.BigNumber;
const expect = require('chai').expect;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();


function transferEvent(result, from, to, amount) {
    let transferEvent = result.logs.find(e => e.event === 'Transfer');
    expect(transferEvent).to.exist;
    transferEvent.args._from.should.equal(from);
    transferEvent.args._to.should.equal(to);
    transferEvent.args._value.should.be.bignumber.equal(amount);
}

function approvalEvent(result, owner, spender, value) {
    let approvalEvent = result.logs.find(e => e.event === 'Approval');
    expect(approvalEvent).to.exist;
    approvalEvent.args._owner.should.equal(owner);
    approvalEvent.args._spender.should.equal(spender);
    approvalEvent.args._value.should.be.bignumber.equal(value);
}

function never(result, eventType) {
    let event = result.logs.find(e => e.event === eventType);
    expect(transferEvent).to.not.exist;
}

module.exports = {
    transferEvent: transferEvent,
    approvalEvent: approvalEvent,
    never: never,
};
