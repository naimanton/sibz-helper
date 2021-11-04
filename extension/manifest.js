{
	"name": "Sibz Helper",
	"version": "1.0",
	"manifest_version": 3,
	"content_scripts": [
	 	{
			"matches": [
                "https://ru.siberianhealth.com/ru/store/header/new/edit/",
                "https://kz.siberianhealth.com/ru/store/header/new/edit/",
                "https://ru.siberianhealth.com/ru/store/header/order/showcase/new/",
                "https://kz.siberianhealth.com/ru/store/header/order/showcase/new/"
	    	],
	    	"js": ["content.js"]
		}
	]
}
