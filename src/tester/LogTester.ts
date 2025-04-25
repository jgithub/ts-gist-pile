
import { withStoreId } from "../log/getLogger"
import { d4l, d4lObfuscate } from "../log/logUtil"
import { getLogger } from "../log/getLogger"
import { context, trace, isSpanContextValid, Span, SpanStatusCode } from '@opentelemetry/api';
// import { TraceInitializer } from "../trace/TraceInitializer";

// import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
// diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

process.env.LOG_DEBUG = "true"
process.env.LOG_PREPEND_TIMESTAMP = "true"

const LOG = getLogger("log.LogTester");
// TraceInitializer.getInstance("log.LogTester")
const tracer = trace.getTracer('log.LogTester');



class LogTester {
  public buildCar(make: string, model: string): void {
    tracer.startActiveSpan('buildCar()', (span) => {
      console.log(span)


      const confirmSpan = trace.getSpan(context.active()); 
      if (confirmSpan) {
        const { traceId, spanId } = confirmSpan.spanContext();
        console.log(`traceId = '${traceId}', spanId = '${spanId}'`)
      } else {
        console.log("No Confirmed Span")
      }


      const usernameToTrack = 'bob'
      span.setAttributes({ usernameToTrack });
      this.doSomething();
      LOG.debug(`buildCar(): Entering.  `, { make, model })
      LOG.debug(() => `buildCar(): Entering with make = ${d4l(make)}`)
      LOG.fatal(`buildCar(): password = ${d4lObfuscate("password")}`)
      LOG.fatal(`buildCar(): password = ${d4lObfuscate("123456789012345")}`)
      LOG.fatal(`buildCar(): password = ${d4lObfuscate("ABCDEFGHIJKLMNOPQRSTUVWXYZ")}`)
      LOG.fatal(`buildCar(): password = ${d4lObfuscate("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefg")}`)
      LOG.fatal(`buildCar(): password = ${d4lObfuscate("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz")}`)
      
      // I don't think this is needed here, right?
      // span.end();
    })
  }

  private doSomething(): void {
    const span = tracer.startSpan('doSomething');
    try {
      LOG.debug(`doSomething(): Entering`)
      // your logic here
    } catch (err) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: String(err) });
      throw err;
    } finally {
      span.end();
    }
  }
}


withStoreId( '00000000-0000-0000-0000-000000000000', () => {
  const logTester = new LogTester()
  logTester.buildCar("Jeep", "Cherokee")
})
