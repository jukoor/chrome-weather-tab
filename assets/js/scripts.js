(function() {

	/* Disable all features that only work in real Chrome Extension Environment */
	let devMode = 1;

	/* Alias */
	const find = document.querySelector.bind(document);
	const findAll = document.querySelectorAll.bind(document);
	const findId = document.getElementById.bind(document);

	/* Unsplash API */
	const clientId = apikeys.UNSPLASH_CLIENT_ID;
	const unsplashUrl = `https://api.unsplash.com/photos/random?query=landscape&client_id=${clientId}`;
	const unsplasSourceUrl = 'https://source.unsplash.com/featured?berlin&orientation=landscape';

	const weatherApiKey = apikeys.OWM_API_KEY;

	// settings defaults
	let savedSettings = {
		cityLat: 52.5071778,
		cityLon: 13.4468267,
		cityName: 'London',
		cityCountry: 'England',
		tempMode: 'celcius',
		windMode: 'kmh',
		windSpeed: 0,
		darkMode: false
	};

	const elements = {
		bgImg: find('.js_bg_img'),
		locationCity: find('.js_location'),
		locationCountry: find('.js_country'),
		video: find('.js_video'),
		videoSource: find('.js_video_source'),
		date: find('.js_date'),
		temp: find('.js_temp'),
		description: find('.js_description .js_value'),
		descriptionEmoji: find('.js_emoji'),
		tempMinMax: find('.js_temp_min_max .value'),
		chanceOfRain: find('.js_chance_of_rain .js_value'),
		uvIndex: find('.js_uv_index .js_value'),
		wind: find('.js_wind .js_value'),
		sunriseSunset: find('.js_sunrise_sunset .js_value'),
		icon: find('.js_weather_icon'),
		forecastList: find('.js_forecast_list'),
		currentWeather: find('.js_current_weather'),
		setDayTodayBtn: find('.js_set_date_today'),
		airquality: find('.js_air_quality .js_value'),
		settingsWindow: find('.js_settings'),
		settingsOpen: find('.js_settings_trigger'),
		settingsClose: find('.js_settings .js_close'),
		settingsLocation: findId('locationSearch'),
		settingsTempBool: findId('settingTempMode'),
		settingsWindBool: findId('settingWindSpeed'),
		settingsDarmodeBool: findId('settingDarkMode')
	};



	let weatherDataTemp;

	const forecastElems = {
		list: find('.js_forecast_list')
	};


	initApp();

	/**
	 * Initialize application
	 */
	function initApp() {
		setCurrentDate();

		getUserLocation();

		// fetchWeather('metric', 52.5071778, 13.4468267);

		// displayImage(unsplasSourceUrl);
		initClickListener();
	}


	/**
	 * Get, format and set current date
	 */
	function setCurrentDate() {
		const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
		const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		let today = new Date();
		let day = today.getDay();
		let fullDate = today.getDate() + ', ' + months[(today.getMonth())] + ' ' + today.getFullYear();

		elements.date.textContent = weekdays[day] + " " + fullDate;
	}

	/**
	 * Fetch image from Unsplash API
	 */
	// function fetchImage() {
	//
	// 	fetch(unsplasSourceUrl)
	// 		.then(response => response.json())
	// 		.then(data => {
	// 			displayImage(data);
	// 		}).catch(function(error) {
	// 			console.log(error);
	// 		});
	// }

	/**
	 * Fetch image from Unsplash API and set as background
	 * @param {object} imgData Fetched image data
	 */
	function displayImage(imgLink) {

		// const imgContainer = document.querySelector('.js_background');
		// const imgAuthor = document.querySelector('.js_author');

		// let img = document.createElement("img");
		// img.src = imgData.urls.regular;
		// img.src = 'bg.jpg';

		// let link = document.createElement("a");
		// link.href = imgData.user.links.html;
		// link.classList.add('link');
		// link.textContent = 'Image by: ' + imgData.user.name;

		// imgContainer.appendChild(img);
		// imgAuthor.appendChild(link);

		// elements.currentWeather.style.backgroundImage = "url('" + imgLink + "')";
	}

	function getUserLocation() {
		/* Get User Location */
		var options = {
			enableHighAccuracy: true,
			timeout: 5000,
			maximumAge: 0
		};

		function success(pos) {
			var coordinates = pos.coords;

			// save user location to storage
			if (!devMode) {
				chrome.storage.sync.set({
					userLocationLat: coordinates.latitude
				});
				chrome.storage.sync.set({
					userLocationLon: coordinates.longitude
				});
			}

			fetchWeather('metric', coordinates.latitude, coordinates.longitude);
		}

		function error(err) {
			console.warn(`ERROR(${err.code}): ${err.message}`);
		}

		navigator.geolocation.getCurrentPosition(success, error, options);
	}

	/**
	 * Fetches WeatherData from openweathermap API
	 */
	function fetchWeather(weatherUnit, lat, long) {

		/* Weather Data */

		// const inputVal = 'Berlin';
		// const cityIdBerlin = 2950159;
		let unit = weatherUnit;
		let userPosLat = lat;
		let userPosLong = long;
		let weatherUrl;

		// fetch city from coordinates: reverse geocoding
		let cityFromCrds = `http://api.openweathermap.org/geo/1.0/reverse?lat=${userPosLat}&lon=${userPosLong}&limit=5&appid=${weatherApiKey}`;
		fetch(cityFromCrds)
			.then(response => response.json())
			.then(data => {

				// display user location city and countnry
				elements.locationCity.textContent = data[0].name;
				elements.locationCountry.textContent = data[0].country;

				// save user location city and country to storage
				if (!devMode) {
					chrome.storage.sync.set({
						cityName: data[0].name
					});
					chrome.storage.sync.set({
						countryName: data[0].country
					});
				}

			}).catch(function(error) {
				console.log(error);
			});


		// var berlinlat = '52.5071778';
		// var berlinLong = '13.4468267';
		weatherUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${userPosLat}&lon=${userPosLong}&appid=${weatherApiKey}&units=${unit}&exclude=minutely,hourly`;

		// fetch weather data and display it
		fetch(weatherUrl)
			.then(response => response.json())
			.then(data => {
				displayWeather(data, 0, weatherUnit);
				weatherDataTemp = data;
				document.body.dataset.tempMode = '';
				document.body.dataset.tempMode = unit;
				// console.log("fetched");
			}).catch(function(error) {
				console.log(error);
			});
		// }

	}

	/**
	 * Sets fetched weather data to corresponding HTML element
	 * @param {object} weatherData Fetched weather data object containing current condition and 8 days forecast
	 * @param {int} day Day number starting at zero to fetch weather for that day
	 */
	function displayWeather(weatherData, day, weatherUnit) {
		console.log(weatherData);

		/* Current weather condition */
		// setVideoSource(weatherData.current.weather[0].id);
		elements.temp.textContent = Math.round(weatherData.current.temp, 2);
		elements.descriptionEmoji.textContent = getIconForWeather(weatherData.current.weather[0].id);
		elements.description.textContent = weatherData.current.weather[0].description;

		/* Highlights */
		elements.tempMinMax.textContent = Math.round(weatherData.daily[day].temp.max, 2) + '° / ' + Math.round(weatherData.daily[day].temp.min, 2) + '°';
		elements.chanceOfRain.textContent = Math.round(weatherData.daily[day].pop * 100, 2) + '%';
		elements.uvIndex.textContent = weatherData.daily[day].uvi;
		elements.wind.textContent = setWindSpeed(weatherData.daily[day].wind_speed);
		elements.sunriseSunset.textContent = getTimeFromTimestamp(weatherData.daily[day].sunrise) + ' / ' + getTimeFromTimestamp(weatherData.daily[day].sunset);
		fetchAndSetAirQualityData(day);


		elements.bgImg.src = 'assets/img/weather/' + weatherData.current.weather[0].icon + '.jpg';


		if (day === 0) {
			createForecastList(weatherData);
		}

	}

	function setWindSpeed(windSpeed) {
		console.log(savedSettings.windSpeed);
		savedSettings.windSpeed = windSpeed;

		console.log(savedSettings);
		if (savedSettings.tempMode == 'celcius' && savedSettings.windMode == 'kmh') {
			return Math.round((savedSettings.windSpeed * 3.6), 2) + " km/h";
		} else if (savedSettings.tempMode == 'celcius' && savedSettings.windMode == 'mph') {
			return Math.round((savedSettings.windSpeed * 2.237), 2) + " mph";
		} else if (savedSettings.tempMode == 'fahrenheit' && savedSettings.windMode == 'kmh') {
			return Math.round((savedSettings.windSpeed * 1.61), 2) + " km/h";
		} else if (savedSettings.tempMode == 'fahrenheit' && savedSettings.windMode == 'mph') {
			return Math.round(savedSettings.windSpeed) + " mph";
		}
	}

	function fetchAndSetAirQualityData(day) {

		const airPollutionUrl = `http://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=52.5067614&lon=13.2846508&appid=${weatherApiKey}`;
		const ratings = ['Good', 'Fair', 'Moderate', 'Bad', 'Unhealthy'];

		// Air Quality
		fetch(airPollutionUrl)
			.then(response => response.json())
			.then(data => {
				// console.log(data);
				elements.airquality.textContent = ratings[data.list[0].main.aqi - 1];
			})
			.catch(() => {
				console.log("Air Quality Index temporarily not available. Please try again later.");
				elements.airquality.textContent = 'N/A';
			});
	}


	function setVideoSource(weatherCode) {
		let video = elements.video;
		let source = elements.videoSource;

		source.setAttribute('src', 'assets/video/' + weatherCode + '.mp4');

		video.load();
		video.play();
	}



	const createForecastList = (weatherData) => {

		let dailyWeather = weatherData.daily;

		// clear list
		elements.forecastList.innerHTML = '';


		for (let i = 0; i < dailyWeather.length; i++) {
			let day = dailyWeather[i];

			// skip days 0 (today), 6 and 7
			if ([0, 6, 7].indexOf(i) === -1) {
				let listItem = `<li class="day js_day" data-idx="${i}" data-day="${getDayOfMonthFromTimestamp(day.dt)}.">
					<span class="date_day">${getDayFromTimestamp(day.dt)}</span>
					<span class="icon_description">
						<img class="day_icon js_day_icon" width="60" src="assets/icons/weather/${day.weather[0].icon}.svg" />
						<span class="day_description js_day_description">${day.weather[0].main}</span>
					</span>
					<span class="day_min_max">
						<span class="day_max js_day_max">${Math.round(day.temp.max,2)}°</span>
						<span class="day_min js_day_min">${Math.round(day.temp.min,2)}°</span>
					</span>

				</li>`;

				elements.forecastList.appendChild(createItemNode(listItem, i, getDayFromTimestamp(day.dt)));
			}
		}

	};


	const createItemNode = (item, i, daytext) => {
		var template = document.createElement('template');
		template.innerHTML = item;
		template.content.childNodes[0].addEventListener('click', function() {
			findAll(".js_day").forEach((el) => el.classList.remove("active"));
			this.classList.add('active');
			displayWeather(weatherDataTemp, i);
			// update headline text
			find('.js_today_label').textContent = daytext;
			// show today btn
			elements.setDayTodayBtn.classList.add('active');
		});
		return template.content.childNodes[0];
	};


	/* Return Day (short) from Timestamp */
	function getDayShortFromTimestamp(timestamp) {
		var date;
		var dayOfWeek;
		var daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

		date = new Date(timestamp * 1000);
		dayOfWeek = daysShort[date.getDay()];

		return dayOfWeek;
	}

	/* Return Day from Timestamp */
	function getDayFromTimestamp(timestamp) {
		var date;
		var dayOfWeek;
		var daysShort = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

		date = new Date(timestamp * 1000);
		dayOfWeek = daysShort[date.getDay()];

		return dayOfWeek;
	}

	function getMonthShortFromTimestamp(timestamp) {
		var date;
		var dayOfWeek;
		const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		let today = new Date();
		let day = today.getDay();


		return monthsShort[(today.getMonth())];
	}

	function getIconForWeather(weatherId) {
		let weatherIdString = weatherId.toString(10);
		let idFirstNumber = weatherIdString.charAt(0);

		// if weather condition id starts with 8, use the full id, otherwise only the first number
		let lookUpId = parseInt(idFirstNumber) == 8 ? weatherId : idFirstNumber;

		let emojiLookup = {
			2: '🌪', // thunderstorm
			3: '🌧', // drizzle: light rain
			5: '☔️', // rain
			6: '❄️', // snow
			7: '🌀', // atmosphere: smoke/dust
			800: '☀️', // clear sky/sun
			801: '🌤', // few clouds
			802: '⛅️', // medium clouds
			803: '🌥', // many clouds
			804: '☁️' // complete clouds
		};

		return emojiLookup[lookUpId];
	}


	/* Return Day from Timestamp */
	function getDayOfMonthFromTimestamp(timestamp) {
		var date;
		var dayOfMonth;

		date = new Date(timestamp * 1000);
		dayOfMonth = date.getDate();

		return dayOfMonth;
	}

	/* Return Time from Timestamp */
	function getTimeFromTimestamp(timestamp) {
		var date;
		var hour;

		date = new Date(timestamp * 1000);

		hour = date.toLocaleTimeString();

		return hour.slice(0, -3);
	}



	function initClickListener() {
		/* Reset Highlights Data to today */
		elements.setDayTodayBtn.addEventListener('click', function() {
			this.classList.remove('active');
			findAll(".js_day").forEach((el) => el.classList.remove("active"));
			find('.js_today_label').textContent = 'Today';
			displayWeather(weatherDataTemp, 0, 1);
		});

		/* Settings: Close */
		elements.settingsClose.addEventListener('click', function() {
			elements.settingsWindow.classList.remove('active');
			document.querySelector('.js_blur_bg').classList.remove('active');
		});


		/* Settings: Open Trigger */
		elements.settingsOpen.addEventListener('click', function() {
			elements.settingsWindow.classList.add('active');
			document.querySelector('.js_blur_bg').classList.add('active');
		});

		// city search
		let citySearchApi;
		let citySearchLength = 0;



		// var countries = ["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Anguilla", "Antigua &amp; Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia &amp; Herzegovina", "Botswana", "Brazil", "British Virgin Islands", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Central Arfrican Republic", "Chad", "Chile", "China", "Colombia", "Congo", "Cook Islands", "Costa Rica", "Cote D Ivoire", "Croatia", "Cuba", "Curacao", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Falkland Islands", "Faroe Islands", "Fiji", "Finland", "France", "French Polynesia", "French West Indies", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea Bissau", "Guyana", "Haiti", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Isle of Man", "Israel", "Italy", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macau", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauro", "Nepal", "Netherlands", "Netherlands Antilles", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Puerto Rico", "Qatar", "Reunion", "Romania", "Russia", "Rwanda", "Saint Pierre &amp; Miquelon", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "St Kitts &amp; Nevis", "St Lucia", "St Vincent", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor L'Este", "Togo", "Tonga", "Trinidad &amp; Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks &amp; Caicos", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Virgin Islands (US)", "Yemen", "Zambia", "Zimbabwe"];

		/* Settings: City Search Input */
		elements.settingsLocation.addEventListener('keyup', function() {
			let val = this.value;
			let valLenght = this.value.length;
			citySearchApi = `http://api.openweathermap.org/geo/1.0/direct?q=${this.value}&limit=5&appid=${weatherApiKey}`;

			// City Search
			if (valLenght > 0) {
				fetch(citySearchApi)
					.then(response => response.json())
					.then(data => {
						console.log(data);
						autocomplete(elements.settingsLocation, data, val);

						elements.settingsLocation.addEventListener('change', function() {
							var me = this;
							window.setTimeout(function() {
								fetchWeather('metric', me.dataset.lat, me.dataset.lon);

								// save selected city to chrome storage
								// chrome.storage.sync.set({
								// 	selectedCityName: "test"
								// });
								//
								// chrome.storage.sync.get('selectedCityName', function(data) {
								// 	console.log(data);
								// });
							}, 250);

						});

					})
					.catch(() => {});
			}
		});

		/* Settings: Temperature Mode */
		/* On: Celsius, Off: Fahrenheit */
		elements.settingsTempBool.addEventListener('change', function() {
			if (this.checked) {
				savedSettings.tempMode = 'celcius';
				fetchWeather('metric', savedSettings.cityLat, savedSettings.cityLon);
			} else {
				savedSettings.tempMode = 'fahrenheit';
				fetchWeather('imperial', savedSettings.cityLat, savedSettings.cityLon);
			}
		});

		/* Settings: Wind Mode */
		/* On: Meter/Second; Off: Miles/Hour */
		elements.settingsWindBool.addEventListener('change', function() {
			if (this.checked) {
				savedSettings.windMode = 'kmh';
			} else {
				savedSettings.windMode = 'mph';
			}
			elements.wind.textContent = setWindSpeed(savedSettings.windSpeed);
		});

		/* Settings: Dark Mode */
		elements.settingsDarmodeBool.addEventListener('change', function() {
			if (this.checked) {
				document.body.classList.add('darkmode');
			} else {
				document.body.classList.remove('darkmode');
			}
		});

	}

})();