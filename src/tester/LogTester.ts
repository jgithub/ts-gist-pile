
import { withTraceId } from "../log/getLogger"
import { d4l, d4lObfuscate } from "../log/logUtil"
import { getLogger } from "../log/getLogger"

process.env.LOG_DEBUG = "true"
process.env.LOG_PREPEND_TIMESTAMP = "true"

const LOG = getLogger("log/LogTester");
  
class LogTester {
  public buildCar(make: string, model: string): void {
    LOG.debug(`buildCar(): Entering`, { make, model })
    LOG.debug(() => `buildCar(): Entering with make = ${d4l(make)}`)
    LOG.fatal(`buildCar(): password = ${d4lObfuscate("password")}`)
    LOG.fatal(`buildCar(): password = ${d4lObfuscate("123456789012345")}`)
    LOG.fatal(`buildCar(): password = ${d4lObfuscate("ABCDEFGHIJKLMNOPQRSTUVWXYZ")}`)
    LOG.fatal(`buildCar(): password = ${d4lObfuscate("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefg")}`)
    LOG.fatal(`buildCar(): password = ${d4lObfuscate("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz")}`)
  }
}


withTraceId( '00000000-0000-0000-0000-000000000000', () => {
  const logTester = new LogTester()
  logTester.buildCar("Jeep", "Cherokee")
})
