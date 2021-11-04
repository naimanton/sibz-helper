{
	"name": "Sibz Helper",
	"version": "1.0",
	"manifest_version": 3,
	"content_scripts": [
	 	{
			"matches": [
                "https://ru.siberianhealth.com/ru/",
                "https://kz.siberianhealth.com/ru/"
	    	],
	    	"js": ["content.js"]
		}
	]
}
