async function uploadImage(base64string) {
	const data = await chrome.storage.local.get(["apiKey", "imgbb"])
	const apiKey = data.apiKey
	const activated = data.imgbb
	if(!(activated && apiKey && /^[a-zA-Z0-9]{32}$/.test(apiKey))){return {status: 403}}

	let response = await fetch("https://api.imgbb.com/1/upload", {
		method: "POST",
		body: new URLSearchParams({
			key: apiKey,
			image: base64string,
		})
	}) 

	response = await response.json()

	const result = {status: response.status || response.status_code}
	if(result.status === 200) {
		result.url = response.data.url
	}
	return result
}