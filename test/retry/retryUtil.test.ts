import { expect } from "chai"
import { retryWithBackoff, RetryOptions, DEFAULT_RETRY_OPTIONS } from "../../src/retry/retryUtil"

describe("retryUtil", () => {
  describe("retryWithBackoff", () => {
    describe("successful operations", () => {
      it("should return result on first successful attempt", async () => {
        const operation = async () => "success"

        const result = await retryWithBackoff(operation, {
          maxAttempts: 3,
          backoffMs: 100,
          shouldRetry: () => false,
        })

        expect(result).to.equal("success")
      })

      it("should not retry if shouldRetry returns false", async () => {
        let attempts = 0
        const operation = async () => {
          attempts++
          return "success"
        }

        await retryWithBackoff(operation, {
          maxAttempts: 5,
          backoffMs: 100,
          shouldRetry: () => false,
        })

        expect(attempts).to.equal(1)
      })
    })

    describe("retry on errors", () => {
      it("should retry on errors when shouldRetry returns true", async () => {
        let attempts = 0
        const operation = async () => {
          attempts++
          if (attempts < 3) {
            throw new Error("Transient error")
          }
          return "success"
        }

        const result = await retryWithBackoff(operation, {
          maxAttempts: 5,
          backoffMs: 10,
          shouldRetry: (error) => error != null,
        })

        expect(result).to.equal("success")
        expect(attempts).to.equal(3)
      })

      it("should throw last error when maxAttempts exceeded", async () => {
        const operation = async () => {
          throw new Error("Persistent error")
        }

        try {
          await retryWithBackoff(operation, {
            maxAttempts: 3,
            backoffMs: 10,
            shouldRetry: (error) => error != null,
          })
          expect.fail("Should have thrown error")
        } catch (error: any) {
          expect(error.message).to.equal("Persistent error")
        }
      })

      it("should not retry on specific errors when shouldRetry returns false", async () => {
        let attempts = 0
        const operation = async () => {
          attempts++
          const error: any = new Error("Non-retryable error")
          error.code = "NOT_FOUND"
          throw error
        }

        try {
          await retryWithBackoff(operation, {
            maxAttempts: 5,
            backoffMs: 10,
            shouldRetry: (error: any) => error?.code !== "NOT_FOUND",
          })
          expect.fail("Should have thrown error")
        } catch (error: any) {
          expect(error.message).to.equal("Non-retryable error")
          expect(attempts).to.equal(1)
        }
      })
    })

    describe("retry on results (eventual consistency)", () => {
      it("should retry when result is null until non-null", async () => {
        let attempts = 0
        const operation = async () => {
          attempts++
          if (attempts < 3) {
            return null
          }
          return { id: "123", name: "John" }
        }

        const result = await retryWithBackoff(operation, {
          maxAttempts: 5,
          backoffMs: 10,
          shouldRetry: (error, result) => result == null,
        })

        expect(result).to.deep.equal({ id: "123", name: "John" })
        expect(attempts).to.equal(3)
      })

      it("should return null when maxAttempts exceeded and result still null", async () => {
        const operation = async () => null

        const result = await retryWithBackoff(operation, {
          maxAttempts: 3,
          backoffMs: 10,
          shouldRetry: (error, result) => result == null,
        })

        expect(result).to.be.null
      })

      it("should retry based on custom result validation", async () => {
        let attempts = 0
        const operation = async () => {
          attempts++
          return { status: attempts < 3 ? "pending" : "ready", data: "test" }
        }

        const result = await retryWithBackoff(operation, {
          maxAttempts: 5,
          backoffMs: 10,
          shouldRetry: (error, result) => result?.status !== "ready",
        })

        expect(result.status).to.equal("ready")
        expect(attempts).to.equal(3)
      })
    })

    describe("backoff behavior", () => {
      it("should use exponential backoff by default", async () => {
        const delays: number[] = []
        const startTimes: number[] = []
        let attempts = 0

        const operation = async () => {
          startTimes.push(Date.now())
          attempts++
          if (attempts < 4) {
            throw new Error("Retry me")
          }
          return "success"
        }

        await retryWithBackoff(operation, {
          maxAttempts: 4,
          backoffMs: 100,
          backoffMultiplier: 2,
          jitter: 0, // No jitter for predictable delays
          shouldRetry: (error) => error != null,
        })

        // Calculate actual delays between attempts
        for (let i = 1; i < startTimes.length; i++) {
          delays.push(startTimes[i] - startTimes[i - 1])
        }

        // Verify exponential backoff: 100ms, 200ms, 400ms (±10ms tolerance)
        expect(delays[0]).to.be.closeTo(100, 10)
        expect(delays[1]).to.be.closeTo(200, 10)
        expect(delays[2]).to.be.closeTo(400, 10)
      })

      it("should use constant backoff when backoffMultiplier is 1", async () => {
        const delays: number[] = []
        const startTimes: number[] = []
        let attempts = 0

        const operation = async () => {
          startTimes.push(Date.now())
          attempts++
          if (attempts < 4) {
            throw new Error("Retry me")
          }
          return "success"
        }

        await retryWithBackoff(operation, {
          maxAttempts: 4,
          backoffMs: 100,
          backoffMultiplier: 1,
          jitter: 0,
          shouldRetry: (error) => error != null,
        })

        for (let i = 1; i < startTimes.length; i++) {
          delays.push(startTimes[i] - startTimes[i - 1])
        }

        // All delays should be ~100ms
        delays.forEach((delay) => {
          expect(delay).to.be.closeTo(100, 10)
        })
      })

      it("should cap delay at maxDelayMs", async () => {
        const delays: number[] = []
        const startTimes: number[] = []
        let attempts = 0

        const operation = async () => {
          startTimes.push(Date.now())
          attempts++
          if (attempts < 5) {
            throw new Error("Retry me")
          }
          return "success"
        }

        await retryWithBackoff(operation, {
          maxAttempts: 5,
          backoffMs: 100,
          backoffMultiplier: 2,
          maxDelayMs: 250, // Cap at 250ms
          jitter: 0,
          shouldRetry: (error) => error != null,
        })

        for (let i = 1; i < startTimes.length; i++) {
          delays.push(startTimes[i] - startTimes[i - 1])
        }

        // Delays: 100ms, 200ms, 250ms (capped), 250ms (capped)
        expect(delays[0]).to.be.closeTo(100, 10)
        expect(delays[1]).to.be.closeTo(200, 10)
        expect(delays[2]).to.be.closeTo(250, 10) // Capped
        expect(delays[3]).to.be.closeTo(250, 10) // Capped
      })

      it("should apply jitter to delays", async () => {
        const delays: number[] = []
        const startTimes: number[] = []
        let attempts = 0

        const operation = async () => {
          startTimes.push(Date.now())
          attempts++
          if (attempts < 4) {
            throw new Error("Retry me")
          }
          return "success"
        }

        await retryWithBackoff(operation, {
          maxAttempts: 4,
          backoffMs: 100,
          backoffMultiplier: 2,
          jitter: 0.2, // 20% jitter
          shouldRetry: (error) => error != null,
        })

        for (let i = 1; i < startTimes.length; i++) {
          delays.push(startTimes[i] - startTimes[i - 1])
        }

        // With 20% jitter:
        // Attempt 1: 100ms ± 20ms = 80-120ms
        // Attempt 2: 200ms ± 40ms = 160-240ms
        // Attempt 3: 400ms ± 80ms = 320-480ms
        expect(delays[0]).to.be.within(80, 120)
        expect(delays[1]).to.be.within(160, 240)
        expect(delays[2]).to.be.within(320, 480)
      })
    })

    describe("callbacks", () => {
      it("should invoke onRetry callback before each retry", async () => {
        const retryEvents: Array<{ attempt: number; delayMs: number; error?: string; result?: any }> = []
        let attempts = 0

        const operation = async () => {
          attempts++
          if (attempts < 3) {
            throw new Error(`Error ${attempts}`)
          }
          return "success"
        }

        await retryWithBackoff(operation, {
          maxAttempts: 5,
          backoffMs: 10,
          jitter: 0,
          shouldRetry: (error) => error != null,
          onRetry: (error: any, result, attempt, delayMs) => {
            retryEvents.push({
              attempt,
              delayMs,
              error: error?.message,
              result,
            })
          },
        })

        expect(retryEvents).to.have.lengthOf(2)
        expect(retryEvents[0]).to.deep.equal({
          attempt: 1,
          delayMs: 10,
          error: "Error 1",
          result: undefined,
        })
        expect(retryEvents[1]).to.deep.equal({
          attempt: 2,
          delayMs: 20,
          error: "Error 2",
          result: undefined,
        })
      })

      it("should invoke onRetry with result when retrying on result", async () => {
        const retryEvents: Array<{ attempt: number; result: any }> = []
        let attempts = 0

        const operation = async () => {
          attempts++
          if (attempts < 3) {
            return null
          }
          return "success"
        }

        await retryWithBackoff(operation, {
          maxAttempts: 5,
          backoffMs: 10,
          shouldRetry: (error, result) => result == null,
          onRetry: (error, result, attempt, delayMs) => {
            retryEvents.push({ attempt, result })
          },
        })

        expect(retryEvents).to.have.lengthOf(2)
        expect(retryEvents[0].result).to.be.null
        expect(retryEvents[1].result).to.be.null
      })

      it("should invoke onFailure when all retries exhausted (error case)", async () => {
        let failureEvent: any = null

        const operation = async () => {
          throw new Error("Persistent error")
        }

        try {
          await retryWithBackoff(operation, {
            maxAttempts: 3,
            backoffMs: 10,
            shouldRetry: (error) => error != null,
            onFailure: (error: any, result, attempts) => {
              failureEvent = { error: error?.message, result, attempts }
            },
          })
        } catch (error) {
          // Expected
        }

        expect(failureEvent).to.deep.equal({
          error: "Persistent error",
          result: undefined,
          attempts: 3,
        })
      })

      it("should not invoke onFailure when operation succeeds", async () => {
        let failureCalled = false

        const operation = async () => "success"

        await retryWithBackoff(operation, {
          maxAttempts: 3,
          backoffMs: 10,
          shouldRetry: () => false,
          onFailure: () => {
            failureCalled = true
          },
        })

        expect(failureCalled).to.be.false
      })
    })

    describe("attempt parameter in shouldRetry", () => {
      it("should pass current attempt number to shouldRetry", async () => {
        const attemptNumbers: number[] = []
        let callCount = 0

        const operation = async () => {
          callCount++
          if (callCount < 4) {
            throw new Error("Retry me")
          }
          return "success"
        }

        await retryWithBackoff(operation, {
          maxAttempts: 5,
          backoffMs: 10,
          shouldRetry: (error, result, attempt) => {
            attemptNumbers.push(attempt)
            return error != null
          },
        })

        // shouldRetry is called for attempts 1, 2, 3 (4 succeeds)
        expect(attemptNumbers).to.deep.equal([1, 2, 3, 4])
      })

      it("should allow conditional retry based on attempt number", async () => {
        let attempts = 0

        const operation = async () => {
          attempts++
          throw new Error("Always fails")
        }

        try {
          await retryWithBackoff(operation, {
            maxAttempts: 10,
            backoffMs: 10,
            // Only retry first 2 attempts
            shouldRetry: (error, result, attempt) => error != null && attempt < 3,
          })
        } catch (error) {
          // Expected
        }

        expect(attempts).to.equal(3) // Initial attempt + 2 retries
      })
    })

    describe("DEFAULT_RETRY_OPTIONS", () => {
      it("should have sensible defaults", () => {
        expect(DEFAULT_RETRY_OPTIONS.maxAttempts).to.equal(3)
        expect(DEFAULT_RETRY_OPTIONS.backoffMs).to.equal(100)
        expect(DEFAULT_RETRY_OPTIONS.backoffMultiplier).to.equal(2)
        expect(DEFAULT_RETRY_OPTIONS.jitter).to.equal(0.1)
      })

      it("should work with partial options using defaults", async () => {
        let attempts = 0
        const operation = async () => {
          attempts++
          if (attempts < 2) {
            throw new Error("Retry me")
          }
          return "success"
        }

        const result = await retryWithBackoff(operation, {
          maxAttempts: DEFAULT_RETRY_OPTIONS.maxAttempts!,
          backoffMs: DEFAULT_RETRY_OPTIONS.backoffMs!,
          backoffMultiplier: DEFAULT_RETRY_OPTIONS.backoffMultiplier,
          jitter: DEFAULT_RETRY_OPTIONS.jitter,
          shouldRetry: (error) => error != null,
        })

        expect(result).to.equal("success")
      })
    })

    describe("real-world examples", () => {
      it("should handle eventual consistency scenario", async () => {
        // Simulate eventual consistency: document appears after a few attempts
        let attempts = 0
        const getDocument = async () => {
          attempts++
          if (attempts < 4) {
            return null // Not yet consistent
          }
          return { userId: "test-user", name: "John Doe" }
        }

        const doc = await retryWithBackoff(getDocument, {
          maxAttempts: 5,
          backoffMs: 100,
          shouldRetry: (error, result) => result == null,
        })

        expect(doc).to.deep.equal({ userId: "test-user", name: "John Doe" })
        expect(attempts).to.equal(4)
      })

      it("should handle network errors with exponential backoff", async () => {
        let attempts = 0
        const fetchData = async () => {
          attempts++
          if (attempts < 3) {
            const error: any = new Error("Network error")
            error.code = "ECONNRESET"
            throw error
          }
          return { data: "response" }
        }

        const result = await retryWithBackoff(fetchData, {
          maxAttempts: 5,
          backoffMs: 100,
          backoffMultiplier: 2,
          jitter: 0.1,
          shouldRetry: (error: any) => error?.code === "ECONNRESET",
          onRetry: (error: any, result, attempt, delayMs) => {
            // In real app, would log here
            // console.log(`Retry attempt ${attempt} after ${delayMs}ms`)
          },
        })

        expect(result).to.deep.equal({ data: "response" })
      })

      it("should not retry on client errors (4xx)", async () => {
        let attempts = 0
        const apiCall = async () => {
          attempts++
          const error: any = new Error("Bad request")
          error.statusCode = 400
          throw error
        }

        try {
          await retryWithBackoff(apiCall, {
            maxAttempts: 5,
            backoffMs: 100,
            shouldRetry: (error: any) => {
              // Only retry on 5xx server errors
              return error?.statusCode >= 500
            },
          })
          expect.fail("Should have thrown error")
        } catch (error: any) {
          expect(error.message).to.equal("Bad request")
          expect(attempts).to.equal(1) // No retries
        }
      })

      it("should retry until specific condition is met", async () => {
        let attempts = 0
        const checkJobStatus = async () => {
          attempts++
          const statuses = ["pending", "pending", "processing", "processing", "completed"]
          return { status: statuses[attempts - 1] || "completed", jobId: "123" }
        }

        const result = await retryWithBackoff(checkJobStatus, {
          maxAttempts: 10,
          backoffMs: 50,
          backoffMultiplier: 1, // Constant backoff for polling
          jitter: 0,
          shouldRetry: (error, result) => result?.status !== "completed",
        })

        expect(result.status).to.equal("completed")
        expect(attempts).to.equal(5)
      })
    })
  })
})
