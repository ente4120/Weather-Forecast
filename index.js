const API_KEY = '';
const DEFAULT_CITY_NAME = 'London';
const WEEK_DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function main(){
    // Init Div & CSS
    setCSS();
    setDiv()

    // Init Default Results (London)
    searchWeather();
}

function setCSS(){
    var styles = `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300&family=Rubik:wght@500&display=swap');
        .weather-container { 
            width: 800px;
            margin: 10px 0;
            padding-bottom: 5px;
            font-family: 'Rubik', sans-serif;
            font-size: 17px;
            color: black;
            background: #F3EEEA;
        }
        #weather-panels-container{
            display: flex;
            gap: 6px;
        }
        .search-container{
            width: 780px;
            padding: 10px;
            background: #7071E8;
        }
        .weather-search-text{
            color: white;
            margin-right: 14px;
        }
        .weather-search-input{
            height: 30px;
            width: 250px;
            padding: 10px;
            border: none;
            border-bottom: 3px solid #9EB8D9;
            border-radius: 3px 3px 0 0;
        }
        .weather-search-button{
            position: relative;
            top: 2px;
            font-size: 14px;
            margin-left: 10px;
            padding: 7px 10px;
            border: none;
            background: none;
            border-radius: 5px;
        }
        .weather-search-button:hover{
            background: #595ab9;
        }
        .weather-search-input:focus {
            outline: none;
            border-bottom: 3px solid #FFC5C5;
        }
        #city-or-coordinates-container{
            margin: 15px 15px;
            font-size: 24px;
            color: #161A30;
        }
        .weather-day-panel {
            height: 130px;
            width: 100px;
            padding: 4px;
            text-align: center;
            border-radius: 10px;
        }
        .weather-day-text {
            color: #7071E8;
        }
        .weather-day-icon {
            margin: 10px 0;
        }
    `
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}

function setDiv(){
    // Init Main Container
    const divContainer = document.createElement('Div');
    divContainer.classList.add('weather-container');

    // Create and Set Search Container
    const searchContainer = generateSearch();
    divContainer.appendChild(searchContainer);

    // Create and Set City Name or Coordinates Title Container
    const cityOrCoordinatesContainer = document.createElement('Div');
    cityOrCoordinatesContainer.id = 'city-or-coordinates-container';
    divContainer.appendCinhild(cityOrCoordinatesContainer);

    // Create and Set Weather Panels Container
    const divPanelsContainer = document.createElement('Div');
    divPanelsContainer.id = 'weather-panels-container';
    divContainer.appendChild(divPanelsContainer);

    // Set Main Container in HTML
    let outputElement = document.querySelectorAll("data-div-weather-id");
    if(!outputElement){
        document.body.appendChild(divContainer);
    } else {
        document.getElementById('test').appendChild(divContainer);
    }
}

function generateSearch(){
    // Init Search Container
    const searchContainer = document.createElement('Div');
    searchContainer.classList.add('search-container');

    // Init and Set Search Title
    const spanText = document.createElement('Span');
    spanText.innerText="Weather by City or Cordinates"
    spanText.classList.add('weather-search-text');
    searchContainer.appendChild(spanText);

    // Init and Set Search Input
    const inputContainer = document.createElement('Input');
    inputContainer.id = 'weather-search-input';
    inputContainer.setAttribute('placeholder','"CityName" or "Latitude,Longitude"');
    inputContainer.classList.add('weather-search-input');
    searchContainer.appendChild(inputContainer);

    // Init and Set Search Button
    const searchButton = document.createElement('Button');
    searchButton.innerHTML = "Search"
    searchButton.classList.add('weather-search-button');
    searchButton.onclick = function(){searchWeather()}
    searchContainer.appendChild(searchButton);

    return searchContainer;
}

async function searchWeather(){
    let searchInput = document.getElementById('weather-search-input').value;
    if(!searchInput){
        searchInput = DEFAULT_CITY_NAME;
    }
    const weatherData = await getWeatherData(searchInput);
    const weekData = calculateWeekWeather(weatherData);
    generateWeatherDivContainer(weekData, searchInput);
}

function getWeatherData(cityOrCoordinates){
    const API_URL = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${cityOrCoordinates}/next14days?elements=datetime,temp,icon,conditions&unitGroup=metric&key=${API_KEY}`;
    return fetch(API_URL)
    .then(response => {return response.json();})
    .then(data => {return data.days;})
    .catch(error => {
        console.log('hello')
        const divContainer = document.getElementById('weather-panels-container');
        divContainer.innerText = 'There is an issue. Check your search parameter.'
        console.error('Error during fetch:', error.message);
    });
}

function calculateWeekWeather(data){
    const daysList = [];
    for(let i=0; i < 7; i++) {
        const d = new Date(data[i].datetime);
        const day = WEEK_DAYS[d.getDay()];
        daysList.push({name: day, temp: calculateAverageTemperature(data[i].temp, data[i+7].temp), icon: generateIcon(data[i], data[i+7])});
    }
    return daysList;
}

function calculateAverageTemperature(num1, num2){
    return ((num1 + num2) / 2).toFixed(0)+String.fromCharCode(176)+"C";
}

function generateIcon(day1, day2){
    if(day1.temp < day2.temp){
        return day1.icon;
    } else {
        return day2.icon;
    }
    
}

function generateWeatherDivContainer(data, cityOrCoordinates){
    // Get and Reset Weather Panels Container Reference
    const divContainer = document.getElementById('weather-panels-container');
    divContainer.innerHTML = "";
    divContainer.classList.add('weather-container');

    // Update City Name or Coordinates Name
    const cityOrCoordinatesContainer = document.getElementById('city-or-coordinates-container');
    cityOrCoordinatesContainer.innerText = cityOrCoordinates;

    // Loop over Data Results and Set Panels to Container
    data.forEach(day => {
        const dayPanelDiv = generateWeatherByDate(day);
        divContainer.appendChild(dayPanelDiv);
    })
}

function generateWeatherByDate(data){
    // Create components
    const dayPanelContainer = document.createElement('Div');
    const daytTitle = document.createElement('Div');
    const daytIcon = document.createElement('img');
    const daytTempeture = document.createElement('Div');

    // Set Day Panel Continer
    dayPanelContainer.classList.add('weather-day-panel');

    // Set Day Title
    daytTitle.innerText = data.name;
    daytTitle.classList.add('weather-day-text');
    dayPanelContainer.appendChild(daytTitle);
    
    // Day Weather Icon
    daytIcon.src = `https://raw.githubusercontent.com/visualcrossing/WeatherIcons/main/PNG/2nd%20Set%20-%20Color/${data.icon}.png`;
    daytIcon.classList.add('weather-day-icon');
    dayPanelContainer.appendChild(daytIcon);

    // Day Temperture
    daytTempeture.innerText = data.temp;
    dayPanelContainer.appendChild(daytTempeture);

    return dayPanelContainer;
}

main()