How to run:
Open a terminal session(Let's call it session 1)and run the following commands:
1.  Check out the code from git:
    git clone  https://github.com/USDXProject/contract.git
2.  Install truffle package:
    npm install -g truffle ethereumjs-testrpc
3.  Enter the ustx/ directory and execute npm install 
4.  Start your Ethereum simulator:
        a. Open another terminal session(Let's call it session 2) and run:
            testrpc
5.  Under your previous terminal session(session 1), run the following:
    a.  Go to the home directory of the usdx contract:
        cd contract/usdx
    b.  Compile contract:
        truffle compile
    c.  Run the test cases of contract:
        truffle test
    d.  Deploy contract:
        truffle migrate
