// Wait so the reporter has time to fetch and return prices from APIs.
// https://github.com/cgewecke/eth-gas-reporter/issues/254
describe("eth-gas-reporter workaround", () => {
  it("should kill time", (done) => {
    setTimeout(done, 2000);
  });
});
