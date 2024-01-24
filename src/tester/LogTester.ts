
// import { withTraceId } from "../log/getLogger"
import { d4l } from "../log/logUtil"
import { getLogger } from "../log/getLogger"

process.env.LOG_DEBUG = "true"
process.env.LOG_PREPEND_TIMESTAMP = "true"

const LOG = getLogger("log/LogTester");
  
class LogTester {
  public buildCar(make: string, model: string): void {
    LOG.debug(`buildCar(): Entering`, {make, model})
  }
}


// withTraceId( '00000000-0000-0000-0000-000000000000', () => {
//   const logTester = new LogTester()
//   logTester.buildCar("Jeep", "Cherokee")
// })
