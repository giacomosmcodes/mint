// an example dynamic worker- this is the test
export default {
  async fetch(request) {
    const url = new URL(request.url)

    if (request.method === "GET" && url.pathname === "/test") {
      const headersToInclude = ["user-agent", "accept", "mint-identity", "x-forwarded-for"]
      let text = `Headers received at /test:\n\n`

      for (const h of headersToInclude) {
        const val = request.headers.get(h) || "<none>"
        text += `${h}: ${val}\n`
      }
    
      text += `congrats for getting mint set up- happy hacking :)\n\n`

      return new Response(text, {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
          "Content-Disposition": 'attachment; filename="mint-test.txt"',
        },
      })
    }

    return new Response("I'm a teapot", {
      status: 418,
      headers: { "Content-Type": "text/plain" },
    })
  }
}
