/*
 * DO NOT use the logger herein!!
 */


export function sendStatToKpitracks(requestBodyString: string): void {
  let kpitracksEzKey = process.env.KPITRACKS_EZ_KEY
  kpitracksEzKey = kpitracksEzKey?.trim()

  if (kpitracksEzKey != null && kpitracksEzKey?.length > 0) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 750)
    const url = "https://stat.kpitracks.com/c"
    requestBodyString = requestBodyString + `&ezkey=${process.env.KPITRACKS_EZ_KEY?.trim()}`

    console.log(`sendStatToKpitracks(): Sending POST to Stathat url = '${url}',  requestBodyString = '${requestBodyString}'`)

    const beforeAt = new Date()
    // While still experimental, the global fetch API is available by default in Node.js 18
    fetch(url, { 
      method: 'POST', 
      signal: controller.signal,
      body: requestBodyString
    }).then(response => {
      // completed request before timeout fired
      const deltaInMs = new Date().getTime() - beforeAt.getTime()
      // console.log(`Stathat fetch completed after ${deltaInMs} milliseconds,  with response = ${d4l(response)}`)

      // If you only wanted to timeout the request, not the response, add:
      clearTimeout(timeoutId)
    }).catch(err => {
      console.log(`sendStatToKpitracks(): Failed to send stat.  requestBodyString = ${requestBodyString},  Reason: ${JSON.stringify(err)}`);
    })
  }
}