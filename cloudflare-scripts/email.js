
addEventListener("fetch", event => {
	const { request } = event
	if (request.method === "POST") {
	  return event.respondWith(handleRequest(request))
	}
	else if (request.method === "GET") {
	  return event.respondWith(new Response(`The request was a GET`))
	}
  })

async function handleRequest(request) {
  let pathname = new URL(request.url).pathname
  // return new Response(pathname)
  console.log("wefwerwergrg");
  let reqBody;
  if(pathname == "/updateTag"){
    reqBody = await email(request)
  }
  else{
    return new Response("Invailid path mentioned")
  }
  const retBody = `The request body sent in ${JSON.stringify(reqBody)}`
  return new Response(retBody)
}

async function email(request) {
  const { headers } = request
  const contentType = headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
      let bodyy = JSON.stringify(await request.json())
      bodyy = JSON.parse(bodyy)
      let message1=bodyy.data.resource_data.message
      let temp_tag =message1.split("Ticket #")[1].split(":")[0]
      let dataa = {
        "tags": {
          "ticket": {
            "value": temp_tag,
            "color": "#0f61dd"
          }
        }
      }
      let apiUrl="https://api.squadcast.com/v3/incidents/"
      let authApiUrl = "https://auth.squadcast.com/oauth/access-token"
      if(!bodyy.data.resource_data.url.includes("app.squadcast.com")){
        apiUrl="https://api.eu.squadcast.com/v3/incidents/"
        authApiUrl="https://auth.eu.squadcast.com/oauth/access-token"
      }
      let url=apiUrl +bodyy.data.resource_data.id +'/tags'
      let config = {
        method: 'get',
        headers: {
          'X-Refresh-Token': headers.get("x-refresh-token"),
        },
      }
      const barer_token = await fetch(authApiUrl, config)
      const aa= await barer_token.json()
      const token = aa.data.access_token
      let config1 = {
        method: 'put',
        headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
        },
        body:JSON.stringify(dataa)
      }
      return await fetch(url,config1)
  }
  else {
      return 'a file';
  }
}