
import { getLogger } from "../log/getLogger"
import { d4l } from "../log/logUtil"

process.env.LOG_DEBUG = "true"
process.env.LOG_PREPEND_TIMESTAMP = "true"

const LOG = getLogger("log/LogTester");
  
class LogTester {
  public buildCar(make: string, model: string): void {
    LOG.debug(`buildCar(): Entering`, {make, model})
  }
}

const logTester = new LogTester()
logTester.buildCar("Jeep", "Cherokee")