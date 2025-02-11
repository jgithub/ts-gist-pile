/*
 * DO NOT use the logger herein!!  
 * Circular references!
 */

export function sendPlusOneCountToStathat(countStatName: string): void {
  if (process.env.STATHAT_EZ_KEY != null && process.env.STATHAT_EZ_KEY.trim()?.length > 0) {

    const controller = new AbortController()
    // 1 second timeout:
    const timeoutId = setTimeout(() => controller.abort(), 750)

    const url = "https://api.stathat.com/ez"
    // This param should either be 'ezkey' or 'email'... I'm not sure which
    const ezKeyLabel = "ezkey" // vs email
    const requestBody = `stat=${countStatName.trim()}&${ezKeyLabel}=${process.env.STATHAT_EZ_KEY?.trim()}&count=1`

    /*
     * % curl -v -d "stat=sisu _ERROR&email=ezkey&count=1" https://api.stathat.com/ez
     */

    // console.log(`Sending POST to Stathat url = '${url}',  requestBody = '${requestBody}'`)

    // setTimeout is used to ensure that the fetch call is non-blocking and done out-of-band
    setTimeout(() => {
      const beforeAt = new Date()
      // While still experimental, the global fetch API is available by default in Node.js 18
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        signal: controller.signal,
        body: requestBody
      }).then(response => {
        // completed request before timeout fired
        const deltaInMs = new Date().getTime() - beforeAt.getTime()
        // console.log(`Stathat fetch completed after ${deltaInMs} milliseconds,  with response = ${d4l(response)}`)

        // If you only wanted to timeout the request, not the response, add:
        clearTimeout(timeoutId)
      }).catch(err => {
        // console.log(`[STATHAT][ ERROR] Reason: ${d4l(err)}`)
      })
    }, 0)
  }
}


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